import { SportsPageClient } from './page-client'

export const dynamic = 'force-dynamic'

async function getSportsEvents(sport?: string) {
  try {
    // Server-side fetch using absolute URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/sports/events${sport ? `?sport=${encodeURIComponent(sport)}` : ''}`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function SportsPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>
}) {
  const { sport } = await searchParams
  const events = await getSportsEvents(sport)

  return <SportsPageClient initialEvents={events} initialSport={sport} />
}
