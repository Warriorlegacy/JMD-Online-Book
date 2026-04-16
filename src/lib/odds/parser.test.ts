/**
 * Property-based tests for odds parse round-trip.
 * Validates: Requirements 17.8
 * Feature: jmd-production-ready, Property 8: Odds Parse Round-Trip
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { parseOddsResponse, round4dp, type OddsApiEvent } from './parser'

// Generator for a valid OddsApiEvent
const oddsApiEventArb = fc.record({
  id: fc.uuid(),
  sport_key: fc.constantFrom('cricket_ipl', 'soccer', 'tennis'),
  home_team: fc.string({ minLength: 2, maxLength: 30 }),
  away_team: fc.string({ minLength: 2, maxLength: 30 }),
  bookmakers: fc.array(
    fc.record({
      key: fc.string({ minLength: 2, maxLength: 20 }),
      markets: fc.array(
        fc.record({
          key: fc.constantFrom('h2h', 'spreads', 'totals'),
          outcomes: fc.array(
            fc.record({
              name: fc.string({ minLength: 2, maxLength: 30 }),
              price: fc.double({ min: 1.01, max: 100, noNaN: true }),
            }),
            { minLength: 1, maxLength: 3 }
          ),
        }),
        { minLength: 1, maxLength: 2 }
      ),
    }),
    { minLength: 1, maxLength: 1 }
  ),
})

describe('parseOddsResponse — Property 8: Odds Parse Round-Trip', () => {
  it('back_odds equals round4dp(original price)', () => {
    fc.assert(
      fc.property(
        fc.array(oddsApiEventArb, { minLength: 1, maxLength: 5 }),
        (events: OddsApiEvent[]) => {
          const parsed = parseOddsResponse(events)

          for (const market of parsed) {
            // Find the original price
            const event = events.find((e) => e.id === market.external_event_id)
            if (!event) continue

            const bookmaker = event.bookmakers[0]
            if (!bookmaker) continue

            for (const m of bookmaker.markets) {
              const outcome = m.outcomes.find((o) => o.name === market.outcome)
              if (!outcome) continue

              const expectedBack = round4dp(outcome.price)
              const expectedLay = round4dp(outcome.price * 1.02)

              expect(market.back_odds).toBe(expectedBack)
              expect(market.lay_odds).toBe(expectedLay)
            }
          }
        }
      )
    )
  })

  it('lay_odds equals round4dp(original_price × 1.02)', () => {
    fc.assert(
      fc.property(
        fc.array(oddsApiEventArb, { minLength: 1, maxLength: 5 }),
        (events: OddsApiEvent[]) => {
          const parsed = parseOddsResponse(events)
          for (const market of parsed) {
            // Find the original price from the source event
            const event = events.find((e) => e.id === market.external_event_id)
            if (!event) continue
            const bookmaker = event.bookmakers[0]
            if (!bookmaker) continue
            for (const m of bookmaker.markets) {
              const outcome = m.outcomes.find((o) => o.name === market.outcome)
              if (!outcome) continue
              const expectedLay = round4dp(outcome.price * 1.02)
              expect(market.lay_odds).toBe(expectedLay)
            }
          }
        }
      )
    )
  })

  it('round4dp is idempotent', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1.0, max: 1000, noNaN: true }),
        (n) => {
          expect(round4dp(round4dp(n))).toBe(round4dp(n))
        }
      )
    )
  })

  it('all parsed markets have external_event_id matching input', () => {
    fc.assert(
      fc.property(
        fc.array(oddsApiEventArb, { minLength: 1, maxLength: 5 }),
        (events: OddsApiEvent[]) => {
          const parsed = parseOddsResponse(events)
          const eventIds = new Set(events.map((e) => e.id))
          for (const market of parsed) {
            expect(eventIds.has(market.external_event_id)).toBe(true)
          }
        }
      )
    )
  })
})
