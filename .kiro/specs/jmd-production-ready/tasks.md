# Implementation Plan: JMD Online Book Production-Ready Platform

## Overview

Incremental build-out of the full betting platform on top of the existing Next.js 16 / Supabase / Tailwind CSS 4 codebase. Each task group produces working, integrated code before the next group begins. TypeScript is used throughout.

## Tasks

- [-] 1. Database migration — new tables and bets extension
  - [x] 1.1 Create migration file `supabase/migrations/20240001_betting_schema.sql`
    - Add `sport_events` table with all columns from design (id, tenant_id, sport, league, home_team, away_team, start_time, status CHECK, is_betting_locked, result, external_event_id, created_at, updated_at)
    - Add `odds_markets` table (id, event_id FK, market_name, outcome, back_odds, lay_odds, is_active, override_back_odds, override_lay_odds, is_stale, created_at, updated_at)
    - Add `casino_rounds` table (id, tenant_id, game_id FK, status CHECK, result, crash_point, settled_at, created_at)
    - Add `settlement_log` table (id, event_id nullable FK, round_id nullable FK, settled_by FK, total_bets, total_payout, created_at)
    - Add `odds_api_cache` table (id, sport_key, event_id, raw_response jsonb, fetched_at, UNIQUE(sport_key, event_id))
    - Wrap all CREATE TABLE statements in `IF NOT EXISTS` guards for idempotency
    - _Requirements: 16.1, 16.2, 16.3, 16.5, 16.6, 16.8_

  - [x] 1.2 Extend `bets` table and add RLS policies
    - `ALTER TABLE bets ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES sport_events(id)`
    - `ALTER TABLE bets ADD COLUMN IF NOT EXISTS round_id uuid REFERENCES casino_rounds(id)`
    - `ALTER TABLE bets ADD COLUMN IF NOT EXISTS bet_type varchar(10) NOT NULL DEFAULT 'casino' CHECK (bet_type IN ('back','lay','casino'))`
    - `ALTER TABLE bets ADD COLUMN IF NOT EXISTS outcome varchar(100) NOT NULL DEFAULT ''`
    - `ALTER TABLE bets ADD COLUMN IF NOT EXISTS cashout_multiplier numeric(8,2)`
    - Enable RLS on all five new tables; add authenticated-read and admin-write policies as specified in design
    - _Requirements: 16.4, 16.7_

  - [x] 1.3 Create settlement RPC functions in `supabase/migrations/20240002_settlement_rpcs.sql`
    - Implement `settle_sport_event(p_event_id, p_result, p_admin_id)` PL/pgSQL function with idempotency guard, FOR UPDATE row lock, win/lose/void/draw payout logic, settlement_log insert
    - Implement `settle_casino_round(p_round_id, p_result, p_admin_id)` following same pattern, using game-specific payout multipliers from design
    - Both functions must call existing `update_balance` RPC with reference_id for idempotency
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.7, 8.4_


- [x] 2. Core betting types and shared lib files
  - [ ] 2.1 Create `lib/types/betting.ts`
    - Export `SportEventStatus`, `CasinoRoundStatus`, `BetType`, `BetResult` union types
    - Export `SportEvent`, `OddsMarket`, `CasinoRound`, `PlaceBetRequest` interfaces exactly as defined in design
    - Export `SettlementResult`, `AviatorRoundState` interfaces
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

  - [ ] 2.2 Create `lib/casino/payouts.ts`
    - Export `CASINO_PAYOUTS` record constant for teen_patti, dragon_tiger, andar_bahar
    - Export `getCasinoPayout(game, betOutcome, result): number` function
    - _Requirements: 4.6, 5.5, 6.5_

  - [ ] 2.3 Create `lib/odds/override.ts` and `lib/odds/parser.ts`
    - `override.ts`: export `getEffectiveOdds(market: OddsMarket)` returning `{ back, lay }` using COALESCE logic
    - `parser.ts`: export `OddsApiEvent` interface, `parseOddsResponse(raw)` function with synthetic lay = back × 1.02, `round4dp` helper
    - _Requirements: 2.9, 9.2, 9.3, 17.8_

  - [ ] 2.4 Create `lib/casino/aviator.ts`
    - Export `AviatorRoundState` interface
    - Export `computeMultiplier(started_at: number): number` using `e^(0.00006 * elapsed_ms)` formula, rounded to 2dp
    - _Requirements: 7.1, 7.9_

  - [ ] 2.5 Create `lib/validators/profile.ts`
    - Export `isValidUpiId(s: string): boolean` — regex `[a-zA-Z0-9._-]+@[a-zA-Z]+`
    - Export `isValidIfsc(s: string): boolean` — regex `[A-Z]{4}0[A-Z0-9]{6}`
    - _Requirements: 13.3, 13.4_


