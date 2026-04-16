import { fail, ok } from '@/lib/api'
import { requireAdminSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    await requireAdminSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  let body: { event_id: string; locked: boolean }
  try {
    body = await request.json()
  } catch {
    return fail('Invalid JSON')
  }

  const { event_id, locked } = body
  if (!event_id) return fail('event_id is required')

  const db = createAdminClient()
  const { error } = await db
    .from('sport_events')
    .update({ is_betting_locked: locked, updated_at: new Date().toISOString() })
    .eq('id', event_id)

  if (error) return fail(error.message, 500)
  return ok({ success: true, locked })
}
