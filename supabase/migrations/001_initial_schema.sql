-- Sipher Database Schema
-- Initial migration for waitlist and user management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Waitlist Users Table
CREATE TABLE IF NOT EXISTS waitlist_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  startup_name TEXT,
  startup_stage TEXT CHECK (startup_stage IN ('idea', 'mvp', 'launched', 'revenue')),
  linkedin_url TEXT,
  city TEXT,
  what_building TEXT,
  website_url TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES waitlist_users(id),
  status TEXT CHECK (status IN ('pending', 'approved', 'activated')) DEFAULT 'pending',
  activation_token TEXT,
  activation_token_expires_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table (for activated users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  waitlist_user_id UUID REFERENCES waitlist_users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  startup_name TEXT,
  startup_stage TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_users_email ON waitlist_users(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_users_referral_code ON waitlist_users(referral_code);
CREATE INDEX IF NOT EXISTS idx_waitlist_users_status ON waitlist_users(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_users_referred_by ON waitlist_users(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_waitlist_user_id ON profiles(waitlist_user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_waitlist_users_updated_at
  BEFORE UPDATE ON waitlist_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE waitlist_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own waitlist entry (by email match)
CREATE POLICY "Users can view own waitlist entry"
  ON waitlist_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.email = waitlist_users.email 
      AND auth.users.id = auth.uid()
    )
  );

-- Policy: Users can update their own waitlist entry
CREATE POLICY "Users can update own waitlist entry"
  ON waitlist_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.email = waitlist_users.email 
      AND auth.users.id = auth.uid()
    )
  );

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Note: Admin operations (insert, approve, activate) should use service role key
-- which bypasses RLS policies