- [ ] 3. The-Odds-API integration
  - [ ] 3.1 Create `lib/odds/fetchOdds.ts`
    - Implement `fetchOddsForSports(sportKeys: string[])` that calls `https://api.the-odds-api.com/v4/sports/{sport}/odds` with `apiKey` from env
    - Parse `X-Requests-Remaining` header; if < 100, update `site_settings.odds_api_paused = true` and `odds_api_quota_alert = true`
    - On HTTP error: log, set `is_stale = true` on affected `odds_markets` rows, return cached data from `odds_api_cache`
    - _Requirements: 17.1, 17.4, 17.5_

  - [ ] 3.2 Create `lib/odds/upsertOdds.ts`
    - Implement `upsertOddsMarkets(parsed: ParsedMarket[])` that upserts into `odds_markets` only where `override_back_odds IS NULL AND override_lay_odds IS NULL`
    - Implement `upsertOddsApiCache(sportKey, eventId, raw)` for raw response storage
    - _Requirements: 17.2, 17.3, 17.9_

  - [ ] 3.3 Create API route `app/api/admin/odds/refresh/route.ts`
    - POST handler: verify admin role, call `fetchOddsForSports`, call `upsertOddsMarkets`, return `{ updated: number, quota_remaining: number }`
    - _Requirements: 17.6_

  - [ ] 3.4 Create API route `app/api/admin/odds/override/route.ts`
    - POST handler: verify admin role, accept `{ market_id, back_odds, lay_odds }` (null values clear override)
    - Validate odds >= 1.01 if not null; update `odds_markets.override_back_odds / override_lay_odds`
    - _Requirements: 9.2, 9.3, 9.6, 17.7_

  - [ ] 3.5 Create Vercel Cron config in `vercel.json`
    - Add cron entry: `{ "path": "/api/admin/odds/refresh", "schedule": "* * * * *" }` (every 60s)
    - Add `ODDS_API_KEY` to `.env.local.example`
    - _Requirements: 17.1_


