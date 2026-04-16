"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";

const GAMES = ["teen-patti", "dragon-tiger", "andar-bahar", "aviator"] as const;

export default function CasinoGamePage() {
  const { game } = useParams<{ game: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if not a valid game
    if (!GAMES.includes(game as any)) {
      router.push("/casino");
    }
    // Simulate loading game asset
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [game, router]);

  if (!loading && !user) {
    // Middleware should handle, but double-check
    router.push("/login");
    return null;
  }

  if (!GAMES.includes(game as any)) {
    return <div className="p-8 text-center text-white">Game not found</div>;
  }

  const formattedName = (game as string).replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-[calc(100vh-200px)] bg-[#0f1923] flex flex-col items-center justify-center p-4">
      {isLoading ? (
        <div className="text-white">Loading {formattedName}...</div>
      ) : (
        <div className="w-full max-w-6xl aspect-video bg-slate-900/50 rounded-2xl border border-white/10 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-black text-white uppercase italic">{formattedName}</h1>
            <p className="text-slate-400">Game interface would load here in production.</p>
            <button 
              onClick={() => alert("Game would start now!")}
              className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500"
            >
              Start Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
