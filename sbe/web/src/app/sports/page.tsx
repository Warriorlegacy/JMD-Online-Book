"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useBetSlip } from "@/context/bet-slip-context";
import { useSocket } from "@/context/socket-context";
import { Match, SportCategory, PriceLevel, MatchStatus } from "@/types";
import { Loader2 } from "lucide-react";

type SportTab = SportCategory | "all";

const SPORT_TABS: { value: SportTab; label: string }[] = [
  { value: "all", label: "All Sports" },
  { value: "cricket", label: "Cricket" },
  { value: "football", label: "Football" },
  { value: "tennis", label: "Tennis" },
  { value: "horse_racing", label: "Horse Racing" },
  { value: "other", label: "Other" },
];

const getSportIcon = (sport: SportCategory): string => {
  const icons: Record<SportCategory, string> = {
    cricket: "🏏",
    football: "⚽",
    tennis: "🎾",
    horse_racing: "🐎",
    casino: "🎰",
    other: "🎯",
  };
  return icons[sport] || "🎯";
};

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const StatusBadge = ({ status }: { status: MatchStatus }) => {
  const styles: Record<MatchStatus, string> = {
    scheduled: "bg-slate-800 text-slate-400",
    in_play: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    completed: "bg-blue-500/10 text-blue-400",
    cancelled: "bg-red-500/10 text-red-400",
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${styles[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
};

export default function SportsPage() {
  const { setSelection } = useBetSlip();

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSport, setActiveSport] = useState<SportTab>("all");
  const [orderbooks, setOrderbooks] = useState<Record<string, { backs: PriceLevel[]; lays: PriceLevel[] }>>({});
  const { connected, subscribe, on } = useSocket();

   // Initial fetch + polling every 30 seconds
   useEffect(() => {
     async function fetchMatches() {
       try {
         const res = await fetch("/api/matches");
         if (res.ok) {
           const data = await res.json();
           if (Array.isArray(data)) {
             setMatches(data);
           } else if (data && typeof data === "object" && "id" in data) {
             // Backend returned a single match — wrap in array for consistent typing
             setMatches([data as Match]);
           }
         }
       } catch (err) {
         console.error("Failed to fetch matches:", err);
       } finally {
         setLoading(false);
       }
     }

     fetchMatches();
     const interval = setInterval(fetchMatches, 30000);
     return () => clearInterval(interval);
   }, []);

   // Subscribe to orderbook updates for all matches
   useEffect(() => {
     if (!connected) return;
     matches.forEach((m) => subscribe(m.id));
   }, [connected, matches, subscribe]);

   // Listen to orderbook_update events
   useEffect(() => {
     if (!connected) return;
     const unsub = on<{
       room: string;
       snapshot: { backs: [string, number][]; lays: [string, number][] };
     }>(
       "orderbook_update",
       (data) => {
         setOrderbooks((prev) => ({
           ...prev,
           [data.room]: {
             backs: (data.snapshot?.backs || []).map(([p, s]) => ({ price: p, size: s })),
             lays: (data.snapshot?.lays || []).map(([p, s]) => ({ price: p, size: s })),
           },
         }));
       }
     );
     return () => unsub();
   }, [connected, on]);

   const getDisplayLevels = (matchId: string) => {
     const ob = orderbooks[matchId] || { backs: [], lays: [] };
     const validBacks = ob.backs.filter((l) => !isNaN(parseFloat(l.price)));
     validBacks.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
     const backs = validBacks.slice(0, 3);
     while (backs.length < 3) backs.push({ price: "—", size: 0 });

     const validLays = ob.lays.filter((l) => !isNaN(parseFloat(l.price)));
     validLays.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
     const lays = validLays.slice(0, 3);
     while (lays.length < 3) lays.push({ price: "—", size: 0 });

     return { backs, lays };
   };

   const handleBackClick = (match: Match, level: PriceLevel) => {
     if (!level.price || level.price === "—") return;
     setSelection({
       matchId: match.id,
       matchName: `${match.teamA} v ${match.teamB}`,
       marketName: "Match Odds",
       selectionId: match.teamA,
       selectionName: match.teamA,
       odds: parseFloat(level.price),
       side: "back",
     });
   };

   const handleLayClick = (match: Match, level: PriceLevel) => {
     if (!level.price || level.price === "—") return;
     setSelection({
       matchId: match.id,
       matchName: `${match.teamA} v ${match.teamB}`,
       marketName: "Match Odds",
       selectionId: match.teamB,
       selectionName: match.teamB,
       odds: parseFloat(level.price),
       side: "lay",
     });
   };

  // Normalize fields: API may use snake_case in some endpoints
  function normalizeMatch(m: any): Match {
    return {
      id: m.id,
      tournamentId: m.tournamentId || m.tournament_id || "",
      tournamentName: m.tournamentName || m.tournament_name || "",
      teamA: m.teamA || m.team_a || "Team A",
      teamB: m.teamB || m.team_b || "Team B",
      startTime: m.startTime || m.start_time || new Date().toISOString(),
      status: m.status,
      sportType: m.sportType || m.sport_type || "other",
      score: m.score,
      elapsedMinutes: m.elapsedMinutes || m.elapsed_minutes,
    };
  }

  const normalizedMatches = matches.map(normalizeMatch);
  const filteredNormalized = activeSport === "all"
    ? normalizedMatches
    : normalizedMatches.filter((m) => m.sportType === activeSport);

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-white uppercase tracking-tight">Sports Markets</h1>
      </div>

      {/* Sport Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {SPORT_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveSport(tab.value)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeSport === tab.value
                ? "bg-cyan-500 text-white"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Match List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </div>
      ) : filteredNormalized.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <p className="text-2xl">🏏</p>
          <p className="text-slate-400 text-sm">No matches available for this category</p>
        </div>
      ) : (
        <>
           {/* Mobile: Stacked Cards */}
           <div className="block md:hidden space-y-4">
             {filteredNormalized.map((match) => {
               const { backs, lays } = getDisplayLevels(match.id);
               const bestBack = backs[0];
               const bestLay = lays[0];

               return (
                <div
                  key={match.id}
                  className="p-4 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-all"
                >
                  {/* Header: sport + tournament + status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getSportIcon(match.sportType)}</span>
                      <span className="text-xs text-slate-500 uppercase">
                        {match.tournamentName || "Tournament"}
                      </span>
                    </div>
                    <StatusBadge status={match.status} />
                  </div>

                  {/* Teams */}
                  <div className="text-center mb-3">
                    <div className="text-lg font-black text-white uppercase italic">
                      {match.teamA} v {match.teamB}
                    </div>
                    {/* Start time */}
                    <div className="text-xs text-slate-500 mt-1">
                      {formatTime(match.startTime)}
                    </div>
                    {match.status === "in_play" && match.score && (
                      <div className="text-sm text-slate-400 mt-1">
                        {match.score.teamA} - {match.score.teamB} ({match.elapsedMinutes}')
                      </div>
                    )}
                  </div>

                   {/* Odds */}
                   <div className="grid grid-cols-2 gap-2">
                     <button
                       onClick={() => handleBackClick(match, bestBack)}
                       disabled={!bestBack.price || bestBack.price === "—"}
                       className={`p-3 rounded-xl border transition-all ${
                         bestBack.price && bestBack.price !== "—"
                           ? "bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20"
                           : "bg-white/5 border-white/5 text-slate-600 cursor-not-allowed"
                       }`}
                     >
                       <div className="text-[10px] uppercase text-slate-500">Back</div>
                       <div className="text-lg font-bold">{bestBack?.price || "—"}</div>
                     </button>
                     <button
                       onClick={() => handleLayClick(match, bestLay)}
                       disabled={!bestLay.price || bestLay.price === "—"}
                       className={`p-3 rounded-xl border transition-all ${
                         bestLay.price && bestLay.price !== "—"
                           ? "bg-pink-500/10 border-pink-500/20 text-pink-300 hover:bg-pink-500/20"
                           : "bg-white/5 border-white/5 text-slate-600 cursor-not-allowed"
                       }`}
                     >
                       <div className="text-[10px] uppercase text-slate-500">Lay</div>
                       <div className="text-lg font-bold">{bestLay?.price || "—"}</div>
                     </button>
                   </div>

                  {/* Link to detail */}
                  <Link
                    href={`/match/${match.id}`}
                    className="block text-center mt-3 text-xs text-cyan-400 hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Desktop: Table View */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/40">
            <table className="w-full text-left">
               <thead className="bg-white/5">
                 <tr className="text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-white/5">
                   <th className="py-3 px-4">Sport</th>
                   <th className="py-3 px-4">Tournament</th>
                   <th className="py-3 px-4">Teams</th>
                   <th className="py-3 px-4">Start Time</th>
                   <th className="py-3 px-4">Status</th>
                   <th className="py-3 px-4 text-center">
                     <div className="flex flex-col items-center">
                       <span>Back</span>
                       <span className="text-[8px] font-normal text-slate-600">3 levels</span>
                     </div>
                   </th>
                   <th className="py-3 px-4 text-center">
                     <div className="flex flex-col items-center">
                       <span>Lay</span>
                       <span className="text-[8px] font-normal text-slate-600">3 levels</span>
                     </div>
                   </th>
                 </tr>
               </thead>
              <tbody className="divide-y divide-white/5">
                 {filteredNormalized.map((match) => {
                   const { backs, lays } = getDisplayLevels(match.id);
                   return (
                     <tr key={match.id} className="hover:bg-white/5 transition-colors group">
                       <td className="py-4 px-4 text-lg">
                         {getSportIcon(match.sportType)}
                       </td>
                       <td className="py-4 px-4 text-xs text-slate-500 uppercase">
                         {match.tournamentName || "Tournament"}
                       </td>
                       <td className="py-4 px-4">
                         <div className="text-sm font-black text-white uppercase italic">
                           {match.teamA} v {match.teamB}
                         </div>
                         {match.status === "in_play" && match.score && (
                           <div className="text-xs text-slate-400 mt-1">
                             {match.score.teamA} - {match.score.teamB} ({match.elapsedMinutes}')
                           </div>
                         )}
                       </td>
                       <td className="py-4 px-4 text-xs text-slate-500">
                         {formatTime(match.startTime)}
                       </td>
                       <td className="py-4 px-4">
                         <StatusBadge status={match.status} />
                       </td>
                       <td className="py-2 px-2">
                         <div className="grid grid-cols-3 gap-1">
                           {backs.map((lvl, i) => (
                             <button
                               key={i}
                               onClick={() => handleBackClick(match, lvl)}
                               disabled={!lvl.price || lvl.price === "—"}
                               className={`h-10 w-full flex flex-col items-center justify-center rounded-lg border transition-all ${
                                 lvl.price && lvl.price !== "—"
                                   ? "bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20"
                                   : "bg-white/5 border-white/5 text-slate-600 cursor-not-allowed"
                               }`}
                             >
                               <div className="text-[8px] text-slate-500">{lvl.size > 0 ? `$${lvl.size.toLocaleString()}` : ""}</div>
                               <div className="text-sm font-bold">{lvl.price}</div>
                             </button>
                           ))}
                         </div>
                       </td>
                       <td className="py-2 px-2">
                         <div className="grid grid-cols-3 gap-1">
                           {lays.map((lvl, i) => (
                             <button
                               key={i}
                               onClick={() => handleLayClick(match, lvl)}
                               disabled={!lvl.price || lvl.price === "—"}
                               className={`h-10 w-full flex flex-col items-center justify-center rounded-lg border transition-all ${
                                 lvl.price && lvl.price !== "—"
                                   ? "bg-pink-500/10 border-pink-500/20 text-pink-300 hover:bg-pink-500/20"
                                   : "bg-white/5 border-white/5 text-slate-600 cursor-not-allowed"
                               }`}
                             >
                               <div className="text-[8px] text-slate-500">{lvl.size > 0 ? `$${lvl.size.toLocaleString()}` : ""}</div>
                               <div className="text-sm font-bold">{lvl.price}</div>
                             </button>
                           ))}
                         </div>
                       </td>
                     </tr>
                   );
                 })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
