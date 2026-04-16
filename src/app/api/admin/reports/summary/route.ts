import { fail, ok } from '@/lib/api'
import { requireAdminSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start') ?? new Date(Date.now() - 86400000).toISOString()
  const end = searchParams.get('end') ?? new Date().toISOString()

  const db = createAdminClient()

  // Transactions summary
  const { data: txData } = await db
    .from('transactions')
    .select('type, amount, status')
    .gte('created_at', start)
    .lte('created_at', end)

  const txRows = txData ?? []
  const total_deposits = txRows
    .filter((t) => t.type === 'deposit' && t.status === 'approved')
    .reduce((s, t) => s + Number(t.amount), 0)
  const total_withdrawals = txRows
    .filter((t) => t.type === 'withdraw' && t.status === 'approved')
    .reduce((s, t) => s + Number(t.amount), 0)

  // Bets summary
  const { data: betsData } = await db
    .from('bets')
    .select('amount, payout, result, event_id, round_id')
    .gte('created_at', start)
    .lte('created_at', end)
    .neq('result', 'pending')

  const betsRows = betsData ?? []
  const total_bets = betsRows.length
  const total_payouts = betsRows.reduce((s, b) => s + Number(b.payout ?? 0), 0)
  const total_staked = betsRows.reduce((s, b) => s + Number(b.amount), 0)
  const house_pnl = total_staked - total_payouts

  // Sports vs casino breakdown
  const sports_bets = betsRows.filter((b) => b.event_id)
  const casino_bets = betsRows.filter((b) => b.round_id)
  const sports_pnl = sports_bets.reduce((s, b) => s + Number(b.amount) - Number(b.payout ?? 0), 0)
  const casino_pnl = casino_bets.reduce((s, b) => s + Number(b.amount) - Number(b.payout ?? 0), 0)

  // Top 10 users by net loss
  const userLoss: Record<string, number> = {}
  for (const bet of betsRows) {
    // We need user_id — re-query with user_id
  }

  const { data: betsWithUsers } = await db
    .from('bets')
    .select('user_id, amount, payout')
    .gte('created_at', start)
    .lte('created_at', end)
    .neq('result', 'pending')

  for (const bet of betsWithUsers ?? []) {
    const loss = Number(bet.amount) - Number(bet.payout ?? 0)
    userLoss[bet.user_id] = (userLoss[bet.user_id] ?? 0) + loss
  }

  const top10 = Object.entries(userLoss)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([user_id, net_loss]) => ({ user_id, net_loss }))

  // Enrich with names
  const userIds = top10.map((u) => u.user_id)
  let profiles: Array<{ id: string; full_name: string | null; phone: string | null }> = []
  if (userIds.length > 0) {
    const { data } = await db.from('profiles').select('id, full_name, phone').in('id', userIds)
    profiles = data ?? []
  }

  const top10Enriched = top10.map((u) => {
    const p = profiles.find((pr) => pr.id === u.user_id)
    return { ...u, name: p?.full_name ?? p?.phone ?? u.user_id }
  })

  return ok({
    total_deposits,
    total_withdrawals,
    total_bets,
    total_payouts,
    house_pnl,
    breakdown: {
      sports: { bets: sports_bets.length, pnl: sports_pnl },
      casino: { bets: casino_bets.length, pnl: casino_pnl },
    },
    top10_users: top10Enriched,
    period: { start, end },
  })
}