- [ ] 4. Sports betting page — event list, odds table, bet slip
  - [ ] 4.1 Create API routes for sports events
    - `app/api/sports/events/route.ts` — GET: query `sport_events` joined with `odds_markets`, apply `getEffectiveOdds`, support `?sport=` filter, return up to 50 events
    - `app/api/sports/events/[id]/route.ts` — GET: single event with all markets and user's open bets
    - _Requirements: 2.1, 2.2, 2.8, 2.9, 2.12, 2.13_

  - [ ] 4.2 Create `app/api/bets/route.ts` — POST place bet
    - Verify auth; validate `PlaceBetRequest`; check `is_betting_locked`; check `stake <= balance`; check `stake >= min_bet`
    - Deduct stake via `update_balance` RPC; insert `bets` row with `result = 'pending'`
    - Return 400 with `{ error: 'insufficient_balance' }`, `{ error: 'betting_suspended' }`, or `{ error: 'below_minimum_stake' }` as appropriate
    - _Requirements: 2.5, 2.6, 2.7, 3.5_

  - [ ] 4.3 Create `components/OddsTable.tsx`
    - Renders Back/Lay columns for each outcome in an `OddsMarket[]`
    - Highlights cells where override is active with a badge
    - Shows "Odds may be delayed" label when `is_stale = true`
    - Shows "Betting Suspended" overlay when `is_betting_locked = true`
    - On cell click: calls `onSelectOdds(market, betType)` callback
    - _Requirements: 2.2, 2.3, 2.4, 2.9, 2.12, 3.3_

  - [ ] 4.4 Create `components/BetSlip.tsx`
    - Slide-up drawer accepting `marketId`, `betType`, `odds`, `minStake` props
    - Stake input with validation; shows current balance; submit calls `POST /api/bets`
    - Displays success toast or inline error on response
    - _Requirements: 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ] 4.5 Create `app/sports/page.tsx` and `app/sports/[eventId]/page.tsx`
    - `sports/page.tsx`: fetches events, groups by sport, renders sport category tabs, `OddsTable` per event, `BetSlip` drawer
    - `sports/[eventId]/page.tsx`: single event detail with full odds table and user's open bets list
    - _Requirements: 2.1, 2.10, 2.11, 2.13_


- [ ] 5. In-play betting — live badge, lock/unlock
  - [ ] 5.1 Create API routes for in-play management
    - `app/api/admin/sports/lock/route.ts` — POST: toggle `sport_events.is_betting_locked`; verify admin role
    - Add `status` update support to existing or new `app/api/admin/sports/events/route.ts` — PATCH: set `status = 'live'` or `status = 'suspended'`
    - _Requirements: 3.1, 3.3, 3.4_

  - [ ] 5.2 Update `OddsTable` and sports page for live state
    - Show "LIVE" badge on events where `status = 'live'`; move live events to top of list under "In-Play" section header
    - Poll `/api/sports/events` every 30 seconds on the sports page using `setInterval` + `router.refresh()` or SWR
    - Disable Back/Lay buttons and show "Betting Suspended" when `is_betting_locked = true`
    - Display elapsed time / score field from `sport_events` if provided
    - _Requirements: 2.10, 2.11, 3.1, 3.2, 3.3, 3.4, 3.6_


- [ ] 6. Casino games — Teen Patti, Dragon Tiger, Andar Bahar
  - [ ] 6.1 Create shared casino round API routes
    - `app/api/casino/[game]/round/route.ts` — GET: return current open `casino_rounds` row for the game with bet count; POST (admin): create new round with `status = 'waiting'`
    - `app/api/admin/games/round/route.ts` — POST: transition round status (waiting → betting_open → dealing → result)
    - _Requirements: 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 8.1, 8.2_

  - [ ] 6.2 Create `components/casino/CasinoRoundStatus.tsx`
    - Displays current round status badge (WAITING / BETTING OPEN / DEALING / RESULT)
    - Shows result history list (last 20 rounds) fetched from `casino_rounds` table
    - _Requirements: 4.1, 4.8, 5.1, 5.7, 6.1, 6.7_

  - [ ] 6.3 Create `components/casino/CasinoBetPanel.tsx`
    - Renders outcome buttons (e.g. "Player A", "Player B", "Tie") based on `game` prop
    - Stake input; on submit calls `POST /api/bets` with `bet_type = 'casino'`
    - Disabled when round status is not `betting_open`
    - _Requirements: 4.2, 4.3, 4.4, 5.2, 5.3, 6.2, 6.3_

  - [ ] 6.4 Create `app/casino/teen-patti/page.tsx`, `app/casino/dragon-tiger/page.tsx`, `app/casino/andar-bahar/page.tsx`
    - Each page: fetch current round, render `CasinoRoundStatus` + `CasinoBetPanel` with game-specific outcomes
    - Teen Patti outcomes: "Player A", "Player B", "Tie"
    - Dragon Tiger outcomes: "Dragon", "Tiger", "Tie"
    - Andar Bahar outcomes: "Andar", "Bahar"
    - _Requirements: 4.1, 4.2, 5.1, 5.2, 6.1, 6.2_


