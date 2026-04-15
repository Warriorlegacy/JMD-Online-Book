"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Match {
  id: string;
  team_a: string;
  team_b: string;
  status: string;
  start_time: string;
}

export default function SportsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMatches(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 py-4">
      <h1 className="text-2xl font-black text-white uppercase tracking-tight">Sports Markets</h1>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <p className="text-2xl">⚽</p>
          <p className="text-slate-400 text-sm">No matches available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map(m => (
            <Link key={m.id} href={`/?match=${m.id}`}
              className="block rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">{m.team_a} v {m.team_b}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(m.start_time).toLocaleString()}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${m.status === "in_play" ? "bg-green-500/10 text-green-400" : "bg-slate-800 text-slate-400"}`}>
                  {m.status === "in_play" ? "LIVE" : m.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
