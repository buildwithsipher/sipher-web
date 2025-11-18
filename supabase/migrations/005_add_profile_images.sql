-- Add profile picture and startup logo columns to waitlist_users table
-- Run this in Supabase SQL Editor

ALTER TABLE waitlist_users 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS startup_logo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN waitlist_users.profile_picture_url IS 'URL to user profile picture stored in Supabase Storage';
COMMENT ON COLUMN waitlist_users.startup_logo_url IS 'URL to startup logo stored in Supabase Storage';

