"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/card'
import { SectionHeading } from '@/components/ui/section-heading'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Summary {
  total_deposits: number
  total_withdrawals: number
  total_bets: number
  total_payouts: number
  house_pnl: number
  breakdown: { sports: { bets: number; pnl: number }; casino: { bets: number; pnl: number } }
  top10_users: Array<{ user_id: string; name: string; net_loss: number }>
}

interface PendingTx {
  id: string
  type: string
  amount: number
  status: string
  created_at: string | null
  profiles: { full_name: string | null; phone: string | null } | null
}

export function AdminReportsClient() {
  const today = new Date().toISOString().split('T')[0]
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(today)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [pending, setPending] = useState<PendingTx[]>([])
  const [loading, setLoading] = useState(false)
  const mounted = useRef(false)

  const fetchSummary = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reports/summary?start=${start}T00:00:00Z&end=${end}T23:59:59Z`)
      if (res.ok) {
        const json = await res.json()
        setSummary(json.data)
      }
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }, [start, end])

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/transactions')
      if (res.ok) {
        const json = await res.json()
        setPending(json.data ?? [])
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      fetchSummary()
      fetchPending()
    }
  }, [fetchSummary, fetchPending])

  async function approve(txId: string) {
    const res = await fetch('/api/admin/transactions/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: txId }),
    })
    const data = await res.json()
    if (res.ok) { toast.success('Approved'); fetchPending() }
    else toast.error(data.error ?? 'Failed')
  }

  async function reject(txId: string) {
    const res = await fetch('/api/admin/transactions/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: txId }),
    })
    if (res.ok) { toast.success('Rejected'); fetchPending() }
    else toast.error('Failed')
  }

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Admin" title="Financial Reports" subtitle="P&L summary and transaction approvals." />

      {/* Date range */}
      <Card className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Start Date</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#0071e3]" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">End Date</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#0071e3]" />
        </div>
        <button onClick={fetchSummary} disabled={loading} className="rounded-[980px] bg-[#0071e3] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
          {loading ? 'Loading...' : 'Apply'}
        </button>
      </Card>

      {summary && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card><p className="text-xs text-gray-500 mb-1">Total Deposits</p><p className="text-2xl font-bold text-emerald-400">{formatCurrency(summary.total_deposits)}</p></Card>
            <Card><p className="text-xs text-gray-500 mb-1">Total Withdrawals</p><p className="text-2xl font-bold text-rose-400">{formatCurrency(summary.total_withdrawals)}</p></Card>
            <Card><p className="text-xs text-gray-500 mb-1">House P&L</p><p className={`text-2xl font-bold ${summary.house_pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{formatCurrency(summary.house_pnl)}</p></Card>
            <Card><p className="text-xs text-gray-500 mb-1">Total Bets</p><p className="text-2xl font-bold text-white">{summary.total_bets}</p></Card>
            <Card><p className="text-xs text-gray-500 mb-1">Total Payouts</p><p className="text-2xl font-bold text-[#2997ff]">{formatCurrency(summary.total_payouts)}</p></Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="space-y-2">
              <h2 className="font-semibold text-white">P&L by Category</h2>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Sports</span><span className="font-semibold text-white">{formatCurrency(summary.breakdown.sports.pnl)} ({summary.breakdown.sports.bets} bets)</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Casino</span><span className="font-semibold text-white">{formatCurrency(summary.breakdown.casino.pnl)} ({summary.breakdown.casino.bets} bets)</span></div>
            </Card>

            <Card className="space-y-2">
              <h2 className="font-semibold text-white">Top 10 by Net Loss</h2>
              {summary.top10_users.map((u, i) => (
                <div key={u.user_id} className="flex justify-between text-sm">
                  <span className="text-gray-400">{i + 1}. {u.name}</span>
                  <span className="font-semibold text-rose-400">{formatCurrency(u.net_loss)}</span>
                </div>
              ))}
            </Card>
          </div>
        </>
      )}

      {/* Pending transactions */}
      <Card className="space-y-4">
        <h2 className="font-semibold text-white">Pending Approvals ({pending.length})</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-500">No pending transactions</p>
        ) : (
          <div className="space-y-2">
            {pending.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/8 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white capitalize">{tx.type} — {tx.profiles?.full_name ?? tx.profiles?.phone ?? 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{formatDate(tx.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{formatCurrency(Number(tx.amount))}</span>
                  <button onClick={() => approve(tx.id)} className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs text-emerald-400 hover:bg-emerald-500/30">Approve</button>
                  <button onClick={() => reject(tx.id)} className="rounded-lg bg-rose-500/20 border border-rose-500/30 px-3 py-1 text-xs text-rose-400 hover:bg-rose-500/30">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

