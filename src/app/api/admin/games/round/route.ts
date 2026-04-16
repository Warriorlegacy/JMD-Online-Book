import { fail, ok } from '@/lib/api'
import { requireAdminSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const STATUS_TRANSITIONS: Record<string, string> = {
  waiting: 'betting_open',
  betting_open: 'dealing',
  dealing: 'result',
}

export async function POST(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  let body: { round_id: string; action: string; crash_point?: number }
  try {
    body = await request.json()
  } catch {
    return fail('Invalid JSON')
  }

  const { round_id, action, crash_point } = body
  if (!round_id || !action) return fail('round_id and action are required')

  const db = createAdminClient()
  const { data: round, error: fetchError } = await db
    .from('casino_rounds')
    .select('*')
    .eq('id', round_id)
    .maybeSingle()

  if (fetchError) return fail(fetchError.message, 500)
  if (!round) return fail('Round not found', 404)

  let newStatus: string
  if (action === 'transition') {
    newStatus = STATUS_TRANSITIONS[round.status]
    if (!newStatus) return fail(`Cannot transition from status: ${round.status}`)
  } else {
    return fail(`Unknown action: ${action}`)
  }

  const patch: Record<string, unknown> = { status: newStatus }
  if (crash_point !== undefined) patch.crash_point = crash_point

  const { data: updated, error } = await db
    .from('casino_rounds')
    .update(patch)
    .eq('id', round_id)
    .select('*')
    .single()

  if (error) return fail(error.message, 500)
  return ok(updated)
}
