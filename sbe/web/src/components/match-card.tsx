"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Radio } from "lucide-react";

export interface MatchCardProps {
  match: {
    id: string;
    teamA: string;
    teamB: string;
    startTime: string;
    status: "scheduled" | "in_play" | "completed" | "cancelled";
    sportType: string;
    score?: { teamA: string; teamB: string };
    league?: string;
    odds?: {
      selection: string;
      back: number;
      lay: number;
    }[];
  };
  className?: string;
}

export function MatchCard({ match, className }: MatchCardProps) {
  const isLive = match.status === "in_play";

  return (
    <div 
      className={cn(
        "group relative flex flex-col p-5 rounded-2xl glass-card transition-all duration-500 hover:translate-y-[-4px]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ff3b30]/10 border border-[#ff3b30]/20">
              <Radio className="w-3 h-3 text-[#ff3b30] animate-pulse" />
              <span className="text-[10px] font-bold text-[#ff3b30] uppercase tracking-wider">Live</span>
            </div>
          ) : (
            <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider">
              {new Date(match.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <span className="text-[10px] text-[#86868b] uppercase tracking-widest">{match.league || match.sportType}</span>
        </div>
        <button className="text-[#86868b] hover:text-white transition-colors">
          <span className="material-symbols-outlined text-[18px]">more_horiz</span>
        </button>
      </div>

      {/* Teams & Score */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
              {(match.teamA || "T1").substring(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">{match.teamA}</span>
          </div>
          {isLive && <span className="text-lg font-bold text-white tabular-nums">{match.score?.teamA || "0"}</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
              {(match.teamB || "T2").substring(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">{match.teamB}</span>
          </div>
          {isLive && <span className="text-lg font-bold text-white tabular-nums">{match.score?.teamB || "0"}</span>}
        </div>
      </div>

      {/* Odds Grid */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-[#86868b] uppercase tracking-widest pl-1">Back</span>
          <button className="h-10 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 hover:bg-[#0071e3] hover:border-[#0071e3] group/btn transition-all duration-300">
            <span className="text-[13px] font-bold text-[#0071e3] group-hover/btn:text-white transition-colors">
              {match.odds?.[0]?.back?.toFixed(2) || "2.10"}
            </span>
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-[#86868b] uppercase tracking-widest pl-1 text-right">Lay</span>
          <button className="h-10 rounded-xl bg-[#ff375f]/10 border border-[#ff375f]/20 hover:bg-[#ff375f] hover:border-[#ff375f] group/btn transition-all duration-300">
            <span className="text-[13px] font-bold text-[#ff375f] group-hover/btn:text-white transition-colors">
              {match.odds?.[0]?.lay?.toFixed(2) || "2.14"}
            </span>
          </button>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0071e3]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
