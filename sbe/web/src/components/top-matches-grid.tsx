"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon, LayoutGrid, List } from "lucide-react";
import { MatchCard } from "./match-card";

interface MatchOdds {
  home: number;
  draw: number;
  away: number;
}

interface TotalGoals {
  over: number;
  under: number;
  line: number;
}

interface Handicap {
  home: number;
  away: number;
  line: number;
}

interface Match {
  id: string;
  time: string;
  isLive: boolean;
  league: string;
  teams: [string, string];
  score?: [number, number];
  matchResult: MatchOdds;
  matchResultMovement?: { home: 'up' | 'down' | null, draw: 'up' | 'down' | null, away: 'up' | 'down' | null };
  totalGoals: TotalGoals;
  totalGoalsMovement?: { over: 'up' | 'down' | null, under: 'up' | 'down' | null };
  handicap: Handicap;
  handicapMovement?: { home: 'up' | 'down' | null, away: 'up' | 'down' | null };
}

interface TopMatchesGridProps {
  matches?: Match[];
}

const marketTabs = ["All Markets", "1X2", "Over/Under", "Handicap"];

function OddButton({ 
  value, 
  movement,
  className 
}: { 
  value: number; 
  movement?: 'up' | 'down' | null;
  className?: string;
}) {
  return (
    <button 
      className={cn(
        "h-10 w-full flex items-center justify-center gap-1 rounded-lg text-sm font-medium transition-all duration-200",
        "bg-[#0071e3]/10 border border-[#0071e3]/20 text-[#0071e3] hover:bg-[#0071e3] hover:text-white active:scale-[0.98]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-1",
        className
      )}
    >
      <span>{value.toFixed(2)}</span>
      {movement && (
        <span className={cn(
          "text-xs transition-all",
          movement === 'up' ? "text-emerald-400" : "text-rose-400"
        )}>
          {movement === 'up' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
        </span>
      )}
    </button>
  );
}

export function TopMatchesGrid({ matches: initialMatches }: TopMatchesGridProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [matches, setMatches] = useState<Match[]>(initialMatches || []);
  const [isLoading, setIsLoading] = useState(!initialMatches);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialMatches) return;
    
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/matches/active");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        const activeMatches = Array.isArray(data) ? data : [data];
        
        const mappedMatches: Match[] = activeMatches.map((m: any) => ({
          id: m.id,
          time: new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isLive: m.status === 'in_play',
          league: JSON.parse(m.metadata || '{}').round || "International",
          teams: [m.team_a, m.team_b],
          matchResult: { home: 2.0, draw: 3.5, away: 3.5 },
          totalGoals: { line: 2.5, over: 1.9, under: 1.9 },
          handicap: { line: 0, home: 1.9, away: 1.9 },
        }));

        setMatches(mappedMatches);
      } catch (error: any) {
        console.error("Failed to load active matches:", error);
        setError(error.message || "Failed to load matches");
        setMatches([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [initialMatches]);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-black/20 backdrop-blur-xl rounded-2xl border border-white/5">
        <div className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Grid Controls */}
      <div className="flex items-center justify-between">
        <div className="flex bg-white/5 p-1 rounded-full border border-white/5 overflow-x-auto no-scrollbar">
          {marketTabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index)}
              className={cn(
                "px-5 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap",
                activeTab === index
                  ? "bg-[#0071e3] text-white shadow-lg shadow-[#0071e3]/20"
                  : "text-[#86868b] hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex bg-white/5 p-1 rounded-xl border border-white/5 gap-1">
          <button 
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === 'grid' ? "bg-white/10 text-white shadow-sm" : "text-[#86868b] hover:text-white"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === 'list' ? "bg-white/10 text-white shadow-sm" : "text-[#86868b] hover:text-white"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {matches.length === 0 && !isLoading ? (
        <div className="w-full py-20 text-center glass rounded-2xl border border-white/5">
          <p className="text-[#86868b] font-medium">No active matches found at the moment.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-[#0071e3] hover:underline font-semibold"
          >
            Refresh Feed
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {matches.map((match) => (
            <MatchCard 
              key={match.id} 
              match={{
                id: match.id,
                teamA: match.teams?.[0],
                teamB: match.teams?.[1],
                startTime: match.time,
                status: match.isLive ? "in_play" : "scheduled",
                sportType: "Football",
                score: match.score ? { teamA: (match.score?.[0]?.toString() || "0"), teamB: (match.score?.[1]?.toString() || "0") } : undefined,
                league: match.league,
                odds: [
                  { selection: "Match Winner", back: match.matchResult.home, lay: match.matchResult.home + 0.04 }
                ]
              }}
            />
          ))}
        </div>
      ) : (
        <div className="w-full rounded-2xl overflow-hidden glass border border-white/5">
          {/* Grid Header */}
          <div className="hidden lg:grid grid-cols-12 px-6 py-4 border-b border-white/5 text-[11px] font-bold uppercase tracking-widest text-[#86868b]">
            <div className="col-span-5 pl-2">Event</div>
            <div className="col-span-3 text-center">Match Result (1X2)</div>
            <div className="col-span-2 text-center">Total Goals</div>
            <div className="col-span-2 text-center">Handicap</div>
          </div>

          {/* Match Rows */}
          <div className="divide-y divide-white/5">
            {matches.map((match) => (
              <div
                key={match.id}
                className={cn(
                  "grid grid-cols-1 lg:grid-cols-12 gap-3 px-6 py-5 transition-all duration-300",
                  "bg-white/[0.01] hover:bg-white/[0.03]",
                  match.isLive && "border-l-4 border-[#ff3b30]"
                )}
              >
                {/* Event Detail - 5 columns */}
                <div className="col-span-5 flex items-start gap-5">
                  <div className="flex flex-col items-center min-w-[60px] pt-1">
                    <span className={cn(
                      "text-[13px] font-bold",
                      match.isLive ? "text-[#ff3b30]" : "text-white"
                    )}>
                      {match.time}
                    </span>
                    <span className="text-[10px] uppercase text-[#86868b] font-medium tracking-wider">{match.league}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white tracking-tight">{match.teams?.[0]}</span>
                      {match.isLive && match.score && (
                        <span className="text-[13px] font-bold text-[#ff3b30] tabular-nums ml-auto">{match.score?.[0]}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white tracking-tight">{match.teams?.[1]}</span>
                      {match.isLive && match.score && (
                        <span className="text-[13px] font-bold text-[#ff3b30] tabular-nums ml-auto">{match.score?.[1]}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Result - 3 columns */}
                <div className="col-span-3 grid grid-cols-3 gap-2">
                  <OddButton value={match.matchResult.home} movement={match.matchResultMovement?.home} />
                  <OddButton value={match.matchResult.draw} movement={match.matchResultMovement?.draw} />
                  <OddButton value={match.matchResult.away} movement={match.matchResultMovement?.away} />
                </div>

                {/* Total Goals - 2 columns */}
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  <OddButton value={match.totalGoals.over} movement={match.totalGoalsMovement?.over} />
                  <OddButton value={match.totalGoals.under} movement={match.totalGoalsMovement?.under} />
                </div>

                {/* Handicap - 2 columns */}
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  <OddButton value={match.handicap.home} movement={match.handicapMovement?.home} />
                  <OddButton value={match.handicap.away} movement={match.handicapMovement?.away} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-center pt-4">
        <button className="px-6 py-2 rounded-full text-[13px] font-semibold text-[#0071e3] bg-[#0071e3]/10 hover:bg-[#0071e3] hover:text-white transition-all">
          View all matches
        </button>
      </div>
    </div>
  );
}