- [ ] 7. Aviator crash game
  - [ ] 7.1 Create `app/api/casino/aviator/state/route.ts`
    - GET: load current `casino_rounds` row for Aviator; compute `computeMultiplier(started_at)` server-side
    - Return `{ round_id, status, multiplier, crash_point_revealed }` — `crash_point_revealed` is null unless `status = 'crashed'`
    - When `status = 'flying'` and `multiplier >= crash_point`: transition round to `crashed`, mark all pending bets as `lose`
    - Run auto-cashout UPDATE for bets where `auto_cashout_multiplier <= current_multiplier` and `auto_cashout_multiplier < crash_point`
    - _Requirements: 7.1, 7.5, 7.6, 7.9, 7.10_

  - [ ] 7.2 Create `app/api/bets/cashout/route.ts`
    - POST: verify auth; load bet; check round status is `flying` and `multiplier < crash_point`; credit `stake × current_multiplier`; mark bet `win` with `cashout_multiplier`
    - Return 400 `{ error: 'round_ended' }` if round already crashed
    - _Requirements: 7.4, 7.7_

  - [ ] 7.3 Create `components/casino/AviatorMultiplierDisplay.tsx`
    - Polls `/api/casino/aviator/state` every 100ms via `setInterval`
    - Animated counter showing current multiplier; crash animation when status = `crashed`
    - Shows crash point history (last 20 rounds)
    - _Requirements: 7.1, 7.5, 7.8, 7.9_

  - [ ] 7.4 Create `app/casino/aviator/page.tsx`
    - Renders `AviatorMultiplierDisplay`; bet placement form with optional auto-cashout multiplier input
    - "Cash Out" button calls `POST /api/bets/cashout`; disabled when round not flying
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_


- [ ] 8. Settlement engine
  - [ ] 8.1 Create `app/api/admin/games/settle/route.ts`
    - POST: verify admin role; accept `{ round_id, result }`; call `settle_casino_round` RPC
    - Return `{ already_settled: true }` if round already settled; otherwise return `{ total_bets, total_payout }`
    - Send notification to each affected bettor via existing notifications system
    - _Requirements: 8.2, 8.3, 8.4, 8.8, 4.5, 4.6, 4.7, 5.4, 5.5, 5.6, 6.4, 6.5, 6.6_

  - [ ] 8.2 Create `app/api/admin/sports/settle/route.ts`
    - POST: verify admin role; accept `{ event_id, result }`; call `settle_sport_event` RPC
    - Return `{ already_settled: true }` if event already settled; otherwise return `{ total_bets, total_payout }`
    - Send notification to each affected bettor
    - _Requirements: 8.6, 8.7, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

  - [ ] 8.3 Create `components/admin/SettlementConfirmDialog.tsx`
    - Modal showing affected bet count and estimated total payout before admin confirms
    - Fetches preview data from a `GET /api/admin/games/settle?round_id=` or `GET /api/admin/sports/settle?event_id=` endpoint
    - Confirm button triggers the POST; shows result toast
    - _Requirements: 8.3, 8.4_


- [ ] 9. Admin — game result control panel
  - [ ] 9.1 Create `app/admin/games/page.tsx`
    - Fetch all `casino_rounds` grouped by game; display status, bet count, created_at per round
    - "New Round" button: POST to `/api/admin/games/round` to create round with `status = 'waiting'`
    - Status transition buttons: "Open Betting", "Start Dealing", "Set Result"
    - For Aviator: show crash point input field (hidden from users) before opening betting
    - "Set Result" opens `SettlementConfirmDialog`; on confirm calls `/api/admin/games/settle`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 7.10_

  - [ ] 9.2 Create `app/admin/sports/page.tsx` (sports event management section)
    - Table of all `sport_events` with inline status controls: set live, lock/unlock betting, set result
    - "Set Result" triggers `SettlementConfirmDialog` then calls `/api/admin/sports/settle`
    - Shows pending bet count per event (real-time from DB)
    - _Requirements: 8.5, 8.6, 8.7_


