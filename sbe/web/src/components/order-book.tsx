"use client";

import { cn } from "@/lib/utils";
import type { PriceLevel, BetSelection } from "@/types";

interface OrderBookProps {
  matchId: string;
  backs: PriceLevel[];
  lays: PriceLevel[];
  onSelect: (selection: BetSelection) => void;
  matchTitle?: string;
}

export function OrderBook({ matchId, backs, lays, onSelect, matchTitle }: OrderBookProps) {
  // Sort and take top 3
  const sortedBacks = [...backs]
    .filter(l => !isNaN(parseFloat(l.price)))
    .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
    .slice(0, 3);
  const sortedLays = [...lays]
    .filter(l => !isNaN(parseFloat(l.price)))
    .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
    .slice(0, 3);

  // Pad to 3
  while (sortedBacks.length < 3) sortedBacks.push({ price: "—", size: 0 });
  while (sortedLays.length < 3) sortedLays.push({ price: "—", size: 0 });

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden">
      {/* Two-section headers for desktop */}
      <div className="hidden md:grid grid-cols-2 text-center">
        <div className="text-xs font-bold text-blue-400 bg-blue-500/5 py-2">BACK</div>
        <div className="text-xs font-bold text-pink-400 bg-pink-500/5 py-2">LAY</div>
      </div>
      
      {/* Body: interleaved on desktop, stacked on mobile */}
      <div className="divide-y divide-white/5">
        {sortedBacks.map((level, i) => (
          <button
            key={`back-${i}`}
            onClick={() => level.price !== "—" && onSelect({
              matchId,
              matchTitle: matchTitle || "Match",
              market: "Match Odds",
              selectionName: "Team A",
              side: "back",
              odds: parseFloat(level.price),
              stake: 0
            })}
            className={cn(
              "w-full grid grid-cols-2 text-left p-4 hover:bg-blue-500/10 transition-colors border-l-4 border-transparent hover:border-blue-500",
              "min-h-[44px]",
              level.price === "—" && "cursor-default opacity-50 hover:bg-transparent hover:border-transparent"
            )}
            disabled={level.price === "—"}
          >
             <span className="text-lg font-bold text-blue-400">{level.price}</span>
             <span className="text-right text-sm text-slate-400">
               {level.price === "—" ? "—" : `₹${level.size.toLocaleString('en-IN')}`}
             </span>
          </button>
        ))}
        {sortedLays.map((level, i) => (
          <button
            key={`lay-${i}`}
            onClick={() => level.price !== "—" && onSelect({
              matchId,
              matchTitle: matchTitle || "Match",
              market: "Match Odds",
              selectionName: "Team B",
              side: "lay",
              odds: parseFloat(level.price),
              stake: 0
            })}
            className={cn(
              "w-full grid grid-cols-2 text-left p-4 hover:bg-pink-500/10 transition-colors border-l-4 border-transparent hover:border-pink-500",
              "min-h-[44px]",
              level.price === "—" && "cursor-default opacity-50 hover:bg-transparent hover:border-transparent"
            )}
            disabled={level.price === "—"}
          >
             <span className="text-lg font-bold text-pink-400">{level.price}</span>
             <span className="text-right text-sm text-slate-400">
               {level.price === "—" ? "—" : `₹${level.size.toLocaleString('en-IN')}`}
             </span>
          </button>
        ))}
      </div>
    </div>
  );
}
