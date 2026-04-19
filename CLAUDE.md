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

### Common Operations
- Git status: `git status` (run in repository root)
- View changes: `git diff` (run in repository root)
- Recent commits: `git log` (run in repository root)

## Architecture Overview

The project is a multi-tenant SaaS gaming wallet system with a modern web architecture.

### High-Level Structure
- **Frontend**: Next.js 16 (App Router) in `jmd-online-book/` with Tailwind CSS 4.
    - **State Management**: Zustand
    - **Forms/Validation**: React Hook Form + Zod
    - **Styling**: Design system following Apple aesthetic (see DESIGN.md)
- **Edge Layer**: Middleware and Edge Functions handle authentication and request routing.
- **Backend (`sbe/backend`)**: A Fastify-based TypeScript server managing heavy business logic, wallet transactions, and database interactions.
- **Database/Auth**: Supabase (PostgreSQL) is used for the primary data store and authentication.
    - **Migrations**: Found in `jmd-online-book/supabase/migrations/`
    - **Schema**: Defined in `sbe/backend/src/db/schema.ts` using Drizzle ORM

### Key Design Patterns
- **Secure Proxy**: The frontend uses a server-side proxy to hide backend endpoints and manage authentication tokens via secure HttpOnly cookies to mitigate XSS.
- **Multi-tenancy**: Environments are isolated for different tenants.
- **Database Access**: Backend interacts with PostgreSQL using Drizzle ORM.
- **Auth Flow**: Supabase Auth manages sessions, which are then persisted in cookies.

## Design System (Apple Aesthetic)

The frontend follows a strict Apple-inspired design system detailed in `DESIGN.md`.

### Visual Identity
- **Color Palette**: Binary rhythm of Pure Black (`#000000`) and Light Gray (`#f5f5f7`).
- **Accent Color**: Apple Blue (`#0071e3`) is reserved EXCLUSIVELY for interactive elements.
- **Typography**: Use `SF Pro Display` for 20px+ and `SF Pro Text` for <20px.
- **Spacing**: Tight line-heights (1.07-1.14 for headlines) and universal negative letter-spacing.

### Component Guidelines
- **CTAs**: Use 980px border-radius for "pill" links. Primary buttons use 8px radius.
- **Navigation**: Sticky, translucent dark glass (`rgba(0,0,0,0.8)` with `blur(20px)`).
- **Layout**: Use alternating background color blocks to separate sections (cinematic rhythm).
- **Elevation**: Avoid heavy shadows; use a single soft diffused shadow (`rgba(0,0,0,0.22) 3px 5px 30px 0px`) or none.

## Developer Notes

- **Next.js Version Alert**: This project uses a version of Next.js with significant breaking changes. APIs and conventions may differ from standard training data. Always check `node_modules/next/dist/docs/` for the authoritative guide before implementing new features.
- **TypeScript Configuration**: The backend uses strict TypeScript settings. Ensure type safety when making changes.
- **Database Schema**: Always update schema definitions in `sbe/backend/src/db/schema.ts` and generate migrations using `npm run db:generate`.
- **Environment Variables**: Configure environment variables in `.env.local` files. Never commit sensitive data.
- **Testing**: Use the provided test scripts to ensure code quality before committing changes.