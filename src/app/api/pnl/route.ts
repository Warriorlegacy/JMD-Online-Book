import { fail, ok } from '@/lib/api'
import { requireSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  let session
  try {
    session = await requireSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  const db = createAdminClient()

  // Get profile totals
  const { data: profile } = await db
    .from('profiles')
    .select('total_deposited, total_withdrawn')
    .eq('id', session.id)
    .maybeSingle()

  // Get settled bets in range
  let betsQuery = db
    .from('bets')
    .select('id, amount, payout, result, odds, outcome, created_at, event_id, round_id, game_id')
    .eq('user_id', session.id)
    .neq('result', 'pending')
    .order('created_at', { ascending: false })

  if (start) betsQuery = betsQuery.gte('created_at', start)
  if (end) betsQuery = betsQuery.lte('created_at', end)

  const { data: bets } = await betsQuery

  const betsRows = bets ?? []
  const total_staked = betsRows.reduce((s, b) => s + Number(b.amount), 0)
  const total_won = betsRows.filter((b) => b.result === 'win').reduce((s, b) => s + Number(b.payout ?? 0), 0)
  const total_lost = betsRows.filter((b) => b.result === 'lose').reduce((s, b) => s + Number(b.amount), 0)
  const net_pnl = betsRows.reduce((s, b) => s + Number(b.payout ?? 0) - Number(b.amount), 0)

  // Enrich with game names
  const gameIds = [...new Set(betsRows.map((b) => b.game_id).filter(Boolean))]
  let games: Array<{ id: string; name: string }> = []
  if (gameIds.length > 0) {
    const { data } = await db.from('games').select('id, name').in('id', gameIds)
    games = data ?? []
  }

  const enrichedBets = betsRows.map((bet) => {
    const game = games.find((g) => g.id === bet.game_id)
    return {
      ...bet,
      game_name: game?.name ?? (bet.event_id ? 'Sports' : 'Casino'),
    }
  })

  return ok({
    total_deposited: Number(profile?.total_deposited ?? 0),
    total_withdrawn: Number(profile?.total_withdrawn ?? 0),
    total_staked,
    total_won,
    total_lost,
    net_pnl,
    bets: enrichedBets,
  })
}
