# Incident Report: Missing Odds Data for Active Matches

## Observation
The health check for the runtime failed.
A request to `https://web-two-gamma-49.vercel.app/api/matches/active` returned a list of matches, but the `odds` object for `in_play` matches was empty (`{}`).

## Investigation
By running a custom debug script (`debug_live_system.js`), it was verified that:
1. The database connection via `DATABASE_URL` is healthy.
2. There are 3 active matches (`status = 'in_play'`) in the `matches` table.
3. However, querying the `odds_markets` table for these active matches revealed that no odds data is currently present for the `in_play` matches in the database. Only one `scheduled` match had associated odds data.

## Conclusion
The issue is not a database connectivity problem or an API error. The `/api/matches/active` endpoint is correctly querying and returning data from Supabase. The empty `odds` objects are a direct result of missing data in the `odds_markets` table for those specific matches.
