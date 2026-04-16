import { EventDetailClient } from './page-client'

export const dynamic = 'force-dynamic'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  let event = null
  try {
    const res = await fetch(`${baseUrl}/api/sports/events/${eventId}`, { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      event = json.data
    }
  } catch { /* silent */ }

  if (!event) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p>Event not found</p>
      </div>
    )
  }

  return <EventDetailClient event={event} />
}
