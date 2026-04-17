/**
 * Property-based tests for casino payout correctness.
 * Validates: Requirements 4.6, 5.5, 6.5
 * Feature: jmd-production-ready, Property 5: Casino Payout Correctness
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { getCasinoPayout, CASINO_PAYOUTS } from './payouts'

describe('getCasinoPayout — Property 5: Casino Payout Correctness', () => {
  it('teen_patti: win outcome returns stake × 1.95', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 100000, noNaN: true }),
        fc.constantFrom('Player A', 'Player B'),
        (stake, outcome) => {
          const multiplier = getCasinoPayout('teen_patti', outcome, outcome)
          expect(multiplier).toBe(1.95)
          expect(stake * multiplier).toBeCloseTo(stake * 1.95, 5)
        }
      )
    )
  })

  it('teen_patti: tie outcome returns stake × 8.0', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 100000, noNaN: true }),
        (stake) => {
          const multiplier = getCasinoPayout('teen_patti', 'Tie', 'Tie')
          expect(multiplier).toBe(8.0)
          expect(stake * multiplier).toBeCloseTo(stake * 8.0, 5)
        }
      )
    )
  })

  it('dragon_tiger: win outcome returns stake × 1.95', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 100000, noNaN: true }),
        fc.constantFrom('Dragon', 'Tiger'),
        (stake, outcome) => {
          const multiplier = getCasinoPayout('dragon_tiger', outcome, outcome)
          expect(multiplier).toBe(1.95)
          expect(stake * multiplier).toBeCloseTo(stake * 1.95, 5)
        }
      )
    )
  })

  it('dragon_tiger: tie outcome returns stake × 8.0', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 100000, noNaN: true }),
        (_stake) => {
          const multiplier = getCasinoPayout('dragon_tiger', 'Tie', 'Tie')
          expect(multiplier).toBe(8.0)
        }
      )
    )
  })

  it('andar_bahar: win outcome returns stake × 1.90', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 100000, noNaN: true }),
        fc.constantFrom('Andar', 'Bahar'),
        (stake, outcome) => {
          const multiplier = getCasinoPayout('andar_bahar', outcome, outcome)
          expect(multiplier).toBe(1.90)
          expect(stake * multiplier).toBeCloseTo(stake * 1.90, 5)
        }
      )
    )
  })

  it('any game: losing bet returns 0', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('teen_patti', 'dragon_tiger', 'andar_bahar'),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (game, betOutcome, result) => {
          // Only test when outcomes differ (losing case)
          if (betOutcome !== result) {
            const multiplier = getCasinoPayout(game, betOutcome, result)
            expect(multiplier).toBe(0)
          }
        }
      )
    )
  })

  it('CASINO_PAYOUTS has correct structure', () => {
    expect(CASINO_PAYOUTS.teen_patti.win).toBe(1.95)
    expect(CASINO_PAYOUTS.teen_patti.tie).toBe(8.0)
    expect(CASINO_PAYOUTS.dragon_tiger.win).toBe(1.95)
    expect(CASINO_PAYOUTS.dragon_tiger.tie).toBe(8.0)
    expect(CASINO_PAYOUTS.andar_bahar.win).toBe(1.90)
  })
})
