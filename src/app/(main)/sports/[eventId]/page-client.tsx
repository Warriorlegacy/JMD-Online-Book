"use client"

import { useState } from 'react'
import { OddsTable } from '@/components/OddsTable'
import { BetSlip } from '@/components/BetSlip'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { SportEvent, OddsMarket, BetType } from '@/lib/types/betting'

interface EventDetailClientProps {
  event: SportEvent & { user_bets?: Array<{ id: string; amount: number; outcome: string; result: string; odds: number }> }
}

export function EventDetailClient({ event }: EventDetailClientProps) {
  const [selectedMarket, setSelectedMarket] = useState<OddsMarket | null>(null)
  const [selectedBetType, setSelectedBetType] = useState<BetType | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          {event.status === 'live' && <Badge tone="danger">LIVE</Badge>}
          <span className="text-xs text-gray-500 capitalize">{event.sport}</span>
          {event.league && <span className="text-xs text-gray-600">· {event.league}</span>}
        </div>
        <h1 className="text-2xl font-black text-white">{event.home_team} vs {event.away_team}</h1>
        <p className="text-sm text-gray-400 mt-1">
          {new Date(event.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      </div>

      <Card className="space-y-3">
        <h2 className="font-semibold text-white">Odds</h2>
        {event.odds_markets && event.odds_markets.length > 0 ? (
          <OddsTable
            markets={event.odds_markets}
            isBettingLocked={event.is_betting_locked}
            onSelectOdds={(market, betType) => {
              setSelectedMarket(market)
              setSelectedBetType(betType)
            }}
          />
        ) : (
          <p className="text-sm text-gray-500">No odds available</p>
        )}
      </Card>

      {/* User's open bets */}
      {event.user_bets && event.user_bets.length > 0 && (
        <Card className="space-y-3">
          <h2 className="font-semibold text-white">Your Open Bets</h2>
          <div className="space-y-2">
            {event.user_bets.map((bet) => (
              <div key={bet.id} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/8 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{bet.outcome}</p>
                  <p className="text-xs text-gray-500">@ {bet.odds?.toFixed(2) ?? '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#2997ff]">{formatCurrency(bet.amount)}</p>
                  <p className="text-xs text-gray-500 capitalize">{bet.result}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedMarket && selectedBetType && (
        <BetSlip
          market={selectedMarket}
          betType={selectedBetType}
          onClose={() => { setSelectedMarket(null); setSelectedBetType(null) }}
        />
      )}
    </div>
  )
}
