// lib/odds/parser.ts

export interface OddsApiEvent {
  id: string
  sport_key: string
  home_team: string
  away_team: string
  bookmakers: Array<{
    key: string
    markets: Array<{
      key: string
      outcomes: Array<{ name: string; price: number }>
    }>
  }>
}

export interface ParsedMarket {
  external_event_id: string
  market_name: string
  outcome: string
  back_odds: number
  lay_odds: number
}

export function round4dp(n: number): number {
  return Math.round(n * 10000) / 10000
}

export function parseOddsResponse(raw: OddsApiEvent[]): ParsedMarket[] {
  return raw.flatMap(event =>
    event.bookmakers[0]?.markets.flatMap(market =>
      market.outcomes.map(outcome => ({
        external_event_id: event.id,
        market_name: market.key,
        outcome: outcome.name,
        back_odds: round4dp(outcome.price),
        lay_odds:  round4dp(outcome.price * 1.02),  // synthetic lay = back + 2% margin
      }))
    ) ?? []
  )
}
