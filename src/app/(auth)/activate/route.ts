import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(
        new URL('/?error=invalid-token', request.url)
      )
    }

    const supabase = createAdminClient()

    // Verify token
    const { data: user, error } = await supabase
      .from('waitlist_users')
      .select('*')
      .eq('activation_token', token)
      .single()

    if (error || !user) {
      return NextResponse.redirect(
        new URL('/?error=invalid-token', request.url)
      )
    }

    // Check expiration
    if (new Date(user.activation_token_expires_at) < new Date()) {
      return NextResponse.redirect(
        new URL('/?error=token-expired', request.url)
      )
    }

    // Check if already activated
    if (user.status === 'activated') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Create auth user
    const tempPassword = nanoid(16)
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: user.name,
        startup_name: user.startup_name,
        startup_stage: user.startup_stage,
      },
    })

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError)
      return NextResponse.redirect(
        new URL('/?error=activation-failed', request.url)
      )
    }

    // Create profile
    await supabase.from('profiles').insert({
      id: authData.user.id,
      waitlist_user_id: user.id,
      email: user.email,
      full_name: user.name,
      startup_name: user.startup_name,
      startup_stage: user.startup_stage,
      linkedin_url: user.linkedin_url,
    })

    // Update waitlist status
    await supabase
      .from('waitlist_users')
      .update({
        status: 'activated',
        activated_at: new Date().toISOString(),
        activation_token: null, // Clear token after use
      })
      .eq('id', user.id)

    // Generate magic link for immediate login
    const { data: magicLink, error: magicLinkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    })

    if (magicLinkError || !magicLink) {
      console.error('Magic link error:', magicLinkError)
      return NextResponse.redirect(
        new URL('/?error=activation-failed', request.url)
      )
    }

    // Redirect to magic link
    return NextResponse.redirect(magicLink.properties.action_link)
  } catch (error) {
    console.error('Activation error:', error)
    return NextResponse.redirect(
      new URL('/?error=something-went-wrong', request.url)
    )
  }
}

