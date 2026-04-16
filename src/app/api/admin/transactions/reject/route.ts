import { fail, ok } from '@/lib/api'
import { requireAdminSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { addNotification } from '@/lib/repo'

export async function POST(request: Request) {
  let session
  try {
    session = await requireAdminSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  let body: { transaction_id: string; reason?: string }
  try {
    body = await request.json()
  } catch {
    return fail('Invalid JSON')
  }

  const { transaction_id, reason } = body
  if (!transaction_id) return fail('transaction_id is required')

  const db = createAdminClient()
  const { data: tx } = await db
    .from('transactions')
    .select('*')
    .eq('id', transaction_id)
    .maybeSingle()

  if (!tx) return fail('Transaction not found', 404)

  await db.from('transactions').update({
    status: 'rejected',
    admin_note: reason ?? 'Rejected by admin',
    approved_by: session.id,
    approved_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', transaction_id)

  await addNotification({
    user_id: tx.user_id,
    title: `${tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Rejected`,
    body: reason ?? `Your ${tx.type} request was rejected.`,
    type: 'warning',
  })

  return ok({ success: true })
}
