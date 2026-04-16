"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OddsGrid } from "@/components/odds-grid";
import { Sidebar } from "@/components/sidebar";
import { useSocket } from "@/context/socket-context";
import {
  Trophy,
  Zap,
  MonitorPlay,
  Play,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  tournamentName?: string;
  startTime?: string;
  status: string;
  sportType: string;
  score?: { teamA: string; teamB: string };
  elapsedMinutes?: number;
}

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
}

const BANNERS: Banner[] = [
  { id: 1, title: "Special Event 1", subtitle: "Get extra bonuses this week!", image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2070&auto=format&fit=c" },
  { id: 2, title: "Special Event 2", subtitle: "Exclusive odds on finals!", image: "https://images.unsplash.com/photo-1579952363873-27f3bde9be0f?q=80&w=2070&auto=format&fit=crop" },
  { id: 3, title: "Special Event 3", subtitle: "Win big with every bet!", image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=2070&auto=format&fit=crop" },
];

function normalizeMatch(m: any): Match {
  return {
    id: m.id,
    teamA: m.team_a || m.teamA,
    teamB: m.team_b || m.teamB,
    tournamentName: m.tournament_name || m.tournamentName,
    startTime: m.start_time || m.startTime,
    status: m.status,
    sportType: m.sport_type || m.sportType,
    score: m.score,
    elapsedMinutes: m.elapsed_minutes || m.elapsedMinutes,
  };
}

function getSportIcon(sport: string) {
  switch (sport?.toLowerCase()) {
    case "cricket": return "🏏";
    case "football": return "⚽";
    case "tennis": return "🎾";
    case "horse racing": return "🐎";
    case "casino": return "🎰";
    default: return "🏆";
  }
}

function MatchCard({ match, onClick }: { match: Match; onClick: () => void }) {
  const sportIcon = getSportIcon(match.sportType);
  const timeStr = match.startTime ? new Date(match.startTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : null;
  const scoreStr = match.score ? `${match.score.teamA} - ${match.score.teamB}` : null;

  return (
    <div
      onClick={onClick}
      className="min-w-[200px] p-4 rounded-2xl border border-white/5 bg-slate-900/40 flex-shrink-0 cursor-pointer hover:border-cyan-500/50 hover:bg-slate-900/60 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{sportIcon}</span>
        {match.tournamentName && (
          <span className="text-[10px] font-bold text-slate-500 uppercase truncate">{match.tournamentName}</span>
        )}
      </div>
      <div className="text-sm font-black text-white uppercase italic mb-1 truncate">
        {match.teamA} v {match.teamB}
      </div>
      {match.status === "in_play" && scoreStr && (
        <div className="text-xs text-slate-400">
          {scoreStr} {match.elapsedMinutes ? `(${match.elapsedMinutes}')` : ""}
        </div>
      )}
      {match.status === "scheduled" && timeStr && (
        <div className="text-xs text-slate-500">{timeStr}</div>
      )}
    </div>
  );
}

function BannerCarousel() {
  return (
    <section className="relative w-full h-48 md:h-64 rounded-[2rem] bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 overflow-x-auto flex flex-nowrap scrollbar-hide">
      {BANNERS.map((banner) => (
        <div
          key={banner.id}
          className="min-w-full flex-shrink-0 relative p-6 md:p-10 flex flex-col justify-end"
        >
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
            style={{ backgroundImage: `url('${banner.image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
              {banner.title}
            </h2>
            <p className="text-sm text-white/60 mt-2">{banner.subtitle}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sportFilter = searchParams.get("sport") || "all";
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const { connected, subscribe, on } = useSocket();

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/matches");
      if (res.ok) {
        const data = await res.json();
        setMatches(Array.isArray(data) ? data.map(normalizeMatch) : [normalizeMatch(data)]);
      }
    } catch (err) {
      console.error("Match fetching failed:", err);
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
     fetchMatches();
     const interval = setInterval(fetchMatches, 30000);
     return () => clearInterval(interval);
   }, []);

   useEffect(() => {
     if (!connected) return;
     matches.forEach(m => subscribe(m.id));
   }, [connected, matches, subscribe]);

   useEffect(() => {
     if (!connected) return;
     const unsubscribe = on<{ matchId: string; status: string; score?: {teamA: string, teamB: string}; elapsedMinutes?: number }>("match_update", (data) => {
       setMatches(prev => prev.map(m => 
         m.id === data.matchId
           ? { 
               ...m, 
               status: data.status, 
               score: data.score, 
               elapsedMinutes: data.elapsedMinutes 
             }
           : m
       ));
     });
     return () => { unsubscribe(); };
   }, [connected, on]);

   const inPlayMatches = matches.filter((m) => m.status === "in_play");
  const upcomingMatches = matches
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime())
    .slice(0, 5);
  const showcaseMatches = inPlayMatches.length > 0 ? inPlayMatches : upcomingMatches;

  const mainBoardMatches =
    sportFilter === "all"
      ? matches
      : matches.filter((m) => m.sportType === sportFilter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 py-8">
      {/* Left Sidebar (Desktop) */}
      <div className="hidden lg:block sticky top-24 h-[calc(100vh-120px)]">
        <Sidebar />
      </div>

      {/* Center Column */}
      <div className="space-y-10 overflow-hidden">
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* In-Play / Upcoming Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-white uppercase italic">
              {inPlayMatches.length > 0 ? "In-Play" : "Upcoming"}
            </h2>
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              ({showcaseMatches.length})
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {loading ? (
              <div className="py-8 text-slate-500">Loading matches...</div>
            ) : showcaseMatches.length > 0 ? (
              showcaseMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  onClick={() => router.push(`/match/${m.id}`)}
                />
              ))
            ) : (
              <div className="py-8 text-slate-500">No matches available.</div>
            )}
          </div>
        </section>

        {/* Main Board */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-black flex items-center gap-2 text-white uppercase italic">
              <MonitorPlay className="w-5 h-5 text-cyan-400" />
              Main Board
            </h2>
            <div className="flex gap-2">
              {["Live", "Schedule", "Top Odds"].map((t) => (
                <button
                  key={t}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                    t === "Live"
                      ? "bg-white/10 text-white border border-white/10"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Sport filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {["all", "cricket", "football", "tennis", "horse_racing", "other"].map((cat) => {
              const label =
                cat === "all"
                  ? "All Sports"
                  : cat.replace("_", " ");
              return (
                <Link
                  key={cat}
                  href={`/?sport=${cat}`}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                    sportFilter === cat
                      ? "bg-cyan-500 text-white"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Matches odds grids */}
          <div className="space-y-6">
            {loading ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
              </div>
            ) : mainBoardMatches.length > 0 ? (
              mainBoardMatches.map((match) => (
                <OddsGrid key={match.id} matchId={match.id} />
              ))
            ) : (
              <div className="py-10 rounded-[2rem] border border-dashed border-white/5 bg-white/5 text-center space-y-2">
                <p className="text-sm font-black text-slate-500 uppercase">No Active Markets</p>
                <p className="text-xs text-slate-600">
                  Select another sport or check back later
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
