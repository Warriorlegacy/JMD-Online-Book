"use client";

import { cn } from "@/lib/utils";
import type { PriceLevel, BetSelection } from "@/types";

interface OrderBookProps {
  matchId: string;
  orderBooks: Record<string, { backs: PriceLevel[]; lays: PriceLevel[] }>;
  matchTitle: string;
  teams: [string, string];
  onSelect: (selection: BetSelection) => void;
}

export function OrderBook({ matchId, orderBooks, matchTitle, teams, onSelect }: OrderBookProps) {
  const selections = [
    { id: "team_a", name: teams[0] },
    { id: "team_b", name: teams[1] },
    { id: "draw", name: "Draw" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2">
        {/* Header row for desktop */}
        <div className="hidden md:grid grid-cols-[1fr_repeat(6,80px)] gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
          <div>Selection</div>
          <div className="text-center col-span-3 text-blue-400 bg-blue-400/5 py-1 rounded">Back</div>
          <div className="text-center col-span-3 text-pink-400 bg-pink-400/5 py-1 rounded">Lay</div>
        </div>

        {selections.map((sel) => {
          const book = orderBooks[sel.id] || { backs: [], lays: [] };
          
          // Sort and take top 3
          const sortedBacks = [...book.backs]
            .filter(l => !isNaN(parseFloat(l.price)))
            .sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
            .slice(0, 3);
          const sortedLays = [...book.lays]
            .filter(l => !isNaN(parseFloat(l.price)))
            .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
            .slice(0, 3);

          // Pad to 3
          while (sortedBacks.length < 3) sortedBacks.push({ price: "—", size: 0 });
          while (sortedLays.length < 3) sortedLays.push({ price: "—", size: 0 });

          return (
            <div key={sel.id} className="grid grid-cols-1 md:grid-cols-[1fr_repeat(6,80px)] gap-2 items-center p-3 md:p-2 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
              <div className="px-2">
                <div className="text-sm font-black text-white uppercase italic">{sel.name}</div>
              </div>

              <div className="grid grid-cols-3 md:contents gap-1">
                {/* Backs */}
                <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-1">
                  {sortedBacks.map((level, i) => (
                    <button
                      key={`back-${i}`}
                      onClick={() => level.price !== "—" && onSelect({
                        matchId,
                        matchTitle,
                        market: "Match Odds",
                        selectionName: sel.name,
                        side: "back",
                        odds: parseFloat(level.price),
                        stake: 0
                      })}
                      className={cn(
                        "h-12 flex flex-col items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-600 transition-all active:scale-95 group/btn",
                        level.price === "—" && "opacity-30 cursor-default hover:bg-transparent hover:border-white/5"
                      )}
                      disabled={level.price === "—"}
                    >
                      <span className="text-xs font-black text-blue-400 group-hover/btn:text-white">{level.price}</span>
                      <span className="text-[7px] font-bold text-blue-600 group-hover/btn:text-blue-100 uppercase">
                        {level.price !== "—" ? `₹${level.size.toLocaleString()}` : ""}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Lays */}
                <div className="col-span-1 md:col-span-3 grid grid-cols-3 gap-1">
                  {sortedLays.map((level, i) => (
                    <button
                      key={`lay-${i}`}
                      onClick={() => level.price !== "—" && onSelect({
                        matchId,
                        matchTitle,
                        market: "Match Odds",
                        selectionName: sel.name,
                        side: "lay",
                        odds: parseFloat(level.price),
                        stake: 0
                      })}
                      className={cn(
                        "h-12 flex flex-col items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/20 hover:bg-pink-600 transition-all active:scale-95 group/btn",
                        level.price === "—" && "opacity-30 cursor-default hover:bg-transparent hover:border-white/5"
                      )}
                      disabled={level.price === "—"}
                    >
                      <span className="text-xs font-black text-pink-400 group-hover/btn:text-white">{level.price}</span>
                      <span className="text-[7px] font-bold text-pink-600 group-hover/btn:text-pink-100 uppercase">
                        {level.price !== "—" ? `₹${level.size.toLocaleString()}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
