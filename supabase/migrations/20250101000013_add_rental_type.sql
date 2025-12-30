-- Add type discriminator field to rentals table
-- This enables the Single Table Pattern for Rental and Subrental

-- Add type column with default 'rental'
ALTER TABLE rentals
ADD COLUMN type VARCHAR(20) DEFAULT 'rental'
CHECK (type IN ('rental', 'subrental'));

-- Create index for type-based filtering (performance optimization)
CREATE INDEX idx_rentals_type ON rentals(type);

-- Add subrental-specific fields (supplier information)
ALTER TABLE rentals
ADD COLUMN supplier_name VARCHAR(255),
ADD COLUMN supplier_contact VARCHAR(255),
ADD COLUMN supplier_notes TEXT;

-- Add purchase price to rental_items for subrental costing
ALTER TABLE rental_items
ADD COLUMN purchase_price DECIMAL(10, 2);

-- Update existing rentals to 'rental' type (backward compatibility)
UPDATE rentals SET type = 'rental' WHERE type IS NULL;

-- Make type NOT NULL after backfill
ALTER TABLE rentals ALTER COLUMN type SET NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN rentals.type IS 'Discriminator field: rental (own inventory) or subrental (rented from supplier)';
COMMENT ON COLUMN rentals.supplier_name IS 'Supplier company name (subrental only)';
COMMENT ON COLUMN rentals.supplier_contact IS 'Supplier contact info: email or phone (subrental only)';
COMMENT ON COLUMN rentals.supplier_notes IS 'Additional supplier notes (subrental only)';
COMMENT ON COLUMN rental_items.purchase_price IS 'Item purchase price from supplier (subrental only) - for profit calculation';
