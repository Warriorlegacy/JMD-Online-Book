# Kinetic Ledger Debug Report

- Started: 2026-04-27T16:24:14.133Z
- Finished: 2026-04-27T16:24:55.356Z
- Mode: local
- Target: http://127.0.0.1:3210
- Health: ATTENTION REQUIRED

## Core Checks
- Vercel cron config: PASS
- Lint: PASS
- Typecheck: PASS
- Build: PASS
- Test: PASS
- Database: FAIL
- Supabase REST: FAIL
- Runtime: PASS
- Routes: FAIL

## Route Probes


## BACKEND_URL Audit
- No BACKEND_URL leaks found in sbe/web source.

## Design Audit
- #0a0e17: 19 occurrence(s)
- #0d1117: 2 occurrence(s)
- #f54242: 1 occurrence(s)
- #4f46e5: 1 occurrence(s)
- #0f766e: 1 occurrence(s)
- #162a3d: 8 occurrence(s)
- #0f1923: 1 occurrence(s)
- #0d1120: 28 occurrence(s)
- #0d1525: 1 occurrence(s)
- #0064cc: 5 occurrence(s)
- #afff00: 33 occurrence(s)
- #0a0a00: 1 occurrence(s)

## Commands
```text
npm run lint
/app/sbe/web/node_modules/.bin/tsc --noEmit
npm run build
npm run test
```
