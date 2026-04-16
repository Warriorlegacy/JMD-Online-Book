"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type { CasinoRound } from "@/lib/types/betting";

const GAME_OUTCOMES: Record<string, string[]> = {
  "teen-patti": ["Player A", "Player B", "Tie"],
  "dragon-tiger": ["Dragon", "Tiger", "Tie"],
  "andar-bahar": ["Andar", "Bahar"],
};

interface CasinoBetPanelProps {
  game: string;
  round: CasinoRound | null;
  minBet?: number;
  onBetPlaced?: () => void;
}

export function CasinoBetPanel({ game, round, minBet = 10, onBetPlaced }: CasinoBetPanelProps) {
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [stake, setStake] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const outcomes = GAME_OUTCOMES[game] ?? [];
  const isOpen = round?.status === "betting_open";

  async function handleBet() {
    setError("");
    if (!selectedOutcome) { setError("Select an outcome"); return; }
    const stakeNum = parseFloat(stake);
    if (!stakeNum || stakeNum < minBet) { setError(`Minimum stake is ₹${minBet}`); return; }
    if (!round) { setError("No active round"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          round_id: round.id,
          bet_type: "casino",
          outcome: selectedOutcome,
          stake: stakeNum,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Failed to place bet";
        if (msg.includes("insufficient_balance")) setError("Insufficient balance");
        else if (msg.includes("betting_suspended")) setError("Betting is not open");
        else if (msg.includes("below_minimum_stake")) setError(`Minimum stake is ₹${minBet}`);
        else setError(msg);
        return;
      }
      toast.success("Bet placed!");
      setStake("");
      setSelectedOutcome("");
      onBetPlaced?.();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {outcomes.map((outcome) => (
          <button
            key={outcome}
            disabled={!isOpen}
            onClick={() => setSelectedOutcome(outcome)}
            className="rounded-[18px] py-3 text-[14px] font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: selectedOutcome === outcome ? "rgba(0,113,227,0.2)" : "rgba(255,255,255,0.06)",
              border: `1px solid ${selectedOutcome === outcome ? "#0071e3" : "rgba(255,255,255,0.08)"}`,
              color: selectedOutcome === outcome ? "#2997ff" : "rgba(255,255,255,0.7)",
            }}
          >
            {outcome}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          min={minBet}
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          placeholder={`Stake (min ₹${minBet})`}
          disabled={!isOpen}
          className="flex-1 rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.07)] px-4 py-3 text-white placeholder:text-[rgba(255,255,255,0.3)] outline-none focus:border-[#0071e3] disabled:opacity-40"
        />
        <button
          onClick={handleBet}
          disabled={!isOpen || loading}
          className="rounded-[980px] bg-[#0071e3] px-6 py-3 text-[14px] font-medium text-white disabled:opacity-40 transition-colors hover:bg-[#0077ed]"
        >
          {loading ? "..." : "Bet"}
        </button>
      </div>

      {!isOpen && (
        <p className="text-[12px] text-[rgba(255,255,255,0.3)] text-center">
          {round ? `Betting is ${round.status}` : "No active round"}
        </p>
      )}

      {error && <p className="text-[12px] text-[#ff453a]">{error}</p>}
    </div>
  );
}
