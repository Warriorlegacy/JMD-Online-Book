import { fail, ok } from '@/lib/api'
import { getSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveOdds } from '@/lib/odds/override'
import type { OddsMarket } from '@/lib/types/betting'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = createAdminClient()

  try {
    const { data: event, error } = await db
      .from('sport_events')
      .select('*, odds_markets(*)')
      .eq('id', id)
      .maybeSingle()

    if (error) return fail(error.message, 500)
    if (!event) return fail('Event not found', 404)

    const markets = (event.odds_markets as OddsMarket[] ?? []).map((m) => {
      const eff = getEffectiveOdds(m)
      return { ...m, effective_back_odds: eff.back, effective_lay_odds: eff.lay }
    })

    // Get user's open bets for this event
    const session = await getSession()
    let userBets: unknown[] = []
    if (session) {
      const { data: bets } = await db
        .from('bets')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', session.id)
        .eq('result', 'pending')
      userBets = bets ?? []
    }

    return ok({ ...event, odds_markets: markets, user_bets: userBets })
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Failed to fetch event', 500)
  }
}
