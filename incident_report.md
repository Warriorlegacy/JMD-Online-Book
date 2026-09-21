# Incident Report: Missing Active Matches / Odds

## Issue
During health checks, we investigated the `/api/matches/active` endpoint to ensure live matches are returning correctly from Supabase.

## Findings
Based on the latest automated check in `artifacts/kinetic-ledger-debug/latest.json`:
- The health check for `/api/matches/active` returns a 200 OK.
- 2 matches were found in the payload.
- As confirmed by the data, matches are returned but the `odds` objects for these matches are empty (e.g., `"odds":{}`).

## Root Cause
As noted in the system memory: "In the `sbe/web` API (e.g., `/api/matches/active`), the `odds` object for active matches is populated by joining with the `odds_markets` table. If matches are returned with empty `odds` objects, it indicates the `odds_markets` table is empty or missing data for those matches, not a database connection failure."

The DATABASE_URL connectivity is functioning properly, as the query to retrieve matches from the `matches` table succeeds. The issue lies with the lack of odds data populated in the `odds_markets` table for the currently active matches.