- [ ] 10. Admin — odds management panel
  - [ ] 10.1 Extend `app/admin/sports/page.tsx` with odds management section
    - Inline odds editing table per `odds_markets` row; show "API" or "Override" source badge
    - Override input fields for `override_back_odds` and `override_lay_odds`; save calls `POST /api/admin/odds/override`
    - "Clear Override" button sends `{ back_odds: null, lay_odds: null }` to same endpoint
    - "Refresh Odds" button calls `POST /api/admin/odds/refresh`
    - Quota alert banner shown when `site_settings.odds_api_quota_alert = true`
    - _Requirements: 9.1, 9.2, 9.3, 9.6, 17.5_

  - [ ] 10.2 Add "Add Event" form to `app/admin/sports/page.tsx`
    - Form fields: sport category, home_team, away_team, league, start_time, initial back_odds, lay_odds
    - POST to new `app/api/admin/sports/events/route.ts` — creates `sport_events` row + initial `odds_markets` rows
    - Validate odds >= 1.01 before submit
    - _Requirements: 9.4, 9.5, 9.6_


- [ ] 11. Admin — enhanced user management
  - [ ] 11.1 Create `app/api/admin/users/route.ts`
    - GET: paginated list (20/page) with `?search=` filter on name/phone; return balance, total_deposited, total_withdrawn, registration date, is_active
    - _Requirements: 10.1, 10.2_

  - [ ] 11.2 Create `app/api/admin/users/[id]/route.ts`
    - GET: user detail with transaction history and bet history (paginated tabs)
    - PATCH: toggle `is_active` (suspend/activate)
    - _Requirements: 10.3, 10.4, 10.7_

  - [ ] 11.3 Create `app/api/admin/users/adjust-balance/route.ts`
    - POST: accept `{ user_id, delta, note }`; validate `current_balance + delta >= 0`; call `update_balance` RPC with type `'adjustment'`
    - Return 400 `{ error: 'negative_balance_result' }` if guard fails
    - _Requirements: 10.5, 10.6_

  - [ ] 11.4 Create `app/admin/users/page.tsx` and `app/admin/users/[id]/page.tsx`
    - `users/page.tsx`: paginated table with search, suspend/activate toggle, "Adjust Balance" modal
    - `users/[id]/page.tsx`: tabbed view — Transaction History, Bet History; balance adjustment form
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_


- [ ] 12. Admin — financial reports and P&L
  - [ ] 12.1 Create `app/api/admin/reports/summary/route.ts`
    - GET: accept `?start=&end=` date params; run the summary SQL from design (total_deposits, total_withdrawals, total_bets, total_payouts, house_pnl)
    - Return breakdown by category (sports / casino) and top 10 users by net loss
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ] 12.2 Create `app/api/admin/transactions/route.ts`
    - GET: list pending deposit and withdrawal transactions
    - _Requirements: 11.6_

  - [ ] 12.3 Create `app/api/admin/transactions/approve/route.ts` and `app/api/admin/transactions/reject/route.ts`
    - `approve`: verify admin; for deposit → `update_balance(user_id, amount, 'deposit', tx_id)` + set `status = 'approved'`; for withdrawal → check balance >= amount → `update_balance(user_id, -amount, 'withdrawal', tx_id)`; return 400 if insufficient
    - `reject`: set `status = 'rejected'`; send notification to user
    - _Requirements: 11.7, 11.8, 11.9, 11.10_

  - [ ] 12.4 Create `app/admin/reports/page.tsx`
    - Date range picker (default today); summary cards; P&L breakdown table; top 10 users table
    - Pending transactions section with approve/reject buttons (calls routes from 12.3)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_


