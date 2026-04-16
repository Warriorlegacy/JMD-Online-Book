# Requirements Document

## Introduction

Redesign the SBE (Sports Betting Exchange) frontend at `sbe/web/` to match the professional look, feel, and feature set of sunexch.com — a leading Indian sports betting exchange. The current app is a basic Next.js 16 single-page app with a minimal dark UI. The redesign targets a mobile-first, dark-themed professional exchange with real-time in-play markets, multi-sport navigation, casino games section, full user authentication, a sliding bet slip, and an admin panel. The backend remains Fastify + PostgreSQL (Supabase) with WebSocket for real-time updates. Tech stack: Next.js 16, React 19, Tailwind CSS v4, TypeScript.

---

## Glossary

- **App**: The SBE frontend Next.js application at `sbe/web/`
- **Backend**: The Fastify + PostgreSQL API at `sbe/backend/`
- **Exchange**: The peer-to-peer sports betting exchange platform
- **Back**: A bet that a selection will win (blue side)
- **Lay**: A bet that a selection will lose (pink side)
- **Odds**: Decimal price at which a bet is offered
- **Stake**: The amount of money wagered on a bet
- **Liability**: The maximum amount a layer can lose on a lay bet
- **Bet_Slip**: The panel where users review and confirm bets before placing
- **In_Play**: A match that is currently live and accepting bets
- **Market**: A specific betting market within a match (e.g., Match Odds, Over/Under)
- **Order_Book**: The collection of unmatched back and lay orders at various prices
- **UTR**: Unique Transaction Reference — a 12-digit ID from UPI payments
- **UPI**: Unified Payments Interface — Indian digital payment standard
- **Admin**: A privileged user who can manage matches, settle bets, and approve deposits
- **Announcement_Ticker**: A horizontally scrolling marquee displaying platform announcements
- **Casino_Game**: A non-exchange game of chance (Teen Patti, Dragon Tiger, Andar Bahar, Aviator)
- **Session**: An authenticated user session stored via JWT or cookie
- **Wallet**: The user's account balance and transaction history
- **Price_Ladder**: A vertical list of price levels showing available back/lay quantities
- **Sport_Category**: A top-level grouping of matches (Cricket, Football, Tennis, Horse Racing, etc.)

---

## Requirements

### Requirement 1: Global Layout and Navigation

**User Story:** As a user, I want a professional dark-themed layout with persistent navigation, so that I can quickly access any section of the platform.

#### Acceptance Criteria

