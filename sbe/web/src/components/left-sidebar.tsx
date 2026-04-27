"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface Sport {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface League {
  id: string;
  name: string;
  icon: string;
}

const SPORTS: Sport[] = [
  { id: "football", name: "Football", icon: "sports_soccer", count: 0 },
  { id: "basketball", name: "Basketball", icon: "sports_basketball", count: 0 },
  { id: "tennis", name: "Tennis", icon: "sports_tennis", count: 0 },
  { id: "hockey", name: "Hockey", icon: "sports_hockey", count: 0 },
  { id: "baseball", name: "Baseball", icon: "sports_baseball", count: 0 },
  { id: "cricket", name: "Cricket", icon: "sports_cricket", count: 0 },
  { id: "mma", name: "MMA", icon: "sports_mma", count: 0 },
  { id: "esports", name: "Esports", icon: "sports_esports", count: 0 },
];

const TOP_LEAGUES: League[] = [
  { id: "premier-league", name: "Premier League", icon: "shield" },
  { id: "champions-league", name: "Champions League", icon: "trophy" },
  { id: "laliga", name: "La Liga", icon: "sports_soccer" },
  { id: "bundesliga", name: "Bundesliga", icon: "sports_soccer" },
  { id: "serie-a", name: "Serie A", icon: "sports_soccer" },
];

export function LeftSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const activeSport = searchParams.get("sport") || "football";
  const activeLeague = searchParams.get("league") || "premier-league";

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen w-64 z-40 flex flex-col pt-16",
        "bg-black/60 backdrop-blur-2xl border-r border-white/5 shadow-2xl"
      )}
    >
      {/* Search Bar */}
      <div className="p-4 pb-2">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#86868b] text-lg transition-colors group-focus-within:text-white">
            search
          </span>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-9 rounded-xl pl-10 pr-3 text-[13px] font-medium",
              "bg-white/5 text-white placeholder:text-[#86868b]",
              "border border-transparent focus:border-[#0071e3]/40 focus:bg-white/[0.08]",
              "outline-none transition-all duration-200"
            )}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
        {/* Top Leagues Section */}
        <div className="px-3 mb-6">
          <p className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#86868b] mb-1">
            Top Leagues
          </p>
          <div className="space-y-0.5">
            {TOP_LEAGUES.map((league) => (
              <Link
                key={league.id}
                href={`/?sport=football&league=${league.id}`}
                className={cn(
                  "flex items-center gap-3 h-9 px-4 rounded-lg transition-all duration-200",
                  "group",
                  activeLeague === league.id
                    ? "bg-white/10 text-white"
                    : "text-[#86868b] hover:bg-white/5 hover:text-white"
                )}
              >
                <span className="material-symbols-outlined text-[18px] opacity-80 group-hover:opacity-100">
                  {league.icon}
                </span>
                <span className="text-[13px] font-medium">{league.name}</span>
                {activeLeague === league.id && (
                  <div className="ml-auto w-1 h-1 rounded-full bg-[#0071e3]" />
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* All Sports Section */}
        <div className="px-3">
          <p className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-[#86868b] mb-1">
            All Sports
          </p>
          <div className="space-y-0.5">
            {SPORTS.map((sport) => (
              <Link
                key={sport.id}
                href={`/?sport=${sport.id}`}
                className={cn(
                  "flex items-center gap-3 h-9 px-4 rounded-lg transition-all duration-200 relative group",
                  activeSport === sport.id
                    ? "bg-white/10 text-white"
                    : "text-[#86868b] hover:bg-white/5 hover:text-white"
                )}
              >
                <span className="material-symbols-outlined text-[18px] opacity-80 group-hover:opacity-100">
                  {sport.icon}
                </span>
                <span className="text-[13px] font-medium">{sport.name}</span>
                {sport.count > 0 && (
                  <span className={cn(
                    "ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[20px] text-center",
                    activeSport === sport.id
                      ? "bg-[#0071e3] text-white"
                      : "bg-white/5 text-[#86868b] group-hover:text-white"
                  )}>
                    {sport.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* View All Sports Button */}
      <div className="p-4 border-t border-white/5">
        <button className={cn(
          "w-full h-10 rounded-full flex items-center justify-center gap-2",
          "bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 transition-all duration-200",
          "text-white text-[13px] font-semibold"
        )}>
          <span className="material-symbols-outlined text-[18px]">grid_view</span>
          <span>More Sports</span>
        </button>
      </div>
    </aside>
  );
}
