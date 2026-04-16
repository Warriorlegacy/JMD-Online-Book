import { fail, ok } from '@/lib/api'
import { requireAdminSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { addNotification } from '@/lib/repo'

export async function GET(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  const { searchParams } = new URL(request.url)
  const event_id = searchParams.get('event_id')
  if (!event_id) return fail('event_id is required')

  const db = createAdminClient()
  const { count } = await db
    .from('bets')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event_id)
    .eq('result', 'pending')

  const { data: bets } = await db
    .from('bets')
    .select('amount')
    .eq('event_id', event_id)
    .eq('result', 'pending')

  const totalStake = (bets ?? []).reduce((sum, b) => sum + Number(b.amount), 0)

  return ok({ pending_bets: count ?? 0, estimated_payout: totalStake })
}

export async function POST(request: Request) {
  let session
  try {
    session = await requireAdminSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  let body: { event_id: string; result: string }
  try {
    body = await request.json()
  } catch {
    return fail('Invalid JSON')
  }

  const { event_id, result } = body
  if (!event_id || !result) return fail('event_id and result are required')

  const db = createAdminClient()

  // Call settle_sport_event RPC
  const { data, error } = await db.rpc('settle_sport_event', {
    p_event_id: event_id,
    p_result: result,
    p_admin_id: session.id,
  })

  if (error) return fail(error.message, 500)

  const settlementResult = data as { already_settled?: boolean; total_bets?: number; total_payout?: number }

  if (settlementResult?.already_settled) {
    return ok({ already_settled: true })
  }

  // Send notifications to affected bettors
  try {
    const { data: bets } = await db
      .from('bets')
      .select('user_id, result, payout, amount')
      .eq('event_id', event_id)
      .neq('result', 'pending')

    for (const bet of bets ?? []) {
      await addNotification({
        user_id: bet.user_id,
        title: 'Bet Settled',
        body: bet.result === 'win'
          ? `You won ₹${Number(bet.payout).toFixed(2)}!`
          : bet.result === 'void' || bet.result === 'draw'
          ? `Your bet was ${bet.result}. Stake refunded.`
          : `Your bet of ₹${Number(bet.amount).toFixed(2)} lost.`,
        type: bet.result === 'win' ? 'win' : 'info',
      })
    }
  } catch { /* notifications are non-critical */ }

  return ok({
    total_bets: settlementResult?.total_bets ?? 0,
    total_payout: settlementResult?.total_payout ?? 0,
  })
}
