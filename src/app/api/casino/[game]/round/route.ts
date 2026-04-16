import { fail, ok, created } from '@/lib/api'
import { getSession, requireAdminSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const GAME_SLUGS: Record<string, string> = {
  'teen-patti': 'Teen Patti Gold',
  'dragon-tiger': 'Dragon Tiger',
  'andar-bahar': 'Andar Bahar',
  'aviator': 'Aviator',
}

async function getGameId(db: ReturnType<typeof createAdminClient>, gameSlug: string) {
  const gameName = GAME_SLUGS[gameSlug]
  if (!gameName) return null
  const { data } = await db.from('games').select('id').ilike('name', `%${gameName.split(' ')[0]}%`).maybeSingle()
  return data?.id ?? null
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ game: string }> }
) {
  const { game } = await params
  const session = await getSession()
  if (!session) return fail('Unauthorized', 401)

  const db = createAdminClient()
  const gameId = await getGameId(db, game)
  if (!gameId) return fail('Game not found', 404)

  const { data: round, error } = await db
    .from('casino_rounds')
    .select('*')
    .eq('game_id', gameId)
    .not('status', 'eq', 'settled')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return fail(error.message, 500)

  // Get bet count
  let betCount = 0
  if (round) {
    const { count } = await db
      .from('bets')
      .select('*', { count: 'exact', head: true })
      .eq('round_id', round.id)
    betCount = count ?? 0
  }

  // Get last 20 settled rounds for history
  const { data: history } = await db
    .from('casino_rounds')
    .select('id, result, created_at, settled_at')
    .eq('game_id', gameId)
    .eq('status', 'settled')
    .order('settled_at', { ascending: false })
    .limit(20)

  return ok({ round, bet_count: betCount, history: history ?? [] })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ game: string }> }
) {
  const { game } = await params

  try {
    await requireAdminSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  const db = createAdminClient()
  const gameId = await getGameId(db, game)
  if (!gameId) return fail('Game not found', 404)

  const { data: tenant } = await db.from('tenants').select('id').limit(1).maybeSingle()
  const tenant_id = tenant?.id ?? '00000000-0000-0000-0000-000000000000'

  let body: { crash_point?: number } = {}
  try {
    body = await request.json()
  } catch { /* no body */ }

  const { data: round, error } = await db
    .from('casino_rounds')
    .insert({
      game_id: gameId,
      tenant_id,
      status: 'waiting',
      crash_point: body.crash_point ?? null,
    })
    .select('*')
    .single()

  if (error) return fail(error.message, 500)
  return created(round)
}
