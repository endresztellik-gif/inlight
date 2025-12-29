-- Create products table for rental equipment
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  name_hu VARCHAR(255),
  description TEXT,
  serial_number VARCHAR(100) UNIQUE NOT NULL,

  -- Pricing (informational only - final price is manual)
  daily_rate DECIMAL(10, 2) NOT NULL,
  weekly_rate DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'EUR' CHECK (currency IN ('EUR', 'HUF', 'USD')),

  -- Inventory
  stock_quantity INTEGER DEFAULT 1 NOT NULL CHECK (stock_quantity >= 0),
  available_quantity INTEGER DEFAULT 1 NOT NULL CHECK (available_quantity >= 0),

  -- Condition & Status
  condition VARCHAR(20) DEFAULT 'excellent' CHECK (condition IN ('excellent', 'good', 'fair', 'damaged')),
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Media & Specs
  image_url TEXT,
  specifications JSONB, -- Flexible specs: {"sensor": "Full Frame", "resolution": "4K", etc.}

  -- Audit
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Constraint: available_quantity cannot exceed stock_quantity
  CONSTRAINT check_available_quantity CHECK (available_quantity <= stock_quantity)
);

-- Create indexes for faster queries
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_serial_number ON products(serial_number);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_condition ON products(condition);

-- Add comment
COMMENT ON TABLE products IS 'Rental equipment inventory (cameras, lenses, lighting, audio, etc.)';

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at_trigger
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();
