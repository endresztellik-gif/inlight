-- Enable Row Level Security on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies for categories table
-- ============================================================

-- Policy 1: Public READ access - anyone can view active categories (for public catalog)
CREATE POLICY "public_read_active_categories" ON categories
FOR SELECT
USING (is_active = TRUE);

-- Policy 2: Authenticated users can read all categories (including inactive)
CREATE POLICY "authenticated_read_all_categories" ON categories
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  )
);

-- Policy 3: Only super_admin can INSERT categories
CREATE POLICY "super_admin_insert_categories" ON categories
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'super_admin'
  )
);

-- Policy 4: Only super_admin can UPDATE categories
CREATE POLICY "super_admin_update_categories" ON categories
FOR UPDATE TO authenticated
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

-- Policy 5: Only super_admin can DELETE categories
CREATE POLICY "super_admin_delete_categories" ON categories
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

COMMENT ON POLICY "public_read_active_categories" ON categories IS
'Anyone (including anonymous users) can view active categories for the public catalog';

COMMENT ON POLICY "authenticated_read_all_categories" ON categories IS
'Authenticated admin users can view all categories including inactive ones';

COMMENT ON POLICY "super_admin_insert_categories" ON categories IS
'Only super admins can create new categories';

COMMENT ON POLICY "super_admin_update_categories" ON categories IS
'Only super admins can update categories';

COMMENT ON POLICY "super_admin_delete_categories" ON categories IS
'Only super admins can delete categories';
