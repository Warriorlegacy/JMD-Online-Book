# Kinetic Ledger Debug Report

- Started: 2026-04-28T20:22:06.251Z
- Finished: 2026-04-28T20:23:12.402Z
- Mode: local
- Target: http://127.0.0.1:3210
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
