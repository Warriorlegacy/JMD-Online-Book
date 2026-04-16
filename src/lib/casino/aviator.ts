// lib/casino/aviator.ts

export interface AviatorRoundState {
  round_id: string
  status: 'betting_open' | 'flying' | 'crashed'
  multiplier: number
  crash_point: number
  started_at: number
}

/**
 * Computes the current Aviator multiplier based on elapsed time.
 * Formula: M(t) = e^(0.00006 * t_ms) rounded to 2dp
 */
export function computeMultiplier(started_at: number): number {
  const elapsed = Date.now() - started_at
  return Math.round(Math.exp(0.00006 * elapsed) * 100) / 100
}
