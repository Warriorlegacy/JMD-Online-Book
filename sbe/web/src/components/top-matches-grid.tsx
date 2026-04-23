"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

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

const mockMatches: Match[] = [
  {
    id: "1",
    time: "19:45",
    isLive: true,
    league: "Premier League",
    teams: ["Manchester United", "Liverpool"],
    score: [2, 1],
    matchResult: { home: 2.10, draw: 3.40, away: 3.75 },
    matchResultMovement: { home: 'up', draw: null, away: 'down' },
    totalGoals: { line: 2.5, over: 1.85, under: 1.95 },
    totalGoalsMovement: { over: 'up', under: null },
    handicap: { line: 0, home: 1.90, away: 1.90 },
    handicapMovement: { home: null, away: 'down' },
  },
  {
    id: "2",
    time: "20:00",
    isLive: false,
    league: "La Liga",
    teams: ["Real Madrid", "Barcelona"],
    matchResult: { home: 2.25, draw: 3.20, away: 3.10 },
    totalGoals: { line: 2.5, over: 1.90, under: 1.90 },
    handicap: { line: -0.5, home: 2.05, away: 1.78 },
  },
  {
    id: "3",
    time: "21:15",
    isLive: false,
    league: "Bundesliga",
    teams: ["Bayern Munich", "Dortmund"],
    matchResult: { home: 1.75, draw: 3.80, away: 4.50 },
    totalGoals: { line: 3.0, over: 1.75, under: 2.10 },
    handicap: { line: -1, home: 2.10, away: 1.72 },
  },
  {
    id: "4",
    time: "22:30",
    isLive: false,
    league: "Serie A",
    teams: ["Inter Milan", "AC Milan"],
    matchResult: { home: 2.40, draw: 3.10, away: 2.90 },
    totalGoals: { line: 2.0, over: 1.80, under: 2.00 },
    handicap: { line: 0, home: 1.95, away: 1.85 },
  },
];

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
        "bg-[#0071e3] text-white hover:bg-[#0077ed] active:scale-[0.98]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-1",
        className
      )}
    >
      <span>{value.toFixed(2)}</span>
      {movement && (
        <span className={cn(
          "text-xs transition-all",
          movement === 'up' ? "text-emerald-300" : "text-rose-300"
        )}>
          {movement === 'up' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
        </span>
      )}
    </button>
  );
}

export function TopMatchesGrid({ matches: initialMatches }: TopMatchesGridProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [matches, setMatches] = useState<Match[]>(initialMatches || mockMatches);
  const [isLoading, setIsLoading] = useState(!initialMatches);

  React.useEffect(() => {
    if (initialMatches) return;
    
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/matches/active");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        // Transform API data to Match interface if needed
        // For now, if it returns the DEMO_MATCH or array of matches
        const activeMatches = Array.isArray(data) ? data : [data];
        
        // Map backend fields to frontend interface
        const mappedMatches: Match[] = activeMatches.map((m: any) => ({
          id: m.id,
          time: new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isLive: m.status === 'in_play',
          league: JSON.parse(m.metadata || '{}').round || "International",
          teams: [m.team_a, m.team_b],
          matchResult: { home: 2.0, draw: 3.5, away: 3.5 }, // Default odds if not in API
          totalGoals: { line: 2.5, over: 1.9, under: 1.9 },
          handicap: { line: 0, home: 1.9, away: 1.9 },
        }));

        setMatches(mappedMatches);
      } catch (error) {
        console.error("Failed to load active matches:", error);
        setMatches(mockMatches);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [initialMatches]);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-[#1d1d1f] rounded-xl">
        <div className="w-6 h-6 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }


  return (
    <div className="w-full rounded-xl overflow-hidden bg-[#1d1d1f]">
      {/* Tab Navigation */}
      <div className="flex border-b border-white/5 px-3 py-2 gap-1 overflow-x-auto">
        {marketTabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(index)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              activeTab === index
                ? "bg-[#0071e3] text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid Header */}
      <div className="hidden lg:grid grid-cols-12 px-4 py-2 border-b border-white/5 text-xs font-medium uppercase tracking-wider text-white/40">
        <div className="col-span-5 pl-2">Event</div>
        <div className="col-span-3 text-center">1X2</div>
        <div className="col-span-2 text-center">Total Goals</div>
        <div className="col-span-2 text-center">Handicap</div>
      </div>

      {/* Match Rows */}
      <div className="divide-y divide-white/5">
        {matches.map((match) => (
          <div
            key={match.id}
            className={cn(
              "grid grid-cols-1 lg:grid-cols-12 gap-3 px-4 py-3 transition-all duration-200",
              "bg-[#272729] hover:bg-[#2a2a2d]",
              match.isLive && "border-l-3 border-[#f59e0b]"
            )}
          >
            {/* Event Detail - 5 columns */}
            <div className="col-span-5 flex items-start gap-3">
              <div className="flex flex-col items-center min-w-[50px]">
                <span className={cn(
                  "text-sm font-medium",
                  match.isLive ? "text-[#f59e0b]" : "text-white/70"
                )}>
                  {match.isLive && <span className="mr-1 inline-block w-1.5 h-1.5 bg-[#f59e0b] rounded-full animate-pulse"></span>}
                  {match.time}
                </span>
                <span className="text-[10px] uppercase text-white/40 tracking-wider">{match.league}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white leading-tight">{match.teams[0]}</span>
                {match.isLive && match.score && (
                  <span className="text-xs font-bold text-white/90">{match.score[0]} - {match.score[1]}</span>
                )}
                <span className="text-sm font-medium text-white leading-tight">{match.teams[1]}</span>
              </div>
            </div>

            {/* Match Result - 3 columns */}
            <div className="col-span-3 grid grid-cols-3 gap-1">
              <OddButton value={match.matchResult.home} movement={match.matchResultMovement?.home} />
              <OddButton value={match.matchResult.draw} movement={match.matchResultMovement?.draw} />
              <OddButton value={match.matchResult.away} movement={match.matchResultMovement?.away} />
            </div>

            {/* Total Goals - 2 columns */}
            <div className="col-span-2 grid grid-cols-2 gap-1">
              <OddButton value={match.totalGoals.over} movement={match.totalGoalsMovement?.over} />
              <OddButton value={match.totalGoals.under} movement={match.totalGoalsMovement?.under} />
            </div>

            {/* Handicap - 2 columns */}
            <div className="col-span-2 grid grid-cols-2 gap-1">
              <OddButton value={match.handicap.home} movement={match.handicapMovement?.home} />
              <OddButton value={match.handicap.away} movement={match.handicapMovement?.away} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5 text-center">
        <button className="text-sm text-[#2997ff] font-medium hover:underline">
          View all matches →
        </button>
      </div>
    </div>
  );
}
