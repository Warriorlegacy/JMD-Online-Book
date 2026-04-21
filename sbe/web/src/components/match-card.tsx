"use client";

import { useState } from "react";
import { Clock, Activity } from "lucide-react";

export interface MatchOdds {
  back: number;
  lay: number;
  volume?: number;
}

export interface MatchCardProps {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  matchTime: Date;
  isLive?: boolean;
  odds: MatchOdds;
  onBackClick?: () => void;
  onLayClick?: () => void;
  onClick?: () => void;
}

export default function MatchCard({
  sport,
  homeTeam,
  awayTeam,
  matchTime,
  isLive = false,
  odds,
  onBackClick,
  onLayClick,
  onClick,
}: MatchCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
    }).format(date);
  };

  return (
    <div
      className="glass-card group cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
      }}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {sport}
          </span>
          {isLive && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#ff3b30]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(matchTime)} {formatTime(matchTime)}</span>
        </div>
      </div>

      {/* Teams Section */}
      <div className="px-4 py-5">
        <div className="flex flex-col gap-2 mb-5">
          <h3 className="text-base font-semibold text-foreground tracking-tight">
            {homeTeam}
          </h3>
          <div className="flex items-center justify-center">
            <div className="w-8 h-px bg-border/50" />
            <span className="mx-3 text-xs font-bold text-muted-foreground">
              VS
            </span>
            <div className="w-8 h-px bg-border/50" />
          </div>
          <h3 className="text-base font-semibold text-foreground tracking-tight">
            {awayTeam}
          </h3>
        </div>

        {/* Odds Buttons Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Back Button - Blue */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBackClick?.();
            }}
            className="relative overflow-hidden py-3 rounded-xl font-semibold text-sm text-white
                       bg-[#0071e3] transition-all duration-300
                       hover:bg-[#0077ed] hover:scale-[1.02] active:scale-[0.98]
                       focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 focus:ring-offset-1"
          >
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider opacity-80 mb-0.5">
                Back
              </span>
              <span className="text-lg font-bold leading-tight">
                {odds.back.toFixed(2)}
              </span>
            </div>
            <div
              className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"
            />
          </button>

          {/* Lay Button - Pink */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLayClick?.();
            }}
            className="relative overflow-hidden py-3 rounded-xl font-semibold text-sm text-white
                       bg-[#ff2d55] transition-all duration-300
                       hover:bg-[#ff375f] hover:scale-[1.02] active:scale-[0.98]
                       focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/40 focus:ring-offset-1"
          >
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider opacity-80 mb-0.5">
                Lay
              </span>
              <span className="text-lg font-bold leading-tight">
                {odds.lay.toFixed(2)}
              </span>
            </div>
            <div
              className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"
            />
          </button>
        </div>

        {/* Volume Indicator */}
        {odds.volume && (
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="w-3.5 h-3.5" />
            <span>
              {new Intl.NumberFormat("en-IN", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(odds.volume)}{" "}
              matched
            </span>
          </div>
        )}
      </div>

      {/* Bottom Hover Indicator */}
      <div
        className="h-1 bg-gradient-to-r from-[#0071e3] to-[#ff2d55] origin-left
                   transition-transform duration-300 ease-out"
        style={{
          transform: isHovered ? "scaleX(1)" : "scaleX(0)",
        }}
      />
    </div>
  );
}
