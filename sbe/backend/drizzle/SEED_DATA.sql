-- =====================================================
-- SBE Database Seed Data
-- =====================================================
-- Run this in Supabase SQL Editor to add test data
-- =====================================================

-- Step 1: Create a tournament
INSERT INTO "tournaments" ("name", "sport_type", "metadata")
VALUES (
    'Premier League 2026',
    'football',
    '{"country": "England", "season": "2025-26"}'::text
)
RETURNING id AS tournament_id;

-- Note: Copy the tournament_id from the result above

-- Step 2: Create an IN_PLAY match (Manchester City v Arsenal)
-- Replace {TOURNAMENT_ID} with the ID from Step 1
INSERT INTO "matches" ("tournament_id", "team_a", "team_b", "start_time", "status", "metadata")
VALUES (
    (SELECT id FROM "tournaments" WHERE name = 'Premier League 2026' LIMIT 1),
    'Manchester City',
    'Arsenal',
    NOW() + INTERVAL '1 hour',
    'in_play',
    '{"venue": "Etihad Stadium", "round": "Matchday 30"}'::text
);

-- Step 3: Create a SCHEDULED match (Liverpool v Chelsea)
INSERT INTO "matches" ("tournament_id", "team_a", "team_b", "start_time", "status", "metadata")
VALUES (
    (SELECT id FROM "tournaments" WHERE name = 'Premier League 2026' LIMIT 1),
    'Liverpool',
    'Chelsea',
    NOW() + INTERVAL '1 day',
    'scheduled',
    '{"venue": "Anfield", "round": "Matchday 30"}'::text
);

-- =====================================================
-- ✅ Seed Data Added!
-- =====================================================
-- You now have:
-- - 1 Tournament: Premier League 2026
-- - 1 In-Play Match: Manchester City v Arsenal
-- - 1 Scheduled Match: Liverpool v Chelsea
-- =====================================================
