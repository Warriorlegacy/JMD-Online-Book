import { fail, ok } from '@/lib/api'
import { requireAdminSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  let body: { market_id: string; back_odds: number | null; lay_odds: number | null }
  try {
    body = await request.json()
  } catch {
    return fail('Invalid JSON')
  }

  const { market_id, back_odds, lay_odds } = body

  if (!market_id) return fail('market_id is required')

  // Validate odds >= 1.01 if not null
  if (back_odds !== null && back_odds !== undefined && back_odds < 1.01) {
    return fail('Minimum odds value is 1.01')
  }
  if (lay_odds !== null && lay_odds !== undefined && lay_odds < 1.01) {
    return fail('Minimum odds value is 1.01')
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('odds_markets')
    .update({
      override_back_odds: back_odds ?? null,
      override_lay_odds: lay_odds ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', market_id)
    .select('id')
    .maybeSingle()

  if (error) return fail(error.message, 500)
  if (!data) return fail('Market not found', 404)

  return ok({ success: true })
}
