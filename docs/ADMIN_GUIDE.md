# Administrator Guide - Exams Platform

## Admin Dashboard Access

### Prerequisites

- Admin role assigned to your account
- Two-factor authentication enabled
- IP address whitelisted (if configured)
- Valid admin session

### Login Process

1. Navigate to `/auth/login`
2. Enter admin credentials
3. Complete MFA verification
4. Access admin dashboard at `/admin`

## User Management

### Creating Users

```typescript
// Via Admin API
POST /api/admin/users
{
  "email": "user@example.com",
  "role": "student|instructor|admin",
  "firstName": "John",
  "lastName": "Doe",
  "sendWelcomeEmail": true
}
```

### User Roles and Permissions

#### Student Role

- Take assigned exams
- View own results
- Update profile information
- Cannot access admin functions

#### Instructor Role

- Create and manage exams
- View results for their exams
- Manage assigned students
- Cannot access system administration

#### Admin Role

- Full system access
- User management
- System configuration
- Security monitoring
- Audit log access

### Bulk User Operations

#### CSV Import

1. Navigate to Admin → Users → Import
2. Download CSV template
3. Fill in user data:
   ```csv
   email,firstName,lastName,role
   student1@example.com,John,Doe,student
   instructor1@example.com,Jane,Smith,instructor
   ```
4. Upload CSV file
5. Review and confirm import

#### Bulk Role Changes

```sql
-- Update multiple users to instructor role
UPDATE users
SET role = 'instructor', updated_at = NOW()
WHERE id IN ('user-id-1', 'user-id-2', 'user-id-3');
```

## Security Administration

### Account Security

#### Password Policy Management

```typescript
// Update password policy
PUT /api/admin/security/password-policy
{
  "minLength": 12,
  "requireUppercase": true,
  "requireLowercase": true,
  "requireNumbers": true,
  "requireSpecialChars": true,
  "preventReuse": 12,
  "maxAge": 90
}
```

#### Account Lockout Management

```typescript
// Unlock user account
POST /api/admin/users/{userId}/unlock
{
  "reason": "Support ticket #12345",
  "resetFailedAttempts": true
}

// Lock user account
POST /api/admin/users/{userId}/lock
{
  "reason": "Security violation",
  "duration": "24h"
}
```

### MFA Administration

#### Force MFA Enrollment

```sql
-- Require MFA for all admin accounts
UPDATE users
SET mfa_required = true
WHERE role = 'admin';
```

#### Reset MFA for User

```typescript
// Reset user's MFA setup
DELETE /api/admin/users/{userId}/mfa
{
  "reason": "User lost authenticator device",
  "notifyUser": true
}
```

### Session Management

#### View Active Sessions

```sql
-- View all active sessions
SELECT
  s.id,
  u.email,
  s.ip_address,
  s.user_agent,
  s.created_at,
  s.expires_at
FROM sessions s
JOIN users u ON u.id = s.user_id
WHERE s.revoked_at IS NULL
  AND s.expires_at > NOW()
ORDER BY s.created_at DESC;
```

#### Revoke User Sessions

```typescript
// Revoke all sessions for a user
POST /api/admin/users/{userId}/revoke-sessions
{
  "reason": "Security incident",
  "excludeCurrentSession": false
}
```

## Audit and Monitoring

### Audit Log Analysis

#### Common Queries

```sql
-- Failed login attempts in last 24 hours
SELECT
  user_id,
  ip_address,
  COUNT(*) as attempt_count,
  MAX(created_at) as last_attempt
FROM audit_logs
WHERE action = 'login_failed'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id, ip_address
HAVING COUNT(*) > 5
ORDER BY attempt_count DESC;

-- Admin actions in last week
SELECT
  al.action,
  u.email,
  al.ip_address,
  al.created_at,
  al.metadata
FROM audit_logs al
JOIN users u ON u.id = al.user_id
WHERE u.role = 'admin'
  AND al.created_at > NOW() - INTERVAL '7 days'
ORDER BY al.created_at DESC;

-- Suspicious activity patterns
SELECT
  user_id,
  ip_address,
  COUNT(DISTINCT action) as action_types,
  COUNT(*) as total_events,
  MIN(created_at) as first_event,
  MAX(created_at) as last_event
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY user_id, ip_address
HAVING COUNT(*) > 50
ORDER BY total_events DESC;
```

