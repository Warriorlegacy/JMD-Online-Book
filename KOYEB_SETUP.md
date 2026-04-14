# Koyeb Backend Deployment Setup Guide

## Prerequisites

1. **Create a Koyeb Account**: Sign up at https://app.koyeb.com
2. **Generate API Token**: 
   - Go to Koyeb Control Panel → Settings → API Tokens
   - Create a new token with "Full Access" permissions
   - Copy the token (starts with `koyeb-...`)

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

1. **Navigate to**: Settings → Secrets and variables → Actions → New repository secret

2. **Add these secrets**:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `KOYEB_API_TOKEN` | `koyeb-xxxxxxxxx` | Your Koyeb API token from step 2 |

3. **Koyeb Variables (set in Koyeb dashboard)**:
   
   After the first deployment, go to your Koyeb app and add these environment variables in the service settings:
   
   - `DATABASE_URL`: Your PostgreSQL connection string (e.g., `postgresql://user:password@host:5432/sbe_db`)
   - `REDIS_URL`: Your Redis connection string (optional, defaults to in-memory mock)
   - `JWT_SECRET`: A strong random secret for JWT signing

## Deployment Flow

When you push to `main`:
1. ✅ **Build & Test**: TypeScript compilation and linting
2. ✅ **Deploy Frontend**: Vercel deployment
3. ✅ **Deploy Backend**: Koyeb deployment via Docker

## First Deployment Steps

1. **Commit and push** the Koyeb configuration
2. **Wait** for the GitHub Action to create the Koyeb app
3. **Go to Koyeb Dashboard**: https://app.koyeb.com
4. **Configure Environment Variables** in your `sbe-backend` app → `api` service
5. **Redeploy** the service after adding variables

## Database Setup

You need to provision a PostgreSQL database. Options:

### Option 1: Koyeb Managed PostgreSQL (Recommended)
1. In Koyeb Dashboard, create a new PostgreSQL database
2. Copy the connection string
3. Add it as `DATABASE_URL` environment variable

### Option 2: Supabase (Already Configured)
1. Go to your Supabase project
2. Get the connection string from Project Settings → Database
3. Add it as `DATABASE_URL` environment variable

### Option 3: External PostgreSQL
- Use any PostgreSQL provider (AWS RDS, Railway, Render, etc.)
- Ensure the database accepts connections from Koyeb's IP ranges

## Verification

After deployment:
1. Check Koyeb service logs for any errors
2. Visit: `https://sbe-backend-<your-account>.koyeb.app/health`
3. Expected response: `{"status":"ok","version":"1.0.0"}`
4. Update Vercel's `NEXT_PUBLIC_API_URL` if the URL differs

## Troubleshooting

### Deployment fails with "Build failed"
- Check Dockerfile for syntax errors
- Ensure `npm run build` completes successfully locally
- Verify all dependencies are in `package.json`

### Service crashes on startup
- Check logs in Koyeb dashboard for error messages
- Verify `DATABASE_URL` is correctly formatted
- Ensure PostgreSQL database is accessible from Koyeb

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` in `sbe/web/vercel.json` matches your Koyeb URL
- Check CORS settings in backend allow the Vercel domain
- Ensure Koyeb service is running and healthy

## Cost Considerations

Koyeb offers a generous free tier:
- 2 free services (Nano instance)
- 1GB RAM per service
- Suitable for development and low-traffic production

For higher traffic, upgrade to larger instance types.

## Next Steps

1. Set up database migrations with Drizzle ORM
2. Configure Redis for caching and pub/sub
3. Set up monitoring and alerts in Koyeb dashboard
4. Configure custom domain for the backend API
