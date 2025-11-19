-- Add onboarding completion and visibility fields to profiles table
-- Run this in Supabase SQL Editor

-- Add onboarding_done flag
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE;

-- Add default_visibility setting (public, community, investor)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS default_visibility TEXT DEFAULT 'public' CHECK (default_visibility IN ('public', 'community', 'investor'));

-- Add builder_handle (unique username for public profile)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS builder_handle TEXT UNIQUE;

-- Add tagline field
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Add profile_picture_url and startup_logo_url to profiles (sync with waitlist_users)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS startup_logo_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN profiles.onboarding_done IS 'Whether user has completed the onboarding flow';
COMMENT ON COLUMN profiles.default_visibility IS 'Default visibility mode for logs: public, community, or investor';
COMMENT ON COLUMN profiles.builder_handle IS 'Unique public handle (e.g., @srideep) for sipher.in/@handle URLs';
COMMENT ON COLUMN profiles.tagline IS 'User tagline/bio for public profile';

-- Create index on builder_handle for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_builder_handle ON profiles(builder_handle);

