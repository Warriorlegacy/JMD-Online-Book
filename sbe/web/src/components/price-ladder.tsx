"use client";

import { PriceLevel, BetSelection } from "@/types";

interface PriceLadderProps {
  matchId: string;
  backs: PriceLevel[];
  lays: PriceLevel[];
  onSelect: (selection: BetSelection) => void;
  matchTitle?: string;
}

export default function PriceLadder({
  matchId,
  backs,
  lays,
  onSelect,
  matchTitle = "Match"
}: PriceLadderProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Backs */}
      <div className="flex-1 overflow-y-auto">
        {backs.map((level, i) => (
          <button
            key={`back-${i}`}
            onClick={() => onSelect({
              matchId,
              matchTitle,
              market: "Match Odds",
              selectionName: "Team A",
              side: "back",
              odds: parseFloat(level.price),
              stake: 0
            })}
            className={`w-full flex justify-between p-3 text-sm border-b border-white/5 transition-colors
              ${i === 0 
                ? 'bg-blue-500/10 text-blue-300 font-bold border-l-2 border-blue-500' 
                : 'text-slate-300 hover:bg-blue-500/5'}`}
            style={{ minHeight: '44px' }}
          >
            <span>{level.price}</span>
            <span className="font-mono">₹{level.size.toLocaleString('en-IN')}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2"></div>

      {/* Lays */}
      <div className="flex-1 overflow-y-auto">
        {lays.map((level, i) => (
          <button
            key={`lay-${i}`}
            onClick={() => onSelect({
              matchId,
              matchTitle,
              market: "Match Odds",
              selectionName: "Team B",
              side: "lay",
              odds: parseFloat(level.price),
              stake: 0
            })}
            className={`w-full flex justify-between p-3 text-sm border-b border-white/5 transition-colors
              ${i === 0 
                ? 'bg-pink-500/10 text-pink-300 font-bold border-l-2 border-pink-500' 
                : 'text-slate-300 hover:bg-pink-500/5'}`}
            style={{ minHeight: '44px' }}
          >
            <span>{level.price}</span>
            <span className="font-mono">₹{level.size.toLocaleString('en-IN')}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
