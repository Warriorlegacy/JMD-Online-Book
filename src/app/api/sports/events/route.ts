import { fail, ok } from '@/lib/api'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveOdds } from '@/lib/odds/override'
import type { OddsMarket } from '@/lib/types/betting'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get('sport')

  const db = createAdminClient()

  try {
    let query = db
      .from('sport_events')
      .select('*, odds_markets(*)')
      .in('status', ['upcoming', 'live', 'suspended'])
      .order('status', { ascending: false })
      .order('start_time', { ascending: true })
      .limit(50)

    if (sport) {
      query = query.eq('sport', sport)
    }

    const { data, error } = await query
    if (error) return fail(error.message, 500)

    // Apply effective odds
    const events = (data ?? []).map((event) => ({
      ...event,
      odds_markets: (event.odds_markets as OddsMarket[] ?? []).map((m) => {
        const eff = getEffectiveOdds(m)
        return { ...m, effective_back_odds: eff.back, effective_lay_odds: eff.lay }
      }),
    }))

    return ok(events)
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Failed to fetch events', 500)
  }
}
