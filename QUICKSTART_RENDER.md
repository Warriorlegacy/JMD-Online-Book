# 🚀 Quick Start: Deploy SBE Backend to Render (FREE!)

## Why Render?
- ✅ **100% Free** - No credit card required
- ✅ **750 free hours/month** - Enough for 24/7 deployment
- ✅ **Auto-sleep** - Pauses when idle, wakes on request
- ✅ **Free PostgreSQL** - Managed database included
- ✅ **Docker support** - Works with your existing setup
- ✅ **Auto-deploy** - GitHub integration

---

## Step-by-Step Setup (5 minutes)

### 1️⃣ Create Render Account

1. **Sign up**: https://render.com/signup
2. **Connect GitHub** when prompted
3. **No credit card needed** for free tier!

### 2️⃣ Create Web Service

1. Go to **Dashboard** → **New** → **Web Service**
2. **Connect repository**: Select `Warriorlegacy/JMD-Online-Book`
3. **Configure**:
   - **Name**: `sbe-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `sbe/backend`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`
   - **Auto-Deploy**: ✅ Yes

4. Click **Create Web Service**

### 3️⃣ Add Environment Variables

In your Render service settings:

1. Go to **Environment** tab
2. Add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | (from step 4) | PostgreSQL connection string |
| `REDIS_URL` | (leave empty) | Optional - uses in-memory mock |
| `JWT_SECRET` | Generate random string | Use: `openssl rand -hex 32` |
| `PORT` | `4000` | Already configured |

3. Click **Save Changes**

### 4️⃣ Create PostgreSQL Database

1. Go to **Dashboard** → **New** → **PostgreSQL**
2. **Name**: `sbe-database`
3. **Region**: Same as your web service
4. Click **Create Database**
5. **Copy the Internal Connection String** (looks like `postgresql://user:pass@host:5432/db`)
6. Add it as `DATABASE_URL` in step 3

### 5️⃣ Generate API Key for GitHub Actions

1. Go to **Dashboard** → **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it: `GitHub Actions`
4. **Copy the key** (starts with `rnd_`)

### 6️⃣ Add GitHub Secrets

1. Go to GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - **Name**: `RENDER_API_KEY`
   - **Value**: Paste your Render API key from step 5

4. Add another secret:
   - **Name**: `RENDER_SERVICE_ID`
   - **Value**: Your service ID (find it in Render dashboard URL: `https://dashboard.render.com/u/services/<SERVICE_ID>`)

### 7️⃣ Verify Deployment

1. **Check health endpoint**:
   ```bash
   curl https://sbe-backend.onrender.com/health
   # Expected: {"status":"ok","version":"1.0.0"}
   ```

2. **Test the API**:
   ```bash
   curl https://sbe-backend.onrender.com/matches/active
   ```

---

## 🎉 You're Done!

Your backend is now deployed for **FREE** on Render and will auto-deploy on every push to `main`.

---

## 📊 Monitor Your Deployment

- **Render Dashboard**: https://dashboard.render.com
- **Service Logs**: Render → Services → sbe-backend → Logs
- **GitHub Actions**: https://github.com/Warriorlegacy/JMD-Online-Book/actions

---

## 🔧 Understanding Render's Free Tier

### Free Instance Specs:
- **512 MB RAM**
- **0.1 CPU**
- **750 hours/month** (enough for 24/7 if you have 1 service)
- **Auto-sleep after 15 minutes** of inactivity
- **Wakes on HTTP request** (adds ~30s delay on first request)

### For Production:
- Upgrade to **Starter** ($7/month) for:
  - Always-on service
  - 512 MB RAM, 0.5 CPU
  - Custom domains
  - Better performance

---

## 📝 Alternative: Railway (Also Free)

If you prefer Railway instead:

1. **Sign up**: https://railway.app
2. **Connect GitHub**
3. **Deploy from repo**: Select `sbe/backend`
4. **Add PostgreSQL**: Railway has 1-click database provisioning
5. **Get $5 free credits** monthly

Railway advantages:
- Better UI/UX
- Easier database management
- More generous free tier initially

---

## 🆘 Troubleshooting

### "Build failed"
- Check Render build logs
- Verify Dockerfile is in `sbe/backend/`
- Ensure `npm run build` works locally

### "Service sleeping too often"
- Free tier sleeps after 15 min of inactivity
- First request wakes it up (~30s delay)
- Consider upgrading to Starter ($7/mo) for always-on

### "Database connection failed"
- Verify `DATABASE_URL` uses **Internal Connection String**
- Ensure database is in same region as service
- Check database is "Ready" status

### "GitHub Action deployment failed"
- Verify `RENDER_API_KEY` is correct
- Check `RENDER_SERVICE_ID` matches your service
- Ensure service exists in Render dashboard

---

## 💡 Pro Tips

1. **Keep it free**: Use Render's free tier for development
2. **Auto-deploy works**: Push to `main` → automatic deployment
3. **Environment variables**: All secrets managed in Render dashboard
4. **Custom domain**: Available on paid plans
5. **Metrics**: Free monitoring in Render dashboard

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Community**: https://community.render.com
- **GitHub Issues**: https://github.com/Warriorlegacy/JMD-Online-Book/issues