- [ ] 13. Profile page with full edit and avatar upload
  - [ ] 13.1 Create `app/api/profile/route.ts`
    - GET: return own profile fields (name, phone, email, upi_id, bank_account, ifsc, account_holder_name, referral_code, avatar_url, created_at)
    - PATCH: validate UPI ID with `isValidUpiId`, IFSC with `isValidIfsc`; update `profiles` row; return 422 on validation failure
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ] 13.2 Create `app/api/profile/avatar/route.ts`
    - POST: accept multipart form; check file size <= 2MB and MIME type is image/jpeg or image/png; upload to Supabase Storage bucket `avatars/{user_id}`; update `profiles.avatar_url`
    - Return 400 `{ error: 'file_too_large' }` if > 2MB
    - _Requirements: 13.6, 13.7_

  - [ ] 13.3 Create `app/profile/page.tsx`
    - Display all profile fields; inline edit form for name, UPI ID, bank details, IFSC, account holder name
    - Avatar upload with preview (calls `/api/profile/avatar`)
    - Referral link display with one-tap copy button
    - Success/error toast on save
    - _Requirements: 13.1, 13.2, 13.5, 13.6, 13.7, 13.8_


- [ ] 14. P&L statement page for users
  - [ ] 14.1 Create `app/api/pnl/route.ts`
    - GET: accept `?start=&end=` params; query settled bets for auth user in date range
    - Return `{ total_deposited, total_withdrawn, total_staked, total_won, total_lost, net_pnl, bets: [...] }`
    - `net_pnl = SUM(payout - stake)` across all settled bets in range
    - When no bets in range, return zero values and empty array
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.7, 14.8_

  - [ ] 14.2 Create `app/pnl/page.tsx`
    - Date range picker (default: last 30 days); summary stat cards (deposited, withdrawn, staked, won, lost, net P&L)
    - Bet history table: game name, stake, odds, result, payout, date
    - Daily net P&L bar chart using a lightweight chart lib (e.g. recharts or a simple SVG chart)
    - _Requirements: 14.1, 14.3, 14.4, 14.5, 14.6, 14.8_


- [ ] 15. Landing page redesign
  - [ ] 15.1 Create `components/AnnouncementTicker.tsx`
    - Marquee component reading `announcement` from `site_settings` via a server component fetch
    - _Requirements: 1.2_

  - [ ] 15.2 Create `components/SportsCategoryStrip.tsx`
    - Horizontally scrollable strip with icons + labels for: Cricket, Football, Tennis, Horse Racing, Kabaddi, Politics, Binary, Other
    - Each item is a link to `/sports?sport={category}`
    - _Requirements: 1.3, 1.4_

  - [ ] 15.3 Create `components/LiveEventsSection.tsx`
    - Fetches up to 10 `sport_events` ordered by status (live first) then start_time
    - Renders event cards with LIVE/UPCOMING badge, team names, and current odds
    - _Requirements: 1.5_

  - [ ] 15.4 Create `components/CasinoSection.tsx`
    - Grid of 4 casino game thumbnail cards (Teen Patti, Dragon Tiger, Andar Bahar, Aviator)
    - Each card links to its game page
    - _Requirements: 1.6, 1.7_

  - [ ] 15.5 Create `components/PopularBetsSection.tsx`
    - Fetches 5 most recent settled/pending bets across all users (anonymised — no names)
    - Shows game name, outcome, stake (masked), result
    - _Requirements: 1.8_

  - [ ] 15.6 Rewrite `app/page.tsx` (landing page)
    - Hero section: show wallet balance + Deposit/Withdraw buttons for authenticated users; Login/Register CTA for unauthenticated users
    - Compose: `AnnouncementTicker`, `SportsCategoryStrip`, `LiveEventsSection`, `CasinoSection`, `PopularBetsSection`
    - Responsive layout 320px–1280px
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 1.9, 1.10_


