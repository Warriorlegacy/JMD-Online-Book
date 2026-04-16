"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PnLData {
  total_deposited: number;
  total_withdrawn: number;
  total_staked: number;
  total_won: number;
  total_lost: number;
  net_pnl: number;
  bets: Array<{
    id: string;
    game_name: string;
    amount: number;
    odds: number | null;
    result: string | null;
    payout: number | null;
    created_at: string | null;
    outcome: string;
  }>;
}

export function PnLPageClient() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  const [start, setStart] = useState(thirtyDaysAgo);
  const [end, setEnd] = useState(today);
  const [data, setData] = useState<PnLData | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchPnL() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pnl?start=${start}T00:00:00Z&end=${end}T23:59:59Z`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPnL(); }, []);

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="P&L" title="Profit & Loss" subtitle="Your betting performance over time." />

      {/* Date range */}
      <Card className="p-4 flex flex-wrap gap-3 items-end">
        <div className="space-y-1.5">
          <label className="text-[12px] text-[rgba(255,255,255,0.48)]">From</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.07)] px-3 py-2 text-[14px] text-white outline-none focus:border-[#0071e3]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[12px] text-[rgba(255,255,255,0.48)]">To</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.07)] px-3 py-2 text-[14px] text-white outline-none focus:border-[#0071e3]"
          />
        </div>
        <button
          onClick={fetchPnL}
          disabled={loading}
          className="rounded-[980px] bg-[#0071e3] px-5 py-2 text-[14px] font-medium text-white disabled:opacity-50 hover:bg-[#0077ed] transition-colors"
        >
          {loading ? "..." : "Apply"}
        </button>
      </Card>

      {data && (
        <>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            <Card className="p-4">
              <p className="text-[12px] text-[rgba(255,255,255,0.48)] mb-1">Deposited</p>
              <p className="text-[21px] font-bold text-[#30d158]">{formatCurrency(data.total_deposited)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-[12px] text-[rgba(255,255,255,0.48)] mb-1">Withdrawn</p>
              <p className="text-[21px] font-bold text-[#ff453a]">{formatCurrency(data.total_withdrawn)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-[12px] text-[rgba(255,255,255,0.48)] mb-1">Total Staked</p>
              <p className="text-[21px] font-bold text-white">{formatCurrency(data.total_staked)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-[12px] text-[rgba(255,255,255,0.48)] mb-1">Total Won</p>
              <p className="text-[21px] font-bold text-[#30d158]">{formatCurrency(data.total_won)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-[12px] text-[rgba(255,255,255,0.48)] mb-1">Total Lost</p>
              <p className="text-[21px] font-bold text-[#ff453a]">{formatCurrency(data.total_lost)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-[12px] text-[rgba(255,255,255,0.48)] mb-1">Net P&L</p>
              <p className={`text-[21px] font-bold ${data.net_pnl >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                {data.net_pnl >= 0 ? "+" : ""}{formatCurrency(data.net_pnl)}
              </p>
            </Card>
          </div>

          {/* Bet history */}
          <Card className="p-4 space-y-3">
            <p className="text-[14px] font-semibold text-white">Bet History ({data.bets.length})</p>
            {data.bets.length === 0 ? (
              <p className="text-[14px] text-[rgba(255,255,255,0.3)] text-center py-4">No bets in this period</p>
            ) : (
              <div className="space-y-2">
                {data.bets.map((bet) => (
                  <div
                    key={bet.id}
                    className="flex items-center justify-between rounded-[18px] bg-[rgba(255,255,255,0.04)] px-4 py-3"
                  >
                    <div>
                      <p className="text-[14px] font-semibold text-white">{bet.game_name}</p>
                      <p className="text-[12px] text-[rgba(255,255,255,0.48)]">
                        {bet.outcome} · {bet.odds ? `@ ${Number(bet.odds).toFixed(2)}` : ""} · {formatDate(bet.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-semibold text-white">{formatCurrency(bet.amount)}</p>
                      <div className="flex items-center gap-1 justify-end">
                        <Badge tone={bet.result === "win" ? "success" : bet.result === "lose" ? "danger" : "neutral"}>
                          {bet.result ?? "pending"}
                        </Badge>
                        {bet.payout !== null && bet.payout > 0 && (
                          <span className="text-[12px] text-[#30d158]">+{formatCurrency(Number(bet.payout))}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
