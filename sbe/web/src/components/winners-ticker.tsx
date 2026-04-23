"use client";

import React from "react";

interface Winner {
  id: string;
  name: string;
  amount: string;
  game: string;
}

const DEMO_WINNERS: Winner[] = [
  { id: "1", name: "Player_882", amount: "$4,250.00", game: "Starburst X" },
  { id: "2", name: "MaximusPrime", amount: "$12,800.00", game: "Dragon Vault" },
  { id: "3", name: "LadyLuck", amount: "$940.00", game: "Neon Blackjack" },
  { id: "4", name: "CyberKing", amount: "$2,100.00", game: "Kinetic Pulse" },
];

export function WinnersTicker() {
  return (
    <div className="w-full bg-black/40 backdrop-blur-md border-y border-white/5 py-3 overflow-hidden">
      <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
        {[...DEMO_WINNERS, ...DEMO_WINNERS].map((w, i) => (
          <div key={`${w.id}-${i}`} className="flex items-center gap-3">
            <span className="text-[#abd45e] font-black text-[10px] uppercase tracking-widest">LATEST WINNER</span>
            <span className="text-white text-sm font-bold">{w.name}</span>
            <span className="text-white/40 text-sm">won</span>
            <span className="text-[#0071e3] font-black text-sm">{w.amount}</span>
            <span className="text-white/20 text-[10px] uppercase font-bold tracking-tight">on {w.game}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
