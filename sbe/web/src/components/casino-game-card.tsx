"use client";

import Image from "next/image";
import { useState } from "react";

import type { CasinoGame } from "@/types";

interface CasinoGameCardProps {
  game: CasinoGame;
  onPlay: (game: CasinoGame) => void;
}

export default function CasinoGameCard({ game, onPlay }: CasinoGameCardProps) {
  const [imageSrc, setImageSrc] = useState(game.thumbnailUrl || "/file.svg");

  return (
    <div className="relative group overflow-hidden rounded-3xl aspect-video border border-white/5">
      <Image
        src={imageSrc}
        alt={game.name}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform group-hover:scale-110"
        onError={() => setImageSrc("/file.svg")}
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
