# Incident Report: Missing Odds Data for Active Matches

## Overview
When executing the \`debug_kinetic_ledger.js\` health check, the system reported 5 active matches but the \`/api/matches/active\` route returns matches with empty \`odds\` objects (e.g., \`"odds":{}\`). This empty response does not indicate a database connection failure or a \`DATABASE_URL\` connectivity issue. Instead, it signifies that the \`odds_markets\` table is empty or missing data that correctly joins with the \`matches\` table.

## Investigation Details
1. **Connectivity**: \`DATABASE_URL\` is properly configured and accessible. The script was able to query the \`public.matches\` table and retrieve 5 matches with status \`in_play\` or \`scheduled\`.
2. **API Endpoint**: The endpoint at \`sbe/web/src/app/api/matches/active/route.ts\` expects to find records in \`public.odds_markets\` matching the active \`matches.id\` to the \`odds_markets.event_id\`.
3. **Database Constraints**: Attempting to mock data in \`odds_markets\` revealed that \`event_id\` is a foreign key referencing the \`sport_events\` table, *not* the \`matches\` table directly, even though the API logic attempts to match them 1-to-1.
4. **Data Discrepancy**:
    - The API uses \`matches.id\` as the \`event_id\` when querying \`odds_markets\`.
    - However, \`odds_markets.event_id\` is constrained by \`odds_markets_event_id_fkey\` to exist in \`sport_events\`.
    - There are no corresponding records in \`odds_markets\` for the active matches found in the \`matches\` table.

## Conclusion
The issue is not a connection failure but a data state / schema relationship issue where the \`odds_markets\` table lacks the required odds data for the currently active matches, resulting in the empty \`"odds": {}\` payload. The database connectivity via \`DATABASE_URL\` is healthy.
