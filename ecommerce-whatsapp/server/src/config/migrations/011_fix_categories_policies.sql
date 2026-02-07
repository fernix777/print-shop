-- Enable RLS on categories and subcategories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Categories Policies
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON categories;
CREATE POLICY "Public categories are viewable by everyone" 
ON categories FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
CREATE POLICY "Admins can insert categories" 
ON categories FOR INSERT 
WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can update categories" ON categories;
CREATE POLICY "Admins can update categories" 
ON categories FOR UPDATE 
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can delete categories" ON categories;
CREATE POLICY "Admins can delete categories" 
ON categories FOR DELETE 
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- Subcategories Policies
DROP POLICY IF EXISTS "Public subcategories are viewable by everyone" ON subcategories;
CREATE POLICY "Public subcategories are viewable by everyone" 
ON subcategories FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can insert subcategories" ON subcategories;
CREATE POLICY "Admins can insert subcategories" 
ON subcategories FOR INSERT 
WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can update subcategories" ON subcategories;
CREATE POLICY "Admins can update subcategories" 
ON subcategories FOR UPDATE 
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

DROP POLICY IF EXISTS "Admins can delete subcategories" ON subcategories;
CREATE POLICY "Admins can delete subcategories" 
ON subcategories FOR DELETE 
USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
