import { fail, created } from '@/lib/api'
import { requireSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import type { PlaceBetRequest } from '@/lib/types/betting'

export async function POST(request: Request) {
  let session
  try {
    session = await requireSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  let body: PlaceBetRequest
  try {
    body = await request.json()
  } catch {
    return fail('Invalid JSON')
  }

  const { event_id, round_id, market_id, bet_type, outcome, stake, auto_cashout_multiplier } = body

  if (!bet_type || !outcome || !stake) {
    return fail('bet_type, outcome, and stake are required')
  }
  if (stake <= 0) return fail('Stake must be positive')

  const db = createAdminClient()

  // Check if betting is locked for sports events
  if (event_id) {
    const { data: event } = await db
      .from('sport_events')
      .select('is_betting_locked, status, min_bet')
      .eq('id', event_id)
      .maybeSingle()

    if (!event) return fail('Event not found', 404)
    if (event.is_betting_locked) return fail('betting_suspended')
    if (event.status === 'suspended') return fail('betting_suspended')
  }

  // Check casino round status
  if (round_id) {
    const { data: round } = await db
      .from('casino_rounds')
      .select('status, game_id')
      .eq('id', round_id)
      .maybeSingle()

    if (!round) return fail('Round not found', 404)
    if (round.status !== 'betting_open') return fail('betting_suspended')

    // Check min_bet from game
    const { data: game } = await db
      .from('games')
      .select('min_bet')
      .eq('id', round.game_id)
      .maybeSingle()

    if (game?.min_bet && stake < game.min_bet) {
      return fail(`below_minimum_stake: minimum is ${game.min_bet}`)
    }
  }

  // Get current balance
  const { data: profile } = await db
    .from('profiles')
    .select('balance')
    .eq('id', session.id)
    .maybeSingle()

  if (!profile) return fail('User not found', 404)

  const balance = Number(profile.balance ?? 0)
  if (stake > balance) return fail('insufficient_balance')

  // Deduct stake atomically
  const { error: balanceError } = await db.rpc('update_balance', {
    p_user_id: session.id,
    p_amount: -stake,
    p_type: 'bet',
  })

  if (balanceError) return fail(balanceError.message, 500)

  // Insert bet record
  const betPayload: Record<string, unknown> = {
    id: crypto.randomUUID(),
    user_id: session.id,
    game_id: round_id
      ? (await db.from('casino_rounds').select('game_id').eq('id', round_id).maybeSingle()).data?.game_id ?? '00000000-0000-0000-0000-000000000000'
      : '00000000-0000-0000-0000-000000000000',
    amount: stake,
    bet_type,
    outcome,
    result: 'pending',
    created_at: new Date().toISOString(),
  }

  if (event_id) betPayload.event_id = event_id
  if (round_id) betPayload.round_id = round_id
  if (market_id) betPayload.market_id = market_id
  if (auto_cashout_multiplier) betPayload.auto_cashout_multiplier = auto_cashout_multiplier

  // Get odds from market if available
  if (market_id) {
    const { data: market } = await db
      .from('odds_markets')
      .select('back_odds, lay_odds, override_back_odds, override_lay_odds')
      .eq('id', market_id)
      .maybeSingle()

    if (market) {
      const odds = bet_type === 'back'
        ? (market.override_back_odds ?? market.back_odds)
        : (market.override_lay_odds ?? market.lay_odds)
      betPayload.odds = odds
      betPayload.potential_win = stake * Number(odds)
    }
  }

  const { data: bet, error: betError } = await db
    .from('bets')
    .insert(betPayload)
    .select('*')
    .single()

  if (betError) {
    // Refund on bet insert failure
    await db.rpc('update_balance', { p_user_id: session.id, p_amount: stake, p_type: 'refund' })
    return fail(betError.message, 500)
  }

  return created(bet)
}
