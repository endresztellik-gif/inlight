-- Create rental_items junction table (rentals ↔ products)
CREATE TABLE IF NOT EXISTS rental_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,

  -- Quantity & Pricing (snapshot at rental creation time)
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
  daily_rate DECIMAL(10, 2) NOT NULL, -- Snapshot of daily_rate at time of rental
  days INTEGER NOT NULL CHECK (days > 0),
  subtotal DECIMAL(10, 2) NOT NULL, -- quantity * daily_rate * days

  -- Condition tracking
  condition_on_pickup VARCHAR(20) DEFAULT 'excellent' CHECK (condition_on_pickup IN ('excellent', 'good', 'fair', 'damaged')),
  condition_on_return VARCHAR(20) CHECK (condition_on_return IN ('excellent', 'good', 'fair', 'damaged')),

  -- Return tracking
  is_returned BOOLEAN DEFAULT FALSE,
  returned_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Constraint: Same product can only appear once per rental
  CONSTRAINT unique_product_per_rental UNIQUE(rental_id, product_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_rental_items_rental_id ON rental_items(rental_id);
CREATE INDEX idx_rental_items_product_id ON rental_items(product_id);
CREATE INDEX idx_rental_items_is_returned ON rental_items(is_returned);
CREATE INDEX idx_rental_items_returned_at ON rental_items(returned_at);

-- Add comment
COMMENT ON TABLE rental_items IS 'Junction table connecting rentals with products (rental line items)';

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rental_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rental_items_updated_at_trigger
  BEFORE UPDATE ON rental_items
  FOR EACH ROW
  EXECUTE FUNCTION update_rental_items_updated_at();

-- ============================================================
-- Trigger to update product availability when rental item created/returned
-- ============================================================

-- Decrease available_quantity when rental item is created
CREATE OR REPLACE FUNCTION decrease_product_availability()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET available_quantity = available_quantity - NEW.quantity
  WHERE id = NEW.product_id;

  -- Check if we have enough stock
  IF (SELECT available_quantity FROM products WHERE id = NEW.product_id) < 0 THEN
    RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrease_product_availability_trigger
  AFTER INSERT ON rental_items
  FOR EACH ROW
  EXECUTE FUNCTION decrease_product_availability();

-- Increase available_quantity when rental item is returned
CREATE OR REPLACE FUNCTION increase_product_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increase if is_returned changed from FALSE to TRUE
  IF OLD.is_returned = FALSE AND NEW.is_returned = TRUE THEN
    UPDATE products
    SET available_quantity = available_quantity + NEW.quantity
    WHERE id = NEW.product_id;

    -- Set returned_at timestamp if not set
    IF NEW.returned_at IS NULL THEN
      NEW.returned_at = now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increase_product_availability_trigger
  BEFORE UPDATE ON rental_items
  FOR EACH ROW
  WHEN (OLD.is_returned IS DISTINCT FROM NEW.is_returned)
  EXECUTE FUNCTION increase_product_availability();

-- ============================================================
-- Trigger to restore availability if rental item is deleted
-- ============================================================

CREATE OR REPLACE FUNCTION restore_product_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Only restore if item wasn't returned yet
  IF OLD.is_returned = FALSE THEN
    UPDATE products
    SET available_quantity = available_quantity + OLD.quantity
    WHERE id = OLD.product_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restore_product_availability_trigger
  BEFORE DELETE ON rental_items
  FOR EACH ROW
  EXECUTE FUNCTION restore_product_availability();
