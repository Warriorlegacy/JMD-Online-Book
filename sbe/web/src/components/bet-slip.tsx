"use client";

import React, { useState } from "react";
import { useSocket } from "@/lib/socket";

export function BetSlip({ matchId }: { matchId: string }) {
  const { connected } = useSocket();
  const [stake, setStake] = useState("100");
  const [side, setSide] = useState<"back" | "lay">("back");
  const [odds, setOdds] = useState("2.50");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePlaceOrder = async () => {
    if (!connected) return;
    const stakeNum = parseFloat(stake);
    const oddsNum = parseFloat(odds);
    if (isNaN(stakeNum) || stakeNum <= 0 || isNaN(oddsNum) || oddsNum < 1.01) {
      setError("Invalid stake or odds");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://jmd-online-book.onrender.com"}/orders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "00000000-0000-0000-0000-000000000001", // demo user
            matchId,
            type: side,
            price: oddsNum,
            stake: stakeNum,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order failed");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-900 bg-slate-950/80 p-4 backdrop-blur-md shadow-2xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-white uppercase tracking-tighter">Quick Bet Slip</h3>
        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setSide("back")}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${side === "back" ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
          >BACK</button>
          <button
            onClick={() => setSide("lay")}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${side === "lay" ? "bg-pink-600 text-white shadow-lg" : "text-slate-500 hover:text-white"}`}
          >LAY</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Odds</label>
          <input
            type="number"
            value={odds}
            onChange={(e) => setOdds(e.target.value)}
            className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Stake (₹)</label>
          <input
            type="number"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            className="w-full h-11 bg-slate-900 border border-slate-800 rounded-lg px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={!connected || loading}
        className={`w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] ${
          !connected || loading
            ? "bg-slate-800 text-slate-600 cursor-not-allowed"
            : success
            ? "bg-green-600 text-white"
            : side === "back"
            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            : "bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_20px_rgba(219,39,119,0.3)]"
        }`}
      >
        {!connected
          ? "OFFLINE"
          : loading
          ? "Placing..."
          : success
          ? "Order Placed ✓"
          : `Place ${side.toUpperCase()} Order`}
      </button>

      {error && (
        <p className="text-[10px] font-bold text-red-400 text-center -mt-2">{error}</p>
      )}

      <div className="border-t border-slate-900/50 pt-3">
        <div className="flex justify-between text-[10px] font-bold mb-1">
          <span className="text-slate-500">Liability:</span>
          <span className="text-white">₹{side === "lay" ? (parseFloat(stake) * (parseFloat(odds) - 1)).toFixed(2) : "0.00"}</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-slate-500">Net Profit:</span>
          <span className="text-cyan-400 font-black">₹{side === "back" ? (parseFloat(stake) * (parseFloat(odds) - 1)).toFixed(2) : parseFloat(stake)}</span>
        </div>
      </div>
    </div>
  );
}
