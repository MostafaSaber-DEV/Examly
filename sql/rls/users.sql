-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile (excluding sensitive fields)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from changing their role
    role = (SELECT role FROM users WHERE id = auth.uid()) AND
    -- Prevent users from modifying security fields directly
    mfa_secret IS NOT DISTINCT FROM (SELECT mfa_secret FROM users WHERE id = auth.uid()) AND
    login_attempts IS NOT DISTINCT FROM (SELECT login_attempts FROM users WHERE id = auth.uid()) AND
    locked_until IS NOT DISTINCT FROM (SELECT locked_until FROM users WHERE id = auth.uid())
  );

-- Policy: Admins can read all users
CREATE POLICY "users_admin_select_all" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update any user
CREATE POLICY "users_admin_update_all" ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: System can insert new users (during registration)
CREATE POLICY "users_system_insert" ON users
  FOR INSERT
  WITH CHECK (true);

-- Test queries to validate policies
-- Test 1: User can read own profile
-- SELECT * FROM users WHERE id = auth.uid(); -- Should return user's own record

-- Test 2: User cannot read other profiles
-- SELECT * FROM users WHERE id != auth.uid(); -- Should return empty for non-admin

-- Test 3: Admin can read all users
-- SELECT * FROM users; -- Should return all users for admin role

-- Test 4: User cannot update role
-- UPDATE users SET role = 'admin' WHERE id = auth.uid(); -- Should fail

-- Test 5: User can update allowed fields
-- UPDATE users SET first_name = 'New Name' WHERE id = auth.uid(); -- Should succeed