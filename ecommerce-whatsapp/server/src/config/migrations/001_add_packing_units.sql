-- Add packing configuration columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS units_per_box INTEGER DEFAULT 12;
ALTER TABLE products ADD COLUMN IF NOT EXISTS boxes_per_bundle INTEGER DEFAULT 40;

-- Update existing products to have default values (already handled by DEFAULT, but good for clarity)
UPDATE products SET units_per_box = 12 WHERE units_per_box IS NULL;
UPDATE products SET boxes_per_bundle = 40 WHERE boxes_per_bundle IS NULL;
