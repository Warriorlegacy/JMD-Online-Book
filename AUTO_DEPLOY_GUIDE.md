# 🚀 Zero-Touch God-Level Deployment Guide

Your Sports Betting Exchange (SBE) is now equipped with a fully automated, test-driven CI/CD pipeline. 

## 🛡️ The "Zero-Touch" Workflow
1. **Push Changes**: Every time you push code to the `main` branch.
2. **Automated Validation**: GitHub Actions automatically runs `lint` and `build`.
3. **God-Level Verification**: The system executes `sbe/backend/scripts/god-test.ts`, verifying auth, ledger, markets, and AI insights.
4. **Auto-Deploy**: 
   - If tests pass, the **Backend** is automatically deployed to Render.
   - The **Frontend** is automatically deployed to Vercel via Git integration.

## 🔑 Setup Required (One-Time)
To activate this pipeline, you must add the following **Secrets** in your GitHub Repository settings (`Settings > Secrets and variables > Actions`):

| Secret Name | Description |
|-------------|-------------|
| `RENDER_API_KEY` | Your Render API Key (from Dashboard Settings) |
| `RENDER_SERVICE_ID` | The Service ID of your Backend on Render |
| `DATABASE_URL` | Your production PostgreSQL connection string |
| `BACKEND_URL` | The live URL of your backend (for God-Test validation) |
| `NEXT_PUBLIC_API_URL`| The live URL of your backend (for Frontend build) |

## 📦 Infrastructure as Code
- **`render.yaml`**: This file defines your entire production infrastructure (Web Service + Database). You can import this into Render to create all services in one click.
- **`.github/workflows/deploy.yml`**: The brains of the automation. It ensures that **broken code never hits production**.

## 🚦 Monitoring
- **GitHub Actions**: Watch the progress in the `Actions` tab of your repo.
- **Render Dashboard**: View deployment logs and service health.
- **Vercel Dashboard**: Monitor frontend build and edge deployment.

**The system is now fully autonomous. Build, Test, Deploy — all in one go.** 🚀
