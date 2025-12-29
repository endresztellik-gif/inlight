-- Enable Row Level Security on rental_items table
ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies for rental_items table
-- ============================================================

-- Policy 1: Admins and super_admins can read all rental items
CREATE POLICY "authenticated_read_rental_items" ON rental_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  )
);

-- Policy 2: Admins can INSERT rental items (when creating rentals)
CREATE POLICY "admin_insert_rental_items" ON rental_items
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  )
);

-- Policy 3: Admins can UPDATE rental items (for return processing, condition updates)
CREATE POLICY "admin_update_rental_items" ON rental_items
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  )
);

-- Policy 4: Only super_admin can DELETE rental items
CREATE POLICY "super_admin_delete_rental_items" ON rental_items
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'super_admin'
  )
);

-- ============================================================
-- Comments for documentation
-- ============================================================

COMMENT ON POLICY "authenticated_read_rental_items" ON rental_items IS
'Admin and super admin users can view all rental items';

COMMENT ON POLICY "admin_insert_rental_items" ON rental_items IS
'Admins can create rental items when creating new rentals';

COMMENT ON POLICY "admin_update_rental_items" ON rental_items IS
'Admins can update rental items (e.g., marking as returned, updating condition)';

COMMENT ON POLICY "super_admin_delete_rental_items" ON rental_items IS
'Only super admins can delete rental items';
