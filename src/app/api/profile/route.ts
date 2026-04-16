import { fail, ok } from '@/lib/api'
import { requireSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { isValidUpiId, isValidIfsc } from '@/lib/validators/profile'

export async function GET() {
  let session
  try {
    session = await requireSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  const db = createAdminClient()
  const { data, error } = await db
    .from('profiles')
    .select('id, full_name, phone, email, upi_id, bank_account, ifsc_code, account_holder, referral_code, avatar_url, created_at')
    .eq('id', session.id)
    .maybeSingle()

  if (error) return fail(error.message, 500)
  if (!data) return fail('Profile not found', 404)

  return ok(data)
}

export async function PATCH(request: Request) {
  let session
  try {
    session = await requireSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  let body: {
    full_name?: string
    upi_id?: string
    bank_account?: string
    ifsc_code?: string
    account_holder?: string
  }
  try {
    body = await request.json()
  } catch {
    return fail('Invalid JSON')
  }

  // Validate UPI ID
  if (body.upi_id && !isValidUpiId(body.upi_id)) {
    return fail('invalid_upi_id', 422)
  }

  // Validate IFSC
  if (body.ifsc_code && !isValidIfsc(body.ifsc_code)) {
    return fail('invalid_ifsc', 422)
  }

  const db = createAdminClient()
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.full_name !== undefined) patch.full_name = body.full_name
  if (body.upi_id !== undefined) patch.upi_id = body.upi_id
  if (body.bank_account !== undefined) patch.bank_account = body.bank_account
  if (body.ifsc_code !== undefined) patch.ifsc_code = body.ifsc_code
  if (body.account_holder !== undefined) patch.account_holder = body.account_holder

  const { data, error } = await db
    .from('profiles')
    .update(patch)
    .eq('id', session.id)
    .select('id, full_name, phone, email, upi_id, bank_account, ifsc_code, account_holder, referral_code, avatar_url, created_at')
    .maybeSingle()

  if (error) return fail(error.message, 500)
  if (!data) return fail('Profile not found', 404)

  return ok(data)
}
