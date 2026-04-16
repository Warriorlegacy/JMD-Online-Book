"use client";

import type { Match } from "@/types";

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    scheduled: "bg-slate-800 text-slate-400",
    in_play: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    completed: "bg-blue-500/10 text-blue-400",
    cancelled: "bg-red-500/10 text-red-400",
  };
  const style = statusStyles[status] || statusStyles.scheduled;
  return (
    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${style}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export function AdminMatchRow({ match, onSetInPlay, onSettle, isProcessing = false }: {
  match: Match;
  onSetInPlay: (matchId: string) => void;
  onSettle: (matchId: string) => void;
  isProcessing?: boolean;
}) {
  return (
    <div className="p-4 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm font-black text-white uppercase italic">
            {match.teamA} v {match.teamB}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{match.tournamentName}</div>
        </div>
        <StatusBadge status={match.status} />
      </div>

      <div className="flex gap-2">
        {match.status === "scheduled" && (
          <button
            onClick={() => onSetInPlay(match.id)}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase border border-cyan-500/20 hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            Set Live
          </button>
        )}
        {match.status === "in_play" && (
          <button
            onClick={() => onSettle(match.id)}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-xl bg-pink-500/10 text-pink-400 text-[10px] font-bold uppercase border border-pink-500/20 hover:bg-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            Settle Match
          </button>
        )}
      </div>
    </div>
  );
}