"use client"

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeading } from '@/components/ui/section-heading'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Profile, Transaction } from '@/types/database'

interface Bet {
  id: string
  amount: number
  result: string | null
  payout: number | null
  created_at: string | null
  outcome: string
  bet_type: string
}

interface UserDetailClientProps {
  user: Profile
  transactions: Transaction[]
  bets: Bet[]
}

export function UserDetailClient({ user, transactions, bets }: UserDetailClientProps) {
  const [tab, setTab] = useState<'transactions' | 'bets'>('transactions')
  const [delta, setDelta] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  async function adjustBalance() {
    const deltaNum = parseFloat(delta)
    if (!deltaNum) { toast.error('Enter a valid amount'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users/adjust-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, delta: deltaNum, note }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'negative_balance_result') toast.error('Adjustment would result in negative balance')
        else toast.error(data.error ?? 'Failed')
        return
      }
      toast.success(`Balance adjusted. New balance: ${formatCurrency(data.data?.balance)}`)
      setDelta('')
      setNote('')
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive() {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !user.is_active }),
    })
    if (res.ok) toast.success(user.is_active ? 'User suspended' : 'User activated')
    else toast.error('Failed')
  }

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="User Detail" title={user.full_name ?? 'User'} subtitle={user.email ?? user.phone ?? ''} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="font-semibold text-white">Account Info</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-500">Balance</p><p className="font-semibold text-emerald-400">{formatCurrency(Number(user.balance))}</p></div>
            <div><p className="text-gray-500">Deposited</p><p className="font-semibold text-white">{formatCurrency(Number(user.total_deposited ?? 0))}</p></div>
            <div><p className="text-gray-500">Withdrawn</p><p className="font-semibold text-white">{formatCurrency(Number(user.total_withdrawn ?? 0))}</p></div>
            <div><p className="text-gray-500">Status</p><Badge tone={user.is_active !== false ? 'success' : 'danger'}>{user.is_active !== false ? 'Active' : 'Suspended'}</Badge></div>
            <div><p className="text-gray-500">Joined</p><p className="text-white">{formatDate(user.created_at)}</p></div>
            <div><p className="text-gray-500">Phone</p><p className="text-white">{user.phone ?? '—'}</p></div>
          </div>
          <button onClick={toggleActive} className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${user.is_active !== false ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}>
            {user.is_active !== false ? 'Suspend User' : 'Activate User'}
          </button>
        </Card>

        <Card className="space-y-3">
          <h2 className="font-semibold text-white">Adjust Balance</h2>
          <input
            type="number"
            placeholder="Amount (+/-)"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            className="w-full rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.07)] px-3 py-2 text-sm text-white outline-none focus:border-[#0071e3]"
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.07)] px-3 py-2 text-sm text-white outline-none focus:border-[#0071e3]"
          />
          <button onClick={adjustBalance} disabled={loading} className="rounded-[980px] bg-[#0071e3] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-[#0077ed] transition-colors">
            {loading ? 'Adjusting...' : 'Apply Adjustment'}
          </button>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['transactions', 'bets'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-[980px] px-4 py-2 text-sm font-medium transition-colors ${tab === t ? 'bg-[#0071e3] text-white' : 'bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.56)] hover:text-white'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'transactions' && (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/8 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white capitalize">{tx.type}</p>
                <p className="text-xs text-gray-500">{formatDate(tx.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{formatCurrency(Number(tx.amount))}</p>
                <Badge tone={tx.status === 'approved' || tx.status === 'completed' ? 'success' : tx.status === 'rejected' ? 'danger' : 'neutral'}>{tx.status ?? 'pending'}</Badge>
              </div>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-center text-gray-500 py-8">No transactions</p>}
        </div>
      )}

      {tab === 'bets' && (
        <div className="space-y-2">
          {bets.map((bet) => (
            <div key={bet.id} className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/8 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">{bet.outcome}</p>
                <p className="text-xs text-gray-500">{bet.bet_type} · {formatDate(bet.created_at)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{formatCurrency(Number(bet.amount))}</p>
                <Badge tone={bet.result === 'win' ? 'success' : bet.result === 'lose' ? 'danger' : 'neutral'}>{bet.result ?? 'pending'}</Badge>
              </div>
            </div>
          ))}
          {bets.length === 0 && <p className="text-center text-gray-500 py-8">No bets</p>}
        </div>
      )}
    </div>
  )
}
