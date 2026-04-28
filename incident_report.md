# Incident Report: `/api/matches/active` Issue

## Issue Summary
The user requested verification that the script `debug_live_system.js` executes and that the endpoint `/api/matches/active` returns a non-empty array of live matches from Supabase. The script `debug_live_system.js` does not exist in the codebase; however, there is a script called `debug_kinetic_ledger.js` that fulfills the same purpose.

The `/api/matches/active` health check currently passes and successfully returns 5 active matches (e.g. Manchester City vs Arsenal). The array returned by the Next.js API route is therefore non-empty, and Supabase database connectivity using `DATABASE_URL` is healthy. However, the `odds_markets` table currently has zero rows. Since `odds` for the active matches are determined by joining with the `odds_markets` table, all matches are returned with empty `odds` objects (e.g. `"odds":{}`).

## Diagnostics Performed
1. Verified that `debug_live_system.js` is not present but `debug_kinetic_ledger.js` is available.
2. Examined `debug_kinetic_ledger.js` and confirmed it checks the `/api/matches/active` path using `DATABASE_URL`.
3. Noticed an error when first executing the script (`MODULE_NOT_FOUND` for `pg`), resolved by running `npm install pg dotenv` in the `sbe/web` directory.
4. Manually queried the database via node script (`npx ts-node -e "..."`) which returned 5 active match records.
5. Successfully ran the `sbe/web` dev server (`npm run build && npm run start`) to test the API directly using `curl`. The endpoint returned a 200 response with 5 active matches. The format for each match looks like:
   `{"id":"...","teamA":"...","teamB":"...","startTime":"...","status":"in_play","odds":{}}`
6. Queried the `public.odds_markets` table using `pg` directly and found 0 rows. This explains why the odds object is empty for all matches.
7. Successfully executed `node debug_kinetic_ledger.js` which generated a debug report (`latest.md` and `latest.json`). The report confirms a "CLEAN" bill of health with all tests (including database, supabase, and routes) passing. Specifically, the `/api/matches/active` probe passed with `status 200` and returned the aforementioned active matches.

## Conclusion
Connectivity using `DATABASE_URL` is healthy. Supabase is correctly returning matches. The root cause of the "empty odds" issue is an empty `odds_markets` table in Supabase. The system is otherwise functioning properly and the active matches array returned is not empty.
