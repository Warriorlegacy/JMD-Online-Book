// lib/odds/upsertOdds.ts
import { createAdminClient } from '@/lib/supabase/admin'
import type { ParsedMarket } from './parser'

export async function upsertOddsMarkets(parsed: ParsedMarket[]): Promise<number> {
  const db = createAdminClient()
  let updated = 0

  for (const market of parsed) {
    // Find the sport_event by external_event_id
    const { data: event } = await db
      .from('sport_events')
      .select('id')
      .eq('external_event_id', market.external_event_id)
      .maybeSingle()

    if (!event) continue

    // Only update where no override is set
    const { data, error } = await db
      .from('odds_markets')
      .update({
        back_odds: market.back_odds,
        lay_odds: market.lay_odds,
        is_stale: false,
        updated_at: new Date().toISOString(),
      })
      .eq('event_id', event.id)
      .eq('outcome', market.outcome)
      .is('override_back_odds', null)
      .is('override_lay_odds', null)
      .select('id')

    if (!error && data) updated += data.length
  }

  return updated
}

export async function upsertOddsApiCache(
  sportKey: string,
  eventId: string,
  raw: unknown,
): Promise<void> {
  const db = createAdminClient()
  await db.from('odds_api_cache').upsert({
    sport_key: sportKey,
    event_id: eventId,
    raw_response: raw as Record<string, unknown>,
    fetched_at: new Date().toISOString(),
  }, { onConflict: 'sport_key,event_id' })
}
