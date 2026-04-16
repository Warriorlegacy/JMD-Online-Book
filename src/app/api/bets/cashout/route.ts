import { fail, ok } from '@/lib/api'
import { requireSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeMultiplier } from '@/lib/casino/aviator'

export async function POST(request: Request) {
  let session
  try {
    session = await requireSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  let body: { bet_id: string }
  try {
    body = await request.json()
  } catch {
    return fail('Invalid JSON')
  }

  const { bet_id } = body
  if (!bet_id) return fail('bet_id is required')

  const db = createAdminClient()

  // Load bet
  const { data: bet, error: betError } = await db
    .from('bets')
    .select('*')
    .eq('id', bet_id)
    .eq('user_id', session.id)
    .maybeSingle()

  if (betError) return fail(betError.message, 500)
  if (!bet) return fail('Bet not found', 404)
  if (bet.result !== 'pending') return fail('round_ended')

  // Load round
  const { data: round } = await db
    .from('casino_rounds')
    .select('*')
    .eq('id', bet.round_id)
    .maybeSingle()

  if (!round) return fail('Round not found', 404)

  // Check round is still flying (dealing status)
  if (round.status !== 'dealing') return fail('round_ended')

  const startedAt = new Date(round.created_at).getTime()
  const currentMultiplier = computeMultiplier(startedAt)
  const crashPoint = Number(round.crash_point ?? 2.0)

  if (currentMultiplier >= crashPoint) {
    // Already crashed — mark bet as lose
    await db.from('bets').update({ result: 'lose', payout: 0 }).eq('id', bet_id)
    return fail('round_ended')
  }

  const payout = Number(bet.amount) * currentMultiplier

  // Credit payout
  const { error: balanceError } = await db.rpc('update_balance', {
    p_user_id: session.id,
    p_amount: payout,
    p_type: 'win',
  })

  if (balanceError) return fail(balanceError.message, 500)

  // Mark bet as win
  await db.from('bets').update({
    result: 'win',
    payout,
    cashout_multiplier: currentMultiplier,
    settled_at: new Date().toISOString(),
  }).eq('id', bet_id)

  return ok({ payout, multiplier: currentMultiplier })
}
