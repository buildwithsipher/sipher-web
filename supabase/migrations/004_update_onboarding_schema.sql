-- Update Database Schema for New Minimal Onboarding Flow
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Update startup_stage CHECK constraint to include 'scaling'
-- ============================================

-- Drop the old constraint
ALTER TABLE waitlist_users 
DROP CONSTRAINT IF EXISTS waitlist_users_startup_stage_check;

-- Add new constraint with 'scaling' option
ALTER TABLE waitlist_users 
ADD CONSTRAINT waitlist_users_startup_stage_check 
CHECK (startup_stage IN ('idea', 'mvp', 'launched', 'revenue', 'scaling'));

-- ============================================
-- 2. Ensure all required columns exist
-- ============================================

-- These should already exist, but adding IF NOT EXISTS for safety
ALTER TABLE waitlist_users 
ADD COLUMN IF NOT EXISTS what_building TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS startup_name TEXT,
ADD COLUMN IF NOT EXISTS startup_stage TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- ============================================
-- 3. Update TypeScript types (for reference)
-- ============================================
-- Note: Update src/types/database.ts manually:
-- export type StartupStage = 'idea' | 'mvp' | 'launched' | 'revenue' | 'scaling'

-- ============================================
-- 4. Verify the changes
-- ============================================
-- Run this query to verify:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'waitlist_users' 
-- ORDER BY ordinal_position;

-- ============================================
-- 5. Test the constraint
-- ============================================
-- This should work:
-- UPDATE waitlist_users SET startup_stage = 'scaling' WHERE id = 'some-uuid';

-- This should fail:
-- UPDATE waitlist_users SET startup_stage = 'invalid' WHERE id = 'some-uuid';