#### Export Audit Logs

```typescript
// Export audit logs for date range
GET /api/admin/audit-logs/export?startDate=2024-01-01&endDate=2024-01-31&format=csv

// Export user-specific audit logs
GET /api/admin/users/{userId}/audit-logs/export?format=json
```

### Security Monitoring

#### Real-time Alerts

Monitor these events for immediate response:

- Multiple failed login attempts (>5 in 15 minutes)
- Admin login from new IP address
- Account lockout events
- MFA bypass attempts
- Unusual API usage patterns

#### Security Metrics Dashboard

Key metrics to track:

- Failed login rate
- Account lockout frequency
- MFA adoption rate
- Session duration averages
- API error rates

## System Configuration

### Rate Limiting Configuration

#### Update Rate Limits

```typescript
// Configure rate limits
PUT /api/admin/config/rate-limits
{
  "login": {
    "attempts": 5,
    "window": "15m",
    "blockDuration": "1h"
  },
  "api": {
    "requests": 100,
    "window": "1m",
    "burstLimit": 150
  },
  "registration": {
    "accounts": 10,
    "window": "24h",
    "perIP": true
  }
}
```

#### IP Whitelist Management

```typescript
// Add IP to admin whitelist
POST /api/admin/security/ip-whitelist
{
  "ipAddress": "192.168.1.100",
  "description": "Office network",
  "userId": "admin-user-id"
}

// Remove IP from whitelist
DELETE /api/admin/security/ip-whitelist/{ipId}
```

### Email Configuration

#### Update Email Templates

1. Navigate to Admin → Configuration → Email Templates
2. Select template type (verification, reset, security alert)
3. Edit HTML content
4. Test with sample data
5. Deploy changes

#### SMTP Configuration

```typescript
// Update SMTP settings
PUT /api/admin/config/smtp
{
  "provider": "sendgrid",
  "apiKey": "encrypted-api-key",
  "fromEmail": "noreply@examsplatform.com",
  "fromName": "Exams Platform",
  "replyTo": "support@examsplatform.com"
}
```

## Exam Management

### Exam Administration

#### Create System-wide Announcements

```typescript
POST /api/admin/announcements
{
  "title": "System Maintenance Notice",
  "message": "Scheduled maintenance on Sunday 2-4 AM UTC",
  "type": "warning",
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": "2024-01-16T00:00:00Z",
  "targetRoles": ["student", "instructor"]
}
```

#### Exam Statistics

```sql
-- Exam completion rates
SELECT
  e.title,
  COUNT(DISTINCT er.student_id) as students_attempted,
  COUNT(CASE WHEN er.completed_at IS NOT NULL THEN 1 END) as students_completed,
  ROUND(
    COUNT(CASE WHEN er.completed_at IS NOT NULL THEN 1 END) * 100.0 /
    COUNT(DISTINCT er.student_id), 2
  ) as completion_rate
FROM exams e
LEFT JOIN exam_results er ON er.exam_id = e.id
WHERE e.created_at > NOW() - INTERVAL '30 days'
GROUP BY e.id, e.title
ORDER BY completion_rate DESC;
```

### Performance Monitoring

#### Database Performance

```sql
-- Slow queries analysis
SELECT
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;

-- Connection pool status
SELECT
  state,
  COUNT(*) as connection_count
FROM pg_stat_activity
GROUP BY state;
```

#### Application Metrics

Monitor these key metrics:

- Response time (target: <200ms)
- Error rate (target: <0.1%)
- Database connection usage
- Memory consumption
- CPU utilization

