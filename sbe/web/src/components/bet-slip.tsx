"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/lib/socket";

export function BetSlip() {
  const [stake, setStake] = useState("100");
  const [odds, setOdds] = useState("2.10");
  const [type, setType] = useState<"back" | "lay">("back");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const { on } = useSocket();

  const stakeNum = parseFloat(stake) || 0;
  const oddsNum = parseFloat(odds) || 0;
  const totalRisk = type === "back" ? stakeNum : (stakeNum * oddsNum - stakeNum);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          matchId: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
          type,
          price: Math.round(oddsNum * 100),
          stake: Math.round(stakeNum * 100),
        }),
      });
      if (response.ok) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setStatus("idle");
        if (status === "success" && window.innerWidth < 768) setIsOpenMobile(false);
      }, 3000);
    }
  };

  return (
    <>
      {/* Mobile Toggle Trigger */}
      <button 
        onClick={() => setIsOpenMobile(true)}
        className="fixed bottom-6 right-6 z-40 md:hidden h-14 w-14 rounded-full bg-cyan-600 text-white shadow-2xl flex items-center justify-center animate-bounce"
      >
        <span className="font-bold text-lg">₹</span>
      </button>

      {/* BetSlip Container */}
      <div className={cn(
        "fixed inset-x-0 bottom-0 z-50 md:relative md:inset-auto md:z-0 transition-transform duration-300 ease-in-out md:translate-y-0 shadow-2xl md:shadow-none",
        isOpenMobile ? "translate-y-0" : "translate-y-full md:translate-y-0"
      )}>
        <div className="rounded-t-2xl md:rounded-xl border border-slate-800 bg-slate-950 overflow-hidden relative pb-10 md:pb-0">
          {/* Mobile Handle */}
          <div className="flex md:hidden justify-center py-2" onClick={() => setIsOpenMobile(false)}>
            <div className="h-1 w-12 rounded-full bg-slate-800"></div>
          </div>

          <div className="flex bg-slate-900 border-b border-slate-800">
            <button 
              onClick={() => setType("back")}
              className={cn("flex-1 py-4 md:py-3 text-xs font-bold uppercase tracking-wider transition-all", type === "back" ? "bg-blue-600 text-white" : "text-slate-500")}
            >
              Back
            </button>
            <button 
              onClick={() => setType("lay")}
              className={cn("flex-1 py-4 md:py-3 text-xs font-bold uppercase tracking-wider transition-all", type === "lay" ? "bg-pink-600 text-white" : "text-slate-500")}
            >
              Lay
            </button>
          </div>

          <div className="p-6 md:p-4 space-y-4">
            <div className="flex justify-between items-center">
               <div className="text-sm font-bold text-white">Man City v Arsenal</div>
               <button onClick={() => setIsOpenMobile(false)} className="md:hidden text-slate-500 text-xs">Close</button>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Odds</label>
                <input 
                  type="number" step="0.01" value={odds}
                  onChange={(e) => setOdds(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg h-12 md:h-10 px-3 text-sm font-bold text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Stake (₹)</label>
                <input 
                  type="number" value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg h-12 md:h-10 px-3 text-sm font-bold text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-between text-xs font-bold py-2 border-t border-slate-900">
              <span className="text-slate-500 uppercase">Risk (₹)</span>
              <span className={cn(type === "back" ? "text-blue-400" : "text-pink-400")}>{totalRisk.toFixed(2)}</span>
            </div>

            <button 
              onClick={handleSubmit} disabled={loading}
              className={cn(
                "w-full h-14 md:h-11 rounded-xl md:rounded-lg font-bold text-white transition-all shadow-lg",
                loading ? "opacity-50" : "",
                type === "back" ? "bg-blue-600 active:bg-blue-700" : "bg-pink-600 active:bg-pink-700"
              )}
            >
              {loading ? "Ordering..." : status === "success" ? "Done!" : `Submit ${type}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
