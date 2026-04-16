import { fail, ok } from '@/lib/api'
import { requireSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

export async function POST(request: Request) {
  let session
  try {
    session = await requireSession()
  } catch {
    return fail('Unauthorized', 401)
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return fail('Invalid form data')
  }

  const file = formData.get('avatar') as File | null
  if (!file) return fail('No file provided')

  if (file.size > MAX_SIZE) return fail('file_too_large')
  if (!ALLOWED_TYPES.includes(file.type)) return fail('Invalid file type. Only JPEG and PNG are allowed.')

  const db = createAdminClient()
  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const path = `avatars/${session.id}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await db.storage
    .from('avatars')
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) return fail(uploadError.message, 500)

  const { data: urlData } = db.storage.from('avatars').getPublicUrl(path)
  const avatar_url = urlData.publicUrl

  await db.from('profiles').update({ avatar_url, updated_at: new Date().toISOString() }).eq('id', session.id)

  return ok({ avatar_url })
}
