// lib/odds/fetchOdds.ts
import { createAdminClient } from '@/lib/supabase/admin'
import { parseOddsResponse, type OddsApiEvent } from './parser'

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4/sports'

export async function fetchOddsForSports(sportKeys: string[]) {
  const apiKey = process.env.ODDS_API_KEY
  if (!apiKey) {
    console.warn('ODDS_API_KEY not set — skipping odds fetch')
    return { parsed: [], quota_remaining: 0 }
  }

  const db = createAdminClient()
  let quotaRemaining = 9999
  const allParsed: ReturnType<typeof parseOddsResponse> = []

  for (const sport of sportKeys) {
    try {
      const url = `${ODDS_API_BASE}/${sport}/odds?apiKey=${apiKey}&regions=uk&markets=h2h&oddsFormat=decimal`
      const res = await fetch(url, { cache: 'no-store' })

      const remaining = parseInt(res.headers.get('x-requests-remaining') ?? '9999', 10)
      if (!isNaN(remaining)) quotaRemaining = Math.min(quotaRemaining, remaining)

      if (!res.ok) {
        console.error(`Odds API error for ${sport}: ${res.status}`)
        // Mark affected markets as stale
        await db.from('odds_markets')
          .update({ is_stale: true, updated_at: new Date().toISOString() })
          .eq('is_stale', false)
        continue
      }

      const raw: OddsApiEvent[] = await res.json()
      const parsed = parseOddsResponse(raw)
      allParsed.push(...parsed)

      // Cache raw response per event
      for (const event of raw) {
        await db.from('odds_api_cache').upsert({
          sport_key: sport,
          event_id: event.id,
          raw_response: event as unknown as Record<string, unknown>,
          fetched_at: new Date().toISOString(),
        }, { onConflict: 'sport_key,event_id' })
      }
    } catch (err) {
      console.error(`fetchOddsForSports error for ${sport}:`, err)
    }
  }

  // Check quota threshold
  if (quotaRemaining < 100) {
    await db.from('site_settings').upsert([
      { key: 'odds_api_paused', value: 'true', type: 'boolean', description: 'Odds API paused due to low quota', updated_at: new Date().toISOString() },
      { key: 'odds_api_quota_alert', value: 'true', type: 'boolean', description: 'Odds API quota alert', updated_at: new Date().toISOString() },
    ], { onConflict: 'key' })
  }

  return { parsed: allParsed, quota_remaining: quotaRemaining }
}
