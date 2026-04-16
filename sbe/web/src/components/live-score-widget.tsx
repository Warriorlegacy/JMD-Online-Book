"use client";

import type { Match } from "@/types";

interface LiveScoreWidgetProps {
  match: Match;
}

export function LiveScoreWidget({ match }: LiveScoreWidgetProps) {
  const formatOvers = (match: Match): string => {
    const overs = (match as unknown as { overs?: number }).overs;
    return overs !== undefined ? overs.toFixed(1) : "";
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-white/5">
      {/* Team A */}
      <div className="text-center flex-1">
        <div className="text-sm font-bold text-slate-300 uppercase tracking-wide">
          {match.teamA}
        </div>
        <div className="text-2xl font-black text-white mt-1">
          {match.score?.teamA || "0"}
        </div>
      </div>

      {/* VS / Status */}
      <div className="px-6 text-center">
        <div className="flex items-center gap-2 justify-center">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
            LIVE
          </span>
        </div>
        <div className="text-lg font-bold text-slate-500 mt-1">
          {match.elapsedMinutes}'
          {match.sportType === 'cricket' && ` • ${formatOvers(match)}`}
        </div>
      </div>

      {/* Team B */}
      <div className="text-center flex-1">
        <div className="text-sm font-bold text-slate-300 uppercase tracking-wide">
          {match.teamB}
        </div>
        <div className="text-2xl font-black text-white mt-1">
          {match.score?.teamB || "0"}
        </div>
      </div>
    </div>
  );
}
