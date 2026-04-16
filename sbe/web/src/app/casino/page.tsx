"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import CasinoGameCard from "@/components/casino-game-card";
import type { CasinoGame } from "@/types";

const CASINO_GAMES: CasinoGame[] = [
  {
    slug: "teen-patti",
    name: "Teen Patti",
    description: "Classic Indian three-card poker",
    thumbnailUrl: "https://via.placeholder.com/400x300?text=Teen+Patti",
  },
  {
    slug: "dragon-tiger",
    name: "Dragon Tiger",
    description: "Simplified baccarat style",
    thumbnailUrl: "https://via.placeholder.com/400x300?text=Dragon+Tiger",
  },
  {
    slug: "andar-bahar",
    name: "Andar Bahar",
    description: "Traditional Indian card game",
    thumbnailUrl: "https://via.placeholder.com/400x300?text=Andar+Bahar",
  },
  {
    slug: "aviator",
    name: "Aviator",
    description: "Crash style multiplier game",
    thumbnailUrl: "https://via.placeholder.com/400x300?text=Aviator",
  },
];

export default function CasinoPage() {
  const { user } = useAuth();
  const router = useRouter();

  const handlePlay = (game: CasinoGame) => {
    if (!user) {
      router.push('/login');
    } else {
      router.push(`/casino/${game.slug}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic mb-8">Casino</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {CASINO_GAMES.map(game => (
          <CasinoGameCard key={game.slug} game={game} onPlay={handlePlay} />
        ))}
      </div>
    </div>
  );
}
