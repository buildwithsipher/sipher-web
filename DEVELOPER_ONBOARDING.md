# 🚀 Sipher Web - Developer Onboarding Guide

**Last Updated:** January 2025  
**Project:** Sipher Waitlist & Dashboard  
**Status:** Production Ready ✅

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [API Routes](#api-routes)
5. [Database Schema](#database-schema)
6. [Environment Variables](#environment-variables)
7. [Authentication Flow](#authentication-flow)
8. [Key Features](#key-features)
9. [Security](#security)
10. [Deployment](#deployment)
11. [Common Tasks](#common-tasks)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Sipher** is a platform where founders turn execution into proof. This codebase contains:

- **Landing Page** - Marketing site with waitlist signup
- **Waitlist Dashboard** - User dashboard showing position, profile, and status
- **Onboarding Flow** - Multi-step signup process (Google OAuth → Domain → Stage → Details)
- **Admin Panel** - User management and approval system

### Key Principles

- **Minimal & Fast** - No unnecessary friction
- **Founder-First** - Built for founders, not corporations
- **Security First** - Rate limiting, validation, secure uploads
- **Scalable** - Handles 10,000+ concurrent users

---

## 🛠 Tech Stack

### Core
- **Framework:** Next.js 16.0.1 (App Router)
- **Language:** TypeScript 5.9.3
- **React:** 19.2.0
- **Styling:** Tailwind CSS 4.1.17

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Google OAuth)
- **Storage:** Supabase Storage (profile images, logos)
- **Email:** Resend

### Analytics & Monitoring
- **Error Tracking:** Sentry (@sentry/nextjs)
- **Product Analytics:** PostHog
- **Web Analytics:** Google Analytics 4
- **Performance:** Vercel Analytics

### UI Libraries
- **Animations:** Framer Motion 12.23.24
- **UI Components:** Radix UI
- **Forms:** React Hook Form + Zod
- **State:** Zustand
- **3D:** Three.js + React Three Fiber

### Utilities
- **Image Processing:** Sharp
- **Date Handling:** date-fns
- **Validation:** Zod
- **Notifications:** Sonner

---

## 📁 Project Structure

```
sipher-web/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (marketing)/             # Public marketing pages
│   │   │   ├── page.tsx             # Landing page
│   │   │   └── waitlist/            # Waitlist pages
│   │   │       ├── dashboard/      # User dashboard
│   │   │       └── onboarding/    # Onboarding flow
│   │   ├── (auth)/                  # Auth pages
│   │   │   ├── auth/callback/       # OAuth callback
│   │   │   └── login/               # Login page
│   │   ├── (app)/                   # Protected app pages
│   │   │   ├── dashboard/          # Main dashboard (future)
│   │   │   └── admin/               # Admin panel
│   │   ├── api/                     # API Routes
│   │   │   ├── waitlist/           # Waitlist endpoints
│   │   │   └── admin/               # Admin endpoints
│   │   └── layout.tsx               # Root layout
│   │
│   ├── components/                  # React components
│   │   ├── landing/                 # Landing page components
│   │   ├── navigation/              # Navigation components
│   │   ├── onboarding/              # Onboarding screens
│   │   ├── ui/                      # Reusable UI components
│   │   └── analytics/               # Analytics providers
│   │
│   ├── lib/                         # Utilities & helpers
│   │   ├── supabase/                # Supabase clients
│   │   ├── analytics/               # Analytics helpers
│   │   ├── email/                   # Email templates
│   │   ├── rate-limit.ts            # Rate limiting
│   │   ├── image-processor.ts      # Image processing
│   │   ├── virus-scan.ts           # File scanning
│   │   └── logger.ts               # Sanitized logging
│   │
│   └── types/                       # TypeScript types
│       └── database.ts              # Database types
│
├── supabase/
│   └── migrations/                  # Database migrations
│       ├── 001_initial_schema.sql
│       ├── 004_update_onboarding_schema.sql
│       └── 005_add_profile_images.sql
│
├── public/                          # Static assets
├── next.config.ts                   # Next.js config
├── tailwind.config.ts               # Tailwind config
└── package.json                     # Dependencies
```

---

## 🔌 API Routes

### Waitlist Endpoints

#### `POST /api/waitlist`
**Purpose:** Join the waitlist

**Request Body:**
```typescript
{
  email: string
  name: string
  startupName: string
  startupStage: 'idea' | 'mvp' | 'launched' | 'revenue' | 'scaling'
  city: string
  whatBuilding: string  // Domain ID (e.g., 'saas', 'ai-ml')
  linkedinUrl?: string
  websiteUrl?: string
  referralCode?: string
}
```

**Response:**
```typescript
{
  success: true
  position: number  // Displayed position (actual + 100)
  referralCode: string
}
```

**Security:**
- Rate limiting: 5 signups per IP per hour
- Email validation
- Duplicate email check
- Sends confirmation email

**File:** `src/app/api/waitlist/route.ts`

---

#### `GET /api/waitlist/count`
**Purpose:** Get total waitlist count

**Response:**
```typescript
{
  count: number
}
```

**Features:**
- Cached for 1 minute (reduces DB load)
- Used by landing page hero section

**File:** `src/app/api/waitlist/count/route.ts`

---

#### `GET /api/waitlist/position`
**Purpose:** Get user's waitlist position

**Auth:** Required (logged-in users only)

**Response:**
```typescript
{
  position: number        // Actual position
  displayedPosition: number  // Position + 100
}
```

**Security:**
- Rate limiting: 30 requests per user per minute
- Uses admin client to bypass RLS for accurate count
- Only returns position numbers (no sensitive data)

**File:** `src/app/api/waitlist/position/route.ts`

---

#### `GET /api/waitlist/activities`
**Purpose:** Get anonymized live activities (last 5 joiners)

**Auth:** Required

**Response:**
```typescript
{
  activities: Array<{
    id: string
    action: string  // e.g., "joined from Mumbai"
    city: string | null
    timestamp: string
  }>
}
```

**Security:**
- Uses admin client (bypasses RLS)
- Returns anonymized data only
- No names or emails exposed

**File:** `src/app/api/waitlist/activities/route.ts`

---

#### `POST /api/waitlist/upload`
**Purpose:** Upload profile picture or startup logo

**Auth:** Required

**Request:**
- `FormData` with:
  - `file`: Image file (JPEG, PNG, WebP)
  - `type`: 'profile' or 'logo'
  - `userId`: User ID

**Response:**
```typescript
{
  url: string           // Public URL
  optimized: boolean   // Whether image was processed
  originalSize: number
  processedSize: number
}
```

**Security:**
- Rate limiting: 10 uploads per user per hour
- File validation (MIME type, extension, magic bytes)
- Virus scanning
- Image processing (resize, optimize)
- Max file size: 5MB
- Stores in Supabase Storage bucket: `waitlist-assets`

**File:** `src/app/api/waitlist/upload/route.ts`

---

### Admin Endpoints

#### `GET /api/admin/users`
**Purpose:** Get waitlist users (admin only)

**Auth:** Bearer token (`ADMIN_SECRET`)

**Query Params:**
- `status`: 'pending' | 'approved' | 'activated' | 'all'
- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Response:**
```typescript
{
  users: WaitlistUser[]
  total: number
  limit: number
  offset: number
}
```

**File:** `src/app/api/admin/users/route.ts`

---

#### `POST /api/admin/approve`
**Purpose:** Approve a waitlist user

**Auth:** Bearer token (`ADMIN_SECRET`)

**Request Body:**
```typescript
{
  userId: string  // UUID
}
```

**Response:**
```typescript
{
  success: true
  message: string
}
```

**Features:**
- Updates user status to 'approved'
- Generates activation token
- Sends approval email with magic link
- Creates magic link for instant login

**File:** `src/app/api/admin/approve/route.ts`

---

## 🗄 Database Schema

### Tables

#### `waitlist_users`
Main waitlist table.

**Columns:**
- `id` (UUID, PK)
- `email` (TEXT, UNIQUE, NOT NULL)
- `name` (TEXT, NOT NULL)
- `startup_name` (TEXT)
- `startup_stage` (TEXT) - 'idea' | 'mvp' | 'launched' | 'revenue' | 'scaling'
- `city` (TEXT)
- `what_building` (TEXT) - Domain ID
- `linkedin_url` (TEXT)
- `website_url` (TEXT)
- `referral_code` (TEXT, UNIQUE)
- `referred_by` (UUID, FK → waitlist_users.id)
- `status` (TEXT) - 'pending' | 'approved' | 'activated'
- `profile_picture_url` (TEXT)
- `startup_logo_url` (TEXT)
- `activation_token` (TEXT)
- `activation_token_expires_at` (TIMESTAMPTZ)
- `approved_at` (TIMESTAMPTZ)
- `activated_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

**Indexes:**
- `idx_waitlist_users_email`
- `idx_waitlist_users_referral_code`
- `idx_waitlist_users_status`
- `idx_waitlist_users_referred_by`

**RLS Policies:**
- Users can view/update their own entry (by email match)
- Admin operations use service role key (bypasses RLS)

**Migration:** `supabase/migrations/001_initial_schema.sql`

---

#### `profiles`
Activated user profiles (future use).

**Columns:**
- `id` (UUID, PK, FK → auth.users)
- `waitlist_user_id` (UUID, FK → waitlist_users)
- `email` (TEXT, NOT NULL)
- `full_name` (TEXT)
- `startup_name` (TEXT)
- `startup_stage` (TEXT)
- `linkedin_url` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Migration:** `supabase/migrations/001_initial_schema.sql`

---

### Supabase Storage

#### Bucket: `waitlist-assets`
Stores profile pictures and startup logos.

**Structure:**
```
waitlist-assets/
├── profiles/
│   └── {userId}.{ext}
└── logos/
    └── {userId}.{ext}
```

**Policies:**
- Users can upload their own files
- Public read access for profile pictures/logos

**Setup:** See `PROFILE_UPLOAD_SETUP.md`

---

## 🔐 Environment Variables

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Admin
ADMIN_SECRET=your-secure-random-string

# App URL (for magic links)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Sentry (Optional but recommended)
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
NEXT_PUBLIC_SENTRY_DSN=your-dsn

# PostHog (Optional)
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Google Analytics (Optional)
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

### Where to Set

**Local Development:**
- Create `.env.local` file (not committed to git)

**Production (Vercel):**
- Vercel Dashboard → Project → Settings → Environment Variables
- Set for Production, Preview, and Development environments

**See:** `VERCEL_ENV_VARIABLES.md` for detailed setup

---

## 🔑 Authentication Flow

### 1. User Clicks "Join Waitlist"

**Component:** `src/components/landing/waitlist-modal.tsx`

**Flow:**
1. Modal opens with Google OAuth button
2. Shows waitlist count (100+ founders)
3. User clicks "Continue with Google"
4. Redirects to Supabase OAuth

**State Management:**
- Uses `useUIStore` from `src/lib/store.ts`
- `waitlistModalOpen` controls modal visibility

---

### 2. Google OAuth

**Endpoint:** Supabase Auth

**Redirect URL:** `/auth/callback`

**File:** `src/app/(auth)/auth/callback/route.ts`

**Flow:**
1. Supabase handles OAuth
2. Redirects to `/auth/callback` with code
3. Callback route exchanges code for session
4. Checks if user exists in `waitlist_users` table
5. **If new user** → redirects to `/waitlist/onboarding`
6. **If existing user** → redirects to `/waitlist/dashboard`

**Middleware:**
- `src/lib/supabase/middleware.ts` handles session management
- Adds security headers to all responses
- Updates Supabase session cookies

---

### 3. Onboarding Flow

**Route:** `/waitlist/onboarding`

**File:** `src/app/(marketing)/waitlist/onboarding/page.tsx`

**Smart Auto-Check (Screen 0):**
- Checks if user is authenticated
- Checks if user already exists in database
- If exists → redirects to dashboard
- If new → proceeds to onboarding

**Screens:**
1. **Screen 1:** Google 1-Tap (handled by modal, not in onboarding page)
2. **Screen 2:** Domain selection
   - Options: SaaS, AI/ML, Consumer, FinTech, EdTech, Other
   - Tap-based selection (no typing)
   - Component: `src/components/onboarding/Screen2.tsx`
3. **Screen 3:** Startup stage
   - Options: Idea, MVP, Launched, Revenue, Scaling
   - Card-based selection
   - Component: `src/components/onboarding/Screen3.tsx`
4. **Screen 4:** Final details
   - Name (pre-filled from Google)
   - Startup Name
   - City (dropdown with top 15 cities + "Other")
   - Component: `src/components/onboarding/Screen4.tsx`
5. **Screen 5:** Success screen
   - Confirmation message
   - Redirects to dashboard after 2 seconds
   - Component: `src/components/onboarding/Screen5.tsx`

**State Management:**
- Uses local `useState` for screen navigation
- Stores onboarding data in state
- Maps domain IDs to readable values before submission

**On Complete:**
- Calls `POST /api/waitlist` with all data
- Maps `whatBuilding` domain ID to readable string
- Creates waitlist entry
- Sends confirmation email
- Redirects to `/waitlist/dashboard`

---

### 4. Waitlist Dashboard

**Route:** `/waitlist/dashboard`

**File:** `src/app/(marketing)/waitlist/dashboard/page.tsx`

**Features:**
- **Header:** Position badge, status badge, countdown card
- **Profile Card:** Editable profile with slide-over panel
- **Review Progress:** 4-step vertical timeline
- **Live Founder Pulse:** Last 5 anonymized joiners (updates every 30s)
- **Roadmap Timeline:** Three milestone cards (expandable)
- **Why You're Here:** Minimal manifesto section
- **While You Wait:** Bullet list of next steps

**Profile Upload:**
- Profile picture upload (optional)
- Startup logo upload (optional)
- Uses `/api/waitlist/upload` endpoint
- Shows upload progress and completion

**Data Fetching:**
- Fetches user data on mount
- Fetches position from `/api/waitlist/position`
- Polls live activities every 30 seconds
- Fetches community stats

**Auth:** Protected route (requires authentication, redirects to `/` if not logged in)

---

### 5. Admin Panel

**Route:** `/admin`

**File:** `src/app/(app)/admin/page.tsx`

**Features:**
- Admin secret prompt (required to access)
- User listing with filters (status, search)
- Stats dashboard (total, pending, approved, activated)
- Approve users (sends approval email with magic link)
- Search by name, email, startup, city

**Security:**
- Requires `ADMIN_SECRET` in request headers
- Secret stored in client state (not persisted)
- All API calls include `Authorization: Bearer {secret}` header

**API Endpoints Used:**
- `GET /api/admin/users` - Fetch users
- `POST /api/admin/approve` - Approve user

---

## 🗂 State Management

### Zustand Store

**File:** `src/lib/store.ts`

**UI Store (`useUIStore`):**
- `waitlistModalOpen` - Controls waitlist modal visibility
- `commandPaletteOpen` - Controls command palette (future feature)
- `activeTab` - Current active tab on landing page
- `uiDensity` - UI density preference ('compact' | 'comfortable')
- **Persistence:** Stores `uiDensity` and `activeTab` in localStorage

**User Store (`useUserStore`):**
- `user` - Current authenticated user
- `setUser` - Update user state
- **No persistence** - Cleared on page refresh

**Usage:**
```typescript
import { useUIStore } from '@/lib/store'

const { waitlistModalOpen, setWaitlistModalOpen } = useUIStore()
```

---

### Sipher Energy Context

**File:** `src/contexts/SipherEnergyContext.tsx`

**Purpose:** Tracks cursor movement and energy for interactive animations

**State:**
- `cursorSpeed` - Current cursor speed
- `isIdle` - Whether cursor is idle (no movement for 2.5s)
- `isMoving` - Whether cursor is currently moving
- `shouldSyncAura` - Trigger aura sync animation
- `shouldSyncPulse` - Trigger pulse sync animation

**Usage:**
```typescript
import { useSipherEnergy } from '@/contexts/SipherEnergyContext'

const { energy, setCursorSpeed } = useSipherEnergy()
```

**Used By:**
- Landing page interactive sections
- Founder Mirror section
- Pulse map animations

---

## ✨ Key Features

### 1. Waitlist Position Inflation

**Purpose:** "Fake it till we make it" - adds 100 to actual position

**Implementation:**
- Actual position stored in database
- Displayed position = actual + 100
- Applied in:
  - Dashboard (`/waitlist/dashboard`)
  - Landing page hero
  - Email confirmation
  - Waitlist modal

**Files:**
- `src/app/api/waitlist/position/route.ts`
- `src/app/api/waitlist/route.ts`
- `src/components/landing/hero.tsx`

---

### 2. Rate Limiting

**Purpose:** Prevent abuse and DoS attacks

**Implementation:**
- In-memory rate limiter (`src/lib/rate-limit.ts`)
- Per-endpoint limits:
  - Signup: 5 per IP per hour
  - Upload: 10 per user per hour
  - Position: 30 per user per minute

**Limitation:**
- In-memory (not shared across serverless instances)
- Fine for MVP, upgrade to Redis/Vercel KV for scale

**File:** `src/lib/rate-limit.ts`

---

### 3. Secure File Uploads

**Purpose:** Profile pictures and startup logos

**Security Features:**
- MIME type validation
- File extension whitelist
- Magic bytes validation (prevents spoofing)
- Virus scanning (basic pattern detection)
- Image processing (resize, optimize with Sharp)
- Rate limiting
- User ownership verification

**File:** `src/app/api/waitlist/upload/route.ts`

---

### 4. Analytics Stack

**Sentry:**
- Error tracking
- Performance monitoring
- Client, server, and edge runtime

**PostHog:**
- Product analytics
- Feature flags
- Session replay
- Conversion tracking

**Vercel Analytics:**
- Web Vitals
- Performance metrics

**GA4:**
- Web analytics
- User behavior tracking

**Files:**
- `src/lib/analytics/posthog.ts`
- `src/lib/analytics/ga4.ts`
- `src/components/analytics/PostHogProvider.tsx`
- `src/components/analytics/GA4Provider.tsx`

---

### 5. Email System

**Provider:** Resend

**Templates:**
- Waitlist confirmation (`waitlistConfirmationEmail`)
- Approval email (`activationEmail`)

**Features:**
- HTML templates
- Personalization
- Magic links for instant login

**Files:**
- `src/lib/email/client.ts`
- `src/lib/email/templates.ts`
- `src/lib/email/config.ts`

---

## 🛡 Security

### Implemented Security Measures

1. **Rate Limiting**
   - Prevents abuse and DoS
   - Per-endpoint limits

2. **Input Validation**
   - Zod schemas for all inputs
   - File type validation
   - Magic bytes validation

3. **Authentication & Authorization**
   - Supabase Auth
   - RLS policies
   - Admin secret for admin routes

4. **Secure File Uploads**
   - MIME type validation
   - Magic bytes check
   - Virus scanning
   - Image processing

5. **Security Headers**
   - CSP (Content Security Policy)
   - HSTS
   - X-Frame-Options
   - Referrer-Policy
   - Permissions-Policy

**File:** `src/lib/supabase/middleware.ts`

6. **Sanitized Logging**
   - Redacts sensitive data (emails, user IDs)
   - Secure error handling

**File:** `src/lib/logger.ts`

7. **Environment Variables**
   - Service role key never exposed to client
   - Admin secret protected

---

### Security Documentation

- `SECURITY_AUDIT_REPORT.md` - Full security audit
- `SECURITY_FIXES_IMPLEMENTED.md` - All security fixes
- `UPLOAD_SECURITY_ANALYSIS.md` - File upload security
- `POSITION_API_SECURITY_ANALYSIS.md` - Position API security

---

## 🚀 Deployment

### Platform: Vercel

**Setup:**
1. Connect GitHub repo to Vercel
2. Set environment variables (see above)
3. Deploy automatically on push

**Build Command:** `npm run build`  
**Output Directory:** `.next`

### Pre-Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Supabase OAuth redirect URLs updated
- [ ] Database migrations applied
- [ ] Storage bucket created and configured
- [ ] Email domain verified (Resend)
- [ ] Admin secret generated
- [ ] Build succeeds locally (`npm run build`)

**See:** `DEPLOYMENT_CHECKLIST.md` for full checklist

---

## 🔧 Common Tasks

### Adding a New API Route

1. Create file: `src/app/api/your-route/route.ts`
2. Export handler: `export async function GET/POST(request: NextRequest)`
3. Add authentication if needed
4. Add rate limiting if needed
5. Use `logError` for error logging
6. Return `NextResponse.json()`

**Example:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { logError } from '@/lib/logger'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Auth
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Rate limiting
    const rateLimit = checkRateLimit(`route:${user.id}`, 10, 60 * 1000)
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Your logic here

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Route error', error, { action: 'your_action' })
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
```

---

### Adding a New Database Migration

1. Create file: `supabase/migrations/006_your_migration.sql`
2. Use numbered prefix (006, 007, etc.)
3. Write SQL:
   ```sql
   -- Add column
   ALTER TABLE waitlist_users
   ADD COLUMN new_field TEXT;

   -- Add index if needed
   CREATE INDEX IF NOT EXISTS idx_waitlist_users_new_field
   ON waitlist_users(new_field);
   ```
4. Apply in Supabase Dashboard → SQL Editor
5. Update TypeScript types: `src/types/database.ts`

---

### Adding a New Email Template

1. Edit `src/lib/email/templates.ts`
2. Add function:
   ```typescript
   export function yourEmailTemplate(data: { name: string }) {
     return {
       subject: 'Your Subject',
       html: `
         <h1>Hello ${data.name}</h1>
         <p>Your email content</p>
       `,
     }
   }
   ```
3. Use in API route:
   ```typescript
   import { yourEmailTemplate } from '@/lib/email/templates'
   await resend.emails.send({
     from: EMAIL_CONFIG.FROM_EMAIL,
     to: user.email,
     ...yourEmailTemplate({ name: user.name }),
   })
   ```

---

### Adding Analytics Tracking

**PostHog:**
```typescript
import { trackEvent } from '@/lib/analytics/posthog'

trackEvent('event_name', {
  property1: 'value1',
  property2: 'value2',
})
```

**Vercel Analytics:**
```typescript
import { track } from '@vercel/analytics'

track('event_name', { property: 'value' })
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Unauthorized" Error on API Routes

**Cause:** User not authenticated or session expired

**Fix:**
- Check if user is logged in
- Verify Supabase session is valid
- Check RLS policies

---

#### 2. Rate Limiting Too Strict

**Cause:** In-memory rate limiter resets on each serverless function

**Fix:**
- Rate limits are per-instance (expected behavior)
- For stricter limits, upgrade to Redis/Vercel KV

---

#### 3. File Upload Fails

**Cause:** File too large, invalid type, or storage bucket not configured

**Fix:**
- Check file size (max 5MB)
- Verify file type (JPEG, PNG, WebP only)
- Ensure Supabase Storage bucket `waitlist-assets` exists
- Check bucket policies allow uploads

**See:** `PROFILE_UPLOAD_SETUP.md`

---

#### 4. Position Shows Same for Everyone

**Cause:** RLS blocking count query

**Fix:**
- Use `/api/waitlist/position` endpoint (uses admin client)
- Don't query position directly from client

---

#### 5. Email Not Sending

**Cause:** Resend API key invalid or domain not verified

**Fix:**
- Verify `RESEND_API_KEY` in environment variables
- Check Resend dashboard for domain verification
- Check email logs in Resend dashboard

---

#### 6. OAuth Callback Fails

**Cause:** Redirect URL not configured in Supabase

**Fix:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add redirect URL: `https://your-domain.com/auth/callback`
3. Ensure `NEXT_PUBLIC_APP_URL` matches your domain

---

### Debugging Tips

1. **Check Logs:**
   - Vercel: Deployment → Functions → Logs
   - Sentry: Error tracking dashboard
   - Browser Console: Client-side errors

2. **Test Locally:**
   ```bash
   npm run dev
   ```

3. **Check Environment Variables:**
   ```bash
   # In API route
   console.log(process.env.YOUR_VAR)
   ```

4. **Database Queries:**
   - Use Supabase Dashboard → SQL Editor
   - Check RLS policies: `SELECT * FROM waitlist_users;`

---

## 📚 Important Files Reference

### Core Files

- `src/app/layout.tsx` - Root layout (analytics, providers, error boundary)
- `src/app/(marketing)/page.tsx` - Landing page (hero, sections, tabs)
- `src/app/(marketing)/waitlist/dashboard/page.tsx` - User dashboard
- `src/app/(app)/admin/page.tsx` - Admin panel
- `src/lib/supabase/server.ts` - Supabase server clients
- `src/lib/supabase/client.ts` - Supabase client
- `src/lib/supabase/middleware.ts` - Auth middleware + security headers
- `src/lib/store.ts` - Zustand state management
- `src/contexts/SipherEnergyContext.tsx` - Cursor energy context

### API Routes

- `src/app/api/waitlist/route.ts` - Signup endpoint
- `src/app/api/waitlist/position/route.ts` - Position calculation
- `src/app/api/waitlist/upload/route.ts` - File uploads
- `src/app/api/admin/approve/route.ts` - User approval

### Utilities

- `src/lib/rate-limit.ts` - Rate limiting (in-memory)
- `src/lib/logger.ts` - Sanitized logging (redacts sensitive data)
- `src/lib/image-processor.ts` - Image processing (Sharp)
- `src/lib/virus-scan.ts` - File scanning (basic pattern detection)

### Landing Page Components

- `src/components/landing/hero.tsx` - Hero section with CTA
- `src/components/landing/waitlist-modal.tsx` - Waitlist signup modal
- `src/components/landing/ProblemSection.tsx` - Problem statement
- `src/components/landing/SolutionSection.tsx` - Solution overview
- `src/components/landing/FounderMirrorSection.tsx` - Interactive founder struggles
- `src/components/landing/RoadmapSection.tsx` - Product roadmap
- `src/components/landing/FounderLetterSection.tsx` - Founder's letter
- `src/components/landing/pulse/IndiaPulseMap.tsx` - Interactive India map
- `src/components/navigation/PulseNav.tsx` - Sticky navigation with pulse line

### Types

- `src/types/database.ts` - Database TypeScript types

---

## 🎯 Next Steps for New Developers

1. **Read This Document** ✅ (You're here!)

2. **Set Up Local Environment:**
   ```bash
   npm install
   # Create .env.local file (see Environment Variables section)
   # Add all required environment variables
   npm run dev
   ```

3. **Explore the Codebase:**
   - Start with landing page: `src/app/(marketing)/page.tsx`
   - Check API routes: `src/app/api/`
   - Review components: `src/components/`
   - Understand state management: `src/lib/store.ts`

4. **Read Related Docs:**
   - `SCALABILITY_ANALYSIS.md` - Performance & scaling
   - `SECURITY_AUDIT_REPORT.md` - Security details
   - `DEPLOYMENT_CHECKLIST.md` - Deployment guide
   - `UPLOAD_SECURITY_ANALYSIS.md` - File upload security
   - `POSITION_API_SECURITY_ANALYSIS.md` - Position API security

5. **Test Key Flows:**
   - Signup flow (OAuth → Onboarding → Dashboard)
   - Profile upload (picture & logo)
   - Admin approval (access `/admin`, approve user)
   - Waitlist position calculation

6. **Understand Key Concepts:**
   - Position inflation (+100 to actual position)
   - Rate limiting (in-memory, per-endpoint)
   - RLS policies (users can only see their own data)
   - Admin client (bypasses RLS for admin operations)
   - State management (Zustand for UI, Context for energy)

---

## 📞 Support & Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs

### Internal Docs
- `SCALABILITY_ANALYSIS.md`
- `SECURITY_AUDIT_REPORT.md`
- `DEPLOYMENT_CHECKLIST.md`
- `UPLOAD_SECURITY_ANALYSIS.md`

---

## ✅ Quick Reference

### Key Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Lint
npm run lint
```

### Key URLs

- **Local:** http://localhost:3000
- **Production:** https://your-domain.com
- **Admin Panel:** https://your-domain.com/admin (requires `ADMIN_SECRET`)
- **Dashboard:** https://your-domain.com/waitlist/dashboard (requires auth)
- **Onboarding:** https://your-domain.com/waitlist/onboarding (requires auth)
- **OAuth Callback:** https://your-domain.com/auth/callback

### Key Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `ADMIN_SECRET`
- `NEXT_PUBLIC_APP_URL`

---

## 📝 Additional Notes

### Route Groups

Next.js uses route groups `(marketing)`, `(auth)`, `(app)` for organization:
- `(marketing)` - Public marketing pages (no auth required)
- `(auth)` - Authentication pages (OAuth callback, login)
- `(app)` - Protected app pages (dashboard, admin, settings)

Route groups don't affect URLs - they're just for organization.

### Middleware

**File:** `src/lib/supabase/middleware.ts`

**Purpose:**
- Updates Supabase session cookies
- Adds security headers (CSP, HSTS, etc.)
- Handles authentication state

**Usage:**
- Called automatically by Next.js middleware
- Runs on every request
- Must be exported from root `middleware.ts` (if using Next.js middleware)

### Error Handling

**Global Error Boundary:**
- `src/app/global-error.tsx` - Catches unhandled errors
- `src/components/error-boundary.tsx` - React error boundary
- Both integrated with Sentry

**API Error Handling:**
- All API routes use `logError` for sanitized logging
- Generic error messages to users
- Detailed errors in Sentry

---

**Last Updated:** January 2025  
**Maintained By:** Development Team  
**Questions?** Check the docs or review the codebase!

