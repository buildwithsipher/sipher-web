// Database type definitions for Sipher

export type WaitlistStatus = 'pending' | 'approved' | 'activated'
export type StartupStage = 'idea' | 'mvp' | 'launched' | 'revenue'

export interface WaitlistUser {
  id: string
  email: string
  name: string
  startup_name?: string | null
  startup_stage?: StartupStage | null
  linkedin_url?: string | null
  city?: string | null
  what_building?: string | null
  website_url?: string | null
  referral_code: string
  referred_by?: string | null
  status: WaitlistStatus
  activation_token?: string | null
  activation_token_expires_at?: string | null
  approved_at?: string | null
  activated_at?: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  waitlist_user_id?: string | null
  email: string
  full_name?: string | null
  startup_name?: string | null
  startup_stage?: StartupStage | null
  linkedin_url?: string | null
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      waitlist_users: {
        Row: WaitlistUser
        Insert: Omit<WaitlistUser, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<WaitlistUser, 'id' | 'created_at' | 'updated_at'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}

