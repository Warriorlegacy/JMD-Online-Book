import { UserDetailClient } from './page-client'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = createAdminClient()

  const { data: user } = await db.from('profiles').select('*').eq('id', id).maybeSingle()
  if (!user) notFound()

  const [{ data: transactions }, { data: bets }] = await Promise.all([
    db.from('transactions').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(50),
    db.from('bets').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(50),
  ])

  return <UserDetailClient user={user} transactions={transactions ?? []} bets={bets ?? []} />
}
