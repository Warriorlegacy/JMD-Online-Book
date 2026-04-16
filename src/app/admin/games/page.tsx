import { AdminGamesClient } from './page-client'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function AdminGamesPage() {
  const db = createAdminClient()

  const { data: rounds } = await db
    .from('casino_rounds')
    .select('*, games(name, category)')
    .not('status', 'eq', 'settled')
    .order('created_at', { ascending: false })

  const { data: games } = await db
    .from('games')
    .select('id, name, category')
    .in('category', ['casino', 'cards'])
    .order('sort_order', { ascending: true })

  // Get bet counts per round
  const roundsWithCounts = await Promise.all(
    (rounds ?? []).map(async (round) => {
      const { count } = await db
        .from('bets')
        .select('*', { count: 'exact', head: true })
        .eq('round_id', round.id)
      return { ...round, bet_count: count ?? 0 }
    })
  )

  return <AdminGamesClient rounds={roundsWithCounts} games={games ?? []} />
}
