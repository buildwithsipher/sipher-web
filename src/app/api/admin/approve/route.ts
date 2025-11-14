import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { resend } from '@/lib/email/client'
import { activationEmail } from '@/lib/email/templates'
import { EMAIL_CONFIG } from '@/lib/email/config'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.ADMIN_SECRET}`

    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get user details
    const { data: user, error: fetchError } = await supabase
      .from('waitlist_users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.status === 'approved' || user.status === 'activated') {
      return NextResponse.json(
        { error: 'User already approved/activated' },
        { status: 400 }
      )
    }

    // Generate activation token (valid for 7 days)
    const activationToken = nanoid(32)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Update user status
    const { error: updateError } = await supabase
      .from('waitlist_users')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        activation_token: activationToken,
        activation_token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to approve user' },
        { status: 500 }
      )
    }

    // Generate magic link for instant login
    const { data: magicLink, error: magicLinkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    })

    if (magicLinkError || !magicLink) {
      console.error('Magic link error:', magicLinkError)
      return NextResponse.json(
        { error: 'User approved but magic link generation failed' },
        { status: 500 }
      )
    }

    // Send approval email with magic link
    try {
      await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: user.email,
        ...activationEmail({
          name: user.name,
          activationUrl: magicLink.properties.action_link,
        }),
      })
    } catch (emailError) {
      console.error('Email error:', emailError)
      return NextResponse.json(
        { error: 'User approved but email failed to send' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User approved and activation email sent',
    })
  } catch (error) {
    console.error('Approval error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

