# Deployment Guide - Exams Platform

## Prerequisites

### Required Services

- **Supabase Project** (Database, Auth, Edge Functions)
- **SendGrid Account** (Email delivery)
- **Twilio Account** (SMS for MFA)
- **Upstash Redis** (Rate limiting)
- **Vercel/AWS/GCP** (Application hosting)

### Required Tools

- Node.js 18+
- npm or yarn
- Supabase CLI
- Git

## Environment Setup

### 1. Supabase Configuration

#### Create Supabase Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

#### Database Setup

```bash
# Run migrations
supabase db push

# Apply RLS policies
psql -h db.YOUR_PROJECT.supabase.co -U postgres -d postgres -f sql/rls/users.sql
psql -h db.YOUR_PROJECT.supabase.co -U postgres -d postgres -f sql/rls/exams.sql
psql -h db.YOUR_PROJECT.supabase.co -U postgres -d postgres -f sql/rls/results.sql
psql -h db.YOUR_PROJECT.supabase.co -U postgres -d postgres -f sql/rls/audit_logs.sql
psql -h db.YOUR_PROJECT.supabase.co -U postgres -d postgres -f sql/rls/sessions.sql

# Apply triggers
psql -h db.YOUR_PROJECT.supabase.co -U postgres -d postgres -f sql/triggers/audit_logs.sql
```

#### Auth Configuration

1. Go to Supabase Dashboard → Authentication → Settings
2. Configure email templates using files in `/emails/`
3. Set up OAuth providers:
   - **Google**: Add OAuth client ID/secret
   - **GitHub**: Add OAuth app credentials
   - **Microsoft**: Add Azure app registration

#### Security Settings

1. **JWT Settings**
   - JWT expiry: 900 seconds (15 minutes)
   - Refresh token expiry: 604800 seconds (7 days)
   - Enable refresh token rotation

2. **Rate Limiting**
   - Enable rate limiting in Auth settings
   - Configure custom limits via Edge Functions

### 2. External Service Configuration

#### SendGrid Setup

```bash
# Create API key with Mail Send permissions
# Add sender identity verification
# Configure webhook endpoints for delivery tracking
```

#### Twilio Setup

```bash
# Get Account SID and Auth Token
# Purchase phone number for SMS
# Configure messaging service
```

#### Redis Setup (Upstash)

```bash
# Create Redis database
# Get connection URL and token
# Configure for rate limiting
```

## Application Deployment

### 1. Environment Variables

Create `.env.production`:

```bash
# Copy from .env.example and update with production values
cp .env.example .env.production

# Required production variables:
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXTAUTH_SECRET=your-production-secret-32-chars-minimum
NEXTAUTH_URL=https://yourdomain.com
SENDGRID_API_KEY=your-production-sendgrid-key
TWILIO_ACCOUNT_SID=your-production-twilio-sid
TWILIO_AUTH_TOKEN=your-production-twilio-token
REDIS_URL=your-production-redis-url
```

### 2. Build and Deploy

#### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... add all production environment variables
```

#### Docker Deployment

```bash
# Build production image
docker build -t exams-platform:latest .

# Run container
docker run -d \
  --name exams-platform \
  -p 3000:3000 \
  --env-file .env.production \
  exams-platform:latest
```

#### AWS/GCP Deployment

```bash
# Build application
npm run build

