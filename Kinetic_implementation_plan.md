# SBE Production Launch: The "Kinetic Ledger" Implementation Plan

This document outlines the final phase of development for the **Sports Betting Exchange (SBE)**. The goal is to transition from a prototype to a market-ready, ultra-high-performance platform with a premium design and autonomous management capabilities.

## User Review Required

> [!IMPORTANT]
> **Design Transition**: We are moving to a strict **Apple-inspired aesthetic** (#000000, #f5f5f7, #0071e3). Existing components will be refactored to use high-quality glassmorphism and Tailwind CSS 4 features.
> 
> **Referral Logic**: The system will track net winnings and distribute a percentage to referrers. This requires a small schema migration.

## Proposed Changes

### 1. Frontend: "Kinetic Ledger" UX Overhaul
*Target Project*: `sbe/web`

#### [MODIFY] [globals.css](file:///d:/JMD%20Online%20Book/sbe/web/src/app/globals.css)
*   Update theme tokens to strict Apple/Kinetic Ledger colors.
    *   `--background`: #000000
    *   `--primary`: #0071e3
    *   `--accent`: #f5f5f7
    *   Implement glassmorphism utility classes.

#### [MODIFY] [Header](file:///d:/JMD%20Online%20Book/sbe/web/src/components/header.tsx) & [Sidebar](file:///d:/JMD%20Online%20Book/sbe/web/src/components/sidebar.tsx)
*   Redesign navigation using translucent glass backdrops.
*   Update typography to **SF Pro Display** (fonts handled via Tailwind vars).
*   Add micro-animations for active states and hover.

#### [NEW] [MatchCard.tsx](file:///d:/JMD%20Online%20Book/sbe/web/src/components/match-card.tsx)
*   High-fidelity match summaries with real-time odds indicators.
*   Visual "Back" (Blue) and "Lay" (Pink/Theme) markers.

#### [NEW] [AiAssistant.tsx](file:///d:/JMD%20Online%20Book/sbe/web/src/components/ai-assistant.tsx)
*   Floating bubble UI for the AI Chatbot.
*   Next.js Server Action to proxy requests to an LLM provider.

---

### 2. Backend: Referral & Admin Systems
*Target Project*: `sbe/backend`

#### [MODIFY] [schema.ts](file:///d:/JMD%20Online%20Book/sbe/backend/src/db/schema.ts)
*   Add `referrals` table: `id`, `referrer_id`, `referee_id`, `code`, `status`.
*   Add `referral_earnings` table to track commission payouts.

#### [NEW] [referral.ts](file:///d:/JMD%20Online%20Book/sbe/backend/src/routes/referral.ts)
*   `POST /referral/invite`: Generate a unique invite link.
*   `GET /referral/stats`: Dashboard data for earnings and invites.

#### [MODIFY] [admin.ts](file:///d:/JMD%20Online%20Book/sbe/backend/src/routes/admin.ts)
*   Add routes for "Global Liability View" and "Market Injection".
*   Finalize KYC document verification flow.

---

### 3. "GOD MODE" Orchestration
*Target Directory*: `sbe/.agents`

#### [MODIFY] [AGENTS.md](file:///d:/JMD%20Online%20Book/sbe/.agents/AGENTS.md)
*   Hardcoding specific self-healing prompts.
*   Adding constraints for 0% house edge liability logic.

---

## Open Questions

> [!IMPORTANT]
> **Financial Precision**: The `Master Prompt` mentions a Rust matching engine. Should the implementation prioritize the Rust engine for this phase, or continue stabilizing the current TypeScript matching logic for the initial production push?

## Verification Plan

### Automated Tests
*   **Liability Verification**: Run `npm run test` in `sbe/backend` to verify back/lay liability calculations.
*   **Design Audit**: Use `check-ui-guidelines` tool to ensure compliance with Apple aesthetic rules.

### Manual Verification
1.  **Referral Flow**: Register a new user using a referral link and verify the credit entry in the ledger.
2.  **UI Walkthrough**: Capture screenshots of the new Landing Page and Odds Grid to verify "Kinetic Ledger" style.
3.  **Deployment**: Execute the final deployment pipeline and verify the live environment status.
