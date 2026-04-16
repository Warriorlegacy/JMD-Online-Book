"use client";

import { Flame, Trophy, Star, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamificationPanelProps {
  streak: number;
  level: number;
  xp: number;
  xpToNext: number;
  todayProfit?: number;
  totalWins?: number;
}

export function GamificationPanel({
  streak,
  level,
  xp,
  xpToNext,
  todayProfit = 0,
  totalWins = 0,
}: GamificationPanelProps) {
  const xpPercent = Math.min((xp / xpToNext) * 100, 100);

  return (
    <div className="space-y-3">
      {/* Streak */}
      <div className="flex items-center gap-3 rounded-[18px] bg-[#1c1c1e] px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(0,113,227,0.15)]">
          <Flame className="h-5 w-5 text-[#2997ff]" />
        </div>
        <div className="flex-1">
          <p className="text-[12px] text-[rgba(255,255,255,0.48)]">Daily Streak</p>
          <p className="text-[17px] font-semibold text-white">{streak} Days</p>
        </div>
        {streak >= 7 && (
          <span className="rounded-full bg-[rgba(0,113,227,0.15)] px-2 py-0.5 text-[12px] font-medium text-[#2997ff]">
            Hot
          </span>
        )}
      </div>

      {/* Level + XP */}
      <div className="rounded-[18px] bg-[#1c1c1e] px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(0,113,227,0.15)]">
              <Trophy className="h-4 w-4 text-[#2997ff]" />
            </div>
            <div>
              <p className="text-[12px] text-[rgba(255,255,255,0.48)]">Level</p>
              <p className="text-[14px] font-semibold text-white">Level {level}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[12px] text-[rgba(255,255,255,0.48)]">XP</p>
            <p className="text-[14px] font-semibold text-[#2997ff]">{xp} / {xpToNext}</p>
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
          <div
            className="h-full rounded-full bg-[#0071e3] transition-all duration-700"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[18px] bg-[#1c1c1e] px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <ChevronUp className={cn("h-4 w-4", todayProfit >= 0 ? "text-[#30d158]" : "text-[#ff453a]")} />
            <p className="text-[12px] text-[rgba(255,255,255,0.48)]">Today</p>
          </div>
          <p className={cn("text-[17px] font-semibold", todayProfit >= 0 ? "text-[#30d158]" : "text-[#ff453a]")}>
            {todayProfit >= 0 ? "+" : ""}₹{Math.abs(todayProfit).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-[18px] bg-[#1c1c1e] px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Star className="h-4 w-4 text-[#2997ff]" />
            <p className="text-[12px] text-[rgba(255,255,255,0.48)]">Total Wins</p>
          </div>
          <p className="text-[17px] font-semibold text-white">{totalWins}</p>
        </div>
      </div>
    </div>
  );
}
