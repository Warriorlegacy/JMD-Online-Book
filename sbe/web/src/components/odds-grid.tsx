"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/lib/socket";

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
  snapshot: {
    backs: [string, number][];
    lays: [string, number][];
  };
}

export function OddsGrid({ matchId }: { matchId: string }) {
  const { connected, subscribe, on } = useSocket();
  const [matchData, setMatchData] = useState<MatchState>({
    id: matchId,
    teams: ["Home", "Away"],
    backs: [],
    lays: [],
  });

  useEffect(() => {
    async function fetchMatch() {
      try {
        const res = await fetch(`/api/matches/active`);
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
    
    // Define a cleanup function
    const unsubscribe = on<OrderbookUpdate>("orderbook_update", (update) => {
      if (update.room === matchId) {
        setMatchData(prev => ({
          ...prev,
          backs: (update.snapshot.backs || []).map(([p, s]) => ({ price: p, size: s })),
          lays: (update.snapshot.lays || []).map(([p, s]) => ({ price: p, size: s })),
        }));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [connected, subscribe, on, matchId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {!connected && <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>}
            <span className={cn("relative inline-flex rounded-full h-2 w-2", connected ? "bg-green-500" : "bg-yellow-500")}></span>
          </span>
          {connected ? "Live Markets" : "Connecting..."}
        </h2>
      </div>

      <div className="grid gap-4 border border-slate-900 rounded-xl bg-slate-950 p-2 overflow-hidden backdrop-blur-sm shadow-2xl">
        {/* Desktop Header Row (Hidden on Mobile) */}
        <div className="hidden md:grid grid-cols-[1fr_repeat(6,80px)] gap-2 px-4 py-2 border-b border-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <div>Match Selection</div>
          <div className="text-center col-span-3 text-blue-400/80 bg-blue-500/5 py-1 rounded">Back</div>
          <div className="text-center col-span-3 text-pink-400/80 bg-pink-500/5 py-1 rounded">Lay</div>
        </div>

        {/* Match Rows / Cards */}
        <div className="group grid grid-cols-1 md:grid-cols-[1fr_repeat(6,80px)] gap-4 md:gap-2 items-center p-4 md:p-4 rounded-lg bg-slate-900/30 border border-transparent">
          {/* Team Info */}
          <div className="flex flex-col gap-1">
            <div className="text-base md:text-sm font-bold text-white">{matchData.teams[0]} v {matchData.teams[1]}</div>
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">Full Time Result</div>
          </div>

          {/* Odds - Mobile Layout (Stack) vs Desktop Layout (Col) */}
          <div className="grid grid-cols-2 md:contents gap-4">
               {/* Back Section */}
               <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-1">
                 <div className="md:hidden text-[9px] font-bold text-blue-400 uppercase mb-1 col-span-3">Back</div>
                 {[0, 1, 2].map((i) => {
                    const level = matchData.backs[i];
                    return (
                      <button key={`back-${i}`} className="h-14 w-full flex flex-col items-center justify-center rounded-md bg-blue-500/10 border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm">
                         <span className="text-sm font-black">{level ? level.price : "-"}</span>
                         <span className="text-[9px] font-medium opacity-60">₹{level ? (parseFloat(level.price) * 10).toFixed(0) : "0"}</span>
                      </button>
                    );
                 })}
               </div>

               {/* Lay Section */}
               <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-1">
                 <div className="md:hidden text-[9px] font-bold text-pink-400 uppercase mb-1 col-span-3">Lay</div>
                 {[0, 1, 2].map((i) => {
                    const level = matchData.lays[i];
                    return (
                      <button key={`lay-${i}`} className="h-14 w-full flex flex-col items-center justify-center rounded-md bg-pink-500/10 border border-pink-500/20 hover:bg-pink-600 hover:text-white transition-all active:scale-95 shadow-sm">
                         <span className="text-sm font-black">{level ? level.price : "-"}</span>
                         <span className="text-[9px] font-medium opacity-60">₹{level ? (parseFloat(level.price) * 10).toFixed(0) : "0"}</span>
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
