-- Fix RLS policies for waitlist_users - CORRECT WAY
-- Uses auth.jwt() ->> 'email' for simple email matching

-- Step 1: Ensure RLS is enabled
ALTER TABLE waitlist_users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Users can insert own record" ON waitlist_users;
DROP POLICY IF EXISTS "Users can view own entry" ON waitlist_users;
DROP POLICY IF EXISTS "Users can update own entry" ON waitlist_users;
DROP POLICY IF EXISTS "Users can view own waitlist entry" ON waitlist_users;
DROP POLICY IF EXISTS "Users can update own waitlist entry" ON waitlist_users;
DROP POLICY IF EXISTS "allow insert" ON waitlist_users;
DROP POLICY IF EXISTS "allow select" ON waitlist_users;
DROP POLICY IF EXISTS "allow update" ON waitlist_users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON waitlist_users;
DROP POLICY IF EXISTS "Enable select for authenticated users only" ON waitlist_users;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON waitlist_users;

-- Step 3: Create correct policies using auth.jwt() ->> 'email'

-- INSERT policy (for first-time onboarding)
CREATE POLICY "allow insert"
ON waitlist_users
FOR INSERT
WITH CHECK (email = (auth.jwt() ->> 'email'));

-- SELECT policy (users can view their own entry)
CREATE POLICY "allow select"
ON waitlist_users
FOR SELECT
USING (email = (auth.jwt() ->> 'email'));

-- UPDATE policy (users can update their own entry)
CREATE POLICY "allow update"
ON waitlist_users
FOR UPDATE
USING (email = (auth.jwt() ->> 'email'));

-- Step 4: Ensure status defaults to 'pending'
ALTER TABLE waitlist_users
ALTER COLUMN status SET DEFAULT 'pending';
