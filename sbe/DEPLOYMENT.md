# SBE Redesign Deployment Guide

This document provides comprehensive instructions for deploying the SBE (Smart Booking Engine) redesign to production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Database Setup](#database-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Post-Deployment Verification](#post-deployment-verification)
- [Common Issues](#common-issues)
- [Scaling Notes](#scaling-notes)

---

## Prerequisites

### Infrastructure Requirements
- **Cloud Provider**: AWS, Azure, or GCP (AWS recommended)
- **Compute**: 
  - Minimum: 2 vCPUs, 4GB RAM
  - Recommended: 4 vCPUs, 8GB RAM
  - Production: Auto Scaling Group with 2-4 instances
- **Storage**: 
  - Minimum 20GB SSD for application logs and temporary files
  - Separate storage for database backups (minimum 50GB)
- **Network**: 
  - Load Balancer (Application Load Balancer recommended)
  - VPC with public and private subnets
  - Security groups allowing:
    - HTTP (80) and HTTPS (443) from internet to ALB
    - ALB to backend instances on application ports
    - Database port from backend instances only
    - SSH (22) from approved IP ranges for maintenance

### Software Requirements
- **Operating System**: Ubuntu 22.04 LTS (or Amazon Linux 2023)
- **Container Runtime**: Docker Engine 24.0+ or containerd
- **Orchestration**: 
  - Kubernetes 1.27+ (EKS/AKS/GKE) OR
  - Docker Compose for simple deployments OR
  - ECS/Fargate for AWS-native
- **Database**: 
  - PostgreSQL 14+ or MySQL 8.0+
  - Redis 7.0+ for caching
- **CI/CD Tools**: 
  - GitHub Actions, GitLab CI, or Jenkins
  - kubectl or AWS CLI for deployments
- **Monitoring**: 
  - Prometheus + Grafana stack
  - ELK stack for logging
  - Health check endpoints configured

### Accounts and Permissions
- Cloud provider account with billing enabled
- IAM roles/policies for:
  - EC2/ECS/EKS access
  - RDS access
  - S3 access (for backups and static assets)
  - CloudWatch/Lookout access
- Domain name registered and DNS configured
- SSL certificate (ACM recommended for AWS, Let's Encrypt otherwise)
- GitHub/GitLab/Bitbucket repository access with deploy keys

### Environment Variables
Create `.env.production` file with:
```env
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.sbe.example.com
FRONTEND_URL=https://sbe.example.com

# Database
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=sbe_production
DB_USER=sbe_admin
DB_PASSWORD=your_secure_password_here

# Redis
REDIS_HOST=your-redis-endpoint.abcdef.0001.use1.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_strong_jwt_secret_here
JWT_EXPIRES_IN=24h

# Email (if applicable)
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL=no-reply@sbe.example.com

# Third-party APIs
PAYMENT_GATEWAY_KEY=your_payment_key
PAYMENT_GATEWAY_SECRET=your_payment_secret
```

---

## Database Setup

### Option 1: Managed RDS (Recommended for AWS)
1. **Create RDS Instance**:
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier sbe-prod-db \
     --db-instance-class db.t3.medium \
     --engine postgres \
     --engine-version 14.7 \
     --allocated-storage 100 \
     --master-username sbe_admin \
     --master-user-password <secure_password> \
     --vpc-security-group-ids sg-xxxxxxxx \
     --db-subnet-group-name sbe-db-subnet-group \
     --backup-retention-period 7 \
     --multi-az \
     --storage-type gp3
   ```

2. **Enable Encryption**:
   - Enable encryption at rest using AWS KMS
   - Enable encryption in transit (force SSL)

3. **Create Database and User**:
   ```sql
   CREATE DATABASE sbe_production;
   CREATE USER sbe_app WITH PASSWORD '<strong_password>';
   GRANT ALL PRIVILEGES ON DATABASE sbe_production TO sbe_app;
   ALTER USER sbe_app CREATEDB;
   ```

4. **Configure Parameter Group**:
   - Set `max_connections` appropriately (e.g., 200)
   - Set `shared_buffers` to 25% of RAM
   - Enable `pg_stat_statements` for monitoring

### Option 2: Self-Managed Database (EC2)
1. **Launch EC2 Instance**:
   - Ubuntu 22.04 LTS
   - t3.medium or larger
   - Attach EBS volume (minimum 100GB GP3)

2. **Install PostgreSQL**:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib -y
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. **Configure PostgreSQL**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE sbe_production;
   CREATE USER sbe_app WITH PASSWORD '<strong_password>';
   GRANT ALL PRIVILEGES ON DATABASE sbe_production TO sbe_app;
   ALTER SYSTEM SET listen_addresses = '*';
   \q
   ```

4. **Update pg_hba.conf**:
   ```
   # Allow connections from application servers
   host    all             all             10.0.0.0/16         md5
   ```

5. **Restart PostgreSQL**:
   ```bash
   sudo systemctl restart postgresql
   ```

### Option 3: Managed MySQL (Alternative)
Similar steps using RDS for MySQL or Aurora MySQL.

### Database Migration
1. **Run Migrations**:
   ```bash
   # Assuming Node.js with Sequelize or similar
   npm run db:migrate -- --env=production
   
   # Or for Flyway
   flyway -url=jdbc:postgresql://your-rds-endpoint:5432/sbe_production \
          -user=sbe_app -password=<password> migrate
   ```

2. **Verify Migration**:
   ```sql
   -- Check migration history
   SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 5;
   
   -- Check table counts
   SELECT schemaname, tablename, n_tup_ins + n_tup_upd + n_tup_del AS total_ops
   FROM pg_stat_user_tables ORDER BY total_ops DESC;
   ```

### Backup Strategy
1. **Automated Snapshots**:
   - RDS: Enable automated backups with 7-day retention
   - Manual: Create daily snapshots before deployments

2. **Point-in-Time Recovery**:
   - Enable backups and set retention to 35 days for compliance

3. **Backup Validation**:
   ```bash
   # Test restore from snapshot weekly
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier sbe-prod-db-restore-test \
     --db-snapshot-identifier $(aws rds describe-db-snapshots \
        --db-instance-identifier sbe-prod-db \
        --query 'DBSnapshots[?SnapshotType==`automated`].DBSnapshotIdentifier | sort_by(@, &SnapshotCreateTime)[-1]' \
        --output text)
   ```

---

## Backend Deployment

### Containerization
1. **Dockerfile** (example for Node.js):
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   
   FROM node:18-alpine
   WORKDIR /app
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/package*.json ./
   ENV NODE_ENV=production
   EXPOSE 3000
   CMD ["node", "dist/server.js"]
   ```

2. **Build and Push Image**:
   ```bash
   # Login to ECR (AWS example)
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account_id>.dkr.ecr.us-east-1.amazonaws.com
   
   # Build and tag
   docker build -t sbe-backend:latest .
   docker tag sbe-backend:latest <account_id>.dkr.ecr.us-east-1.amazonaws.com/sbe-backend:latest
   
   # Push
   docker push <account_id>.dkr.ecr.us-east-1.amazonaws.com/sbe-backend:latest
   ```

### Kubernetes Deployment (EKS Example)
1. **Namespace and Secrets**:
   ```bash
   kubectl create namespace sbe-production
   kubectl create secret generic sbe-backend-env \
     --from-file=.env.production \
     -n sbe-production
   ```

2. **Deployment Manifest** (`backend-deployment.yaml`):
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: sbe-backend
     namespace: sbe-production
     labels:
       app: sbe-backend
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: sbe-backend
     template:
       metadata:
         labels:
           app: sbe-backend
       spec:
         containers:
         - name: backend
           image: <account_id>.dkr.ecr.us-east-1.amazonaws.com/sbe-backend:latest
           ports:
           - containerPort: 3000
           envFrom:
           - secretRef:
               name: sbe-backend-env
           resources:
             requests:
               memory: "512Mi"
               cpu: "250m"
             limits:
               memory: "1Gi"
               cpu: "500m"
           livenessProbe:
             httpGet:
               path: /health
               port: 3000
             initialDelaySeconds: 30
             periodSeconds: 10
           readinessProbe:
             httpGet:
               path: /ready
               port: 3000
             initialDelaySeconds: 5
             periodSeconds: 5
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: sbe-backend-service
     namespace: sbe-production
   spec:
     selector:
       app: sbe-backend
     ports:
       - protocol: TCP
         port: 80
         targetPort: 3000
     type: ClusterIP
   ```

3. **Apply Deployment**:
   ```bash
   kubectl apply -f backend-deployment.yaml -n sbe-production
   ```

### ECS/Fargate Deployment (AWS Example)
1. **Task Definition**:
   ```json
   {
     "family": "sbe-backend",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "512",
     "memory": "1024",
     "executionRoleArn": "arn:aws:iam::<account_id>:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "backend",
         "image": "<account_id>.dkr.ecr.us-east-1.amazonaws.com/sbe-backend:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "hostPort": 3000,
             "protocol": "tcp"
           }
         ],
         "essential": true,
         "environment": [
           {"name": "NODE_ENV", "value": "production"},
           {"name": "PORT", "value": "3000"}
         ],
         "secrets": [
           {"name": "DB_HOST", "valueFrom": "arn:aws:ssm:us-east-1:<account_id>:parameter/sbe/db/host"},
           {"name": "DB_PASSWORD", "valueFrom": "arn:aws:ssm:us-east-1:<account_id>:parameter/sbe/db/password"}
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/sbe-backend",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

2. **Create Service**:
   ```bash
   aws ecs create-service \
     --cluster sbe-prod-cluster \
     --service-name sbe-backend-service \
     --task-definition sbe-backend:1 \
     --desired-count 3 \
     --launch-type FARGATE \
     --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
     --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:<account_id>:targetgroup/sbe-backend-tg/xxxxxx,containerName=backend,containerPort=3000"
   ```

### Blue/Green Deployment Strategy
1. **Create New Target Group**:
   ```bash
   aws elbv2 create-target-group \
     --name sbe-backend-green \
     --protocol HTTP \
     --port 3000 \
     --vpc-id vpc-xxxxx \
     --health-check-path /health \
     --matcher HttpCode=200
   ```

2. **Deploy to Green Environment**:
   - Deploy new version to green target group
   - Run smoke tests against green environment
   - Update listener rule to shift traffic gradually (10% -> 100%)
   - Monitor metrics for 15-30 minutes
   - Terminate blue environment

---

## Frontend Deployment

### Build Process
1. **Environment Configuration**:
   ```bash
   # Create .env.production for frontend
   VITE_API_URL=https://api.sbe.example.com
   VITE_AUTH_DOMAIN=your-auth0-domain
   VITE_CLIENT_ID=your-auth0-client-id
   ```

2. **Build Command** (React/Vite example):
   ```bash
   npm run build
   # Output: dist/ directory with static assets
   ```

### Static Hosting Options

#### Option 1: AWS CloudFront + S3
1. **Create S3 Bucket**:
   ```bash
   aws s3api create-bucket \
     --bucket sbe-frontend-prod \
     --region us-east-1
   
   aws s3 website s3://sbe-frontend-prod/ \
     --index-document index.html \
     --error-document index.html
   ```

2. **Set Bucket Policy**:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::sbe-frontend-prod/*"
       }
     ]
   }
   ```

3. **Create CloudFront Distribution**:
   - Origin: S3 bucket sbe-frontend-prod
   - Default Root Object: index.html
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Alternate Domain Names: sbe.example.com
   - SSL Certificate: ACM certificate for sbe.example.com
   - Custom Error Responses:
     - 404 → 200 (index.html) for SPA routing
     - 403 → 200 (index.html) for SPA routing

4. **Deploy**:
   ```bash
   aws s3 sync dist/ s3://sbe-frontend-prod/ --delete
   aws cloudfront create-invalidation \
     --distribution-id E1234567890ABCDEF \
     --paths "/*"
   ```

#### Option 2: Vercel/Netlify
1. **Connect Repository**:
   - Import project from GitHub/GitLab
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Configure environment variables in platform UI

2. **Deploy**:
   - Push to main branch triggers automatic deployment
   - Preview deployments for pull requests

#### Option 3: Nginx on EC2/VM
1. **Install Nginx**:
   ```bash
   sudo apt update
   sudo apt install nginx -y
   ```

2. **Configure Nginx** (`/etc/nginx/sites-available/sbe-frontend`):
   ```nginx
   server {
       listen 80;
       server_name sbe.example.com;
       
       root /var/www/sbe/frontend/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /api/ {
           proxy_pass http://backend-internal:3000/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
       
       # SSL configuration (if terminating at Nginx)
       listen 443 ssl;
       ssl_certificate /etc/ssl/certs/sbe.example.com.crt;
       ssl_certificate_key /etc/ssl/private/sbe.example.com.key;
       include /etc/ssl/options-ssl-nginx.conf;
       ssl_dhparam /etc/ssl/ssl-dhparams.pem;
   }
   ```

3. **Deploy Files**:
   ```bash
   sudo rm -rf /var/www/sbe/frontend/dist/*
   sudo cp -r dist/* /var/www/sbe/frontend/dist/
   sudo systemctl reload nginx
   ```

### CDN Cache Invalidation
- After each deployment, invalidate CloudFront cache:
  ```bash
  aws cloudfront create-invalidation \
    --distribution-id E1234567890ABCDEF \
    --paths "/assets/*" "/index.html"
  ```

---

## Post-Deployment Verification

### Health Checks
1. **Backend Health Endpoint**:
   ```bash
   curl -s https://api.sbe.example.com/health
   # Expected: {"status":"OK","timestamp":"2026-04-16T11:35:15Z"}
   ```

2. **Database Connectivity**:
   ```bash
   curl -s https://api.sbe.example.com/health/db
   # Expected: {"status":"connected","latency_ms":12}
   ```

3. **Redis Connectivity**:
   ```bash
   curl -s https://api.sbe.example.com/health/redis
   # Expected: {"status":"connected","latency_ms":2}
   ```

4. **Frontend Availability**:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://sbe.example.com
   # Expected: 200
   ```

### Smoke Tests
1. **API Endpoints**:
   ```bash
   # Test authentication
   curl -X POST https://api.sbe.example.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass123"}'
   
   # Test protected route
   curl -H "Authorization: Bearer <token>" \
     https://api.sbe.example.com/api/v1/bookings
   ```

2. **Critical User Flows**:
   - Search availability
   - Make a booking
   - Process payment (test mode)
   - View booking confirmation
   - Modify/cancel booking

3. **Database Integrity**:
   ```sql
   -- Check for orphaned records
   SELECT b.id FROM bookings b 
   LEFT JOIN users u ON b.user_id = u.id 
   WHERE u.id IS NULL;
   
   -- Check recent activity
   SELECT COUNT(*) FROM bookings 
   WHERE created_at > NOW() - INTERVAL '1 hour';
   ```

### Monitoring Setup Verification
1. **Prometheus Targets**:
   - Verify backend service is scraped
   - Check Redis exporter
   - Verify node exporter on hosts

2. **Grafana Dashboards**:
   - Import SBE dashboard (JSON provided in repo)
   - Verify panels show data
   - Set up alerts for:
     - High error rate (>5%)
     - High latency (p95 > 2s)
     - Low throughput (<10 req/min)
     - High memory usage (>85%)

3. **Log Verification**:
   ```bash
   # Check for errors in logs
   kubectl logs -l app=sbe-backend | grep -i error
   
   # Check request latency
   kubectl logs -l app=sbe-backend | grep -oP 'completed in \d+ms' | 
     awk '{sum+=$3} END {if (NR>0) print "avg:", sum/NR, "ms"}'
   ```

### Performance Testing
1. **Load Testing** (using k6):
   ```bash
   k6 run --vus 10 --duration 5m script.js
   ```
   Where `script.js` simulates:
   - 60% browsing
   - 30% searching
   - 10% booking

2. **Acceptance Criteria**:
   - 95th percentile response time < 2s
   - Error rate < 0.5%
   - System handles 100 RPS sustained

### Security Verification
1. **SSL/TLS Check**:
   ```bash
   echo | openssl s_client -connect sbe.example.com:443 -servername sbe.example.com 2>/dev/null | 
     openssl x509 -noout -dates
   ```

2. **Security Headers**:
   ```bash
   curl -I https://sbe.example.com
   # Check for:
   # Strict-Transport-Security
   # X-Content-Type-Options
   # X-Frame-Options
   # Content-Security-Policy
   ```

3. **Vulnerability Scan**:
   - Run OWASP ZAP or Nessus scan
   - Verify no critical/high vulnerabilities

---

## Common Issues

### Deployment Failures
1. **Image Pull Errors**:
   - **Symptom**: `ErrImagePull` or `ImagePullBackOff`
   - **Cause**: 
     - Incorrect image URI
     - Missing pull secrets
     - Repository not accessible
   - **Solution**:
     ```bash
     # Check image URI
     kubectl describe pod <pod-name> -n sbe-production
     
     # Create pull secret if needed
     kubectl create secret docker-registry regcred \
       --docker-server=<your-registry> \
       --docker-username=<username> \
       --docker-password=<password> \
       --docker-email=<email> \
       --namespace=sbe-production
     ```

2. **Configuration Errors**:
   - **Symptom**: CrashLoopBackOff with config errors
   - **Cause**: Missing environment variables or incorrect values
   - **Solution**:
     ```bash
     kubectl logs <pod-name> -n sbe-production
     # Check for missing env vars
     kubectl describe pod <pod-name> -n sbe-production | grep -A 20 "Environment:"
     ```

3. **Database Connection Failures**:
   - **Symptom**: Backend logs show connection timeouts
   - **Cause**:
     - Security group blocking access
     - Incorrect endpoint/port
     - Database not accepting connections
   - **Solution**:
     ```bash
     # Test from backend pod
     kubectl exec -it <backend-pod> -- nc -zv <db-host> 5432
     
     # Check security groups
     aws ec2 describe-security-groups --group-ids sg-xxxxx
     
     # Verify RDS endpoint
     aws rds describe-db-instances --db-instance-identifier sbe-prod-db
     ```

### Runtime Issues
1. **High Memory Usage**:
   - **Symptom**: Pods restarted due to OOMKilled
   - **Cause**: Memory leak or insufficient limits
   - **Solution**:
     ```bash
     # Check memory usage
     kubectl top pod -n sbe-production
     
     # Increase limits in deployment
     kubectl patch deployment sbe-backend -n sbe-production \
       -p '{"spec":{"template":{"spec":{"containers":[{"name":"backend","resources":{"limits":{"memory":"2Gi"}}}]}}}}'
     ```

2. **Database Connection Pool Exhaustion**:
   - **Symptom**: "too many clients" errors in logs
   - **Cause**: 
     - Connection pool too small
     - Long-running queries holding connections
   - **Solution**:
     ```bash
     # Check current connections
     SELECT count(*) FROM pg_stat_activity WHERE state = 'active';
     
     # Increase max_connections in RDS parameter group
     # Or adjust backend pool size
     ```

3. **CDN Cache Issues**:
   - **Symptom**: Users see old frontend after deployment
   - **Cause**: 
     - Cache not invalidated
     - Service worker caching old assets
   - **Solution**:
     ```bash
     # Force hard reload in browser (Ctrl+Shift+R)
     # Clear service workers: Application > Service Workers > Unregister
     # Manually invalidate CloudFront cache
     ```

### Performance Problems
1. **Slow Database Queries**:
   - **Symptom**: High latency, timeout errors
   - **Cause**: Missing indexes, inefficient queries
   - **Solution**:
     ```bash
     # Enable slow query log temporarily
     # Identify slow queries
     EXPLAIN ANALYZE SELECT ...;
     
     # Add missing indexes
     CREATE INDEX idx_bookings_user_date ON bookings(user_id, created_at);
     ```

2. **High CPU Usage**:
   - **Symptom**: Increased response times, throttling
   - **Cause**: 
     - Inefficient algorithms
     - Lack of caching
     - Traffic spike
   - **Solution**:
     ```bash
     # Profile application
     # Add Redis caching for frequent queries
     # Consider horizontal scaling
     ```

### Network Issues
1. **Intermittent Timeouts**:
   - **Symptom**: Occasional 504 errors
   - **Cause**:
     - Load balancer timeout too low
     - Backend slow to respond
     - Network congestion
   - **Solution**:
     ```bash
     # Increase ALB idle timeout
     aws elbv2 modify-load-balancer-attributes \
       --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:<account_id>:loadbalancer/app/sbe-alb/1234567890abcdef \
       --attributes Key=idle_timeout.timeout_seconds,Value=300
     
     # Check backend response times
     ```

2. **DNS Resolution Failures**:
   - **Symptom**: "Name or service not known" errors
   - **Cause**:
     - Incorrect DNS configuration
     - VPC DNS settings
     - Route 53 health checks failing
   - **Solution**:
     ```bash
     # Test from inside VPC
     dig sbe.example.com @10.0.0.2
     
     # Check Route 53 health checks
     aws route53 list-health-checks
     
     # Verify VPC DHCP options set
     ```

---

## Scaling Notes

### Horizontal Pod Autoscaler (HPA)
1. **Configure HPA for Backend**:
   ```bash
   kubectl autoscale deployment sbe-backend \
     --cpu-percent=60 \
     --min=3 \
     --max=20 \
     --n sbe-production
   ```

2. **Custom Metrics HPA** (using Prometheus Adapter):
   ```yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: sbe-backend-hpa
     namespace: sbe-production
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: sbe-backend
     minReplicas: 3
     maxReplicas: 50
     metrics:
     - type: Resource
       resource:
         name: cpu
         target:
           type: Utilization
           averageUtilization: 60
     - type: Pods
       pods:
         metric:
           name: http_requests_per_second
         target:
           type: AverageValue
           averageValue: "100"
   ```

### Database Scaling
1. **Read Replicas** (for read-heavy workloads):
   ```bash
   aws rds create-db-instance-read-replica \
     --db-instance-identifier sbe-prod-db-replica1 \
     --source-db-instance-identifier sbe-prod-db
   
   # Configure application to use replica for read queries
   ```

2. **Vertical Scaling**:
   - Monitor CPU/RAM utilization
   - Scale up during peak hours (scheduled)
   - Use auto-scaling storage for sudden growth

3. **Connection Pooling**:
   - Use PgBouncer or similar for connection pooling
   - Reduces connection overhead and improves performance

### Caching Strategy
1. **Redis Implementation**:
   ```bash
   # Cache frequent queries
   GET /api/v1/hotels?city=Paris&dates=2026-05-01_to_2026-05-07
   # Cache for 15 minutes
   
   # Cache user sessions
   SET session:<jwt> <user_data> EX 86400
   
   # Cache static data (countries, currencies)
   SET hotel:countries <json> EX 604800  # 1 week
   ```

2. **Cache Warming**:
   ```bash
   # Pre-populate cache during deployment
   npm run cache:warm -- --env=production
   ```

### CDN Optimization
1. **Asset Optimization**:
   - Enable Brotli/Gzip compression in CloudFront
   - Set appropriate cache headers:
     ```http
     Cache-Control: public, max-age=31536000, immutable
     ```
   - Version assets with content hashes

2. **Geographic Distribution**:
   - Enable CloudFront edge locations worldwide
   - Use Lambda@Edge for:
     - Redirects based on geography
     - A/B testing
     - Security headers injection

### Disaster Recovery
1. **Backup Restoration**:
   - Test restore procedure quarterly
   - Document RTO (Recovery Time Objective) and RPO (Recovery Point Objective)

2. **Multi-Region Deployment**:
   - Deploy to secondary region (us-west-2)
   - Use Route 53 latency-based routing
   - Synchronize databases via DMS or logical replication

3. **Chaos Engineering**:
   - Regularly terminate pods/instances
   - Test failure scenarios
   - Implement circuit breakers

### Cost Optimization
1. **Right-sizing**:
   - Monitor utilization with CloudWatch
   - Downsize over-provisioned resources
   - Use Spot Instances for fault-tolerant workloads

2. **Scheduled Scaling**:
   ```bash
   # Scale down during off-hours (2AM-6AM)
   aws autoscaling put-scheduled-update-group-action \
     --auto-scaling-group-name sbe-asg \
     --scheduled-action-name scale-down-night \
     --start-time "2026-04-17T02:00:00Z" \
     --recurrence "0 2 * * *" \
     --min-size 1 --max-size 3 --desired-capacity 1
   ```

3. **Storage Optimization**:
   - Enable S3 Intelligent-Tiering for logs
   - Set lifecycle policies to move old data to Glacier
   - Clean up old Docker images regularly

---

## Rollback Procedure

### Immediate Rollback (within 5 minutes)
1. **Kubernetes**:
   ```bash
   kubectl rollout undo deployment/sbe-backend -n sbe-production
   kubectl rollout status deployment/sbe-backend -n sbe-production
   ```

2. **ECS**:
   ```bash
   aws ecs update-service \
     --cluster sbe-prod-cluster \
     --service sbe-backend-service \
     --deployment-configuration maximumPercent=200,minimumHealthyPercent=100 \
     --force-new-deployment
   ```

### Database Rollback
1. **Point-in-Time Recovery**:
   ```bash
   # Identify time before problematic deployment
   aws rds restore-db-instance-to-point-in-time \
     --source-db-instance-identifier sbe-prod-db \
     --target-time "2026-04-16T11:00:00Z" \
     --db-instance-identifier sbe-prod-db-rollback \
     --multi-az
   ```

2. **Application Data Migration**:
   - Export data from rollback instance
   - Import to primary instance (careful with conflicts)

### Communication Plan
1. **Status Page Update**:
   - Update status.sbe.example.com during incident
   - Provide ETA for resolution

2. **Stakeholder Notification**:
   - Email/SMS to operations team
   - Slack alert to #sbe-production

3. **Post-Incident Review**:
   - Document root cause
   - Update runbooks
   - Implement preventive measures

---

**Last Updated**: April 16, 2026  
**Version**: 1.2.0  
**Contact**: DevOps Team <devops@sbe.example.com>