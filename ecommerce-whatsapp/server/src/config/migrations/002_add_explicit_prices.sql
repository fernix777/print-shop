-- Add explicit price columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_box NUMERIC(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_bundle NUMERIC(10, 2);

-- Comment on columns
COMMENT ON COLUMN products.price_box IS 'Precio explícito por caja';
COMMENT ON COLUMN products.price_bundle IS 'Precio explícito por bulto';
