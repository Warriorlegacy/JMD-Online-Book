# Database Connectivity Incident Report

## Overview
A routine health check of the active matches endpoint (`/api/matches/active`) was performed via a diagnostic script (`debug_live_system.js`). The objective was to verify that the system correctly returns a non-empty array of active matches from Supabase.

## Findings
During testing in the execution environment, the local node health check passed:
- **Status:** PASS
- **Endpoint tested:** `http://127.0.0.1:3210/api/matches/active`
- **Result:** Successfully returned 5 active matches (including 'in_play' and 'scheduled').

However, an earlier diagnostic revealed that if a connection string is misconfigured (e.g. empty or using invalid credentials), backend APIs relying on the `DATABASE_URL` via `pg` can fail and return 500 status codes.

## Root Cause Analysis
Although the health check passed in the current configuration, historical log tracking (referencing `sbe/web/src/app/api/auth/login/route.ts` and `sbe/web/src/lib/db.ts`) highlighted potential vulnerabilities:
1. **Empty DATABASE_URL:** If `process.env.DATABASE_URL` is missing, the singleton `pg` pool defaults to attempting local default authentication or fails entirely. The `lib/db.ts` file currently emits a `console.warn` but continues initialization.
2. **Missing JWT_SECRET:** API routes will return a 500 error and bypass database connectivity checks if `process.env.JWT_SECRET` is undefined.

## Recommendations
To prevent actual health check failures in production environments:
1. **Strict Environment Validation:** Implement early startup validation to fail fast if `DATABASE_URL` is omitted, rather than logging a warning and returning 500s later in the lifecycle.
2. **Connection Port:** Ensure that direct database queries via the `pg` pool utilize standard direct connection ports (e.g., 5432) rather than pooler ports (6543) unless Supabase Transaction Pooler is explicitly configured and supported by the driver.
3. **Continuous Monitoring:** The `debug_live_system.js` script can be incorporated into automated CI pipelines to verify database connectivity and state prior to Vercel deployments.
