# Agentic Coding Guidelines (AGENTS.md)

This document provides essential context, commands, and standards for AI agents operating within the JMD Online Book repository.

## 🛠 Project Structure & Tech Stack
Monorepo containing multiple specialized projects:
- Root: `src/app/` (Next.js App Router) with API routes
- `sbe/backend`: Fastify + TypeScript + Drizzle ORM + PostgreSQL + Redis + Supabase
- `sbe/web`: Next.js 16 + TypeScript + Tailwind CSS 4 + Vitest
- `jmd-mobile`: Expo + React Native
- **Note**: `jmd-online-book/` exists as duplicate nested structure

## 🚀 Build, Lint & Test Commands

### `sbe/backend`
- **Build**: `npm run build` (tsc)
- **Dev**: `npm run dev` (ts-node-dev)
- **Start**: `npm run start`
- **Test**: `npm run test`
- **Database**:
  - Generate: `npm run db:generate`
  - Migrate: `npm run db:migrate`
  - Push: `npm run db:push`
  - Studio: `npm run db:studio`
  - Seed: `npm run db:seed`

### `sbe/web`
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Start**: `npm run start`
- **Lint**: `npm run lint`
- **Test**: `npm run test`
- ⚠️ **CRITICAL**: This is Next.js 16 with breaking changes. Always check `node_modules/next/dist/docs/` before writing code.

### `jmd-mobile`
- **Start**: `npm start`
- **Android**: `npm run android`
- **iOS**: `npm run ios`
- **Web**: `npm run web`

## 🎨 Architecture & Constraints
- Database: Supabase PostgreSQL with Drizzle ORM, migrations in `supabase/migrations/`
- Design System (strict Apple aesthetic, see DESIGN.md):
  - Colors: **Only** #000000, #f5f5f7, #0071e3 (interactive elements)
  - Typography: SF Pro Display (20px+), SF Pro Text (<20px)
  - Components: 980px border radius for pill links, 8px for primary buttons, glass navigation
- Frontend: Server-side proxy pattern with HttpOnly cookies, backend endpoints are never exposed directly
- TypeScript: Strict mode enabled, avoid `any`, prefer `interface` for objects
- **No TODO/comments/placeholders** in production code
- Always run `lint` → `build` → `test` for the modified project after changes
- Schema changes: Update `sbe/backend/src/db/schema.ts` first, then run `db:generate`

## 🤖 Agent Rules
- Check `.cursorrules` in target project folder before starting any task
- Mimic existing code style exactly; follow established patterns for API calls, state management
- Verify all changes with corresponding project test commands