-- ==========================================
-- BUCKET: banners
-- ==========================================

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on objects (if not already enabled, usually is for storage.objects)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policies

-- Public read access
DROP POLICY IF EXISTS "Public Access to Banners" ON storage.objects;
CREATE POLICY "Public Access to Banners"
ON storage.objects FOR SELECT
USING ( bucket_id = 'banners' );

-- Admin upload access
DROP POLICY IF EXISTS "Admin Upload Banners" ON storage.objects;
CREATE POLICY "Admin Upload Banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banners' 
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admin update access
DROP POLICY IF EXISTS "Admin Update Banners" ON storage.objects;
CREATE POLICY "Admin Update Banners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'banners'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admin delete access
DROP POLICY IF EXISTS "Admin Delete Banners" ON storage.objects;
CREATE POLICY "Admin Delete Banners"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'banners'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
