-- Enable RLS on sessions table
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own active sessions
CREATE POLICY "sessions_user_select_own" ON sessions
  FOR SELECT
  USING (
    user_id = auth.uid() AND
    revoked_at IS NULL AND
    expires_at > NOW()
  );

-- Policy: System can insert new sessions
CREATE POLICY "sessions_system_insert" ON sessions
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can revoke their own sessions
CREATE POLICY "sessions_user_revoke_own" ON sessions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() AND
    -- Only allow setting revoked_at
    revoked_at IS NOT NULL
  );

-- Policy: Admins can see and manage all sessions
CREATE POLICY "sessions_admin_all" ON sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to enforce concurrent session limit
CREATE OR REPLACE FUNCTION enforce_session_limit()
RETURNS TRIGGER AS $$
DECLARE
  session_count INTEGER;
  max_sessions INTEGER := 3; -- From environment variable in practice
BEGIN
  -- Count active sessions for the user
  SELECT COUNT(*) INTO session_count
  FROM sessions
  WHERE user_id = NEW.user_id
    AND revoked_at IS NULL
    AND expires_at > NOW();

  -- If limit exceeded, revoke oldest session
  IF session_count >= max_sessions THEN
    UPDATE sessions
    SET revoked_at = NOW()
    WHERE id = (
      SELECT id FROM sessions
      WHERE user_id = NEW.user_id
        AND revoked_at IS NULL
        AND expires_at > NOW()
      ORDER BY created_at ASC
      LIMIT 1
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce session limit on insert
CREATE TRIGGER enforce_session_limit_trigger
  BEFORE INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION enforce_session_limit();

-- Test queries
-- Test 1: User sees only own active sessions
-- SELECT * FROM sessions WHERE user_id = auth.uid(); -- Should return user's active sessions

-- Test 2: User can revoke own session
-- UPDATE sessions SET revoked_at = NOW() WHERE id = 'session_id' AND user_id = auth.uid(); -- Should succeed

-- Test 3: Session limit enforcement
-- INSERT INTO sessions (user_id, device_fingerprint, ip_address, user_agent, expires_at) 
-- VALUES (auth.uid(), 'fingerprint', '127.0.0.1', 'test', NOW() + INTERVAL '1 day'); -- Should revoke oldest if limit exceeded