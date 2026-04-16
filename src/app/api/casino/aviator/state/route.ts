import { fail, ok } from '@/lib/api'
import { getSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeMultiplier } from '@/lib/casino/aviator'

export async function GET() {
  const session = await getSession()
  if (!session) return fail('Unauthorized', 401)

  const db = createAdminClient()

  // Get Aviator game
  const { data: game } = await db
    .from('games')
    .select('id')
    .ilike('name', '%Aviator%')
    .maybeSingle()

  if (!game) return fail('Aviator game not found', 404)

  // Get current round
  const { data: round, error } = await db
    .from('casino_rounds')
    .select('*')
    .eq('game_id', game.id)
    .not('status', 'eq', 'settled')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return fail(error.message, 500)

  if (!round) {
    return ok({ round_id: null, status: 'waiting', multiplier: 1.0, crash_point_revealed: null })
  }

  // Compute multiplier if flying
  let multiplier = 1.0
  let status = round.status as string
  let crash_point_revealed: number | null = null

  if (status === 'betting_open') {
    multiplier = 1.0
  } else if (status === 'dealing') {
    // 'dealing' is used as 'flying' for Aviator
    const startedAt = new Date(round.created_at).getTime()
    multiplier = computeMultiplier(startedAt)

    const crashPoint = Number(round.crash_point ?? 2.0)

    // Check if crashed
    if (multiplier >= crashPoint) {
      multiplier = crashPoint
      status = 'crashed'
      crash_point_revealed = crashPoint

      // Mark round as result/crashed
      await db.from('casino_rounds').update({ status: 'result' }).eq('id', round.id)

      // Mark all pending bets as lose
      await db.from('bets')
        .update({ result: 'lose', payout: 0, settled_at: new Date().toISOString() })
        .eq('round_id', round.id)
        .eq('result', 'pending')
    } else {
      // Run auto-cashout for bets
      const { data: autoBets } = await db
        .from('bets')
        .select('*')
        .eq('round_id', round.id)
        .eq('result', 'pending')
        .not('auto_cashout_multiplier', 'is', null)
        .lte('auto_cashout_multiplier', multiplier)

      for (const bet of autoBets ?? []) {
        const cashoutMultiplier = Number(bet.auto_cashout_multiplier)
        if (cashoutMultiplier < crashPoint) {
          const payout = Number(bet.amount) * cashoutMultiplier
          await db.from('bets').update({
            result: 'win',
            payout,
            cashout_multiplier: cashoutMultiplier,
            settled_at: new Date().toISOString(),
          }).eq('id', bet.id)
          await db.rpc('update_balance', { p_user_id: bet.user_id, p_amount: payout, p_type: 'win' })
        }
      }
    }
  } else if (status === 'result') {
    status = 'crashed'
    crash_point_revealed = Number(round.crash_point ?? 0)
    multiplier = crash_point_revealed
  }

  // Get crash history
  const { data: history } = await db
    .from('casino_rounds')
    .select('id, crash_point, settled_at')
    .eq('game_id', game.id)
    .in('status', ['result', 'settled'])
    .order('created_at', { ascending: false })
    .limit(20)

  return ok({
    round_id: round.id,
    status,
    multiplier,
    crash_point_revealed,
    history: history ?? [],
  })
}
