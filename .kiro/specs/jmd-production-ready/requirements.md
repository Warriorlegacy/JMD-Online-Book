# Requirements Document

## Introduction

Transform the existing JMD Online Book platform (Next.js 16 + Supabase + Tailwind CSS 4) into a full production-ready betting application modelled after nohmy99.com. The platform already has authentication, wallet (manual deposit/withdraw approval), a basic games page, referral system, admin dashboard, and notifications. This spec covers the ten major feature areas needed to reach production parity: landing page redesign, sports betting with live odds, in-house casino games, a comprehensive admin panel, bet settlement, profile editing, P&L statements, mobile navigation improvements, database migrations, and The-Odds-API integration.

The app name remains **JMD Online Book**. All payments remain manual UPI/bank approval — no third-party payment gateway is required. Casino game results are controlled by the admin. Sports odds are sourced from The-Odds-API free tier with an admin manual-override fallback.

---

## Glossary

- **System**: The JMD Online Book web application (Next.js 16 + Supabase).
- **User**: An authenticated end-user with the role `user`.
- **Admin**: An authenticated user with the role `admin` who manages the platform.
- **Bettor**: A User who places a bet on a sports event or casino game.
- **Sports_Event**: A real-world sporting fixture (cricket match, football match, etc.) stored in the `sport_events` table.
- **Odds_Market**: A set of Back/Lay odds for a specific outcome within a Sports_Event.
- **Back_Bet**: A bet placed in favour of an outcome at a given Back odds value.
- **Lay_Bet**: A bet placed against an outcome at a given Lay odds value.
- **Bet**: A record in the `bets` table linking a Bettor to an Odds_Market with a stake amount and bet type (back or lay).
- **Settlement**: The process of resolving all Bets for a Sports_Event or Casino_Round by marking each Bet as win, lose, void, or draw and crediting/debiting balances accordingly.
- **Casino_Game**: An in-house game (Teen Patti, Dragon Tiger, Andar Bahar, Aviator) whose result is set by the Admin.
- **Casino_Round**: A single game session for a Casino_Game with a defined result and associated Bets.
- **Aviator**: A crash-style Casino_Game where a multiplier increases until the Admin-controlled crash point; Bettors cash out before the crash.
- **Crash_Point**: The multiplier value at which an Aviator round ends, set by the Admin before the round starts.
- **Multiplier**: The current live multiplier value in an Aviator round, displayed in real time.
- **Payout**: The amount credited to a Bettor's wallet upon a winning Bet (stake × odds for sports; stake × multiplier for Aviator; fixed ratio for table games).
- **The-Odds-API**: Third-party REST API (https://the-odds-api.com) providing live sports odds data.
- **Odds_Override**: An admin-entered manual odds value that supersedes The-Odds-API value for a specific Odds_Market.
- **P&L**: Profit and Loss — the net financial result for a User or the house over a time period.
- **Wallet**: The User's balance stored in `profiles.balance`, updated atomically via the `update_balance` database function.
- **Transaction**: A record in the `transactions` table representing any credit or debit to a Wallet.
- **Tenant**: The multi-tenant record scoping all data; JMD Online Book operates as a single tenant.
- **Bottom_Nav**: The fixed mobile navigation bar at the bottom of the screen.
- **Announcement_Ticker**: The scrolling marquee banner displaying platform announcements.

---

## Requirements

### Requirement 1: Landing Page Redesign

**User Story:** As a User, I want a visually rich landing page that mirrors the nohmy99.com layout, so that I can quickly navigate to sports categories, live matches, and casino games.

#### Acceptance Criteria

1. THE System SHALL display a hero section containing the User's current Wallet balance, a Deposit button, and a Withdraw button at the top of the home page.
2. THE System SHALL display an Announcement_Ticker below the hero section showing the current `announcement` value from `site_settings`.
3. THE System SHALL display a horizontally scrollable sports category strip containing icons and labels for: Cricket, Football, Tennis, Horse Racing, Kabaddi, Politics, Binary, and Other.
4. WHEN a User taps a sports category icon, THE System SHALL navigate to the sports betting page filtered to that category.
5. THE System SHALL display a "Live & Upcoming" section showing up to 10 Sports_Events with status badges (LIVE / UPCOMING), team names, and current odds.
6. THE System SHALL display a casino games section with thumbnail cards for: Teen Patti, Dragon Tiger, Andar Bahar, and Aviator.
7. WHEN a User taps a casino game card, THE System SHALL navigate to that Casino_Game's play page.
8. THE System SHALL display a "Popular Bets" section showing the 5 most recently placed Bets across all Users (anonymised — no names shown).
9. WHILE the User is not authenticated, THE System SHALL display a "Login / Register" call-to-action banner in place of the balance hero section.
10. THE System SHALL render all landing page sections correctly on viewport widths from 320px to 1280px.

---

### Requirement 2: Sports Betting Page with Live Odds

**User Story:** As a Bettor, I want to browse sports events with live Back/Lay odds and place bets, so that I can participate in sports betting.

#### Acceptance Criteria

1. THE System SHALL display a list of Sports_Events grouped by sport category, each showing: event name, start time, in-play status, and available Odds_Markets.
2. WHEN an Odds_Market is displayed, THE System SHALL show separate Back odds and Lay odds columns for each outcome.
3. WHEN a Bettor taps a Back odds cell, THE System SHALL open a bet slip pre-filled with the selected outcome, bet type "back", and the current Back odds value.
4. WHEN a Bettor taps a Lay odds cell, THE System SHALL open a bet slip pre-filled with the selected outcome, bet type "lay", and the current Lay odds value.
5. WHEN a Bettor submits a bet slip with a valid stake, THE System SHALL deduct the stake from the Bettor's Wallet balance atomically and create a Bet record with result "pending".
6. IF a Bettor submits a bet slip with a stake greater than the Bettor's current Wallet balance, THEN THE System SHALL reject the bet and display an "Insufficient balance" error message.
7. IF a Bettor submits a bet slip with a stake below the Sports_Event's minimum bet amount, THEN THE System SHALL reject the bet and display a minimum stake error message.
8. WHEN The-Odds-API returns updated odds for a Sports_Event, THE System SHALL update the displayed odds within 60 seconds.
9. WHERE an Admin has set an Odds_Override for an Odds_Market, THE System SHALL display the Odds_Override value instead of The-Odds-API value.
10. WHILE a Sports_Event has in-play status "live", THE System SHALL display a "LIVE" badge on the event card.
11. WHILE a Sports_Event has in-play status "live", THE System SHALL accept new Bets unless the Admin has locked betting for that event.
12. IF The-Odds-API request fails or returns an error, THEN THE System SHALL display the last successfully fetched odds and show a "Odds may be delayed" warning label.
13. THE System SHALL display the Bettor's open bets for each Sports_Event below the odds table for that event.

---

### Requirement 3: In-Play Betting

**User Story:** As a Bettor, I want to place bets on live matches in progress, so that I can react to match events in real time.

#### Acceptance Criteria

1. WHEN a Sports_Event's `is_live` flag is set to true by the Admin, THE System SHALL move the event to the top of the sports betting page under an "In-Play" section.
2. WHEN a Sports_Event is in-play, THE System SHALL refresh the displayed odds every 30 seconds from The-Odds-API (or display the Odds_Override if set).
3. WHEN the Admin locks betting for a live Sports_Event, THE System SHALL disable all Back/Lay bet buttons for that event and display a "Betting Suspended" label.
4. WHEN the Admin unlocks betting for a live Sports_Event, THE System SHALL re-enable all Back/Lay bet buttons for that event.
5. IF a Bettor attempts to place a bet on a locked Sports_Event, THEN THE System SHALL reject the bet and display a "Betting suspended for this event" error message.
6. THE System SHALL display the elapsed time or score (if provided by the Admin) alongside the in-play event.

---

### Requirement 4: In-House Casino Games — Teen Patti

**User Story:** As a Bettor, I want to play Teen Patti with real-money bets, so that I can enjoy a card game experience on the platform.

#### Acceptance Criteria

1. THE System SHALL display a Teen Patti game page showing the current Casino_Round status (waiting, dealing, result).
2. WHEN a Casino_Round status is "waiting", THE System SHALL allow Bettors to place bets on: Player A wins, Player B wins, or Tie.
3. WHEN a Bettor places a Teen Patti bet, THE System SHALL deduct the stake from the Bettor's Wallet atomically and create a Bet record linked to the current Casino_Round.
4. IF a Bettor places a bet with a stake below the game's `min_bet` value, THEN THE System SHALL reject the bet and display a minimum stake error.
5. WHEN the Admin sets the Casino_Round result (Player A / Player B / Tie), THE System SHALL update the Casino_Round status to "result" and trigger Settlement for all Bets in that round.
6. WHEN Settlement runs for a Teen Patti round, THE System SHALL credit winning Bettors with Payout = stake × 1.95 for a win outcome and stake × 8.0 for a Tie outcome.
7. WHEN Settlement runs for a Teen Patti round, THE System SHALL mark losing Bets as "lose" with payout = 0.
8. THE System SHALL display the result history of the last 20 Teen Patti Casino_Rounds on the game page.

---

### Requirement 5: In-House Casino Games — Dragon Tiger

**User Story:** As a Bettor, I want to play Dragon Tiger with real-money bets, so that I can enjoy a fast card game on the platform.

#### Acceptance Criteria

1. THE System SHALL display a Dragon Tiger game page showing the current Casino_Round status (waiting, dealing, result).
2. WHEN a Casino_Round status is "waiting", THE System SHALL allow Bettors to place bets on: Dragon wins, Tiger wins, or Tie.
3. WHEN a Bettor places a Dragon Tiger bet, THE System SHALL deduct the stake from the Bettor's Wallet atomically and create a Bet record linked to the current Casino_Round.
4. WHEN the Admin sets the Casino_Round result (Dragon / Tiger / Tie), THE System SHALL trigger Settlement for all Bets in that round.
5. WHEN Settlement runs for a Dragon Tiger round, THE System SHALL credit winning Bettors with Payout = stake × 1.95 for Dragon or Tiger win, and stake × 8.0 for Tie.
6. WHEN Settlement runs for a Dragon Tiger round, THE System SHALL mark losing Bets as "lose" with payout = 0.
7. THE System SHALL display the result history of the last 20 Dragon Tiger Casino_Rounds on the game page.

---

### Requirement 6: In-House Casino Games — Andar Bahar

**User Story:** As a Bettor, I want to play Andar Bahar with real-money bets, so that I can enjoy a traditional Indian card game on the platform.

#### Acceptance Criteria

1. THE System SHALL display an Andar Bahar game page showing the current Casino_Round status (waiting, dealing, result).
2. WHEN a Casino_Round status is "waiting", THE System SHALL allow Bettors to place bets on: Andar or Bahar.
3. WHEN a Bettor places an Andar Bahar bet, THE System SHALL deduct the stake from the Bettor's Wallet atomically and create a Bet record linked to the current Casino_Round.
4. WHEN the Admin sets the Casino_Round result (Andar / Bahar), THE System SHALL trigger Settlement for all Bets in that round.
5. WHEN Settlement runs for an Andar Bahar round, THE System SHALL credit winning Bettors with Payout = stake × 1.90.
6. WHEN Settlement runs for an Andar Bahar round, THE System SHALL mark losing Bets as "lose" with payout = 0.
7. THE System SHALL display the result history of the last 20 Andar Bahar Casino_Rounds on the game page.

---

### Requirement 7: In-House Casino Games — Aviator Crash

**User Story:** As a Bettor, I want to play the Aviator crash game where I cash out before the plane crashes, so that I can experience a high-excitement betting format.

#### Acceptance Criteria

1. THE System SHALL display an Aviator game page showing the current Multiplier value, which increases from 1.00x in real time during an active round.
2. WHEN a Casino_Round status is "betting_open", THE System SHALL allow Bettors to place a stake and optionally set an auto-cashout Multiplier value.
3. WHEN a Bettor places an Aviator bet, THE System SHALL deduct the stake from the Bettor's Wallet atomically and create a Bet record with the round's Casino_Round id.
4. WHEN a Bettor taps "Cash Out" during an active round before the Crash_Point is reached, THE System SHALL immediately credit Payout = stake × current_Multiplier to the Bettor's Wallet and mark the Bet as "win".
5. WHEN the Multiplier reaches the Crash_Point set by the Admin, THE System SHALL end the round, mark all uncashed Bets as "lose" with payout = 0, and display the crash animation.
6. WHEN a Bettor has set an auto-cashout Multiplier and the live Multiplier reaches that value before the Crash_Point, THE System SHALL automatically cash out the Bettor at that Multiplier.
7. IF a Bettor attempts to cash out after the Crash_Point has been reached, THEN THE System SHALL reject the cashout and mark the Bet as "lose".
8. THE System SHALL display the Crash_Point history of the last 20 Aviator rounds on the game page.
9. THE System SHALL update the live Multiplier display at least every 100 milliseconds during an active round.
10. WHEN the Admin sets the Crash_Point for the next round, THE System SHALL store the Crash_Point server-side and not expose it to the client until the round ends.

---

### Requirement 8: Admin Panel — Game Result Control

**User Story:** As an Admin, I want to control casino game results and sports event outcomes from the admin panel, so that I can manage the platform's house edge and settle bets.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a list of all active Casino_Rounds across all Casino_Games with their current status.
2. WHEN an Admin selects a Casino_Round and sets a result, THE Admin_Panel SHALL call the Settlement function for that round.
3. THE Admin_Panel SHALL display a confirmation dialog before executing Settlement showing the number of Bets affected and estimated total Payout.
4. WHEN Settlement is executed, THE System SHALL be idempotent — executing Settlement a second time on an already-settled Casino_Round SHALL NOT alter any Wallet balances or Bet records.
5. THE Admin_Panel SHALL display a list of all Sports_Events with controls to: set in-play status, lock/unlock betting, and set the final result for Settlement.
6. WHEN an Admin sets a Sports_Event result, THE Admin_Panel SHALL trigger Settlement for all Bets on that event.
7. THE Admin_Panel SHALL display a real-time count of pending (unsettled) Bets per event.
8. WHEN Settlement completes, THE System SHALL send a notification to each affected Bettor indicating their Bet result and Payout amount.

---

### Requirement 9: Admin Panel — Odds Management

**User Story:** As an Admin, I want to manually set or override odds for any sports market, so that I can control the book's exposure when The-Odds-API data is unavailable or inaccurate.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display all active Sports_Events with their current Odds_Markets and the source of each odds value (API or Override).
2. WHEN an Admin enters an Odds_Override value for an Odds_Market, THE System SHALL store the override and immediately serve the override value to all Users viewing that market.
3. WHEN an Admin clears an Odds_Override, THE System SHALL revert to displaying The-Odds-API value for that market.
4. THE Admin_Panel SHALL allow the Admin to create a new Sports_Event manually with: sport category, event name, start time, team/player names, and initial odds.
5. THE Admin_Panel SHALL allow the Admin to toggle a Sports_Event between active and suspended states.
6. IF an Admin sets an odds value less than 1.01, THEN THE Admin_Panel SHALL reject the input and display a "Minimum odds value is 1.01" error.

---

### Requirement 10: Admin Panel — User Management

**User Story:** As an Admin, I want to view and manage all user accounts, so that I can handle support requests, suspend bad actors, and adjust balances.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a paginated list of all Users showing: name, phone, balance, total deposited, total withdrawn, registration date, and account status.
2. THE Admin_Panel SHALL provide a search field that filters Users by name or phone number.
3. WHEN an Admin suspends a User, THE System SHALL set `profiles.is_active = false` and prevent that User from logging in.
4. WHEN an Admin activates a suspended User, THE System SHALL set `profiles.is_active = true` and allow that User to log in again.
5. WHEN an Admin applies a balance adjustment to a User, THE System SHALL create a Transaction record of type "adjustment" and update the User's Wallet balance atomically.
6. IF an Admin applies a negative balance adjustment that would result in a Wallet balance below zero, THEN THE Admin_Panel SHALL reject the adjustment and display an "Adjustment would result in negative balance" error.
7. THE Admin_Panel SHALL display a User's full transaction history and bet history when the Admin views a User's detail page.
8. THE Admin_Panel SHALL allow the Admin to reset a User's password by generating a temporary password and displaying it on screen.

---

### Requirement 11: Admin Panel — Financial Reports

**User Story:** As an Admin, I want to view financial reports and P&L summaries, so that I can monitor the platform's financial health.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a daily summary report showing: total deposits, total withdrawals, total bets placed, total payouts, and net house P&L for the selected date.
2. THE Admin_Panel SHALL display a date-range filter allowing the Admin to select any start and end date for the report.
3. THE System SHALL calculate house P&L as: total_bets_amount − total_payouts for the selected period.
4. THE Admin_Panel SHALL display a breakdown of P&L by game category (sports, casino).
5. THE Admin_Panel SHALL display a list of the top 10 Users by net loss (highest revenue contributors) for the selected period.
6. THE Admin_Panel SHALL display a list of pending deposit and withdrawal transactions requiring approval, with approve and reject actions.
7. WHEN an Admin approves a deposit transaction, THE System SHALL credit the User's Wallet with the deposit amount and update the transaction status to "approved".
8. WHEN an Admin rejects a deposit transaction, THE System SHALL update the transaction status to "rejected" and send a notification to the User.
9. WHEN an Admin approves a withdrawal transaction, THE System SHALL debit the User's Wallet with the withdrawal amount and update the transaction status to "approved".
10. IF an Admin approves a withdrawal transaction for an amount greater than the User's current Wallet balance, THEN THE System SHALL reject the approval and display an "Insufficient user balance" error.

---

### Requirement 12: Bet Settlement System

**User Story:** As an Admin, I want a reliable bet settlement system, so that winning bets are paid out correctly and losing bets are recorded accurately.

#### Acceptance Criteria

1. WHEN Settlement is triggered for a Sports_Event with result R, THE System SHALL evaluate each pending Bet on that event and set result to "win", "lose", "draw", or "void" based on the Bet's selected outcome versus R.
2. WHEN a Bet result is "win", THE System SHALL credit Payout = stake × odds to the Bettor's Wallet atomically.
3. WHEN a Bet result is "lose", THE System SHALL set payout = 0 and record no Wallet credit.
4. WHEN a Bet result is "void", THE System SHALL refund the full stake to the Bettor's Wallet atomically.
5. WHEN a Bet result is "draw", THE System SHALL refund the full stake to the Bettor's Wallet atomically.
6. THE System SHALL record a Transaction of type "win" for every winning Bet payout and type "bet" for every losing Bet.
7. THE System SHALL be idempotent for Settlement — running Settlement twice on the same event SHALL NOT change any Wallet balance or Bet record after the first execution.
8. WHEN Settlement completes for an event, THE System SHALL update the Sports_Event status to "settled".
9. THE Admin_Panel SHALL display a Settlement history log showing: event name, settlement time, number of bets settled, total payout, and admin who triggered settlement.

---

### Requirement 13: Profile Page with Full Edit Capability

**User Story:** As a User, I want to view and edit my profile information, so that I can keep my account details and payment information up to date.

#### Acceptance Criteria

1. THE System SHALL display a profile page showing: full name, phone number, email, UPI ID, bank account number, IFSC code, account holder name, referral code, and account creation date.
2. WHEN a User submits a profile update, THE System SHALL validate all fields before saving.
3. IF a User submits a UPI ID that does not match the pattern `[a-zA-Z0-9._-]+@[a-zA-Z]+`, THEN THE System SHALL reject the update and display a "Invalid UPI ID format" error.
4. IF a User submits an IFSC code that does not match the pattern `[A-Z]{4}0[A-Z0-9]{6}`, THEN THE System SHALL reject the update and display an "Invalid IFSC code" error.
5. WHEN a User successfully saves a profile update, THE System SHALL display a "Profile updated successfully" confirmation message.
6. THE System SHALL allow a User to upload a profile avatar image up to 2MB in JPEG or PNG format to Supabase Storage.
7. IF a User uploads an avatar image larger than 2MB, THEN THE System SHALL reject the upload and display a "File size must be under 2MB" error.
8. THE System SHALL display the User's referral link with a one-tap copy button.
9. FOR ALL valid profile field values, saving then fetching the profile SHALL return the same field values (round-trip property).

---

### Requirement 14: P&L Statement Page

**User Story:** As a User, I want to view my personal profit and loss statement, so that I can track my betting performance over time.

#### Acceptance Criteria

1. THE System SHALL display a P&L statement page showing: total deposited, total withdrawn, total staked, total won, total lost, and net P&L for the User's account lifetime.
2. THE System SHALL calculate net P&L as: total_won − total_lost.
3. THE System SHALL display a date-range filter allowing the User to select any start and end date for the P&L view.
4. WHEN a date range is selected, THE System SHALL recalculate and display P&L figures for only the Transactions and Bets within that range.
5. THE System SHALL display a list of individual settled Bets within the selected date range showing: game name, stake, odds, result, payout, and date.
6. THE System SHALL display a summary chart showing daily net P&L for the selected date range.
7. FOR ALL date ranges, the sum of individual Bet P&L values SHALL equal the aggregate net P&L displayed (aggregation invariant).
8. WHEN the selected date range contains no Bets, THE System SHALL display zero values for all P&L fields and an empty bet list.

---

### Requirement 15: Mobile-Responsive Bottom Navigation

**User Story:** As a User on a mobile device, I want an improved bottom navigation bar, so that I can quickly access all major sections of the app.

#### Acceptance Criteria

1. THE Bottom_Nav SHALL display five navigation items: Home, Sports, Casino, Wallet, and Profile.
2. WHEN a User taps a Bottom_Nav item, THE System SHALL navigate to the corresponding page.
3. THE Bottom_Nav SHALL highlight the active navigation item with the platform's primary accent colour.
4. THE Bottom_Nav SHALL remain fixed at the bottom of the viewport on all pages within the main layout.
5. THE Bottom_Nav SHALL respect the device's safe-area-inset-bottom to avoid overlap with home indicator bars on iOS and Android.
6. THE Bottom_Nav SHALL display a badge count on the Wallet item when there are pending deposit or withdrawal transactions for the User.
7. THE System SHALL render the Bottom_Nav correctly on viewport widths from 320px to 768px.

---

### Requirement 16: Database Migration — Sports, Odds, and Settlements

**User Story:** As a developer, I want the database schema extended with sports events, odds markets, and settlement tables, so that the betting features have a reliable data foundation.

#### Acceptance Criteria

1. THE System SHALL have a `sport_events` table with columns: id, tenant_id, sport (varchar), league (varchar), home_team, away_team, start_time (timestamptz), status (enum: upcoming/live/suspended/settled/cancelled), is_betting_locked (boolean), result (varchar nullable), external_event_id (varchar nullable), created_at, updated_at.
2. THE System SHALL have an `odds_markets` table with columns: id, event_id (FK → sport_events), market_name (varchar), outcome (varchar), back_odds (numeric), lay_odds (numeric), is_active (boolean), override_back_odds (numeric nullable), override_lay_odds (numeric nullable), created_at, updated_at.
3. THE System SHALL have a `casino_rounds` table with columns: id, tenant_id, game_id (FK → games), status (enum: waiting/betting_open/dealing/result/settled), result (varchar nullable), crash_point (numeric nullable — for Aviator), settled_at (timestamptz nullable), created_at.
4. THE System SHALL extend the `bets` table with columns: event_id (FK → sport_events nullable), round_id (FK → casino_rounds nullable), bet_type (enum: back/lay/casino), outcome (varchar), cashout_multiplier (numeric nullable — for Aviator).
5. THE System SHALL have a `settlement_log` table with columns: id, event_id (nullable), round_id (nullable), settled_by (FK → profiles), total_bets, total_payout, created_at.
6. THE System SHALL have an `odds_api_cache` table with columns: sport_key (varchar), event_id (varchar), raw_response (jsonb), fetched_at (timestamptz).
7. ALL new tables SHALL have Row Level Security enabled with policies granting Users read access to their own Bets and Admins full access.
8. THE System SHALL provide a migration SQL file that is idempotent (safe to run multiple times without error).

---

### Requirement 17: The-Odds-API Integration

**User Story:** As the platform, I want to automatically fetch live sports odds from The-Odds-API, so that Users see up-to-date odds without manual admin entry.

#### Acceptance Criteria

1. THE System SHALL fetch sports odds from The-Odds-API for configured sport keys (cricket_ipl, soccer, tennis) on a scheduled interval of no more than 60 seconds.
2. WHEN The-Odds-API returns a valid response, THE System SHALL parse the response and upsert Odds_Markets records for each event and outcome.
3. WHEN The-Odds-API returns a valid response, THE System SHALL store the raw response in `odds_api_cache` with the current timestamp.
4. IF The-Odds-API returns an HTTP error (4xx or 5xx), THEN THE System SHALL log the error, retain the last cached odds, and set a "stale" flag on affected Odds_Markets.
5. IF The-Odds-API remaining quota drops below 100 requests, THEN THE System SHALL pause automatic fetching and notify the Admin via a dashboard alert.
6. THE System SHALL expose an admin API endpoint `POST /api/admin/odds/refresh` that triggers an immediate odds fetch on demand.
7. THE System SHALL expose an admin API endpoint `POST /api/admin/odds/override` accepting event_id, market_id, back_odds, and lay_odds to set an Odds_Override.
8. FOR ALL valid The-Odds-API responses, parsing the response then re-serialising the Odds_Markets data SHALL produce equivalent odds values (round-trip parse property).
9. WHERE an Odds_Override exists for an Odds_Market, THE System SHALL serve the override value and SHALL NOT overwrite it during automatic odds fetches.

---

## Correctness Properties

The following properties capture the most important invariants and round-trip behaviours that automated tests should verify:

### P1 — Bet Payout Invariant (Sports)
For any winning sports Bet: `payout = stake × odds`. For any losing Bet: `payout = 0`. For any void or draw Bet: `payout = stake`. This must hold for all valid stake and odds values.

### P2 — Settlement Idempotency
For any settled Sports_Event or Casino_Round, running Settlement a second time must produce zero changes to any Wallet balance, Bet record, or Transaction record.

### P3 — Wallet Balance Non-Negative After Bet
For any Bet placement, if `stake > current_balance`, the System must reject the bet and the Wallet balance must remain unchanged.

### P4 — Aviator Payout Invariant
For any Aviator Bet cashed out at multiplier M: `payout = stake × M`. For any Aviator Bet that did not cash out before the Crash_Point: `payout = 0`.

### P5 — P&L Aggregation Invariant
For any User and any date range, `sum(individual_bet_pnl) = aggregate_net_pnl` where `individual_bet_pnl = payout − stake` for each settled Bet.

### P6 — Profile Round-Trip
For any valid profile field values, saving the profile then fetching it must return identical field values.

### P7 — Odds Parse Round-Trip
For any valid The-Odds-API JSON response, parsing it into Odds_Markets records then re-serialising those records must produce odds values equal to the original parsed values (within numeric precision of 4 decimal places).

### P8 — Balance Adjustment Non-Negative
For any admin balance adjustment, if `current_balance + adjustment < 0`, the System must reject the adjustment and the Wallet balance must remain unchanged.

### P9 — Casino Payout Correctness
For Teen Patti and Dragon Tiger: winning non-Tie Bet payout = `stake × 1.95`; Tie Bet payout = `stake × 8.0`. For Andar Bahar: winning Bet payout = `stake × 1.90`. These must hold for all valid stake values.

### P10 — Filter Subset Property
For any P&L date range filter, the set of Bets returned must be a subset of all settled Bets for that User, and every returned Bet's `created_at` must fall within the selected date range.
