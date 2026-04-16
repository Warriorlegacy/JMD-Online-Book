"use client"

import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeading } from '@/components/ui/section-heading'
import { SettlementConfirmDialog } from '@/components/admin/SettlementConfirmDialog'
import { formatDate } from '@/lib/utils'

interface OddsMarket {
  id: string
  market_name: string
  outcome: string
  back_odds: number
  lay_odds: number
  override_back_odds: number | null
  override_lay_odds: number | null
  is_stale: boolean
}

interface SportEvent {
  id: string
  sport: string
  home_team: string
  away_team: string
  start_time: string
  status: string
  is_betting_locked: boolean
  result: string | null
  pending_bets: number
  odds_markets: OddsMarket[]
}

interface AdminSportsClientProps {
  events: SportEvent[]
  quotaAlert: boolean
}

export function AdminSportsClient({ events: initialEvents, quotaAlert }: AdminSportsClientProps) {
  const [events, setEvents] = useState(initialEvents)
  const [settlementTarget, setSettlementTarget] = useState<{ id: string; result: string } | null>(null)
  const [resultInputs, setResultInputs] = useState<Record<string, string>>({})
  const [overrideInputs, setOverrideInputs] = useState<Record<string, { back: string; lay: string }>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ sport: '', home_team: '', away_team: '', league: '', start_time: '', back_odds: '', lay_odds: '' })
  const [isPending, startTransition] = useTransition()

  async function refreshOdds() {
    const res = await fetch('/api/admin/odds/refresh', { method: 'POST' })
    const data = await res.json()
    if (res.ok) toast.success(`Updated ${data.data?.updated ?? 0} markets. Quota: ${data.data?.quota_remaining}`)
    else toast.error(data.error ?? 'Refresh failed')
  }

  async function toggleLock(eventId: string, locked: boolean) {
    startTransition(async () => {
      const res = await fetch('/api/admin/sports/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, locked }),
      })
      if (res.ok) {
        setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, is_betting_locked: locked } : e))
        toast.success(locked ? 'Betting locked' : 'Betting unlocked')
      } else toast.error('Failed')
    })
  }

  async function setStatus(eventId: string, status: string) {
    startTransition(async () => {
      const res = await fetch('/api/admin/sports/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, status }),
      })
      if (res.ok) {
        setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, status } : e))
        toast.success(`Status set to ${status}`)
      } else toast.error('Failed')
    })
  }

  async function saveOverride(marketId: string, back: string | null, lay: string | null) {
    const backNum = back ? parseFloat(back) : null
    const layNum = lay ? parseFloat(lay) : null
    const res = await fetch('/api/admin/odds/override', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ market_id: marketId, back_odds: backNum, lay_odds: layNum }),
    })
    const data = await res.json()
    if (res.ok) toast.success('Override saved')
    else toast.error(data.error ?? 'Failed')
  }

  async function addEvent() {
    const backNum = parseFloat(addForm.back_odds)
    const layNum = parseFloat(addForm.lay_odds)
    if (backNum < 1.01 || layNum < 1.01) { toast.error('Minimum odds value is 1.01'); return }

    const res = await fetch('/api/admin/sports/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addForm, back_odds: backNum, lay_odds: layNum }),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Event created')
      setShowAddForm(false)
      window.location.reload()
    } else toast.error(data.error ?? 'Failed')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeading eyebrow="Admin" title="Sports & Odds" subtitle="Manage events, odds, and settlements." />
        <div className="flex gap-2">
          <button onClick={refreshOdds} className="rounded-2xl bg-sky-500/20 border border-sky-500/30 px-4 py-2 text-sm font-semibold text-sky-400 hover:bg-sky-500/30 transition-colors">
            Refresh Odds
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="rounded-2xl bg-[rgba(0,113,227,0.15)] border border-[rgba(0,113,227,0.3)] px-4 py-2 text-sm font-semibold text-[#2997ff] hover:bg-[rgba(0,113,227,0.25)] transition-colors">
            + Add Event
          </button>
        </div>
      </div>

      {quotaAlert && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-400">
          ⚠ Odds API quota is low (&lt;100 requests remaining). Automatic fetching has been paused.
        </div>
      )}

      {showAddForm && (
        <Card className="space-y-4">
          <h2 className="font-semibold text-white">Add New Event</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['sport', 'league', 'home_team', 'away_team'] as const).map((field) => (
              <input
                key={field}
                type="text"
                placeholder={field.replace('_', ' ')}
                value={addForm[field]}
                onChange={(e) => setAddForm((prev) => ({ ...prev, [field]: e.target.value }))}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#0071e3]"
              />
            ))}
            <input
              type="datetime-local"
              value={addForm.start_time}
              onChange={(e) => setAddForm((prev) => ({ ...prev, start_time: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#0071e3]"
            />
            <input
              type="number"
              placeholder="Back odds"
              min={1.01}
              step={0.01}
              value={addForm.back_odds}
              onChange={(e) => setAddForm((prev) => ({ ...prev, back_odds: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#0071e3]"
            />
            <input
              type="number"
              placeholder="Lay odds"
              min={1.01}
              step={0.01}
              value={addForm.lay_odds}
              onChange={(e) => setAddForm((prev) => ({ ...prev, lay_odds: e.target.value }))}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#0071e3]"
            />
          </div>
          <button onClick={addEvent} className="rounded-2xl bg-gradient-to-r bg-[#0071e3] px-6 py-2 text-sm font-medium text-white">
            Create Event
          </button>
        </Card>
      )}

      <div className="space-y-4">
        {events.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No events found</p>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-white">{event.home_team} vs {event.away_team}</p>
                  <p className="text-xs text-gray-500">{event.sport} · {formatDate(event.start_time)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{event.pending_bets} pending bets</p>
                </div>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  <Badge tone={event.status === 'live' ? 'danger' : event.status === 'settled' ? 'success' : 'neutral'}>
                    {event.status.toUpperCase()}
                  </Badge>
                  {event.is_betting_locked && <Badge tone="warning">LOCKED</Badge>}
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setStatus(event.id, event.status === 'live' ? 'upcoming' : 'live')} disabled={isPending} className="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-colors">
                  {event.status === 'live' ? 'Set Upcoming' : 'Set Live'}
                </button>
                <button onClick={() => toggleLock(event.id, !event.is_betting_locked)} disabled={isPending} className="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition-colors">
                  {event.is_betting_locked ? 'Unlock Betting' : 'Lock Betting'}
                </button>
                {event.status !== 'settled' && (
                  <button
                    onClick={() => {
                      const result = resultInputs[event.id]
                      if (!result) { toast.error('Enter a result first'); return }
                      setSettlementTarget({ id: event.id, result })
                    }}
                    className="rounded-xl bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/30 transition-colors"
                  >
                    Settle
                  </button>
                )}
              </div>

              {/* Result input */}
              {event.status !== 'settled' && (
                <input
                  type="text"
                  placeholder="Result (e.g. home_win, away_win, draw)"
                  value={resultInputs[event.id] ?? ''}
                  onChange={(e) => setResultInputs((prev) => ({ ...prev, [event.id]: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#0071e3]"
                />
              )}

              {/* Odds markets */}
              {event.odds_markets?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Odds Markets</p>
                  {event.odds_markets.map((market) => {
                    const key = market.id
                    const ov = overrideInputs[key] ?? { back: '', lay: '' }
                    const hasOverride = market.override_back_odds !== null || market.override_lay_odds !== null
                    return (
                      <div key={market.id} className="rounded-2xl bg-white/5 border border-white/8 p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-medium">{market.outcome}</span>
                          <span className="text-xs text-gray-500">{market.market_name}</span>
                          {hasOverride && <Badge tone="warning">Override</Badge>}
                          {market.is_stale && <Badge tone="danger">Stale</Badge>}
                        </div>
                        <div className="grid grid-cols-4 gap-2 items-center">
                          <div className="text-xs text-gray-500">API: {market.back_odds} / {market.lay_odds}</div>
                          <input
                            type="number"
                            placeholder="Override Back"
                            min={1.01}
                            step={0.01}
                            value={ov.back}
                            onChange={(e) => setOverrideInputs((prev) => ({ ...prev, [key]: { ...ov, back: e.target.value } }))}
                            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-[#0071e3]"
                          />
                          <input
                            type="number"
                            placeholder="Override Lay"
                            min={1.01}
                            step={0.01}
                            value={ov.lay}
                            onChange={(e) => setOverrideInputs((prev) => ({ ...prev, [key]: { ...ov, lay: e.target.value } }))}
                            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-[#0071e3]"
                          />
                          <div className="flex gap-1">
                            <button onClick={() => saveOverride(market.id, ov.back || null, ov.lay || null)} className="rounded-lg bg-[rgba(0,113,227,0.15)] px-2 py-1 text-xs text-[#2997ff] hover:bg-[rgba(0,113,227,0.25)]">Save</button>
                            {hasOverride && (
                              <button onClick={() => saveOverride(market.id, null, null)} className="rounded-lg bg-white/5 px-2 py-1 text-xs text-gray-400 hover:bg-white/10">Clear</button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {settlementTarget && (
        <SettlementConfirmDialog
          type="sports"
          id={settlementTarget.id}
          result={settlementTarget.result}
          onClose={() => setSettlementTarget(null)}
          onSettled={() => window.location.reload()}
        />
      )}
    </div>
  )
}


