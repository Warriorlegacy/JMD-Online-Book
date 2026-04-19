# Production Deployment: "The Clean Build" Specification

**Goal:** Polish the JMD Online Book (Betting Exchange) codebase by resolving all technical debt (lint errors, asset warnings, component lifecycle bugs) and deploying a secure, production-ready artifact to Vercel.

**Scope:**
1. **Zero-Warning Codebase:** Fix 18 ESLint errors and 3 warnings.
2. **PWA/Asset Cleanup:** Remove lingering references to the deleted service worker's icons in the web app manifest to prevent 404 errors in production.
3. **Environment Preparation:** Verify required environment variables (Supabase URL/Key, JWT Secret, Resend API Key) for Vercel deployment.
4. **Vercel Deployment:** Execute a production build and deploy via the Vercel CLI.

---

## 1. Zero-Warning Codebase (Linting & Component Bugs)

We will address the issues flagged by `npm run lint`:

*   **React Hook Dependencies (Warnings):**
    *   `src/app/(main)/pnl/page-client.tsx`: Add `fetchPnL` to `useEffect` dependencies, or wrap `fetchPnL` in `useCallback`.
    *   `src/app/admin/reports/page-client.tsx`: Add `fetchSummary` to `useEffect` dependencies.
*   **Cascading Render Error:**
    *   `src/app/(main)/sports/page-client.tsx`: The `useEffect` that calls `fetchEvents()` triggers a synchronous state update. We will refactor this to ensure state updates do not trigger infinite loops or cascading renders, likely by checking if the component is mounted or adjusting how `fetchEvents` initializes state.
*   **Component Creation During Render Error:**
    *   `src/components/ui/streak-indicator.tsx`: `const Icon = getIcon();` creates a new component instance on every render. We will refactor this to instantiate the component outside the render cycle or conditionally render the SVG directly.
*   **Unused Variables (Errors):**
    *   Prefix with `_` or remove unused variables across 10 files (`sports/page.tsx`, `transactions/page.tsx`, `admin/reports/page-client.tsx`, `api/diagnostic/route.ts`, `lib/repo.ts`, etc.).
*   **Next.js Optimization Warnings:**
    *   `src/app/super-admin/tenants/page.tsx`: Replace the standard `<img>` tag with `next/image` (`<Image />`) for automatic image optimization.
*   **Type Safety:**
    *   `src/app/api/diagnostic/route.ts`: Replace `any` with `unknown` or a specific interface.

## 2. PWA & Asset Cleanup

The Service Worker (`sw.js`) was removed previously, but `manifest.json` likely still points to missing icons (`/icons/icon-192.png`, `/icons/icon-512.png`).
*   **Action:** Update `public/manifest.json` (if it exists) to either provide placeholder icons or remove the `icons` array entirely. Remove the `manifest` property from `src/app/layout.tsx` `metadata` if it's no longer serving a purpose.

## 3. Environment Variable Verification

To ensure a successful production deployment, the Vercel environment must have the following variables (as listed in `SUMMARY.md`):
*   `NEXT_PUBLIC_SUPABASE_URL`
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
*   `SUPABASE_SERVICE_ROLE_KEY`
*   `NEXT_PUBLIC_APP_NAME`
*   `NEXT_PUBLIC_APP_URL`
*   `Legacy_JWT_Secret`
*   `RESEND_API_KEY`
*   `OTP_SECRET`

**Action:** We will verify these exist in the local `.env.production` or `.env.local` to push them to Vercel during deployment. (The user will need to provide actual values if they are missing locally).

## 4. Vercel Deployment Execution

Once the codebase builds locally without errors (`npm run build`), we will:
1.  Run `npx vercel link` (if not already linked).
2.  Run `npx vercel env pull` / `push` to synchronize secrets.
3.  Run `npx vercel --prod --yes` to deploy the application.

---
*Status: Awaiting User Approval*