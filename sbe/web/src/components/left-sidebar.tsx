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
  { id: "football", name: "Football", icon: "sports_soccer", count: 42 },
  { id: "basketball", name: "Basketball", icon: "sports_basketball", count: 28 },
  { id: "tennis", name: "Tennis", icon: "sports_tennis", count: 19 },
  { id: "hockey", name: "Hockey", icon: "sports_hockey", count: 12 },
  { id: "baseball", name: "Baseball", icon: "sports_baseball", count: 15 },
  { id: "cricket", name: "Cricket", icon: "sports_cricket", count: 8 },
  { id: "mma", name: "MMA", icon: "sports_mma", count: 6 },
  { id: "esports", name: "Esports", icon: "sports_esports", count: 34 },
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
        "bg-[#0b1e2e] border-r border-[#162a3d]"
      )}
    >
      {/* Search Bar */}
      <div className="p-4 pb-2">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-10 rounded-xl pl-10 pr-3 text-sm",
              "bg-[#162a3d] text-white placeholder:text-[#64748b]",
              "border border-transparent focus:border-[#0071e3]/40",
              "outline-none transition-all duration-200"
            )}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 custom-scrollbar">
        {/* Top Leagues Section */}
        <div className="px-3 py-2">
          <p className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#64748b] mb-2">
            Top Leagues
          </p>
          <div className="space-y-1">
            {TOP_LEAGUES.map((league) => (
              <Link
                key={league.id}
                href={`/?sport=football&league=${league.id}`}
                className={cn(
                  "flex items-center gap-3 h-11 px-3 rounded-xl transition-all duration-150",
                  "group hover:bg-[#162a3d]/70",
                  activeLeague === league.id
                    ? "bg-[#0071e3]/10 text-[#0071e3] border-l-2 border-[#0071e3]"
                    : "text-[#94a3b8] hover:text-white"
                )}
              >
                <span className="material-symbols-outlined text-[20px] min-w-[24px] text-center">
                  {league.icon}
                </span>
                <span className="text-xs font-bold uppercase tracking-tight">{league.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#162a3d] mx-4 my-3" />

        {/* All Sports Section */}
        <div className="px-3 py-2">
          <p className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#64748b] mb-2">
            All Sports
          </p>
          <div className="space-y-1">
            {SPORTS.map((sport) => (
              <Link
                key={sport.id}
                href={`/?sport=${sport.id}`}
                className={cn(
                  "flex items-center gap-3 h-11 px-3 rounded-xl transition-all duration-150 relative",
                  "group hover:bg-[#162a3d]/70",
                  activeSport === sport.id
                    ? "bg-[#0071e3]/10 text-[#0071e3] border-l-2 border-[#0071e3]"
                    : "text-[#94a3b8] hover:text-white"
                )}
              >
                <span className="material-symbols-outlined text-[20px] min-w-[24px] text-center">
                  {sport.icon}
                </span>
                <span className="text-xs font-bold uppercase tracking-tight">{sport.name}</span>
                {sport.count > 0 && (
                  <span className={cn(
                    "ml-auto min-w-[20px] h-5 flex items-center justify-center rounded-lg text-[9px] font-black px-1.5",
                    activeSport === sport.id
                      ? "bg-[#0071e3] text-white"
                      : "bg-[#162a3d] text-[#64748b]"
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
      <div className="p-4 border-t border-[#162a3d]">
        <button className={cn(
          "w-full h-11 rounded-xl flex items-center justify-center gap-2.5",
          "bg-[#0071e3] hover:bg-[#0064cc] active:scale-95 transition-all duration-200",
          "text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-[#0071e3]/10"
        )}>
          <span className="material-symbols-outlined text-lg">grid_view</span>
          <span>All Sports</span>
        </button>
      </div>
    </aside>
  );
}
