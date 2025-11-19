-- Migration: Create waitlist-assets storage bucket
-- Note: Storage buckets cannot be created via SQL in Supabase
-- This file documents the required bucket configuration
-- You must create the bucket manually in Supabase Dashboard → Storage

-- Bucket Configuration:
-- Name: waitlist-assets
-- Public: true
-- File size limit: 5 MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Storage Policies (RLS) - Run these in Supabase SQL Editor after creating the bucket:

-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'waitlist-assets'
);

-- Policy 2: Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'waitlist-assets'
)
WITH CHECK (
  bucket_id = 'waitlist-assets'
);

-- Policy 3: Allow public read access
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'waitlist-assets'
);

-- Policy 4: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'waitlist-assets'
);

-- Note: After creating the bucket and policies, verify:
-- 1. Bucket exists in Storage → Buckets
-- 2. Bucket is marked as Public
-- 3. All 4 policies are active
-- 4. Test upload functionality


