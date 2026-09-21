"use client";

import { PriceLevel, BetSelection } from "@/types";

interface PriceLadderProps {
  matchId: string;
  orderBooks: Record<string, { backs: PriceLevel[]; lays: PriceLevel[] }>;
  onSelect: (selection: BetSelection) => void;
  teams: [string, string];
}

export default function PriceLadder({
  matchId,
  orderBooks,
  onSelect,
  teams
}: PriceLadderProps) {
  const selections = [
    { id: "team_a", name: teams?.[0] || "Team A" },
    { id: "team_b", name: teams?.[1] || "Team B" },
    { id: "draw", name: "Draw" },
  ];

  return (
    <div className="h-full flex flex-col custom-scrollbar overflow-y-auto">
      {selections.map((sel) => {
        const book = orderBooks[sel.id] || { backs: [], lays: [] };
        return (
          <div key={sel.id} className="mb-4 last:mb-0">
            <div className="bg-white/5 px-3 py-1 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">
              {sel.name}
            </div>
            
            {/* Backs */}
            <div className="flex flex-col">
              {book.backs.map((level: PriceLevel, i: number) => (
                <button
                  key={`back-${i}`}
                  onClick={() => onSelect({
                    matchId,
                    matchTitle: `${teams?.[0] || "T1"} v ${teams?.[1] || "T2"}`,
                    market: "Match Odds",
                    selectionName: sel.name,
                    side: "back",
                    odds: parseFloat(level.price),
                    stake: 0
                  })}
                  className={`w-full flex justify-between p-2 text-[11px] border-b border-white/5 transition-colors
                    ${i === 0 
                      ? 'bg-blue-500/10 text-blue-300 font-bold border-l-2 border-blue-500' 
                      : 'text-slate-400 hover:bg-blue-500/5'}`}
                >
                  <span>{level.price}</span>
                  <span className="font-mono">₹{level.size.toLocaleString('en-IN')}</span>
                </button>
              ))}
            </div>

            {/* Lays */}
            <div className="flex flex-col">
              {book.lays.map((level: PriceLevel, i: number) => (
                <button
                  key={`lay-${i}`}
                  onClick={() => onSelect({
                    matchId,
                    matchTitle: `${teams?.[0] || "T1"} v ${teams?.[1] || "T2"}`,
                    market: "Match Odds",
                    selectionName: sel.name,
                    side: "lay",
                    odds: parseFloat(level.price),
                    stake: 0
                  })}
                  className={`w-full flex justify-between p-2 text-[11px] border-b border-white/5 transition-colors
                    ${i === 0 
                      ? 'bg-pink-500/10 text-pink-300 font-bold border-l-2 border-pink-500' 
                      : 'text-slate-400 hover:bg-pink-500/5'}`}
                >
                  <span>{level.price}</span>
                  <span className="font-mono">₹{level.size.toLocaleString('en-IN')}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