# Deploy to your preferred cloud provider
# Configure load balancer, SSL certificates, and monitoring
```

### 3. Post-Deployment Configuration

#### SSL/TLS Setup

- Configure SSL certificates (Let's Encrypt recommended)
- Ensure HTTPS redirect is enabled
- Verify TLS 1.3 is supported

#### CDN Configuration

- Set up CloudFlare or AWS CloudFront
- Configure caching rules for static assets
- Enable DDoS protection

#### Monitoring Setup

```bash
# Configure Sentry for error tracking
# Set up Datadog/New Relic for performance monitoring
# Configure uptime monitoring (Pingdom, UptimeRobot)
```

## Security Hardening

### 1. Network Security

- Configure firewall rules (allow only 80, 443, SSH)
- Set up VPN for admin access
- Enable DDoS protection
- Configure rate limiting at CDN level

### 2. Application Security

- Enable security headers (configured in next.config.ts)
- Set up Content Security Policy
- Configure CORS properly
- Enable audit logging

### 3. Database Security

- Enable connection pooling
- Configure backup encryption
- Set up point-in-time recovery
- Enable query logging for auditing

## Monitoring and Alerting

### 1. Application Monitoring

```bash
# Key metrics to monitor:
- Response time (< 200ms target)
- Error rate (< 0.1% target)
- Uptime (99.9% target)
- Database connection pool usage
- Memory and CPU usage
```

### 2. Security Monitoring

```bash
# Security alerts to configure:
- Failed login attempts (> 10 per minute)
- Account lockouts
- Admin access from new IPs
- Unusual API usage patterns
- Database query anomalies
```

### 3. Business Metrics

```bash
# Business metrics to track:
- User registration rate
- Exam completion rate
- System availability during peak hours
- Support ticket volume
```

## Backup and Recovery

### 1. Database Backups

- Automated daily backups (Supabase handles this)
- Weekly full backup downloads
- Monthly backup restoration testing
- Cross-region backup replication

### 2. Application Backups

- Git repository backups
- Environment configuration backups
- SSL certificate backups
- Documentation backups

### 3. Recovery Procedures

```bash
# Database recovery:
1. Identify backup point for recovery
2. Create new Supabase project if needed
3. Restore from backup
4. Update application configuration
5. Test functionality
6. Update DNS if needed

# Application recovery:
1. Deploy from Git repository
2. Restore environment variables
3. Update external service configurations
4. Verify all integrations
5. Run smoke tests
```

## Scaling Considerations

### 1. Database Scaling

- Monitor connection pool usage
- Consider read replicas for reporting
- Implement query optimization
- Set up connection pooling (PgBouncer)

### 2. Application Scaling

- Horizontal scaling with load balancer
- Implement caching strategies
- Use CDN for static assets
- Consider serverless functions for peak loads

### 3. Performance Optimization

- Enable Next.js static generation where possible
- Implement proper caching headers
- Optimize images and fonts
- Use compression (gzip/brotli)

## Maintenance Procedures

### 1. Regular Updates

- **Weekly**: Security patches
- **Monthly**: Dependency updates
- **Quarterly**: Major version updates
- **Annually**: Security audit

### 2. Health Checks

- **Daily**: System health dashboard review
- **Weekly**: Performance metrics analysis
- **Monthly**: Security log review
- **Quarterly**: Disaster recovery testing

### 3. Capacity Planning

- Monitor growth trends
- Plan for peak usage periods (exam seasons)
- Review and adjust resource allocations
- Update scaling thresholds

## Troubleshooting Guide

### Common Issues

#### Authentication Problems

```bash
# Symptoms: Users can't log in
# Check: Supabase auth service status
# Check: JWT secret configuration
# Check: Rate limiting settings
# Solution: Verify auth configuration and check logs
```

#### Database Connection Issues

```bash
# Symptoms: 500 errors, slow responses
# Check: Connection pool status
# Check: Database CPU/memory usage
# Check: Query performance
# Solution: Optimize queries, increase connection limits
```

#### Email Delivery Issues

```bash
# Symptoms: Users not receiving emails
# Check: SendGrid delivery status
# Check: DNS/SPF records
# Check: Email templates
# Solution: Verify SendGrid configuration and domain setup
```

### Emergency Contacts

- **DevOps Team**: devops@company.com
- **Security Team**: security@company.com
- **Supabase Support**: support@supabase.com
- **SendGrid Support**: support@sendgrid.com
