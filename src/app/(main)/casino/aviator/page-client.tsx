"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { AviatorMultiplierDisplay } from "@/components/casino/AviatorMultiplierDisplay";

interface AviatorState {
  round_id: string | null;
  status: string;
  multiplier: number;
  crash_point_revealed: number | null;
}

export function AviatorPageClient() {
  const [aviatorState, setAviatorState] = useState<AviatorState>({
    round_id: null,
    status: "waiting",
    multiplier: 1.0,
    crash_point_revealed: null,
  });
  const [stake, setStake] = useState("");
  const [autoCashout, setAutoCashout] = useState("");
  const [activeBetId, setActiveBetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isFlying = aviatorState.status === "dealing";
  const isBettingOpen = aviatorState.status === "betting_open";

  async function placeBet() {
    setError("");
    const stakeNum = parseFloat(stake);
    if (!stakeNum || stakeNum <= 0) { setError("Enter a valid stake"); return; }
    if (!aviatorState.round_id) { setError("No active round"); return; }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        round_id: aviatorState.round_id,
        bet_type: "casino",
        outcome: "cashout",
        stake: stakeNum,
      };
      if (autoCashout) body.auto_cashout_multiplier = parseFloat(autoCashout);

      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to place bet");
        return;
      }
      setActiveBetId(data.data?.id ?? null);
      toast.success("Bet placed!");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function cashOut() {
    if (!activeBetId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bets/cashout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bet_id: activeBetId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "round_ended") toast.error("Too late! Round ended.");
        else toast.error(data.error ?? "Cashout failed");
        return;
      }
      toast.success(`Cashed out at ${data.data?.multiplier?.toFixed(2)}x — ₹${data.data?.payout?.toFixed(2)}`);
      setActiveBetId(null);
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-[28px] font-semibold text-white"
          style={{ fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' }}
        >
          Aviator
        </h1>
        <p className="text-[14px] text-[rgba(255,255,255,0.48)] mt-1">Cash out before the plane crashes!</p>
      </div>

      <Card className="p-4">
        <AviatorMultiplierDisplay onStateChange={setAviatorState} />
      </Card>

      <Card className="p-4 space-y-4">
        <p className="text-[14px] font-semibold text-white">Place Bet</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[12px] text-[rgba(255,255,255,0.48)]">Stake (₹)</label>
            <input
              type="number"
              min={10}
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Min ₹10"
              disabled={!isBettingOpen || !!activeBetId}
              className="w-full rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.07)] px-4 py-3 text-white placeholder:text-[rgba(255,255,255,0.3)] outline-none focus:border-[#0071e3] disabled:opacity-40"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] text-[rgba(255,255,255,0.48)]">Auto Cashout (optional)</label>
            <input
              type="number"
              min={1.01}
              step={0.01}
              value={autoCashout}
              onChange={(e) => setAutoCashout(e.target.value)}
              placeholder="e.g. 2.00"
              disabled={!isBettingOpen || !!activeBetId}
              className="w-full rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.07)] px-4 py-3 text-white placeholder:text-[rgba(255,255,255,0.3)] outline-none focus:border-[#0071e3] disabled:opacity-40"
            />
          </div>
        </div>

        {error && <p className="text-[12px] text-[#ff453a]">{error}</p>}

        <div className="flex gap-3">
          {!activeBetId ? (
            <button
              onClick={placeBet}
              disabled={!isBettingOpen || loading}
              className="flex-1 rounded-[980px] bg-[#0071e3] py-3 text-[17px] font-medium text-white disabled:opacity-40 transition-colors hover:bg-[#0077ed]"
            >
              {loading ? "Placing..." : "Place Bet"}
            </button>
          ) : (
            <button
              onClick={cashOut}
              disabled={!isFlying || loading}
              className="flex-1 rounded-[980px] bg-[#30d158] py-3 text-[17px] font-medium text-white disabled:opacity-40 transition-colors hover:bg-[#28c44e] animate-pulse"
            >
              {loading ? "..." : `Cash Out @ ${aviatorState.multiplier.toFixed(2)}x`}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
