-- Add base_price column to products and backfill from price
ALTER TABLE products ADD COLUMN IF NOT EXISTS base_price NUMERIC(10, 2);
UPDATE products SET base_price = price WHERE base_price IS NULL;
