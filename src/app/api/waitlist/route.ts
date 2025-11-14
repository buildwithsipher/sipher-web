import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { resend } from '@/lib/email/client'
import { waitlistConfirmationEmail } from '@/lib/email/templates'
import { EMAIL_CONFIG } from '@/lib/email/config'
import { z } from 'zod'
import { nanoid } from 'nanoid'

const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  startupName: z.string().min(1, 'Startup name is required'),
  startupStage: z.enum(['idea', 'mvp', 'launched', 'revenue']),
  linkedinUrl: z.union([
    z.string().url('Invalid LinkedIn URL'),
    z.literal(''),
  ]).optional(),
  city: z.string().min(1, 'City is required'),
  whatBuilding: z.string().optional(),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  referralCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = waitlistSchema.parse(body)

    const supabase = createAdminClient()

    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist_users')
      .select('id, status')
      .eq('email', data.email)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Handle referral if provided
    let referredBy: string | null = null
    if (data.referralCode) {
      const { data: referrer } = await supabase
        .from('waitlist_users')
        .select('id')
        .eq('referral_code', data.referralCode)
        .single()

      if (referrer) {
        referredBy = referrer.id
      }
    }

    // Generate referral code
    const referralCode = nanoid(8).toUpperCase()

    // Insert into waitlist
    const { data: newUser, error: insertError } = await supabase
      .from('waitlist_users')
      .insert({
        email: data.email,
        name: data.name,
        startup_name: data.startupName,
        startup_stage: data.startupStage,
        linkedin_url: data.linkedinUrl && data.linkedinUrl.trim() ? data.linkedinUrl.trim() : null,
        city: data.city,
        what_building: data.whatBuilding || null,
        website_url: data.websiteUrl && data.websiteUrl.trim() ? data.websiteUrl.trim() : null,
        referred_by: referredBy,
        referral_code: referralCode,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      )
    }

    // Get position in waitlist
    const { count } = await supabase
      .from('waitlist_users')
      .select('*', { count: 'exact', head: true })

    const position = count || 0

    // Send confirmation email
    try {
      await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: data.email,
        ...waitlistConfirmationEmail({
          name: data.name,
          position,
          referralCode: newUser.referral_code,
        }),
      })
    } catch (emailError) {
      console.error('Email error:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      position,
      referralCode: newUser.referral_code,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      )
    }

    console.error('Waitlist error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

