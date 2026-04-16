"use client"

import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeading } from '@/components/ui/section-heading'
import { SettlementConfirmDialog } from '@/components/admin/SettlementConfirmDialog'
import { formatDate } from '@/lib/utils'

interface Round {
  id: string
  status: string
  result: string | null
  crash_point: number | null
  created_at: string
  bet_count: number
  games: { name: string; category: string } | null
}

interface Game {
  id: string
  name: string
  category: string
}

interface AdminGamesClientProps {
  rounds: Round[]
  games: Game[]
}

const STATUS_TONE: Record<string, 'neutral' | 'success' | 'warning' | 'danger'> = {
  waiting: 'neutral',
  betting_open: 'success',
  dealing: 'warning',
  result: 'danger',
}

export function AdminGamesClient({ rounds: initialRounds, games }: AdminGamesClientProps) {
  const [rounds, setRounds] = useState(initialRounds)
  const [settlementTarget, setSettlementTarget] = useState<{ id: string; result: string } | null>(null)
  const [resultInputs, setResultInputs] = useState<Record<string, string>>({})
  const [crashInputs, setCrashInputs] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  async function createRound(gameId: string, gameName: string) {
    const gameSlug = gameName.toLowerCase().replace(/\s+/g, '-').replace('gold', '').trim()
    const res = await fetch(`/api/casino/${gameSlug}/round`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    if (res.ok) {
      toast.success('New round created')
      window.location.reload()
    } else {
      toast.error('Failed to create round')
    }
  }

  async function transitionRound(roundId: string) {
    startTransition(async () => {
      const res = await fetch('/api/admin/games/round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ round_id: roundId, action: 'transition', crash_point: crashInputs[roundId] ? parseFloat(crashInputs[roundId]) : undefined }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Failed'); return }
      toast.success('Round status updated')
      setRounds((prev) => prev.map((r) => r.id === roundId ? { ...r, status: data.data?.status ?? r.status } : r))
    })
  }

  const TRANSITION_LABELS: Record<string, string> = {
    waiting: 'Open Betting',
    betting_open: 'Start Dealing',
    dealing: 'Set Result',
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Admin"
        title="Game Control"
        subtitle="Manage casino rounds and settle bets."
      />

      {/* Create new round */}
      <Card className="space-y-3">
        <h2 className="font-semibold text-white">New Round</h2>
        <div className="flex flex-wrap gap-2">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => createRound(game.id, game.name)}
              className="rounded-2xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
            >
              + {game.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Active rounds */}
      <div className="space-y-3">
        {rounds.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No active rounds</p>
        ) : (
          rounds.map((round) => (
            <Card key={round.id} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-white">{round.games?.name ?? 'Unknown Game'}</p>
                  <p className="text-xs text-gray-500">{formatDate(round.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={STATUS_TONE[round.status] ?? 'neutral'}>{round.status.replace('_', ' ').toUpperCase()}</Badge>
                  <span className="text-xs text-gray-500">{round.bet_count} bets</span>
                </div>
              </div>

              {/* Crash point input for Aviator */}
              {round.games?.name?.toLowerCase().includes('aviator') && round.status === 'waiting' && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1.01}
                    step={0.01}
                    placeholder="Crash point (e.g. 3.50)"
                    value={crashInputs[round.id] ?? ''}
                    onChange={(e) => setCrashInputs((prev) => ({ ...prev, [round.id]: e.target.value }))}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#0071e3]"
                  />
                </div>
              )}

              {/* Result input */}
              {round.status === 'dealing' && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Result (e.g. Player A, Dragon, Andar)"
                    value={resultInputs[round.id] ?? ''}
                    onChange={(e) => setResultInputs((prev) => ({ ...prev, [round.id]: e.target.value }))}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#0071e3]"
                  />
                </div>
              )}

              <div className="flex gap-2">
                {TRANSITION_LABELS[round.status] && round.status !== 'dealing' && (
                  <button
                    onClick={() => transitionRound(round.id)}
                    disabled={isPending}
                    className="rounded-[980px] bg-[rgba(0,113,227,0.15)] border border-[rgba(0,113,227,0.3)] px-4 py-2 text-sm font-semibold text-[#2997ff] hover:bg-[rgba(0,113,227,0.25)] disabled:opacity-50 transition-colors"
                  >
                    {TRANSITION_LABELS[round.status]}
                  </button>
                )}

                {round.status === 'dealing' && (
                  <button
                    onClick={() => {
                      const result = resultInputs[round.id]
                      if (!result) { toast.error('Enter a result first'); return }
                      setSettlementTarget({ id: round.id, result })
                    }}
                    className="rounded-xl bg-rose-500/20 border border-rose-500/30 px-4 py-2 text-sm font-semibold text-rose-400 hover:bg-rose-500/30 transition-colors"
                  >
                    Set Result & Settle
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {settlementTarget && (
        <SettlementConfirmDialog
          type="casino"
          id={settlementTarget.id}
          result={settlementTarget.result}
          onClose={() => setSettlementTarget(null)}
          onSettled={() => window.location.reload()}
        />
      )}
    </div>
  )
}
