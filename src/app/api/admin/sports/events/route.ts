import { fail, ok, created } from '@/lib/api'
import { requireAdminSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    await requireAdminSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('sport_events')
    .select('*, odds_markets(*)')
    .order('created_at', { ascending: false })

  if (error) return fail(error.message, 500)
  return ok(data ?? [])
}

export async function POST(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  let body: {
    sport: string
    league?: string
    home_team: string
    away_team: string
    start_time: string
    back_odds?: number
    lay_odds?: number
  }
  try {
    body = await request.json()
  } catch {
    return fail('Invalid JSON')
  }

  const { sport, league, home_team, away_team, start_time, back_odds, lay_odds } = body

  if (!sport || !home_team || !away_team || !start_time) {
    return fail('sport, home_team, away_team, start_time are required')
  }

  if (back_odds !== undefined && back_odds < 1.01) return fail('Minimum odds value is 1.01')
  if (lay_odds !== undefined && lay_odds < 1.01) return fail('Minimum odds value is 1.01')

  const db = createAdminClient()

  // Get tenant_id from first tenant
  const { data: tenant } = await db.from('tenants').select('id').limit(1).maybeSingle()
  const tenant_id = tenant?.id ?? '00000000-0000-0000-0000-000000000000'

  const { data: event, error } = await db
    .from('sport_events')
    .insert({
      sport,
      league: league ?? null,
      home_team,
      away_team,
      start_time,
      status: 'upcoming',
      is_betting_locked: false,
      tenant_id,
    })
    .select('*')
    .single()

  if (error) return fail(error.message, 500)

  // Create initial odds market if odds provided
  if (back_odds && lay_odds) {
    await db.from('odds_markets').insert([
      {
        event_id: event.id,
        market_name: 'Match Winner',
        outcome: home_team,
        back_odds,
        lay_odds,
        is_active: true,
        is_stale: false,
      },
      {
        event_id: event.id,
        market_name: 'Match Winner',
        outcome: away_team,
        back_odds: lay_odds,
        lay_odds: back_odds,
        is_active: true,
        is_stale: false,
      },
    ])
  }

  return created(event)
}

export async function PATCH(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  let body: { event_id: string; status?: string; result?: string }
  try {
    body = await request.json()
  } catch {
    return fail('Invalid JSON')
  }

  const { event_id, status, result } = body
  if (!event_id) return fail('event_id is required')

  const validStatuses = ['upcoming', 'live', 'suspended', 'settled', 'cancelled']
  if (status && !validStatuses.includes(status)) {
    return fail(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
  }

  const db = createAdminClient()
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (status) patch.status = status
  if (result !== undefined) patch.result = result

  const { data, error } = await db
    .from('sport_events')
    .update(patch)
    .eq('id', event_id)
    .select('*')
    .maybeSingle()

  if (error) return fail(error.message, 500)
  if (!data) return fail('Event not found', 404)

  return ok(data)
}
