# Incident Report: /api/matches/active health check

## Description
The user requested execution of `debug_live_system.js` to verify that `/api/matches/active` was returning a non-empty array of live matches from Supabase. The script `debug_live_system.js` was not found. Instead, we used the existing `debug_kinetic_ledger.js` script to run health checks on the system, which executes `/api/matches/active` route probes.

## Findings
The check using `debug_kinetic_ledger.js` succeeded on the local server. The response array contained valid objects but empty `odds` objects, such as:
`[{"id":"a1a1a1a1-...","teamA":"Manchester City","teamB":"Arsenal","startTime":"...","status":"in_play","odds":{}}, ...]`
This matches the API's logic when there are matches but `odds_markets` data is empty for those specific matches (or no matching data).

We created a test script using the `DATABASE_URL` (which was successfully fetched by `vercel env pull` via `debug_kinetic_ledger.js`) and established a connection to the Supabase Postgres instance using the `pg` module, finding that the database returns 5 matches using the route's exact SQL query.

Therefore, connectivity to Supabase using `DATABASE_URL` is healthy and the connection works properly. The `/api/matches/active` route correctly returns a non-empty array of matches.
