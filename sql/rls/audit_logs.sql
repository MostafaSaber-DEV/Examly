-- Enable RLS on audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: System can insert audit logs (no user restrictions)
CREATE POLICY "audit_logs_system_insert" ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can read all audit logs
CREATE POLICY "audit_logs_admin_select" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Users can read their own audit logs (limited fields)
CREATE POLICY "audit_logs_user_select_own" ON audit_logs
  FOR SELECT
  USING (
    user_id = auth.uid() AND
    action IN ('login', 'logout', 'profile_update', 'password_change')
  );

-- Policy: No updates or deletes allowed (audit integrity)
-- Audit logs are immutable for compliance

-- Test queries
-- Test 1: Admin can see all audit logs
-- SELECT * FROM audit_logs; -- Should return all logs for admin

-- Test 2: User can see own limited audit logs
-- SELECT * FROM audit_logs WHERE user_id = auth.uid(); -- Should return user's allowed logs

-- Test 3: User cannot see system audit logs
-- SELECT * FROM audit_logs WHERE action = 'system_backup'; -- Should return empty for non-admin