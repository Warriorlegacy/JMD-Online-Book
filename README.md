# JMD Online Book - SaaS Platform

Multi-tenant gaming wallet platform built with Next.js 16 + Supabase.

## Quick Deploy

```bash
cd jmd-online-book
npm install
npm run build
vercel --prod
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes, Supabase
- **Auth**: Email/Password (Supabase Auth)
- **State**: Zustand
- **Forms**: React Hook Form + Zod

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OTP_SECRET=your-otp-secret
Legacy_JWT_Secret=your-jwt-secret
```

## Routes

| Route | Description |
|-------|-------------|
| `/login` | User login |
| `/register` | User registration |
| `/home` | User dashboard |
| `/wallet` | Wallet balance |
| `/deposit` | Deposit request |
| `/withdraw` | Withdraw request |
| `/transactions` | Transaction history |
| `/admin/dashboard` | Admin panel |
| `/super-admin/dashboard` | Super admin panel |

## Database Migrations

Run in Supabase SQL Editor:
1. `supabase/migrations/001_jmd_online_book.sql`
2. `supabase/migrations/002_multi_tenant.sql`
3. `supabase/migrations/003_performance_indexes.sql`

## Features

- Email/Password authentication (no OTP)
- Wallet management (deposit/withdraw)
- Transaction approval workflow
- Referral system with commissions
- Multi-tenant support
- Super admin dashboard

## Build Status

✅ Build Clean - Ready for deployment