1. THE App SHALL render a sticky top header containing the platform logo, sport category tabs (Cricket, Football, Tennis, Horse Racing, Casino), a live balance display, and Login/Register buttons when no Session exists.
2. WHEN a Session exists, THE App SHALL replace the Login/Register buttons in the header with the authenticated user's username and available balance.
3. THE App SHALL render an Announcement_Ticker below the header that scrolls platform announcements from right to left continuously.
4. THE App SHALL render a fixed mobile bottom navigation bar with five tabs: Home, In-Play, Sports, Casino, and Wallet.
5. WHEN the viewport width is 768px or greater, THE App SHALL hide the mobile bottom navigation bar.
6. WHEN the viewport width is less than 768px, THE App SHALL hide the desktop sport category tabs from the header.
7. THE App SHALL apply a dark color scheme using a near-black background (#0f1923 or equivalent), with blue (#1a73e8) for back odds and pink/red (#e83a1a) for lay odds throughout all pages.

---

### Requirement 2: Homepage — Hero Banners and In-Play Section

**User Story:** As a user, I want to see live match banners and in-play events on the homepage, so that I can quickly find and bet on live action.

#### Acceptance Criteria

1. THE App SHALL render a horizontally scrollable banner carousel at the top of the homepage displaying featured matches or promotions.
2. WHEN at least one match has status `in_play`, THE App SHALL display an "In-Play" section on the homepage listing all live matches with their sport icon, team names, current score (if available), and elapsed time.
3. WHEN a user taps or clicks a match in the In-Play section, THE App SHALL navigate to that match's detail page.
4. WHEN no matches have status `in_play`, THE App SHALL display an "Upcoming" section listing the next scheduled matches sorted by start time ascending.
5. THE App SHALL poll the `/api/matches` endpoint every 30 seconds to refresh the homepage match list.
6. WHEN a WebSocket `match_update` event is received, THE App SHALL update the affected match's score and status in the In-Play section without a full page reload.

---

### Requirement 3: Sport Category Navigation and Listings

**User Story:** As a user, I want to browse matches by sport category, so that I can find events relevant to my interests.

#### Acceptance Criteria

1. THE App SHALL render a sport category navigation bar with tabs for: All, Cricket, Football, Tennis, Horse Racing, and Other.
2. WHEN a sport category tab is selected, THE App SHALL filter the displayed match list to show only matches belonging to that sport type.
3. THE App SHALL display each match in the listing as a row containing: sport icon, tournament name, team A name, team B name, match start time, status badge (LIVE / Scheduled), and the best available back and lay odds for the match winner market.
4. WHEN back or lay odds are unavailable for a match, THE App SHALL display a dash ("—") in the corresponding odds cell.
5. THE App SHALL display three back columns and three lay columns per match row, ordered from best to worst price (best back = highest price, best lay = lowest price).
6. WHEN a user clicks a back odds button, THE App SHALL open the Bet_Slip pre-filled with that selection, the clicked odds, and side set to "back".
7. WHEN a user clicks a lay odds button, THE App SHALL open the Bet_Slip pre-filled with that selection, the clicked odds, and side set to "lay".

---

### Requirement 4: Match Detail Page

**User Story:** As a user, I want a dedicated match page with full market depth and real-time updates, so that I can make informed betting decisions.

#### Acceptance Criteria

1. THE App SHALL render a match detail page at the route `/match/[id]` displaying the match title, sport, tournament, status, and start time.
2. WHEN a match has status `in_play`, THE App SHALL display a live score widget and elapsed time at the top of the match detail page.
3. THE App SHALL render the Match Odds market with a full Order_Book showing up to three back and three lay price levels with available quantities.
4. WHEN a WebSocket `orderbook_update` event is received for the current match, THE App SHALL update the Order_Book display within 500ms without a full page reload.
5. THE App SHALL render a Price_Ladder component showing all available price levels and their quantities in a scrollable vertical list.
6. THE App SHALL render a candlestick Market_Chart showing price action history for the match, updated in real time via WebSocket `candle_update` events.
7. WHEN a user selects an odds button in the Order_Book, THE App SHALL open the Bet_Slip panel pre-filled with the selection, odds, and side.

---

### Requirement 5: Bet Slip

**User Story:** As a user, I want a convenient bet slip that slides up from the bottom on mobile, so that I can review and place bets without losing context of the market.

#### Acceptance Criteria

1. WHEN a user selects an odds button anywhere in the App, THE Bet_Slip SHALL become visible by sliding up from the bottom of the screen on mobile viewports.
2. WHEN the viewport width is 768px or greater, THE Bet_Slip SHALL render as a fixed sidebar panel on the right side of the match detail page.
3. THE Bet_Slip SHALL display the selection name, market name, side (Back/Lay), odds input, stake input, calculated liability (for lay bets), and calculated net profit.
4. WHEN the user modifies the odds input, THE Bet_Slip SHALL recalculate and display the updated liability and net profit values immediately.
5. WHEN the user modifies the stake input, THE Bet_Slip SHALL recalculate and display the updated liability and net profit values immediately.
6. THE Bet_Slip SHALL display quick-stake buttons for preset amounts: ₹100, ₹500, ₹1000, ₹2000, ₹5000.
7. WHEN a user clicks a quick-stake button, THE Bet_Slip SHALL set the stake input to that amount and recalculate liability and net profit.
8. WHEN a user clicks "Place Bet" and no Session exists, THE App SHALL redirect the user to the login page.
9. WHEN a user clicks "Place Bet" and a Session exists, THE Bet_Slip SHALL POST the order to `/api/orders` and display a success confirmation or error message.
10. IF the `/api/orders` request returns an error, THEN THE Bet_Slip SHALL display the error message and allow the user to retry.
11. WHEN a bet is successfully placed, THE Bet_Slip SHALL display a confirmation message and clear the current selection after 3 seconds.
12. WHEN a user taps the close button or swipes down on the Bet_Slip on mobile, THE Bet_Slip SHALL hide.

---

### Requirement 6: User Authentication

**User Story:** As a user, I want to register and log in with a username and password, so that I can place bets and manage my funds.

#### Acceptance Criteria

1. THE App SHALL render a login page at `/login` with fields for username/email and password, and a "Login" submit button.
2. THE App SHALL render a registration page at `/register` with fields for username, email, password, confirm password, and a "Register" submit button.
3. WHEN a user submits the login form with valid credentials, THE App SHALL POST to `/api/auth/login`, store the returned JWT in an httpOnly cookie, and redirect to the homepage.
4. WHEN a user submits the login form with invalid credentials, THE App SHALL display the error message returned by the Backend without redirecting.
5. WHEN a user submits the registration form with a password that does not match the confirm password field, THE App SHALL display a "Passwords do not match" error without submitting to the Backend.
6. WHEN a user submits the registration form with valid data, THE App SHALL POST to `/api/auth/register` and redirect to the login page on success.
7. IF the `/api/auth/register` request returns a conflict error (duplicate email/username), THEN THE App SHALL display "Username or email already taken" to the user.
8. WHEN a logged-in user clicks "Logout", THE App SHALL DELETE the session cookie and redirect to the homepage.
9. WHILE a Session exists, THE App SHALL include the JWT in the Authorization header of all `/api/orders` and `/api/wallet` requests.

---

### Requirement 7: Wallet — Balance, Deposit, and Withdrawal

**User Story:** As a user, I want to view my balance and manage deposits and withdrawals via UPI, so that I can fund my account and cash out winnings.

#### Acceptance Criteria

1. THE App SHALL render a wallet page at `/wallet` displaying the user's available balance and locked balance in INR.
2. WHEN no Session exists and the user navigates to `/wallet`, THE App SHALL redirect to `/login`.
3. THE App SHALL render a deposit flow with: amount input, preset amount buttons (₹500, ₹1000, ₹2000, ₹5000), a "Proceed" button, and on the next step: the platform UPI ID with a copy button, a deep-link "Open UPI App" button, a UTR input, and a "Confirm Deposit" button.
4. WHEN a user submits a deposit with a UTR number of fewer than 10 characters, THE App SHALL display a "Invalid UTR number" error and prevent submission.
5. WHEN a user submits a valid deposit request, THE App SHALL POST to `/api/wallet/deposit` and display a pending confirmation message.
6. THE App SHALL render a withdrawal flow with: amount input, UPI ID input, and a "Request Withdrawal" button.
7. WHEN a user submits a withdrawal request with an amount below ₹200, THE App SHALL display "Minimum withdrawal is ₹200" and prevent submission.
8. WHEN a user submits a valid withdrawal request, THE App SHALL POST to `/api/wallet/withdraw` and display a pending confirmation message.
9. THE App SHALL render a transaction history tab showing all past deposits, withdrawals, and bet settlements with their status (Pending, Approved, Rejected).
10. WHEN the wallet page loads, THE App SHALL GET `/api/wallet/balance` to fetch and display the current balance.

---

### Requirement 8: Casino Games Section

**User Story:** As a user, I want to access casino games from the main navigation, so that I can play games beyond sports betting.

#### Acceptance Criteria

1. THE App SHALL render a casino page at `/casino` displaying a grid of available games: Teen Patti, Dragon Tiger, Andar Bahar, and Aviator.
2. THE App SHALL display each casino game as a card with a game thumbnail image, game name, and a "Play Now" button.
3. WHEN a user clicks "Play Now" on a casino game card and no Session exists, THE App SHALL redirect to `/login`.
4. WHEN a user clicks "Play Now" on a casino game card and a Session exists, THE App SHALL navigate to the game's dedicated page or open the game in an iframe.
5. THE App SHALL include a "Casino" tab in both the desktop header navigation and the mobile bottom navigation bar.

---

### Requirement 9: Admin Panel

**User Story:** As an admin, I want a protected admin panel to manage matches, settle bets, and approve deposits, so that I can operate the platform.

#### Acceptance Criteria

1. THE App SHALL render an admin panel at `/admin` accessible only to users with the `admin` role.
2. WHEN a non-admin user navigates to `/admin`, THE App SHALL redirect to the homepage.
3. THE Admin panel SHALL display a "Matches" tab listing all matches with their status, and buttons to create a new match, set a match to in_play, and settle a match.
4. WHEN an admin clicks "Settle Match", THE Admin panel SHALL display a modal with options: Team A wins, Team B wins, Draw, and a "Confirm" button.
5. WHEN an admin confirms settlement, THE Admin panel SHALL POST to `/api/admin/matches/:id/settle` and update the match status in the list.
6. THE Admin panel SHALL display a "Deposits" tab listing all pending deposit requests with columns: user, amount, UTR, submitted time, and action buttons "Approve" and "Reject".
7. WHEN an admin clicks "Approve" on a deposit, THE Admin panel SHALL POST to `/api/admin/deposits/:id/approve` and update the deposit status to Approved.
8. WHEN an admin clicks "Reject" on a deposit, THE Admin panel SHALL POST to `/api/admin/deposits/:id/reject` and update the deposit status to Rejected.
9. THE Admin panel SHALL display a "Users" tab listing all registered users with their balance and registration date.
10. THE Admin panel SHALL display a "Announcements" tab where an admin can create, edit, and delete Announcement_Ticker messages.
11. WHEN an admin creates or updates an announcement, THE Admin panel SHALL POST to `/api/admin/announcements` and the Announcement_Ticker SHALL reflect the change within 60 seconds.

---

### Requirement 10: Real-Time Updates via WebSocket

**User Story:** As a user, I want all market data and match scores to update in real time, so that I always see the latest information without refreshing.

#### Acceptance Criteria

1. THE App SHALL establish a WebSocket connection to the Backend on initial page load using the URL from `NEXT_PUBLIC_WS_URL`.
2. WHEN the WebSocket connection is lost, THE App SHALL attempt to reconnect using exponential backoff with delays of 1s, 2s, 4s, 8s, 16s, and 30s.
3. WHEN the WebSocket reconnects, THE App SHALL re-subscribe to all previously subscribed match rooms.
4. WHEN a `orderbook_update` WebSocket event is received, THE App SHALL update the Order_Book display for the relevant match within 500ms.
5. WHEN a `candle_update` WebSocket event is received, THE App SHALL update the Market_Chart for the relevant match.
6. WHEN a `match_update` WebSocket event is received, THE App SHALL update the match score, status, and elapsed time in all visible match listings and the match detail page.
7. WHEN a `balance_update` WebSocket event is received for the authenticated user, THE App SHALL update the balance displayed in the header and wallet page.

---

### Requirement 11: Responsive and Mobile-First Design

**User Story:** As a mobile user, I want the platform to be fully usable on a small screen, so that I can bet on the go.

#### Acceptance Criteria

1. THE App SHALL render all pages with a mobile-first layout that is fully functional on viewport widths from 320px to 428px.
2. THE App SHALL render match listing rows in a stacked card format on mobile viewports (width < 768px), showing team names, status, and the best single back and lay price.
3. WHEN the viewport width is 768px or greater, THE App SHALL render match listing rows in a full table format with all three back and three lay columns visible.
4. THE App SHALL render touch targets (buttons, odds cells) with a minimum height of 44px on mobile viewports to meet touch usability standards.
5. THE Bet_Slip SHALL be dismissible by swiping down on mobile viewports.
6. THE App SHALL not require horizontal scrolling on any page at viewport widths of 320px or greater, except for explicitly scrollable carousels and tables.

---

### Requirement 12: Backend API Extensions

**User Story:** As a developer, I want the Backend to expose all necessary endpoints for the redesigned frontend, so that all features are fully functional.

#### Acceptance Criteria

1. THE Backend SHALL expose `POST /api/auth/register` accepting `{ username, email, password }` and returning a user object on success or a 409 conflict on duplicate.
2. THE Backend SHALL expose `POST /api/auth/login` accepting `{ email, password }` and returning a signed JWT and user object on success or a 401 on invalid credentials.
3. THE Backend SHALL expose `GET /api/wallet/balance` returning `{ available: number, locked: number }` for the authenticated user.
4. THE Backend SHALL expose `POST /api/wallet/deposit` accepting `{ amount, upiId, utrNumber }` and creating a pending deposit record.
5. THE Backend SHALL expose `POST /api/wallet/withdraw` accepting `{ amount, upiId }` and creating a pending withdrawal record.
6. THE Backend SHALL expose `GET /api/wallet/transactions` returning a paginated list of the authenticated user's transactions.
7. THE Backend SHALL expose `POST /api/admin/deposits/:id/approve` and `POST /api/admin/deposits/:id/reject` accessible only to admin-role users.
8. THE Backend SHALL expose `GET /api/admin/announcements`, `POST /api/admin/announcements`, `PUT /api/admin/announcements/:id`, and `DELETE /api/admin/announcements/:id` accessible only to admin-role users.
9. THE Backend SHALL expose `GET /api/announcements` returning the list of active announcements for the Announcement_Ticker.
10. IF a request to any `/api/admin/*` route is made by a non-admin user, THEN THE Backend SHALL return a 403 Forbidden response.
