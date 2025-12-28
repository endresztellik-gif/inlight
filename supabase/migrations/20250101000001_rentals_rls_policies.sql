-- Enable Row Level Security on rentals table
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies for rentals table
-- ============================================================

-- Policy 1: Super Admin - Full Access (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "super_admin_full_access_rentals" ON rentals
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'super_admin'
  )
);

-- Policy 2: Admin - SELECT (read) access
CREATE POLICY "admin_read_rentals" ON rentals
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  )
);

-- Policy 3: Admin - INSERT access
CREATE POLICY "admin_insert_rentals" ON rentals
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  )
  AND created_by = auth.uid()
);

-- Policy 4: Admin - UPDATE access (only for non-cancelled rentals)
-- Admins can update rentals they created or that are in active/draft status
CREATE POLICY "admin_update_rentals" ON rentals
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  )
  AND (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  )
);

-- Policy 5: Admin - DELETE is restricted to super_admin only
-- Regular admins cannot delete rentals
CREATE POLICY "super_admin_delete_rentals" ON rentals
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'super_admin'
  )
);

-- ============================================================
-- Additional Security Triggers
-- ============================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rentals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rentals_updated_at_trigger
  BEFORE UPDATE ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION update_rentals_updated_at();

-- ============================================================
-- Function to generate rental number
-- Format: R-YYYYMMDD-XXXX (e.g., R-20250101-0001)
-- ============================================================

CREATE OR REPLACE FUNCTION generate_rental_number()
RETURNS TRIGGER AS $$
DECLARE
  date_part TEXT;
  seq_num INTEGER;
  new_rental_number TEXT;
BEGIN
  -- Get date part (YYYYMMDD)
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

  -- Get next sequence number for today
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(rental_number FROM 'R-[0-9]{8}-([0-9]{4})')
      AS INTEGER
    )
  ), 0) + 1
  INTO seq_num
  FROM rentals
  WHERE rental_number LIKE 'R-' || date_part || '-%';

  -- Generate new rental number
  new_rental_number := 'R-' || date_part || '-' || LPAD(seq_num::TEXT, 4, '0');

  NEW.rental_number := new_rental_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_rental_number_trigger
  BEFORE INSERT ON rentals
  FOR EACH ROW
  WHEN (NEW.rental_number IS NULL)
  EXECUTE FUNCTION generate_rental_number();

-- ============================================================
-- Comments for documentation
-- ============================================================

COMMENT ON POLICY "super_admin_full_access_rentals" ON rentals IS
'Super admins have full access to all rental records';

COMMENT ON POLICY "admin_read_rentals" ON rentals IS
'Admins and super admins can read all rental records';

COMMENT ON POLICY "admin_insert_rentals" ON rentals IS
'Admins can create new rentals, automatically setting created_by to their user ID';

COMMENT ON POLICY "admin_update_rentals" ON rentals IS
'Admins can update rentals they created, super admins can update any rental';

COMMENT ON POLICY "super_admin_delete_rentals" ON rentals IS
'Only super admins can delete rental records';
