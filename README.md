# Sports Betting Exchange (SBE)

Professional-grade, peer-to-peer sports betting exchange built with sub-millisecond Rust matching and real-time React analytics.

## 🚀 Live Platform
- **Frontend**: [Vercel](https://vercel.com)
- **Backend Service**: Dockerized Node.js + Rust Engine
- **Database**: Supabase + PostgreSQL (RLS Secured)

## 🛠️ Technology Stack
- **Engine**: Rust (L2 Depth snapshots, atomic liability management)
- **API**: Fastify + TypeScript (WebSocket PubSub, Auth Middleware)
- **Storage**: Drizzle ORM + Supabase (8-decimal wallet precision)
- **UI**: Next.js 16 + Tailwind CSS 4 + Lightweight Charts (L2 Price Ladder)

## 📦 Production Deployment
This repository is configured with **GitHub Actions**. Any push to the `main` branch will automatically:
1.  Run linting and Typecheck.
2.  Build the Next.js production bundle.
3.  Deploy the frontend to **Vercel**.
4.  Trigger the cloud backend update.

### Environment Secrets Required:
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 👨‍💻 Local Development
1.  **Clone**: `git clone https://github.com/Warriorlegacy/JMD-Online-Book.git`
2.  **Install**: `npm install` in both `sbe/backend` and `sbe/web`.
3.  **Run Engine**: `cd sbe/engine && cargo run --release`
4.  **Run Backend**: `cd sbe/backend && npm run dev`
5.  **Run Frontend**: `cd sbe/web && npm run dev`

---
Built by Antigravity AI. Ready for global markets.
