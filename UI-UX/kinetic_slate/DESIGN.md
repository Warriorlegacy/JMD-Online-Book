# High-Performance Betting Interface: Design System Documentation

## 1. Overview & Creative North Star
In the world of high-stakes sports betting, data is the protagonist, but clarity is the hero. This design system departs from the cluttered, "spreadsheet-style" legacy of betting platforms to embrace a philosophy we call **"The Kinetic Ledger."**

The Kinetic Ledger is an editorial-first approach to dense data. It prioritizes the "Creative North Star" of **Visual Authority.** We break the traditional grid-locked template by using intentional asymmetry, overlapping layers, and high-contrast typography scales. The goal is to make the user feel like they are interacting with a high-end financial terminal—sophisticated, ultra-fast, and impeccably organized. We don't just show odds; we curate the betting experience.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep, oceanic blues to establish trust, punctuated by "Electric Neon" accents that signal action and live updates.

### The Color Tokens
*   **Primary (`#a7c8ff`):** Used for critical actions, selected states, and brand moments.
*   **Tertiary (`#abd45e`):** The "Winning Accent." Reserved for live status, positive odds shifts, and success states.
*   **Surface (`#09141f`):** The foundational dark space.

### The "No-Line" Rule
To achieve a premium, editorial feel, **1px solid borders are strictly prohibited** for sectioning. Structural boundaries must be defined through:
1.  **Background Color Shifts:** Placing a `surface-container-low` card on a `surface` background.
2.  **Tonal Transitions:** Using subtle shifts in the blue spectrum to imply a change in content density.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials.
*   **Base Layer:** `surface` (The floor).
*   **Primary Containers:** `surface-container-low` (General layout sections).
*   **Actionable Cards:** `surface-container-high` (Betting markets and odds blocks).
*   **Overlays/Modals:** `surface-container-highest` (Bet slips and menus).

### The "Glass & Gradient" Rule
Standard flat colors feel "out-of-the-box." To elevate the experience:
*   **Glassmorphism:** Use semi-transparent surface colors with a `backdrop-filter: blur(12px)` for floating elements like the Bet Slip.
*   **Signature Gradients:** For primary CTAs, use a linear gradient from `primary` to `primary-container` at a 135-degree angle to add a sense of "liquid metal" polish.

---

## 3. Typography: Editorial Authority
We use **Inter** across the board. Its geometric clarity ensures that even at the smallest sizes (0.6875rem), complex odds remain legible.

*   **Display & Headlines:** Use `display-md` or `headline-lg` for major sports categories. These should feel bold and authoritative, using tighter letter-spacing (-0.02em).
*   **The Data Tier:** `title-sm` is your workhorse for match titles. It provides enough weight to anchor the odds below it.
*   **The Odds Tier:** Use `label-md` for odds values. This font size is specifically tuned for density, allowing us to fit 1x2, Handicap, and Totals in a single horizontal view without visual fatigue.
*   **Labels:** `label-sm` is used for "Live" timestamps and "Market" categories. It should always be uppercase with +0.05em tracking to ensure it doesn't "bleed" into the data.

---

## 4. Elevation & Depth
We eschew traditional drop shadows for **Tonal Layering.** Depth is achieved through the stacking of the surface-container tiers.

*   **Ambient Shadows:** If a floating element (like a Bet Slip) requires a shadow, it must be highly diffused.
    *   *Shadow Color:* A tinted version of the surface color (not black).
    *   *Blur:* 32px to 64px.
    *   *Opacity:* 6% - 10%.
*   **The "Ghost Border" Fallback:** In ultra-dense tables where tonal shifts aren't enough, use a Ghost Border. This is the `outline-variant` token set to 15% opacity. It provides a "suggestion" of a line rather than a hard boundary.
*   **Interactive Glow:** When an odd is selected, don't just change the color—add a subtle outer glow using the `primary` color at 20% opacity to mimic a backlit button.

---

## 5. Components

### Buttons
*   **Primary:** Gradient-filled (`primary` to `primary-container`). Use `lg` roundedness (0.5rem).
*   **Secondary:** Ghost-style with a `primary` text color. No border, just a `surface-container-highest` background on hover.
*   **Tertiary:** For utility functions (e.g., "Cash Out"). Uses the `tertiary` green to denote a profitable action.

### Odds Cards (The Core Component)
Forbid the use of divider lines between odds. Instead, use a `surface-container-high` background for the entire block. When an odd changes (Live Update), the entire background of that specific odd cell should flash `tertiary` (green) for 500ms before fading back to the base color.

### The Bet Slip (Glass Overlay)
The Bet Slip is a floating, persistent entity. Apply `surface-container-highest` with 85% opacity and a heavy backdrop blur. This keeps the user grounded in the "Live" data while they manage their bets.

### Status Indicators
*   **Live Now:** A `tertiary` dot with a "Pulse" animation. The pulse should be a 10% opacity `tertiary` ring that expands and fades.
*   **Suspended Market:** Use `on-surface-variant` with a 40% opacity overlay and a small lock icon.

### Input Fields
Avoid "box" styles. Use a "Bottom Line Only" approach or a subtle `surface-container-lowest` fill. The label should always be visible (using `label-sm`) to prevent cognitive load in high-stress betting moments.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use vertical white space (16px or 24px) instead of lines to separate different leagues or sports.
*   **Do** use asymmetrical layouts for Hero banners (e.g., an image bleeding off the edge of the screen) to break the "web-template" feel.
*   **Do** prioritize "Data Freshness"—ensure every odds update has a micro-animation (a subtle color tint).

### Don’t:
*   **Don't** use 100% black. The deepest color should always be our `surface` blue.
*   **Don't** use standard "Error Red" for everything negative. Use `error_container` for a more integrated, sophisticated warning system.
*   **Don't** crowd the interface. Even in a "data-dense" environment, a 4px "breathing room" between odds cells is mandatory.