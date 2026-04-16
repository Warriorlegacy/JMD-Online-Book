import { AdminSportsClient } from './page-client'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function AdminSportsPage() {
  const db = createAdminClient()

  const { data: events } = await db
    .from('sport_events')
    .select('*, odds_markets(*)')
    .order('created_at', { ascending: false })
    .limit(50)

  // Get pending bet counts per event
  const eventsWithCounts = await Promise.all(
    (events ?? []).map(async (event) => {
      const { count } = await db
        .from('bets')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id)
        .eq('result', 'pending')
      return { ...event, pending_bets: count ?? 0 }
    })
  )

  // Check quota alert
  const { data: quotaAlert } = await db
    .from('site_settings')
    .select('value')
    .eq('key', 'odds_api_quota_alert')
    .maybeSingle()

  return (
    <AdminSportsClient
      events={eventsWithCounts}
      quotaAlert={quotaAlert?.value === 'true'}
    />
  )
}
