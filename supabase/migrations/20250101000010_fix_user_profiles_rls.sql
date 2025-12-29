-- Fix infinite recursion in user_profiles RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "super_admin_read_all_profiles" ON user_profiles;
DROP POLICY IF EXISTS "super_admin_manage_profiles" ON user_profiles;

-- ============================================================
-- Create SECURITY DEFINER function to get user role
-- This bypasses RLS and prevents infinite recursion
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS VARCHAR(20)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN (
    SELECT role
    FROM public.user_profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;

COMMENT ON FUNCTION public.get_user_role() IS 'Returns the role of the current authenticated user, bypassing RLS';

-- ============================================================
-- Recreate RLS policies using the security definer function
-- ============================================================

-- Policy: Super admins can read all profiles
CREATE POLICY "super_admin_read_all_profiles" ON user_profiles
FOR SELECT TO authenticated
USING (
  public.get_user_role() = 'super_admin'
);

-- Policy: Super admins can insert profiles
CREATE POLICY "super_admin_insert_profiles" ON user_profiles
FOR INSERT TO authenticated
WITH CHECK (
  public.get_user_role() = 'super_admin'
);

-- Policy: Super admins can update profiles
CREATE POLICY "super_admin_update_profiles" ON user_profiles
FOR UPDATE TO authenticated
USING (
  public.get_user_role() = 'super_admin'
)
WITH CHECK (
  public.get_user_role() = 'super_admin'
);

-- Policy: Super admins can delete profiles
CREATE POLICY "super_admin_delete_profiles" ON user_profiles
FOR DELETE TO authenticated
USING (
  public.get_user_role() = 'super_admin'
);

-- ============================================================
-- Comments for documentation
-- ============================================================

COMMENT ON POLICY "super_admin_read_all_profiles" ON user_profiles IS
'Super admins can read all user profiles (using security definer function to avoid recursion)';

COMMENT ON POLICY "super_admin_insert_profiles" ON user_profiles IS
'Only super admins can create new user profiles';

COMMENT ON POLICY "super_admin_update_profiles" ON user_profiles IS
'Only super admins can update user profiles';

COMMENT ON POLICY "super_admin_delete_profiles" ON user_profiles IS
'Only super admins can delete user profiles';
