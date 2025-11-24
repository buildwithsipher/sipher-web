interface WaitlistConfirmationProps {
  name: string
  position: number
  referralCode: string
}

export function waitlistConfirmationEmail({
  name,
  position,
  referralCode,
}: WaitlistConfirmationProps) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/waitlist/dashboard`

  return {
    subject: `Welcome to Sipher ✦ You're #${position}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Sipher Waitlist</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000; color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Logo -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 48px; font-weight: 900; margin: 0; letter-spacing: -0.05em;">
                sipher<span style="color: #8B5CF6;">*</span>
              </h1>
            </div>

            <!-- Main Content -->
            <div style="background: #1a1a1a; border: 1px solid #2d2d2d; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
              <h2 style="font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">
                Welcome, ${name}
              </h2>
              
              <p style="font-size: 16px; color: #9CA3AF; margin: 0 0 24px 0; line-height: 1.6;">
                You're now on the Sipher waitlist.
              </p>

              <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                <div style="font-size: 48px; font-weight: 900; color: #8B5CF6; margin-bottom: 8px;">
                  #${position}
                </div>
                <p style="margin: 0; font-size: 14px; color: #9CA3AF;">
                  Your position in line
                </p>
              </div>

              <p style="font-size: 16px; color: #9CA3AF; margin: 0 0 16px 0; line-height: 1.6;">
                Founders who execute daily deserve visibility.<br>
                That's what Sipher is building — and you're early.
              </p>

              <div style="text-align: center; margin: 24px 0;">
                <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(to right, #8B5CF6, #6366F1); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View Your Dashboard →
                </a>
              </div>

              <div style="background: #000000; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #ffffff; font-weight: 600;">
                  What happens next:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #9CA3AF; font-size: 14px; line-height: 1.8;">
                  <li>We'll review your profile manually (quality over quantity)</li>
                  <li>You'll get approved within 7 days</li>
                  <li>Launch is February 1, 2026</li>
                  <li>No action needed from you</li>
                </ul>
              </div>
            </div>

            <!-- Values -->
            <div style="background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #9CA3AF; line-height: 1.6;">
                <strong style="color: #ffffff;">Why you're here:</strong><br>
                For too long, credentials have mattered more than execution. Your college. Your network. Your last name.
              </p>
              <p style="margin: 0; font-size: 14px; color: #9CA3AF; line-height: 1.6;">
                But you know the truth: <strong style="color: #8B5CF6;">shipping matters</strong>.
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; color: #6B7280; font-size: 13px; line-height: 1.6;">
              <p style="margin: 0 0 8px 0;">
                Questions? Just reply to this email.
              </p>
              <p style="margin: 0;">
                Proof over promises.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}

interface ActivationEmailProps {
  name: string
  activationUrl: string
  activationToken?: string
}

export function activationEmail({ name, activationUrl, activationToken }: ActivationEmailProps) {
  const firstName = name.split(' ')[0]
  return {
    subject: "You're In — Your Sipher Builder Access Is Ready",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Sipher Access Is Ready</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0F0F0F; color: #ffffff;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Logo -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="font-size: 48px; font-weight: 900; margin: 0; letter-spacing: -0.05em;">
                sipher<span style="color: #7B5CFF;">*</span>
              </h1>
            </div>

            <!-- Main Content -->
            <div style="background: linear-gradient(135deg, rgba(123, 92, 255, 0.1) 0%, rgba(0, 0, 0, 0) 100%); border: 1px solid rgba(123, 92, 255, 0.3); border-radius: 16px; padding: 40px; margin-bottom: 24px; position: relative; overflow: hidden;">
              <!-- Glow effect -->
              <div style="position: absolute; top: -50%; right: -50%; width: 100%; height: 100%; background: radial-gradient(circle, rgba(123, 92, 255, 0.3) 0%, transparent 70%); pointer-events: none;"></div>
              
              <div style="position: relative; z-index: 1;">
                <h2 style="font-size: 32px; font-weight: 600; margin: 0 0 16px 0; text-align: center; line-height: 1.2;">
                  You're In, ${firstName}
                </h2>
                
                <p style="font-size: 18px; color: #9CA3AF; margin: 0 0 24px 0; line-height: 1.6; text-align: center;">
                  <strong style="color: #ffffff;">Proof, not pedigree.</strong><br>
                  Your Sipher Builder access is ready.
                </p>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${activationUrl}" style="display: inline-block; background: linear-gradient(to right, #7B5CFF, #4AA8FF); color: white; text-decoration: none; padding: 18px 48px; border-radius: 12px; font-weight: 700; font-size: 18px; box-shadow: 0 10px 40px rgba(123, 92, 255, 0.4); transition: all 0.3s;">
                    Activate My Profile →
                  </a>
                </div>
                ${
                  activationToken
                    ? `
                <div style="background: rgba(0, 0, 0, 0.5); border-radius: 8px; padding: 20px; margin-top: 24px; border: 1px solid rgba(123, 92, 255, 0.3);">
                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #9CA3AF; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    Activation Token (if needed):
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #7B5CFF; font-family: monospace; word-break: break-all; background: rgba(0, 0, 0, 0.5); padding: 12px; border-radius: 6px;">
                    ${activationToken}
                  </p>
                  <p style="margin: 12px 0 0 0; font-size: 11px; color: #6B7280;">
                    Use this token if the magic link doesn't work. Keep it secure.
                  </p>
                </div>
                `
                    : ''
                }

                <div style="background: rgba(0, 0, 0, 0.5); border-radius: 8px; padding: 20px; margin-top: 32px;">
                  <p style="margin: 0 0 12px 0; font-size: 14px; color: #ffffff; font-weight: 600;">
                    What to expect:
                  </p>
                  <ul style="margin: 0; padding-left: 20px; color: #9CA3AF; font-size: 14px; line-height: 1.8;">
                    <li>You'll set up your Builder Identity first (6 quick steps)</li>
                    <li>Then start logging your work in BuilderLog</li>
                    <li>Watch your ProofCard score build automatically</li>
                    <li>Share your public profile anywhere</li>
                  </ul>
                </div>

                <p style="font-size: 13px; color: #6B7280; margin: 24px 0 0 0; text-align: center; line-height: 1.6;">
                  This magic link expires in 24 hours.<br>
                  <a href="${activationUrl}" style="color: #7B5CFF; text-decoration: underline;">Resend link</a> if needed.
                </p>
              </div>
            </div>

            <!-- Mission Statement -->
            <div style="background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: #9CA3AF; line-height: 1.6; font-style: italic; text-align: center;">
                "You're not here because of what you studied.<br>
                You're here because of what you <strong style="color: #7B5CFF; font-style: normal;">build</strong>."
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; color: #6B7280; font-size: 13px; line-height: 1.6;">
              <p style="margin: 0 0 8px 0;">
                Let's make your execution visible.
              </p>
              <p style="margin: 0;">
                — Team Sipher
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }
}
