"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { OddsMarket, BetType } from "@/lib/types/betting";

interface BetSlipProps {
  market: OddsMarket | null;
  betType: BetType | null;
  minStake?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BetSlip({ market, betType, minStake = 10, onClose, onSuccess }: BetSlipProps) {
  const [stake, setStake] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!market || !betType) return null;

  const odds = betType === "back" ? market.effective_back_odds : market.effective_lay_odds;
  const potentialWin = stake ? (parseFloat(stake) * odds).toFixed(2) : "0.00";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!market || !betType) return;
    const stakeNum = parseFloat(stake);
    if (!stakeNum || stakeNum <= 0) { setError("Enter a valid stake"); return; }
    if (stakeNum < minStake) { setError(`Minimum stake is ₹${minStake}`); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: market.event_id,
          market_id: market.id,
          bet_type: betType,
          outcome: market.outcome,
          stake: stakeNum,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Failed to place bet";
        if (msg.includes("insufficient_balance")) setError("Insufficient balance");
        else if (msg.includes("betting_suspended")) setError("Betting suspended for this event");
        else if (msg.includes("below_minimum_stake")) setError(`Minimum stake is ₹${minStake}`);
        else setError(msg);
        return;
      }
      toast.success("Bet placed successfully!");
      onSuccess?.();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" style={{ backdropFilter: "blur(8px)" }} />
      <div
        className="relative w-full max-w-lg rounded-t-[18px] bg-[#1c1c1e] p-6 space-y-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-semibold text-white">Place Bet</h3>
          <button onClick={onClose} className="text-[rgba(255,255,255,0.48)] hover:text-white text-xl">✕</button>
        </div>

        <div className="rounded-[18px] bg-[#272729] p-4 space-y-1">
          <p className="text-[12px] text-[rgba(255,255,255,0.48)]">{market.market_name} — {market.outcome}</p>
          <div className="flex items-center gap-2">
            <span className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${betType === "back" ? "bg-[rgba(0,113,227,0.15)] text-[#2997ff]" : "bg-[rgba(255,69,58,0.12)] text-[#ff453a]"}`}>
              {betType.toUpperCase()}
            </span>
            <span className="text-[21px] font-bold text-white">{odds.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[12px] text-[rgba(255,255,255,0.48)] mb-1.5 block">Stake (₹)</label>
            <input
              type="number"
              min={minStake}
              step="1"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder={`Min ₹${minStake}`}
              className="w-full rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.07)] px-4 py-3 text-white placeholder:text-[rgba(255,255,255,0.3)] outline-none focus:border-[#0071e3] focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)]"
            />
          </div>

          {stake && (
            <div className="flex justify-between text-[14px]">
              <span className="text-[rgba(255,255,255,0.48)]">Potential win</span>
              <span className="text-[#30d158] font-semibold">₹{potentialWin}</span>
            </div>
          )}

          {error && <p className="text-[12px] text-[#ff453a]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[980px] bg-[#0071e3] py-3 text-[17px] font-medium text-white disabled:opacity-50 transition-colors hover:bg-[#0077ed]"
          >
            {loading ? "Placing..." : "Place Bet"}
          </button>
        </form>
      </div>
    </div>
  );
}
