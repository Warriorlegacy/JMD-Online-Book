"use client"

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

interface SettlementConfirmDialogProps {
  type: 'casino' | 'sports'
  id: string
  result: string
  onClose: () => void
  onSettled?: () => void
}

export function SettlementConfirmDialog({
  type,
  id,
  result,
  onClose,
  onSettled,
}: SettlementConfirmDialogProps) {
  const [preview, setPreview] = useState<{ pending_bets: number; estimated_payout: number } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchPreview() {
      try {
        const param = type === 'casino' ? `round_id=${id}` : `event_id=${id}`
        const endpoint = type === 'casino' ? '/api/admin/games/settle' : '/api/admin/sports/settle'
        const res = await fetch(`${endpoint}?${param}`)
        if (res.ok) {
          const json = await res.json()
          setPreview(json.data)
        }
      } catch { /* silent */ }
    }
    fetchPreview()
  }, [type, id])

  async function handleConfirm() {
    setLoading(true)
    try {
      const endpoint = type === 'casino' ? '/api/admin/games/settle' : '/api/admin/sports/settle'
      const body = type === 'casino'
        ? { round_id: id, result }
        : { event_id: id, result }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Settlement failed')
        return
      }
      if (data.data?.already_settled) {
        toast('Already settled', { icon: 'ℹ️' })
      } else {
        toast.success(`Settled ${data.data?.total_bets ?? 0} bets — ${formatCurrency(data.data?.total_payout ?? 0)} paid out`)
      }
      onSettled?.()
      onClose()
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#0f1520] border border-white/10 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white">Confirm Settlement</h3>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Result</span>
            <span className="font-semibold text-white">{result}</span>
          </div>
          {preview ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pending bets</span>
                <span className="font-semibold text-white">{preview.pending_bets}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Est. payout</span>
                <span className="font-semibold text-[#2997ff]">{formatCurrency(preview.estimated_payout)}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Loading preview...</p>
          )}
        </div>

        <p className="text-sm text-[#2997ff]/80">
          This action is irreversible. Settlement is idempotent — running it twice is safe.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 rounded-2xl bg-gradient-to-r bg-[#0071e3] py-3 text-sm font-medium text-white disabled:opacity-50 transition-colors hover:bg-[#0077ed]"
          >
            {loading ? 'Settling...' : 'Confirm Settlement'}
          </button>
        </div>
      </div>
    </div>
  )
}

