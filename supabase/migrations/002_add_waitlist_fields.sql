-- Add missing fields to waitlist_users table
-- Run this in Supabase SQL Editor if fields don't exist

ALTER TABLE waitlist_users 
ADD COLUMN IF NOT EXISTS what_building TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Create index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist_users(created_at DESC);

