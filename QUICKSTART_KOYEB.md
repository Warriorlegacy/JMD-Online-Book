# 🚀 Quick Start: Deploy SBE Backend to Koyeb

## Step-by-Step Setup (5 minutes)

### 1️⃣ Create Koyeb Account & API Token

1. **Sign up**: https://app.koyeb.com/signup
2. **Generate API Token**:
   - Go to **Settings** → **API Tokens**
   - Click **Create Token**
   - Name it "GitHub Actions"
   - Copy the token (starts with `koyeb-`)

### 2️⃣ Add GitHub Secret

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - **Name**: `KOYEB_API_TOKEN`
   - **Value**: Paste your Koyeb token from step 1

### 3️⃣ Wait for First Deployment

The GitHub Action will automatically:
- ✅ Build your backend Docker image
- ✅ Create a new Koyeb app called `sbe-backend`
- ✅ Deploy the first version

**Monitor progress**: Check the GitHub Actions tab or visit https://app.koyeb.com

### 4️⃣ Configure Environment Variables in Koyeb

Once the app is created:

1. Go to **Koyeb Dashboard** → **Apps** → **sbe-backend** → **api** service
2. Click **Environment Variables** tab
3. Add these variables:

| Variable | Example Value | Notes |
|----------|---------------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/sbe_db` | **Required** - Get from your database provider |
| `REDIS_URL` | (leave empty) | Optional - uses in-memory mock if empty |
| `JWT_SECRET` | `your-random-secret-key` | **Required** - generate with: `openssl rand -hex 32` |

4. Click **Deploy** to restart with the new variables

### 5️⃣ Set Up Database

**Option A: Supabase (Recommended & Already Configured)**
```bash
# Get your connection string from:
# Supabase Dashboard → Project Settings → Database → Connection string
# Format: postgresql://postgres.[project-ref]:[password]@[host]:5432/postgres
```

**Option B: Koyeb Managed Database**
1. In Koyeb, go to **Databases** → **Create**
2. Choose **PostgreSQL**
3. Copy the connection string
4. Add it as `DATABASE_URL` in step 4

### 6️⃣ Verify Deployment

1. **Check health endpoint**:
   ```bash
   curl https://sbe-backend.<your-account>.koyeb.app/health
   # Expected: {"status":"ok","version":"1.0.0"}
   ```

2. **Update Frontend API URL** (if different):
   - Edit `sbe/web/vercel.json`
   - Update `NEXT_PUBLIC_API_URL` to your Koyeb URL
   - Commit and push

3. **Test the API**:
   ```bash
   curl https://sbe-backend.<your-account>.koyeb.app/matches/active
   ```

## 🎉 You're Done!

Your backend is now deployed and will automatically redeploy on every push to `main`.

## 📊 Monitor Your Deployment

- **Koyeb Dashboard**: https://app.koyeb.com
- **GitHub Actions**: https://github.com/Warriorlegacy/JMD-Online-Book/actions
- **Service Logs**: Koyeb → Apps → sbe-backend → api → Logs

## 🔧 Common Issues

### "Deployment failed"
- Check Koyeb service logs for error messages
- Verify `DATABASE_URL` is correct and accessible
- Ensure all environment variables are set

### "Service crashes on startup"
- Check logs for database connection errors
- Verify PostgreSQL version compatibility (14+)
- Ensure `npm run build` succeeds locally

### "Frontend can't connect to backend"
- Verify `NEXT_PUBLIC_API_URL` in `vercel.json` matches your Koyeb URL
- Check CORS settings in backend allow Vercel domain
- Ensure Koyeb service status is "Healthy"

## 📞 Need Help?

- **Koyeb Docs**: https://www.koyeb.com/docs
- **GitHub Issues**: https://github.com/Warriorlegacy/JMD-Online-Book/issues
- **Master Prompt**: See `Master Prompt for Sports Betting Exchange.md` for architecture details
