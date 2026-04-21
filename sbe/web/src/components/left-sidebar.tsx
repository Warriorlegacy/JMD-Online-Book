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
        "fixed left-0 top-0 h-screen w-16 z-40 flex flex-col",
        "bg-[#0b1e2e] border-r border-[#162a3d]"
      )}
    >
      {/* Search Bar */}
      <div className="p-3 pb-2">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748b] text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full h-10 rounded-lg pl-9 pr-3 text-sm",
              "bg-[#162a3d] text-white placeholder:text-[#64748b]",
              "border border-transparent focus:border-[#0071e3]/40",
              "outline-none transition-all duration-200"
            )}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 custom-scrollbar">
        {/* Top Leagues Section */}
        <div className="px-2 py-2">
          <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#64748b] mb-1">
            Top Leagues
          </p>
          <div className="space-y-0.5">
            {TOP_LEAGUES.map((league) => (
              <Link
                key={league.id}
                href={`/?sport=football&league=${league.id}`}
                className={cn(
                  "flex items-center h-10 px-2 rounded-md transition-all duration-150",
                  "group hover:bg-[#162a3d]/70",
                  activeLeague === league.id
                    ? "bg-[#162a3d] border-l-2 border-[#0071e3]"
                    : "border-l-2 border-transparent"
                )}
              >
                <span className="material-symbols-outlined text-[18px] min-w-[20px] text-center text-[#94a3b8] group-hover:text-white">
                  {league.icon}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#162a3d] mx-3 my-2" />

        {/* All Sports Section */}
        <div className="px-2 py-1">
          <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#64748b] mb-1">
            All Sports
          </p>
          <div className="space-y-0.5">
            {SPORTS.map((sport) => (
              <Link
                key={sport.id}
                href={`/?sport=${sport.id}`}
                className={cn(
                  "flex items-center h-10 px-2 rounded-md transition-all duration-150 relative",
                  "group hover:bg-[#162a3d]/70",
                  activeSport === sport.id
                    ? "bg-[#162a3d] border-l-2 border-[#0071e3]"
                    : "border-l-2 border-transparent"
                )}
              >
                <span className="material-symbols-outlined text-[18px] min-w-[20px] text-center transition-colors duration-150">
                  {sport.icon}
                </span>
                {sport.count > 0 && (
                  <span className={cn(
                    "absolute right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-medium",
                    activeSport === sport.id
                      ? "bg-[#0071e3] text-white"
                      : "bg-[#1e3a5f] text-[#94a3b8]"
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
      <div className="p-3 pt-2 border-t border-[#162a3d]">
        <button className={cn(
          "w-full h-10 rounded-lg flex items-center justify-center gap-1.5",
          "bg-[#162a3d] hover:bg-[#1e3a5f] transition-all duration-200",
          "text-[#94a3b8] hover:text-white text-sm font-medium"
        )}>
          <span className="material-symbols-outlined text-lg">grid_view</span>
          <span className="text-xs font-semibold uppercase tracking-wider">All Sports</span>
        </button>
      </div>
    </aside>
  );
}
