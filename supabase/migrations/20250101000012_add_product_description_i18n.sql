-- Add multi-language description fields to products table

ALTER TABLE products ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_hu TEXT;

COMMENT ON COLUMN products.description_en IS 'English description of the product';
COMMENT ON COLUMN products.description_hu IS 'Hungarian description of the product';
