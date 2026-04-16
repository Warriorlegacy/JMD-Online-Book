import { CasinoGameClient } from './game-client'

interface CasinoGamePageProps {
  game: string
  title: string
}

export async function CasinoGamePage({ game, title }: CasinoGamePageProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  let roundData = { round: null, bet_count: 0, history: [] }
  try {
    const res = await fetch(`${baseUrl}/api/casino/${game}/round`, { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      roundData = json.data ?? roundData
    }
  } catch { /* silent */ }

  return <CasinoGameClient game={game} title={title} initialData={roundData} />
}
