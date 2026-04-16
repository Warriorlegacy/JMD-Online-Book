// lib/odds/override.ts
import type { OddsMarket } from '@/lib/types/betting'

/**
 * Returns effective odds for a market, using override values if set.
 * COALESCE(override_back_odds, back_odds)
 */
export function getEffectiveOdds(market: OddsMarket): { back: number; lay: number } {
  return {
    back: market.override_back_odds ?? market.back_odds,
    lay:  market.override_lay_odds  ?? market.lay_odds,
  }
}
