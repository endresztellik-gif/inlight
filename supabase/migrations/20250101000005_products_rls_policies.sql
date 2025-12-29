-- Enable Row Level Security on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies for products table
-- ============================================================

-- Policy 1: Public READ access - anyone can view active products with stock (for public catalog)
CREATE POLICY "public_read_active_products" ON products
FOR SELECT
USING (is_active = TRUE);

-- Policy 2: Authenticated users (admin/super_admin) can read all products
CREATE POLICY "authenticated_read_all_products" ON products
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')
  )
);

-- Policy 3: Only super_admin can INSERT products
CREATE POLICY "super_admin_insert_products" ON products
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'super_admin'
  )
  AND created_by = auth.uid()
);

-- Policy 4: Only super_admin can UPDATE products
CREATE POLICY "super_admin_update_products" ON products
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

-- Policy 5: Only super_admin can DELETE products
CREATE POLICY "super_admin_delete_products" ON products
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

COMMENT ON POLICY "public_read_active_products" ON products IS
'Anyone can view active products for the public catalog';

COMMENT ON POLICY "authenticated_read_all_products" ON products IS
'Admin and super admin users can view all products including inactive ones';

COMMENT ON POLICY "super_admin_insert_products" ON products IS
'Only super admins can create new products';

COMMENT ON POLICY "super_admin_update_products" ON products IS
'Only super admins can update products';

COMMENT ON POLICY "super_admin_delete_products" ON products IS
'Only super admins can delete products';
