"use client";

import { useSocket } from "@/lib/socket";
import { useState, useEffect } from "react";

interface DepthLevel {
  price: string;
  stake: string;
}

interface OrderBookSnapshot {
  matchId: string;
  backs: [string, string][];
  lays: [string, string][];
}

export function PriceLadder({ matchId }: { matchId: string }) {
  const { on } = useSocket();
  const [depth, setDepth] = useState<{ backs: DepthLevel[], lays: DepthLevel[] }>({ backs: [], lays: [] });

  useEffect(() => {
    const unsubscribe = on("orderbook_snapshot", (snapshot: OrderBookSnapshot) => {
      if (snapshot.matchId !== matchId) return;
      
      setDepth({
        backs: snapshot.backs.map(([price, stake]) => ({ price, stake })),
        lays: snapshot.lays.map(([price, stake]) => ({ price, stake }))
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [on, matchId]);

  if (depth.backs.length === 0 && depth.lays.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-slate-800 p-8 text-center">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
          Waiting for <br /> Market Depth...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-2xl">
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Price Ladder (L2)</h3>
      
      <div className="grid grid-cols-2 gap-1.5 h-64 overflow-hidden">
        {/* Backs (Blue) */}
        <div className="flex flex-col gap-0.5">
          <div className="text-[9px] text-center font-bold text-cyan-500 mb-1">BACK</div>
          {depth.backs.map((lvl, i) => (
             <div key={i} className="group relative flex justify-between items-center px-2 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">
                <div 
                  className="absolute inset-y-0 left-0 bg-cyan-500/5 transition-all" 
                  style={{ width: `${Math.min(100, parseFloat(lvl.stake) / 10)}%` }} 
                />
                <span className="relative text-[10px] font-bold text-cyan-400">{lvl.price}</span>
                <span className="relative text-[10px] font-medium text-white/70">₹{parseFloat(lvl.stake).toFixed(0)}</span>
             </div>
          ))}
        </div>

        {/* Lays (Pink) */}
        <div className="flex flex-col gap-0.5">
          <div className="text-[9px] text-center font-bold text-pink-500 mb-1">LAY</div>
          {depth.lays.map((lvl, i) => (
             <div key={i} className="group relative flex justify-between items-center px-2 py-1.5 rounded bg-pink-500/10 border border-pink-500/20 hover:bg-pink-500/20 transition-all">
                <div 
                  className="absolute inset-y-0 right-0 bg-pink-500/5 transition-all" 
                  style={{ width: `${Math.min(100, parseFloat(lvl.stake) / 10)}%` }} 
                />
                <span className="relative text-[10px] font-medium text-white/70">₹{parseFloat(lvl.stake).toFixed(0)}</span>
                <span className="relative text-[10px] font-bold text-pink-400">{lvl.price}</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