- [ ] 16. Bottom nav update — 5 items
  - [ ] 16.1 Update `components/BottomNav.tsx`
    - Replace existing nav items with exactly 5: Home (`/`), Sports (`/sports`), Casino (`/casino`), Wallet (`/wallet`), Profile (`/profile`)
    - Active item highlighted with primary accent colour
    - Fixed at bottom; add `pb-[env(safe-area-inset-bottom)]` for iOS/Android safe area
    - Wallet item shows badge count when user has pending transactions (query `transactions` where `status = 'pending'` and `user_id = auth.uid()`)
    - Render only on viewport widths 320px–768px
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

  - [ ] 16.2 Create `app/casino/page.tsx` (casino lobby)
    - Grid of 4 game cards linking to individual game pages (needed for Casino nav item)
    - _Requirements: 15.1_


- [ ] 17. Property-based tests for all 10 correctness properties
  - [ ] 17.1 Set up fast-check in `package.json` and create `tests/` directory
    - Install `fast-check` and `vitest` dev dependencies if not present
    - Create `vitest.config.ts` pointing to `tests/**/*.test.ts`
    - _Requirements: P1–P10_

  - [ ]* 17.2 Write property test for Property 1 — Sports Bet Payout Invariant
    - File: `tests/properties/sportsBetPayout.test.ts`
    - Generate random `(stake: positive number, odds: number >= 1.01, result: 'win'|'lose'|'void'|'draw')` tuples
    - Assert: win → `payout = stake × odds`; lose → `payout = 0`; void/draw → `payout = stake`
    - Tag: `Feature: jmd-production-ready, Property 1: Sports Bet Payout Invariant`
    - _Requirements: 12.2, 12.3, 12.4, 12.5, P1_

  - [ ]* 17.3 Write property test for Property 2 — Settlement Idempotency
    - File: `tests/properties/settlementIdempotency.test.ts`
    - Mock Supabase client; generate a settled event state; call `settle_sport_event` logic twice
    - Assert second call returns `{ already_settled: true }` and no balance/bet mutations occur
    - Tag: `Feature: jmd-production-ready, Property 2: Settlement Idempotency`
    - _Requirements: 8.4, 12.7, P2_

  - [ ]* 17.4 Write property test for Property 3 — Wallet Non-Negative on Bet Placement
    - File: `tests/properties/walletNonNegative.test.ts`
    - Generate `(stake, balance)` where `stake > balance > 0`
    - Assert `POST /api/bets` handler returns error and balance is unchanged
    - Tag: `Feature: jmd-production-ready, Property 3: Wallet Balance Non-Negative After Bet`
    - _Requirements: 2.6, P3_

  - [ ]* 17.5 Write property test for Property 4 — Aviator Payout Invariant
    - File: `tests/properties/aviatorPayout.test.ts`
    - Generate `(stake: positive, multiplier: >= 1.00, crash_point: > 1.00)` tuples
    - Assert: `multiplier < crash_point` → `payout = stake × multiplier`; `multiplier >= crash_point` → `payout = 0`
    - Tag: `Feature: jmd-production-ready, Property 4: Aviator Payout Invariant`
    - _Requirements: 7.4, 7.5, P4_

  - [ ]* 17.6 Write property test for Property 5 — Casino Payout Correctness
    - File: `tests/properties/casinoPayout.test.ts`
    - Generate random valid stakes; test all game/outcome combinations via `getCasinoPayout`
    - Assert: teen_patti/dragon_tiger win → `stake × 1.95`; tie → `stake × 8.0`; andar_bahar win → `stake × 1.90`; any lose → 0
    - Tag: `Feature: jmd-production-ready, Property 5: Casino Payout Correctness`
    - _Requirements: 4.6, 5.5, 6.5, P9_

  - [ ]* 17.7 Write property test for Property 6 — P&L Aggregation Invariant
    - File: `tests/properties/pnlAggregation.test.ts`
    - Generate random collections of settled bets with `(stake, payout)` pairs
    - Assert `SUM(payout - stake)` equals the value returned by the P&L calculation function
    - Tag: `Feature: jmd-production-ready, Property 6: P&L Aggregation Invariant`
    - _Requirements: 14.7, P5_

  - [ ]* 17.8 Write property test for Property 7 — Profile Round-Trip
    - File: `tests/properties/profileRoundTrip.test.ts`
    - Generate random valid profile objects (name, upi_id matching regex, ifsc matching regex, bank details)
    - Mock `PATCH /api/profile` then `GET /api/profile`; assert deep equality of all fields
    - Tag: `Feature: jmd-production-ready, Property 7: Profile Round-Trip`
    - _Requirements: 13.9, P6_

  - [ ]* 17.9 Write property test for Property 8 — Odds Parse Round-Trip
    - File: `tests/properties/oddsParseRoundTrip.test.ts`
    - Generate random valid `OddsApiEvent[]` objects with arbitrary prices
    - Call `parseOddsResponse(raw)` then check each `back_odds` and `lay_odds` matches original price (back) and `price × 1.02` (lay) within 4dp
    - Tag: `Feature: jmd-production-ready, Property 8: Odds Parse Round-Trip`
    - _Requirements: 17.8, P7_

  - [ ]* 17.10 Write property test for Property 9 — Balance Adjustment Non-Negative Guard
    - File: `tests/properties/balanceAdjustmentGuard.test.ts`
    - Generate `(balance: positive, adjustment: negative)` where `balance + adjustment < 0`
    - Assert `POST /api/admin/users/adjust-balance` handler returns 400 and balance is unchanged
    - Tag: `Feature: jmd-production-ready, Property 9: Balance Adjustment Non-Negative Guard`
    - _Requirements: 10.6, P8_

  - [ ]* 17.11 Write property test for Property 10 — Locked Event Bet Rejection
    - File: `tests/properties/lockedEventBetRejection.test.ts`
    - Generate random bet requests against events with `is_betting_locked = true`
    - Assert all are rejected with `{ error: 'betting_suspended' }` and balance is unchanged
    - Tag: `Feature: jmd-production-ready, Property 10: Locked Event Bet Rejection`
    - _Requirements: 3.5, 2.11_


