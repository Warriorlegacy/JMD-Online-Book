# Fix CSP and Remote Patterns for Unsplash Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve Content Security Policy (CSP) violations and Next.js Image optimization errors by adding `images.unsplash.com` to the allowed origins.

**Architecture:** Update `next.config.ts` and `vercel.json` to include `https://images.unsplash.com` in the `connect-src` directive (for Service Worker fetches) and `images.remotePatterns` (for Next.js image optimization).

**Tech Stack:** Next.js, Vercel CSP

---

### Task 1: Update jmd-online-book/next.config.ts

**Files:**
- Modify: `jmd-online-book/next.config.ts`

- [ ] **Step 1: Add Unsplash to connect-src**

Update the `cspDirectives` array to include `https://images.unsplash.com` in the `connect-src` string.

- [ ] **Step 2: Add Unsplash to remotePatterns**

Update the `images.remotePatterns` array to include an object for `images.unsplash.com`.

- [ ] **Step 3: Commit changes**

```bash
git add jmd-online-book/next.config.ts
git commit -m "fix: allow images.unsplash.com in CSP connect-src and remotePatterns"
```

### Task 2: Update sbe/web/vercel.json

**Files:**
- Modify: `sbe/web/vercel.json`

- [ ] **Step 1: Add Unsplash to connect-src in vercel.json**

Find the `Content-Security-Policy` header value and add `https://images.unsplash.com` to the `connect-src` directive.

- [ ] **Step 2: Commit changes**

```bash
git add sbe/web/vercel.json
git commit -m "fix: allow images.unsplash.com in sbe web CSP"
```

### Task 3: (Optional/Cleanup) Verify Service Worker Removal

**Files:**
- Modify: `jmd-online-book/src/app/layout.tsx`
- Delete: `jmd-online-book/public/sw.js`

- [ ] **Step 1: Remove SW registration from layout.tsx**

Remove the script tag that registers `/sw.js`.

- [ ] **Step 2: Delete sw.js**

Delete the `public/sw.js` file as per `SUMMARY.md` intention.

- [ ] **Step 3: Commit changes**

```bash
git rm jmd-online-book/public/sw.js
git add jmd-online-book/src/app/layout.tsx
git commit -m "fix: completely remove service worker as per project summary"
```
