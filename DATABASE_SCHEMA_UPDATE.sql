-- ============================================
-- Database Schema Update for Minimal Onboarding Flow
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Update startup_stage CHECK constraint
-- ============================================
-- This adds 'scaling' as a valid option for startup_stage

-- First, drop the existing constraint (if it exists)
ALTER TABLE waitlist_users 
DROP CONSTRAINT IF EXISTS waitlist_users_startup_stage_check;

-- Add the new constraint with 'scaling' included
ALTER TABLE waitlist_users 
ADD CONSTRAINT waitlist_users_startup_stage_check 
CHECK (startup_stage IN ('idea', 'mvp', 'launched', 'revenue', 'scaling'));

-- ============================================
-- STEP 2: Verify all required columns exist
-- ============================================
-- These should already exist, but this ensures they're there

ALTER TABLE waitlist_users 
ADD COLUMN IF NOT EXISTS what_building TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS startup_name TEXT,
ADD COLUMN IF NOT EXISTS startup_stage TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- ============================================
-- STEP 3: Verify the changes
-- ============================================
-- Run this query to see all columns:
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'waitlist_users' 
ORDER BY ordinal_position;

-- ============================================
-- STEP 4: Test the constraint (optional)
-- ============================================
-- Uncomment and run with a real UUID to test:

-- -- This should work (if you have a test user):
-- -- UPDATE waitlist_users 
-- -- SET startup_stage = 'scaling' 
-- -- WHERE id = 'your-test-uuid-here';

-- -- This should fail (invalid value):
-- -- UPDATE waitlist_users 
-- -- SET startup_stage = 'invalid-stage' 
-- -- WHERE id = 'your-test-uuid-here';

-- ============================================
-- DONE! ✅
-- ============================================
-- The database is now ready for the new onboarding flow.
-- 
-- Valid startup_stage values:
-- - 'idea'
-- - 'mvp'
-- - 'launched'
-- - 'revenue'
-- - 'scaling' (NEW)
--
-- All required fields exist:
-- - email ✅
-- - name ✅
-- - startup_name ✅
-- - startup_stage ✅
-- - city ✅
-- - what_building ✅ (domain/industry)
-- - linkedin_url ✅ (optional)
-- - website_url ✅ (optional)

