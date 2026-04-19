# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

### Frontend (`jmd-online-book`)
- Development server: `npm run dev`
- Install dependencies: `npm install`
- Build project: `npm run build`
- Lint code: `npm run lint`
- Run tests: `npm run test`
- Run tests (watch mode): `npm run test:watch`
- Run tests (coverage): `npm run test:coverage`
- Create admin user: `npm run create:admin`
- Insert default games: `npm run insert:games`
- Remote bootstrap: `npm run bootstrap:remote`

### Backend (`sbe/backend`)
- Development server: `npm run dev`
- Start production server: `npm run start`
- Build project: `npm run build`
- Database generation: `npm run db:generate`
- Database migration: `npm run db:migrate`
- Push schema changes: `npm run db:push`
- Open database studio: `npm run db:studio`
- Seed database: `npm run db:seed`

## Architecture Overview

The project is a multi-tenant SaaS gaming wallet system.

### High-Level Structure
- **Frontend**: Next.js 16 (App Router) in `jmd-online-book/` with Tailwind CSS 4.
- **Edge Layer**: Middleware and Edge Functions handle authentication and request routing.
- **Backend (`sbe/backend`)**: A Fastify-based TypeScript server managing heavy business logic, wallet transactions, and database interactions.
- **Database/Auth**: Supabase (PostgreSQL) is used for the primary data store and authentication.

### Key Design Patterns
- **Secure Proxy**: The frontend uses a server-side proxy to hide backend endpoints and manage authentication tokens via secure HttpOnly cookies to mitigate XSS.
- **Multi-tenancy**: Environments are isolated for different tenants.
- **Database Access**: Backend interacts with PostgreSQL using Drizzle ORM.
- **Auth Flow**: Supabase Auth manages sessions, which are then persisted in cookies.
