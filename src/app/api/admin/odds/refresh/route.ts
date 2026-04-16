import { fail, ok } from '@/lib/api'
import { requireAdminSession } from '@/lib/auth'
import { fetchOddsForSports } from '@/lib/odds/fetchOdds'
import { upsertOddsMarkets } from '@/lib/odds/upsertOdds'

const SPORT_KEYS = ['cricket_ipl', 'soccer', 'tennis']

export async function POST() {
  try {
    await requireAdminSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  try {
    const { parsed, quota_remaining } = await fetchOddsForSports(SPORT_KEYS)
    const updated = await upsertOddsMarkets(parsed)
    return ok({ updated, quota_remaining })
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Odds refresh failed', 500)
  }
}
