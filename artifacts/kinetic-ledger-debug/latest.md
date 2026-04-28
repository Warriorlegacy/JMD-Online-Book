# Kinetic Ledger Debug Report

- Started: 2026-04-27T08:35:36.072Z
- Finished: 2026-04-27T08:37:18.715Z
- Mode: remote
- Target: https://web-two-gamma-49.vercel.app
- Health: CLEAN

## Core Checks
- Vercel cron config: PASS
- Lint: PASS
- Typecheck: PASS
- Build: PASS
- Test: PASS
- Database: PASS
- Supabase REST: PASS
- Runtime: PASS
- Routes: PASS

## Route Probes
- PASS GET /api/auth/me: status 200
- PASS GET /api/matches: status 200
- PASS GET /api/matches/active: status 200
- PASS GET /api/matches/48977529-15e8-43be-a10b-9510848e334e: status 200
- PASS GET /api/ai/insights/48977529-15e8-43be-a10b-9510848e334e: status 200
- PASS GET /api/tenant/config: status 200
- PASS GET /api/admin/matches: status 200
- PASS GET /api/admin/matches/48977529-15e8-43be-a10b-9510848e334e: status 200
- PASS GET /api/admin/tournaments: status 200
- PASS GET /api/admin/users: status 200
- PASS GET /api/admin/deposits: status 200
- PASS GET /api/admin/withdrawals: status 200
- PASS GET /api/admin/announcements: status 200
- PASS POST /api/admin/deposits/00000000-0000-0000-0000-000000000000/approve: status 404
- PASS POST /api/admin/deposits/00000000-0000-0000-0000-000000000000/reject: status 404
- PASS POST /api/admin/withdrawals/00000000-0000-0000-0000-000000000000/approve: status 404
- PASS POST /api/admin/withdrawals/00000000-0000-0000-0000-000000000000/reject: status 404
- PASS POST /api/admin/matches/00000000-0000-0000-0000-000000000000/settle: status 404
- PASS GET /api/cron/settle-markets: status 200

## BACKEND_URL Audit
- No BACKEND_URL leaks found in sbe/web source.

## Design Audit
- #1e293b: 2 occurrence(s)
- #abd45e: 23 occurrence(s)
- #162000: 1 occurrence(s)
- #0a0a0a: 2 occurrence(s)
- #1c1c1e: 20 occurrence(s)
- #151517: 2 occurrence(s)
- #2c2c2e: 5 occurrence(s)
- #3a3a3c: 7 occurrence(s)
- #ff3b30: 12 occurrence(s)
- #8e8e93: 3 occurrence(s)
- #06b6d4: 1 occurrence(s)
- #0a0e17: 19 occurrence(s)

## Commands
```text
npm.cmd run lint
node_modules\.bin\tsc.cmd --noEmit
npm.cmd run build
npm.cmd run test
```
