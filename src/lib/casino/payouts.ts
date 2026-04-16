// lib/casino/payouts.ts

export const CASINO_PAYOUTS: Record<string, Record<string, number>> = {
  teen_patti:   { win: 1.95, tie: 8.0, lose: 0 },
  dragon_tiger: { win: 1.95, tie: 8.0, lose: 0 },
  andar_bahar:  { win: 1.90, lose: 0 },
}

/**
 * Returns the payout multiplier for a casino bet.
 * If betOutcome matches result, returns the win/tie multiplier.
 * Otherwise returns 0 (lose).
 */
export function getCasinoPayout(game: string, betOutcome: string, result: string): number {
  const payouts = CASINO_PAYOUTS[game]
  if (!payouts) return 0
  if (betOutcome !== result) return 0

  // Check if it's a tie outcome
  if (betOutcome.toLowerCase() === 'tie') {
    return payouts.tie ?? 0
  }

  return payouts.win ?? 0
}
