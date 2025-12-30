-- Modify inventory triggers to skip subrentals (type='subrental')
-- Subrentals don't track inventory - equipment is rented from suppliers

-- ============================================================
-- Drop existing triggers
-- ============================================================

DROP TRIGGER IF EXISTS decrease_product_availability_trigger ON rental_items;
DROP TRIGGER IF EXISTS increase_product_availability_trigger ON rental_items;
DROP TRIGGER IF EXISTS restore_product_availability_trigger ON rental_items;

-- ============================================================
-- Recreate triggers with rental type check
-- ============================================================

-- 1. Decrease available_quantity when rental item is created
-- ONLY for type='rental' (NOT for subrental)
CREATE OR REPLACE FUNCTION decrease_product_availability()
RETURNS TRIGGER AS $$
DECLARE
  rental_type VARCHAR(20);
BEGIN
  -- Get rental type
  SELECT type INTO rental_type FROM rentals WHERE id = NEW.rental_id;

  -- Only decrease quantity for 'rental' type (NOT subrental)
  IF rental_type = 'rental' THEN
    UPDATE products
    SET available_quantity = available_quantity - NEW.quantity
    WHERE id = NEW.product_id;

    -- Check if we have enough stock
    IF (SELECT available_quantity FROM products WHERE id = NEW.product_id) < 0 THEN
      RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrease_product_availability_trigger
  AFTER INSERT ON rental_items
  FOR EACH ROW
  EXECUTE FUNCTION decrease_product_availability();

-- 2. Increase available_quantity when rental item is returned
-- ONLY for type='rental' (NOT for subrental)
CREATE OR REPLACE FUNCTION increase_product_availability()
RETURNS TRIGGER AS $$
DECLARE
  rental_type VARCHAR(20);
BEGIN
  -- Only increase if is_returned changed from FALSE to TRUE
  IF OLD.is_returned = FALSE AND NEW.is_returned = TRUE THEN
    -- Get rental type
    SELECT type INTO rental_type FROM rentals WHERE id = NEW.rental_id;

    -- Only increase quantity for 'rental' type (NOT subrental)
    IF rental_type = 'rental' THEN
      UPDATE products
      SET available_quantity = available_quantity + NEW.quantity
      WHERE id = NEW.product_id;
    END IF;

    -- Set returned_at timestamp if not set (for both types)
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

-- 3. Restore availability if rental item is deleted
-- ONLY for type='rental' (NOT for subrental)
CREATE OR REPLACE FUNCTION restore_product_availability()
RETURNS TRIGGER AS $$
DECLARE
  rental_type VARCHAR(20);
BEGIN
  -- Only restore if item wasn't returned yet
  IF OLD.is_returned = FALSE THEN
    -- Get rental type
    SELECT type INTO rental_type FROM rentals WHERE id = OLD.rental_id;

    -- Only restore quantity for 'rental' type (NOT subrental)
    IF rental_type = 'rental' THEN
      UPDATE products
      SET available_quantity = available_quantity + OLD.quantity
      WHERE id = OLD.product_id;
    END IF;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restore_product_availability_trigger
  BEFORE DELETE ON rental_items
  FOR EACH ROW
  EXECUTE FUNCTION restore_product_availability();

-- Add comments for documentation
COMMENT ON FUNCTION decrease_product_availability() IS 'Decreases product availability when rental item created (rental only, skips subrental)';
COMMENT ON FUNCTION increase_product_availability() IS 'Increases product availability when rental item returned (rental only, skips subrental)';
COMMENT ON FUNCTION restore_product_availability() IS 'Restores product availability when rental item deleted (rental only, skips subrental)';
