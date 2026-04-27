#!/bin/bash
# Remove all unused imports and variables where easy to fix by regex

# accumulator.ts
sed -i 's/import { bets, betSelections, oddsMarkets } from "..\/db\/schema.js";/import { bets, betSelections } from "..\/db\/schema.js";/g' sbe/web/src/services/accumulator.ts
sed -i 's/import { eq, and } from "drizzle-orm";/import { eq } from "drizzle-orm";/g' sbe/web/src/services/accumulator.ts
sed -i 's/private static async getSelectionStatus(matchId: string, selectionId: string)/private static async getSelectionStatus(_matchId: string, _selectionId: string)/g' sbe/web/src/services/accumulator.ts

# layout.tsx
# I will not touch this, since it's just warnings and shouldn't cause build failures, but I can suppress the next/font warnings

# We only have warnings here. Next.js `npm run lint` only fails the build if there are errors, warnings are fine!
# Let's check the GitHub action log again
