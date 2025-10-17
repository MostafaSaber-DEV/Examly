-- Create audit logging function
CREATE OR REPLACE FUNCTION log_auth_event()
RETURNS TRIGGER AS $$
DECLARE
  user_ip TEXT;
  user_agent TEXT;
BEGIN
  -- Get IP and user agent from application context (set by middleware)
  user_ip := current_setting('app.current_ip', true);
  user_agent := current_setting('app.current_user_agent', true);
  
  -- Default values if not set
  user_ip := COALESCE(user_ip, 'unknown');
  user_agent := COALESCE(user_agent, 'unknown');

  -- Log different events based on the trigger
  IF TG_OP = 'INSERT' THEN
    -- User registration
    INSERT INTO audit_logs (
      user_id,
      action,
      resource,
      ip_address,
      user_agent,
      metadata
    ) VALUES (
      NEW.id,
      'user_registered',
      'users',
      user_ip,
      user_agent,
      jsonb_build_object(
        'email', NEW.email,
        'role', NEW.role,
        'registration_method', 'email'
      )
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Track specific field changes
    IF OLD.last_login_at IS DISTINCT FROM NEW.last_login_at AND NEW.last_login_at IS NOT NULL THEN
      -- Successful login
      INSERT INTO audit_logs (
        user_id,
        action,
        resource,
        ip_address,
        user_agent,
        metadata
      ) VALUES (
        NEW.id,
        'login_success',
        'auth',
        user_ip,
        user_agent,
        jsonb_build_object(
          'login_time', NEW.last_login_at,
          'previous_login', OLD.last_login_at
        )
      );
    END IF;
    
    IF OLD.login_attempts IS DISTINCT FROM NEW.login_attempts AND NEW.login_attempts > OLD.login_attempts THEN
      -- Failed login attempt
      INSERT INTO audit_logs (
        user_id,
        action,
        resource,
        ip_address,
        user_agent,
        metadata
      ) VALUES (
        NEW.id,
        'login_failed',
        'auth',
        user_ip,
        user_agent,
        jsonb_build_object(
          'attempt_count', NEW.login_attempts,
          'locked_until', NEW.locked_until
        )
      );
    END IF;
    
    IF OLD.locked_until IS DISTINCT FROM NEW.locked_until AND NEW.locked_until IS NOT NULL THEN
      -- Account locked
      INSERT INTO audit_logs (
        user_id,
        action,
        resource,
        ip_address,
        user_agent,
        metadata
      ) VALUES (
        NEW.id,
        'account_locked',
        'security',
        user_ip,
        user_agent,
        jsonb_build_object(
          'locked_until', NEW.locked_until,
          'reason', 'excessive_failed_attempts'
        )
      );
    END IF;
    
    IF OLD.mfa_enabled IS DISTINCT FROM NEW.mfa_enabled THEN
      -- MFA status changed
      INSERT INTO audit_logs (
        user_id,
        action,
        resource,
        ip_address,
        user_agent,
        metadata
      ) VALUES (
        NEW.id,
        CASE WHEN NEW.mfa_enabled THEN 'mfa_enabled' ELSE 'mfa_disabled' END,
        'security',
        user_ip,
        user_agent,
        jsonb_build_object(
          'mfa_enabled', NEW.mfa_enabled
        )
      );
    END IF;
    
    -- Password change detection (if auth.users table is updated)
    IF OLD.encrypted_password IS DISTINCT FROM NEW.encrypted_password THEN
      INSERT INTO audit_logs (
        user_id,
        action,
        resource,
        ip_address,
        user_agent,
        metadata
      ) VALUES (
        NEW.id,
        'password_changed',
        'security',
        user_ip,
        user_agent,
        jsonb_build_object(
          'change_time', NOW()
        )
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for users table
CREATE TRIGGER audit_users_changes
  AFTER INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_auth_event();

-- Create trigger for auth.users table (Supabase auth events)
-- Note: This requires superuser privileges and may need to be set up via Supabase dashboard
-- CREATE TRIGGER audit_auth_users_changes
--   AFTER UPDATE ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION log_auth_event();

-- Function to log session events
CREATE OR REPLACE FUNCTION log_session_event()
RETURNS TRIGGER AS $$
DECLARE
  user_ip TEXT;
  user_agent TEXT;
BEGIN
  user_ip := current_setting('app.current_ip', true);
  user_agent := current_setting('app.current_user_agent', true);
  
  user_ip := COALESCE(user_ip, 'unknown');
  user_agent := COALESCE(user_agent, 'unknown');

  IF TG_OP = 'INSERT' THEN
    -- New session created
    INSERT INTO audit_logs (
      user_id,
      action,
      resource,
      ip_address,
      user_agent,
      metadata
    ) VALUES (
      NEW.user_id,
      'session_created',
      'sessions',
      user_ip,
      user_agent,
      jsonb_build_object(
        'session_id', NEW.id,
        'device_fingerprint', NEW.device_fingerprint,
        'expires_at', NEW.expires_at
      )
    );
    
  ELSIF TG_OP = 'UPDATE' AND OLD.revoked_at IS NULL AND NEW.revoked_at IS NOT NULL THEN
    -- Session revoked/logout
    INSERT INTO audit_logs (
      user_id,
      action,
      resource,
      ip_address,
      user_agent,
      metadata
    ) VALUES (
      NEW.user_id,
      'session_revoked',
      'sessions',
      user_ip,
      user_agent,
      jsonb_build_object(
        'session_id', NEW.id,
        'revoked_at', NEW.revoked_at,
        'session_duration', EXTRACT(EPOCH FROM (NEW.revoked_at - NEW.created_at))
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for sessions table
CREATE TRIGGER audit_sessions_changes
  AFTER INSERT OR UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION log_session_event();

-- Function to clean up old audit logs (retention policy)
CREATE OR REPLACE FUNCTION cleanup_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  retention_days INTEGER := 730; -- 2 years default
  deleted_count INTEGER;
BEGIN
  -- Get retention period from environment or use default
  BEGIN
    retention_days := current_setting('app.audit_retention_days')::INTEGER;
  EXCEPTION WHEN OTHERS THEN
    retention_days := 730;
  END;
  
  -- Delete old audit logs
  DELETE FROM audit_logs 
  WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the cleanup operation
  INSERT INTO audit_logs (
    action,
    resource,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    'audit_cleanup',
    'system',
    'system',
    'cleanup_job',
    jsonb_build_object(
      'deleted_count', deleted_count,
      'retention_days', retention_days
    )
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create scheduled job for audit log cleanup (run daily)
-- Note: This requires pg_cron extension
-- SELECT cron.schedule('audit-cleanup', '0 2 * * *', 'SELECT cleanup_audit_logs();');

-- Function to export user audit logs (GDPR compliance)
CREATE OR REPLACE FUNCTION export_user_audit_logs(target_user_id UUID)
RETURNS TABLE (
  log_id UUID,
  action TEXT,
  resource TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.action,
    al.resource,
    al.ip_address,
    al.user_agent,
    al.metadata,
    al.created_at
  FROM audit_logs al
  WHERE al.user_id = target_user_id
  ORDER BY al.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;