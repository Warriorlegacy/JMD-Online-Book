// lib/types/betting.ts

export type SportEventStatus = 'upcoming' | 'live' | 'suspended' | 'settled' | 'cancelled'
export type CasinoRoundStatus = 'waiting' | 'betting_open' | 'dealing' | 'result' | 'settled'
export type BetType = 'back' | 'lay' | 'casino'
export type BetResult = 'pending' | 'win' | 'lose' | 'void' | 'draw'

export interface SportEvent {
  id: string
  sport: string
  league: string | null
  home_team: string
  away_team: string
  start_time: string
  status: SportEventStatus
  is_betting_locked: boolean
  result: string | null
  external_event_id: string | null
  odds_markets?: OddsMarket[]
}

export interface OddsMarket {
  id: string
  event_id: string
  market_name: string
  outcome: string
  back_odds: number
  lay_odds: number
  is_active: boolean
  override_back_odds: number | null
  override_lay_odds: number | null
  is_stale: boolean
  // Computed: effective odds served to client
  effective_back_odds: number
  effective_lay_odds: number
}

export interface CasinoRound {
  id: string
  game_id: string
  status: CasinoRoundStatus
  result: string | null
  crash_point: number | null
  settled_at: string | null
  created_at: string
}

export interface PlaceBetRequest {
  event_id?: string
  round_id?: string
  market_id?: string
  bet_type: BetType
  outcome: string
  stake: number
  auto_cashout_multiplier?: number  // Aviator only
}

export interface SettlementResult {
  already_settled?: boolean
  total_bets?: number
  total_payout?: number
}

export interface AviatorRoundState {
  round_id: string
  status: 'betting_open' | 'flying' | 'crashed'
  multiplier: number
  crash_point: number
  started_at: number
}
