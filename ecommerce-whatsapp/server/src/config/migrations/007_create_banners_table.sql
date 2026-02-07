-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id BIGSERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  link TEXT,
  active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Policies for banners
-- Public can view active banners
CREATE POLICY "Public read active banners" ON banners
  FOR SELECT USING (active = true);

-- Admins can do everything
CREATE POLICY "Admins full access banners" ON banners
  FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Storage policies for banner images (assuming 'banners' bucket)
-- We need to ensure the bucket exists or use a common one. Let's use 'products' for simplicity or create a new one if possible via SQL (Supabase usually requires API/Dashboard for bucket creation, but we can try inserting into storage.buckets if we had permissions, but typically we just reuse or assume existence).
-- For now, we will assume usage of the existing 'products' bucket or a new 'banners' folder within it, or a 'banners' bucket.
-- Let's stick to using the 'products' bucket but organized, OR check if we can create a bucket.
-- Safest bet is to reuse 'products' bucket with a 'banners/' path convention if we don't want to complicate things, OR just assume the user will create the bucket or we use the standard storage upload flow which might create it.
-- Actually, let's just stick to the table definition here. Storage policies are usually handled separately or already exist for authenticated users.

-- Comment
COMMENT ON TABLE banners IS 'Banners promocionales para el home';