## Backup and Recovery

### Database Backups

#### Manual Backup

```bash
# Create manual backup
pg_dump -h db.project.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -h db.project.supabase.co -U postgres -d postgres < backup_20240115_120000.sql
```

#### Automated Backup Verification

```sql
-- Verify backup integrity
SELECT
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Disaster Recovery

#### Recovery Time Objectives (RTO)

- Database recovery: 4 hours
- Application recovery: 2 hours
- Full system recovery: 6 hours

#### Recovery Point Objectives (RPO)

- Database: 1 hour (point-in-time recovery)
- Application data: 24 hours
- Configuration: Real-time (version controlled)

## Incident Response

### Security Incident Response

#### Immediate Actions

1. **Assess Severity**
   - Data breach: Critical
   - Account compromise: High
   - Failed login spike: Medium
   - Configuration error: Low

2. **Containment**

   ```typescript
   // Emergency user lockout
   POST /api/admin/emergency/lockout-user
   {
     "userId": "compromised-user-id",
     "reason": "Security incident #INC-2024-001"
   }

   // System-wide session revocation
   POST /api/admin/emergency/revoke-all-sessions
   {
     "excludeAdmins": true,
     "reason": "Security incident"
   }
   ```

3. **Investigation**
   - Review audit logs
   - Check system integrity
   - Identify attack vectors
   - Document findings

4. **Recovery**
   - Restore from clean backups if needed
   - Apply security patches
   - Reset compromised credentials
   - Notify affected users

### Communication Templates

#### User Notification

```
Subject: Important Security Notice - Action Required

Dear [User Name],

We've detected suspicious activity on your Exams Platform account. As a precautionary measure, we've temporarily secured your account.

What happened: [Brief description]
When: [Timestamp]
What we're doing: [Our response]
What you need to do: [User actions]

If you have questions, contact security@examsplatform.com

Reference: INC-2024-XXX
```

#### Stakeholder Update

```
Subject: Security Incident Update - [Severity Level]

Incident: INC-2024-XXX
Status: [Investigating/Contained/Resolved]
Impact: [Description of impact]
Timeline: [Key events and timeline]
Next Steps: [Planned actions]

Contact: security-team@company.com
```

## Compliance and Reporting

### GDPR Compliance

#### Data Subject Requests

```typescript
// Process data export request
GET /api/admin/gdpr/export/{userId}
// Returns: Complete user data package

// Process data deletion request
DELETE /api/admin/gdpr/delete/{userId}
{
  "confirmDeletion": true,
  "retentionOverride": false,
  "reason": "User request via support ticket #12345"
}
```

#### Data Retention Management

```sql
-- Clean up expired data
DELETE FROM audit_logs
WHERE created_at < NOW() - INTERVAL '2 years';

DELETE FROM sessions
WHERE expires_at < NOW() - INTERVAL '30 days';
```

### Reporting

#### Monthly Security Report

Generate reports including:

- Security incident summary
- Failed login statistics
- Account lockout analysis
- MFA adoption rates
- Vulnerability scan results

#### Compliance Audit Trail

Maintain documentation for:

- Access control changes
- Security configuration updates
- Incident response activities
- Data processing activities
- User consent records

## Emergency Procedures

### Emergency Contacts

- **Security Team Lead**: +1-555-SECURITY
- **DevOps On-call**: +1-555-DEVOPS-1
- **Legal Counsel**: +1-555-LEGAL-1
- **Executive Team**: +1-555-EXEC-1

### Emergency Access

In case of primary admin account compromise:

1. Use emergency admin account (break-glass)
2. Access via secure backup authentication method
3. Immediately rotate all administrative credentials
4. Activate incident response procedures

### System Shutdown Procedure

```bash
# Emergency system shutdown
1. Enable maintenance mode
2. Revoke all active sessions
3. Stop application services
4. Secure database connections
5. Notify stakeholders
6. Document incident details
```
