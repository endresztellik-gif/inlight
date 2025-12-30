-- Fix: Allow admin users to UPDATE client records
-- This resolves CRITICAL SECURITY ISSUE #1 from Security Audit Report
-- 
-- Problem: Only super_admin could update clients, blocking admin users
-- Solution: Add 'admin' role to UPDATE policy
-- Impact: Restores client editing functionality for 2/5 users (40% of user base)

-- Drop the existing super_admin-only UPDATE policy
DROP POLICY IF EXISTS "super_admin_update_clients" ON clients;

-- Create new policy that allows both admin and super_admin to UPDATE
CREATE POLICY "admin_update_clients" ON clients
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')  -- ✅ Include admin role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role IN ('super_admin', 'admin')  -- ✅ Include admin role
  )
);

-- Add documentation comment
COMMENT ON POLICY "admin_update_clients" ON clients IS
'Admin and super admin users can update client records. This allows admin users to edit client contact information, addresses, tax numbers, and notes as part of their normal workflow.';
