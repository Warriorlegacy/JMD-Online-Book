"use client";

import type { CasinoGame } from "@/types";

interface CasinoGameCardProps {
  game: CasinoGame;
  onPlay: (game: CasinoGame) => void;
}

export default function CasinoGameCard({ game, onPlay }: CasinoGameCardProps) {
  return (
    <div className="relative group overflow-hidden rounded-3xl aspect-video border border-white/5">
      <img
        src={game.thumbnailUrl}
        alt={game.name}
        className="w-full h-full object-cover transition-transform group-hover:scale-110"
        onError={(e) => {
          e.currentTarget.src = "/placeholder-game.jpg";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
        <h3 className="text-lg font-black text-white uppercase italic">{game.name}</h3>
        <button
          onClick={() => onPlay(game)}
          className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-[10px] uppercase rounded-xl hover:bg-amber-400 transition-transform group-hover:scale-105"
        >
          Play Now
        </button>
      </div>
    </div>
  );
}
