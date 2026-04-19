# Production Deployment: The Clean Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all 18 ESLint errors and 3 warnings in the JMD Online Book codebase, clean up remaining PWA asset references, and deploy a secure, zero-warning artifact to Vercel.

**Architecture:** We will systematically move through the lint errors, starting with the most complex React hooks/lifecycle bugs, then tackle unused variables and type issues. Afterward, we clean up the manifest and deploy via Vercel CLI.

**Tech Stack:** Next.js (App Router), TypeScript, Vercel CLI

---

### Task 1: Fix Component Lifecycle Bug in Streak Indicator

**Files:**
- Modify: `jmd-online-book/src/components/ui/streak-indicator.tsx`

- [ ] **Step 1: Read the existing file to understand `getIcon` usage**

Run: `npm run lint` or inspect the file to see how `Icon` is rendered.
Expected: See `const Icon = getIcon();` rendered as `<Icon className="..." />` inside the render function.

- [ ] **Step 2: Refactor to render the icon component conditionally instead of instantiating it**

Replace the instantiation of the component inside render. Instead of `const Icon = getIcon(); <Icon />`, return the actual JSX from the helper function or conditionally render it directly.

```tsx
// Inside StreakIndicator component
  const renderIcon = () => {
    if (streak >= 30) return <Crown className={cn("h-4 w-4", getColor())} />;
    if (streak >= 7) return <Flame className={cn("h-4 w-4", getColor())} />;
    return <Zap className={cn("h-4 w-4", getColor())} />;
  };

  return (
    // ...
    <motion.div ...>
      {renderIcon()}
    </motion.div>
    // ...
  )
```

- [ ] **Step 3: Run linter to verify fix**

Run: `cd jmd-online-book && npx eslint src/components/ui/streak-indicator.tsx`
Expected: No errors for this file.

- [ ] **Step 4: Commit**

```bash
git add jmd-online-book/src/components/ui/streak-indicator.tsx
git commit -m "fix: resolve component creation during render in streak-indicator"
```

### Task 2: Fix Cascading Render in Sports Client Page

**Files:**
- Modify: `jmd-online-book/src/app/(main)/sports/page-client.tsx`

- [ ] **Step 1: Refactor useEffect to avoid synchronous state updates**

Remove the `useEffect(() => { fetchEvents(); }, [fetchEvents]);` if `fetchEvents` is already being called elsewhere, or ensure `fetchEvents` doesn't synchronously update state during the initial render in a way that triggers the warning. If `fetchEvents` is just an initialization call, ensure it's wrapped properly or the dependency array is correct. Since the error is "Calling setState synchronously within an effect", we may need to make `fetchEvents` async or remove a redundant call.

- [ ] **Step 2: Run linter to verify fix**

Run: `cd jmd-online-book && npx eslint src/app/\(main\)/sports/page-client.tsx`
Expected: No cascading render errors.

- [ ] **Step 3: Commit**

```bash
git add jmd-online-book/src/app/\(main\)/sports/page-client.tsx
git commit -m "fix: resolve cascading render in sports client page"
```

### Task 3: Fix React Hook Dependencies

**Files:**
- Modify: `jmd-online-book/src/app/(main)/pnl/page-client.tsx`
- Modify: `jmd-online-book/src/app/admin/reports/page-client.tsx`

- [ ] **Step 1: Add missing dependencies**

In `pnl/page-client.tsx`, add `fetchPnL` to the `useEffect` dependency array. Wrap `fetchPnL` in `useCallback` if it isn't already to prevent infinite loops.
In `reports/page-client.tsx`, add `fetchSummary` to the `useEffect` dependency array. Wrap `fetchSummary` in `useCallback`.

- [ ] **Step 2: Run linter**

Run: `cd jmd-online-book && npx eslint src/app/\(main\)/pnl/page-client.tsx src/app/admin/reports/page-client.tsx`
Expected: No exhaustive-deps warnings.

- [ ] **Step 3: Commit**

```bash
git add jmd-online-book/src/app/\(main\)/pnl/page-client.tsx jmd-online-book/src/app/admin/reports/page-client.tsx
git commit -m "fix: resolve exhaustive-deps warnings"
```

### Task 4: Fix Unused Variables and Types

**Files:**
- Modify: `jmd-online-book/src/app/(main)/sports/page.tsx`
- Modify: `jmd-online-book/src/app/(main)/transactions/page.tsx`
- Modify: `jmd-online-book/src/api/admin/reports/summary/route.ts`
- Modify: `jmd-online-book/src/api/diagnostic/route.ts`
- Modify: `jmd-online-book/src/api/setup/database/run-migrations/route.ts`
- Modify: `jmd-online-book/src/app/super-admin/dashboard/page.tsx`
- Modify: `jmd-online-book/src/app/super-admin/layout.tsx`
- Modify: `jmd-online-book/src/lib/casino/payouts.test.ts`
- Modify: `jmd-online-book/src/lib/data.ts`
- Modify: `jmd-online-book/src/lib/repo.ts`

- [ ] **Step 1: Prefix unused variables with `_` or remove them**

Go through each file and either remove the unused import/variable or prefix it with `_` (e.g., `_tenantId`, `_url`). For `diagnostic/route.ts`, change `any` to `unknown`.

- [ ] **Step 2: Run linter**

Run: `cd jmd-online-book && npm run lint`
Expected: No unused-vars or no-explicit-any errors.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "fix: resolve unused variables and explicit any types"
```

### Task 5: Fix Next.js Image Optimization Warning

**Files:**
- Modify: `jmd-online-book/src/app/super-admin/tenants/page.tsx`

- [ ] **Step 1: Replace `<img>` with `<Image />`**

Import `Image` from `next/image` and replace the standard `<img>` tag, providing `width` and `height` props.

- [ ] **Step 2: Commit**

```bash
git add jmd-online-book/src/app/super-admin/tenants/page.tsx
git commit -m "fix: use next/image for tenant logo"
```

### Task 6: PWA Asset Cleanup

**Files:**
- Modify: `jmd-online-book/public/manifest.json` (if exists)
- Modify: `jmd-online-book/src/app/layout.tsx`

- [ ] **Step 1: Remove missing icons from manifest**

If `manifest.json` references `/icons/icon-192.png` and it doesn't exist, remove the `icons` array from the JSON.
In `layout.tsx`, remove the `manifest: "/manifest.json"` from the metadata export if it's no longer needed, or ensure it points to a valid file without missing assets.

- [ ] **Step 2: Commit**

```bash
git add jmd-online-book/public/manifest.json jmd-online-book/src/app/layout.tsx
git commit -m "chore: clean up missing PWA asset references"
```

### Task 7: Vercel Deployment

**Files:** None

- [ ] **Step 1: Verify Production Build locally**

Run: `cd jmd-online-book && npm run build`
Expected: Exits with 0, successfully creating optimized build.

- [ ] **Step 2: Deploy to Vercel**

Run: `cd jmd-online-book && npx vercel --prod --yes`
(Note: ensure Vercel CLI is authenticated and environment variables are already populated in the Vercel project settings).
Expected: Output showing successful deployment URL.
