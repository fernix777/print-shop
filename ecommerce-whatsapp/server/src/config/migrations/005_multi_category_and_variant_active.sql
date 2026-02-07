-- Add active column to product_variants
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Create product_categories junction table
CREATE TABLE IF NOT EXISTS product_categories (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  subcategory_id BIGINT REFERENCES subcategories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, category_id, subcategory_id)
);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read product_categories" ON product_categories
  FOR SELECT USING (true);
  
CREATE POLICY "Admin all product_categories" ON product_categories
  FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Migrate existing data (optional, run only if you want to preserve existing category links)
INSERT INTO product_categories (product_id, category_id, subcategory_id)
SELECT id, category_id, subcategory_id
FROM products
WHERE category_id IS NOT NULL
ON CONFLICT DO NOTHING;
