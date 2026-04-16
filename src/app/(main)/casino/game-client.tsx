"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { CasinoRoundStatus } from '@/components/casino/CasinoRoundStatus'
import { CasinoBetPanel } from '@/components/casino/CasinoBetPanel'
import type { CasinoRound } from '@/lib/types/betting'

interface CasinoGameClientProps {
  game: string
  title: string
  initialData: {
    round: CasinoRound | null
    bet_count: number
    history: Array<{ id: string; result: string | null; created_at: string }>
  }
}

export function CasinoGameClient({ game, title, initialData }: CasinoGameClientProps) {
  const [data, setData] = useState(initialData)

  async function refresh() {
    try {
      const res = await fetch(`/api/casino/${game}/round`)
      if (res.ok) {
        const json = await res.json()
        setData(json.data ?? initialData)
      }
    } catch { /* silent */ }
  }

  // Poll every 5 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">{title}</h1>
        <p className="text-sm text-gray-400 mt-1">
          {data.bet_count} bet{data.bet_count !== 1 ? 's' : ''} placed this round
        </p>
      </div>

      <Card className="space-y-4">
        <CasinoRoundStatus round={data.round} history={data.history} />
      </Card>

      <Card className="space-y-4">
        <h2 className="font-semibold text-white">Place Your Bet</h2>
        <CasinoBetPanel
          game={game}
          round={data.round}
          onBetPlaced={refresh}
        />
      </Card>
    </div>
  )
}