- [ ] 18. Build, test, and deploy readiness
  - [ ] 18.1 Add unit tests for pure functions
    - File: `tests/unit/odds.test.ts` — test `parseOddsResponse` with various API response shapes, `getEffectiveOdds` override vs API selection, `round4dp`
    - File: `tests/unit/casino.test.ts` — test `getCasinoPayout` for all game/outcome combinations, `computeMultiplier` at t=0 and t=5000ms
    - File: `tests/unit/validators.test.ts` — test `isValidUpiId` and `isValidIfsc` with valid and invalid inputs
    - _Requirements: P1, P4, P5, P7, P8_

  - [ ]* 18.2 Write integration smoke tests
    - File: `tests/integration/rls.test.ts` — verify users cannot read other users' bets via Supabase client
    - File: `tests/integration/adminRoutes.test.ts` — verify all `/api/admin/*` routes return 403 for non-admin JWT
    - _Requirements: 16.7_

  - [ ] 18.3 Fix TypeScript and lint errors
    - Run `tsc --noEmit` and resolve all type errors introduced by new files
    - Ensure `next build` completes without errors
    - _Requirements: all_

  - [ ] 19. Final checkpoint — Ensure all tests pass
    - Run `vitest --run` and confirm all unit and property tests pass
    - Run `next build` and confirm zero build errors
    - Ask the user if any questions arise before marking complete.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (Properties 1–10 from design)
- Unit tests validate specific examples and edge cases
- All API routes use the consistent error shape `{ error: string, details?: string }`
- The settlement RPC functions are the source of truth for payout logic — TypeScript helpers mirror them for testing only
