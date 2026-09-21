"use client";

import type { Match } from "@/types";

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    scheduled: "bg-white/5 text-white/40 border border-white/10",
    in_play: "bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,113,227,0.2)]",
    completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
  };
  const style = statusStyles[status] || statusStyles.scheduled;
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${style}`}>
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
    <div className="p-8 rounded-3xl glass border border-white/5 hover:bg-white/5 transition-all group relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
           <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:border-primary/30 transition-all">
              <span className="text-2xl font-bold italic">{String(match?.teamA || 'T')[0]}{String(match?.teamB || 'C')[0]}</span>
           </div>
           <div>
              <div className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                {match.teamA} <span className="text-[10px] text-white/20 not-italic font-bold">VS</span> {match.teamB}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{match.tournamentName}</span>
                <div className="w-1 h-1 rounded-full bg-white/10" />
                <span className="text-[10px] font-mono text-white/20">{new Date(match.startTime).toLocaleString()}</span>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
          <StatusBadge status={match.status} />
          <div className="flex gap-2">
            {match.status === "scheduled" && (
              <button
                onClick={() => onSetInPlay(match.id)}
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(0,113,227,0.3)]"
              >
                GO LIVE
              </button>
            )}
            {match.status === "in_play" && (
              <button
                onClick={() => onSettle(match.id)}
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                SETTLE
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}