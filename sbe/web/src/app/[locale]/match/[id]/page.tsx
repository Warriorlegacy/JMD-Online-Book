"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useSocket } from "@/context/socket-context";
import { useBetSlip } from "@/context/bet-slip-context";
import type { Match, MatchStatus, PriceLevel, BetSelection } from "@/types";
import { OrderBook } from "@/components/order-book";
import PriceLadder from "@/components/price-ladder";
import { MarketChart } from "@/components/market-chart";
import { LiveScoreWidget } from "@/components/live-score-widget";

interface OrderbookUpdate {
  room: string;
  selectionId: string;
  snapshot: {
    backs: [string, number][];
    lays: [string, number][];
  };
}

const normalizeMatch = (m: any): Match => ({
  id: m.id,
  tournamentId: m.tournamentId || m.tournament_id || "",
  tournamentName: m.tournamentName || m.tournament_name || "",
  teamA: m.teamA || m.team_a || "Team A",
  teamB: m.teamB || m.team_b || "Team B",
  startTime: m.startTime || m.start_time || new Date().toISOString(),
  status: m.status || "scheduled",
  sportType: m.sportType || m.sport_type || "other",
  score: m.score ? { teamA: String(m.score.teamA), teamB: String(m.score.teamB) } : undefined,
  elapsedMinutes: m.elapsedMinutes || m.elapsed_minutes,
});

const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const StatusBadge = ({ status }: { status: Match["status"] }) => {
  const styles: Record<Match["status"], string> = {
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

export default function MatchPage({ params }: { params: { id: string } }) {
  const matchId = params.id;
  const { connected, subscribe, on } = useSocket();
  const { setSelection } = useBetSlip();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderBooks, setOrderBooks] = useState<Record<string, { backs: PriceLevel[]; lays: PriceLevel[] }>>({});

  // Fetch match data with polling
  useEffect(() => {
    let cancelled = false;
    // Reset order books when match changes
    setOrderBooks({});
    setLoading(true);
    async function fetchMatch() {
      try {
        const res = await fetch(`/api/matches/${matchId}`);
        if (res.ok) {
          const data = await res.json();
          const normalized = normalizeMatch(data);
          if (!cancelled) setMatch(normalized);
        }
      } catch (error) {
        console.error("Failed to fetch match:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchMatch();
    const interval = setInterval(fetchMatch, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [matchId]);

  // WebSocket updates for orderbook
  useEffect(() => {
    if (!connected) return;
    subscribe(matchId);
    const unsubOrderbook = on<OrderbookUpdate>("orderbook_update", (data) => {
      if (data.room === matchId) {
        setOrderBooks(prev => ({
          ...prev,
          [data.selectionId || "team_a"]: {
            backs: data.snapshot.backs.map(([p, s]) => ({ price: p, size: s })),
            lays: data.snapshot.lays.map(([p, s]) => ({ price: p, size: s })),
          }
        }));
      }
    });
    return () => {
      unsubOrderbook();
    };
  }, [connected, subscribe, on, matchId]);

  // Subscribe to match updates (score/status)
  useEffect(() => {
    if (!connected) return;
    subscribe(matchId);
    const unsub = on<{ status: string; score?: {teamA: string, teamB: string}; elapsedMinutes?: number }>("match_update", (data) => {
      setMatch(prev => prev ? { ...prev, ...data, status: data.status as MatchStatus } : prev);
    });
    return () => { unsub(); };
  }, [connected, subscribe, on, matchId]);

  const handleSelect = (sel: BetSelection) => {
    setSelection({
      matchId: sel.matchId,
      matchName: match ? `${match.teamA} v ${match.teamB}` : sel.matchTitle,
      marketName: "Match Odds",
      selectionId: sel.selectionName === (match?.teamA || "Team A") ? "team_a" : 
                   sel.selectionName === (match?.teamB || "Team B") ? "team_b" : "draw",
      selectionName: sel.selectionName,
      odds: sel.odds,
      side: sel.side,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-20 text-slate-500">
        Match not found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8">
      {/* Main content: OrderBook + Chart (8 cols on desktop) */}
      <div className="col-span-1 md:col-span-8 space-y-6">
        {/* Match header */}
        <div>
          <h1 className="text-2xl font-black text-white uppercase italic">
            {match.teamA} v {match.teamB}
          </h1>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className="text-sm text-slate-500">{match.tournamentName || ""}</span>
            <StatusBadge status={match.status} />
            <span className="text-sm text-slate-500">• {formatDateTime(match.startTime)}</span>
          </div>
        </div>

        {/* Live score if in play */}
        {match.status === "in_play" && <LiveScoreWidget match={match} />}

        {/* Order Book */}
        <OrderBook
          matchId={match.id}
          orderBooks={orderBooks}
          matchTitle={`${match.teamA} v ${match.teamB}`}
          teams={[match.teamA, match.teamB]}
          onSelect={handleSelect}
        />

        {/* Market Chart */}
        <MarketChart matchId={match.id} />
      </div>

      {/* Sidebar: PriceLadder (4 cols on desktop) */}
      <div className="col-span-1 md:col-span-4 space-y-6 md:sticky md:top-24 h-fit">
        <div className="h-96 rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden">
          <PriceLadder
            matchId={match.id}
            orderBooks={orderBooks}
            teams={[match.teamA, match.teamB]}
            onSelect={handleSelect}
          />
        </div>
        {/* BetSlip is already global, rendered by layout as sidebar on desktop */}
      </div>
    </div>
  );
}
