"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/context/socket-context";
import { useBetSlip } from "@/context/bet-slip-context";

interface PriceLevel {
  price: string;
  size: number;
}

interface MatchState {
  id: string;
  teams: [string, string];
  backs: PriceLevel[];
  lays: PriceLevel[];
}

interface OrderbookUpdate {
  room: string;
  selectionId: string;
  snapshot: {
    backs: [string, number][];
    lays: [string, number][];
  };
}

export function OddsGrid({ matchId }: { matchId: string }) {
  const { connected, subscribe, on } = useSocket();
  const { setSelection } = useBetSlip();
  const [matchData, setMatchData] = useState<MatchState>({
    id: matchId,
    teams: ["Home", "Away"],
    backs: [],
    lays: [],
  });

  useEffect(() => {
    async function fetchMatch() {
      try {
        const res = await fetch(`/api/matches/${matchId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data && (data.teamA || data.team_a)) {
          setMatchData(prev => ({ ...prev, teams: [data.teamA || data.team_a, data.teamB || data.team_b] }));
        }
      } catch {}
    }
    fetchMatch();
  }, [matchId]);

  useEffect(() => {
    if (connected) subscribe(matchId);
    
    return on<OrderbookUpdate>("orderbook_update", (update) => {
      // For the homepage grid, we show team_a's odds by default
      if (update.room === matchId && (update.selectionId === "team_a" || !update.selectionId)) {
        setMatchData(prev => ({
          ...prev,
          backs: (update.snapshot.backs || []).map(([p, s]) => ({ price: p, size: s })),
          lays: (update.snapshot.lays || []).map(([p, s]) => ({ price: p, size: s })),
        }));
      }
    });
  }, [connected, subscribe, on, matchId]);

  // Compute displayBacks: sort descending, take top 3, pad with dash
  const validBacks = matchData.backs.filter(l => !isNaN(parseFloat(l.price)));
  validBacks.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  const displayBacks = validBacks.slice(0, 3);
  while (displayBacks.length < 3) displayBacks.push({ price: "—", size: 0 });

  // Compute displayLays: sort ascending, take top 3, pad
  const validLays = matchData.lays.filter(l => !isNaN(parseFloat(l.price)));
  validLays.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  const displayLays = validLays.slice(0, 3);
  while (displayLays.length < 3) displayLays.push({ price: "—", size: 0 });

  const handleBetClick = (price: string, side: "back" | "lay", selectionName: string, selectionId: string) => {
    setSelection({
      matchId,
      matchName: `${matchData.teams?.[0]} v ${matchData.teams?.[1]}`,
      marketName: "Match Odds",
      selectionId: selectionId,
      selectionName,
      odds: parseFloat(price),
      side
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-tighter italic">
          <div className={cn("w-2 h-2 rounded-full", connected ? "bg-emerald-500 animate-pulse" : "bg-amber-500")}></div>
          {connected ? "Live Markets" : "Syncing..."}
        </h2>
      </div>

      <div className="grid gap-4 border border-white/5 rounded-[2rem] bg-slate-900/40 p-2 overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div className="hidden md:grid grid-cols-[1fr_repeat(6,80px)] gap-2 px-6 py-3 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <div>Match Selection</div>
          <div className="text-center col-span-3 text-blue-400 bg-blue-400/5 py-1 rounded-lg">Back</div>
          <div className="text-center col-span-3 text-pink-400 bg-pink-400/5 py-1 rounded-lg">Lay</div>
        </div>

        <div className="group grid grid-cols-1 md:grid-cols-[1fr_repeat(6,80px)] gap-4 md:gap-2 items-center p-4 md:p-4 rounded-3xl bg-white/5 border border-transparent hover:bg-white/10 transition-all duration-500">
          <div className="flex flex-col gap-1 px-2">
            <div className="text-base md:text-sm font-black text-white">{matchData.teams?.[0]} v {matchData.teams?.[1]}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Full Time Result
            </div>
          </div>

          <div className="grid grid-cols-2 md:contents gap-4">
               <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-1">
                 {[0, 1, 2].map((i) => {
                    const level = displayBacks[i];
                    return (
                       <button 
                         key={`back-${i}`}
                         onClick={() => handleBetClick(level?.price || "1.01", "back", matchData.teams?.[0], "team_a")}
                         className="h-14 w-full flex flex-col items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-600 transition-all active:scale-95 group/btn overflow-hidden relative">
                          <span className="text-xs font-black text-blue-400 group-hover/btn:text-white transition-colors">{level.price}</span>
                          <span className="text-[8px] font-bold text-blue-600 group-hover/btn:text-blue-100 transition-colors uppercase tracking-widest">
                            {level.price !== "—" ? `₹${(parseFloat(level.price) * 10).toFixed(0)}` : "₹0"}
                          </span>
                       </button>
                    );
                 })}
               </div>

               <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-1">
                 {[0, 1, 2].map((i) => {
                    const level = displayLays[i];
                    return (
                       <button 
                         key={`lay-${i}`} 
                         onClick={() => handleBetClick(level?.price || "1.01", "lay", matchData.teams?.[0], "team_a")}
                         className="h-14 w-full flex flex-col items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500 transition-all active:scale-95 group/btn overflow-hidden relative">
                          <span className="text-xs font-black text-pink-400 group-hover/btn:text-white transition-colors">{level.price}</span>
                          <span className="text-[8px] font-bold text-pink-600 group-hover/btn:text-pink-100 transition-colors uppercase tracking-widest">
                            {level.price !== "—" ? `₹${(parseFloat(level.price) * 10).toFixed(0)}` : "₹0"}
                          </span>
                       </button>
                    );
                 })}
               </div>
          </div>
        </div>
      </div>
    </div>
  );
}
