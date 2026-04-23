"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/context/socket-context";
import { useBetSlip } from "@/context/bet-slip-context";
import type { Match, PriceLevel } from "@/types";
import { OrderBook } from "@/components/order-book";
import { MarketChart } from "@/components/market-chart";
import { LiveScoreWidget } from "@/components/live-score-widget";
import { LivePitch } from "@/components/live-pitch";
import { LiveCourt } from "@/components/live-court";
import { LiveTennisCourt } from "@/components/live-tennis-court";
import { Search, Bell, Settings, User, ChevronRight, Brain, Loader2, Bookmark } from "lucide-react";


// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderbookUpdate {
  room: string;
  selectionId: string;
  snapshot: { backs: [string, number][]; lays: [string, number][]; };
}

// ─── Static Enrichment Data ───────────────────────────────────────────────────
const SPORT_LEAGUES: Record<string, { label: string; icon: string }[]> = {
  football: [
    { label: "Football", icon: "⚽" },
    { label: "Basketball", icon: "🏀" },
    { label: "Tennis", icon: "🎾" },
    { label: "Cricket", icon: "🏏" },
    { label: "Esports", icon: "🎮" },
    { label: "Formula 1", icon: "🏎️" },
  ],
};


const DEMO_FORM_A = ["W", "W", "D", "L", "W"] as const;
const DEMO_FORM_B = ["W", "W", "W", "D", "W"] as const;

const DEMO_PLAYER_STATS = [
  { name: "Vini Jr.", team: "Team A", role: "FWD", xg: 0.84 },
  { name: "E. Haaland", team: "Team B", role: "FWD", xg: 1.12 },
];

const TACTICAL_BARS = [32, 38, 44, 50, 55, 60, 64, 70, 75, 80, 85];

function FormBadge({ result }: { result: "W" | "D" | "L" }) {
  const styles = {
    W: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    D: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    L: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black border ${styles[result]}`}>
      {result}
    </div>
  );
}

function TacticalPressureChart({ teamALabel, teamBLabel }: { teamALabel: string; teamBLabel: string }) {
  const maxVal = Math.max(...TACTICAL_BARS);
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-white/30 uppercase">
          <span className="w-2 h-2 rounded-full bg-[#0071e3] inline-block mr-1" />{teamALabel.split(" ").pop()}
        </span>
        <span className="text-[10px] font-bold text-white/30 uppercase">
          <span className="w-2 h-2 rounded-full bg-white/20 inline-block mr-1" />{teamBLabel.split(" ").pop()}
        </span>
      </div>
      <div className="flex items-end gap-1 h-28 mt-3">
        {TACTICAL_BARS.map((v, i) => {
          const isA = i < TACTICAL_BARS.length / 2;
          const isHT = i === Math.floor(TACTICAL_BARS.length / 2);
          return (
            <div key={i} className="relative flex-1 flex flex-col items-center">
              {isHT && (
                <div className="absolute -top-5 text-[8px] text-white/20 font-bold uppercase">HT</div>
              )}
              <div
                className="w-full rounded-t-sm transition-all duration-500"
                style={{
                  height: `${(v / maxVal) * 100}%`,
                  background: isA
                    ? "rgba(0,113,227,0.5)"
                    : isHT
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(255,255,255,0.15)",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
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
  metadata: m.metadata || "{}",
});

// ─── Main Component ──────────────────────────────────────────────────────────
export default function MatchPage({ params }: { params: { id: string } }) {
  const matchId = params.id;
  const { connected, subscribe, on } = useSocket();
  const { setSelection } = useBetSlip();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderBooks, setOrderBooks] = useState<Record<string, { backs: PriceLevel[]; lays: PriceLevel[] }>>({});
  const [activeNav, setActiveNav] = useState("Matches");
  const [activeSport, setActiveSport] = useState("Football");
  const [aiInsights, setAiInsights] = useState<any>(null);

  // Fetch + poll match data
  useEffect(() => {
    let cancelled = false;
    setOrderBooks({});
    setLoading(true);
    async function fetchMatch() {
      try {
        const res = await fetch(`/api/matches/${matchId}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setMatch(normalizeMatch(data));
        }
      } catch (error) {
        console.error("Failed to fetch match:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchMatch();
    const interval = setInterval(fetchMatch, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [matchId]);

  // Fetch AI Insights
  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch(`/api/ai/insights/${matchId}`);
        if (res.ok) {
          setAiInsights(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch AI insights", err);
      }
    }
    fetchInsights();
  }, [matchId]);

  // WebSocket orderbook
  useEffect(() => {
    if (!connected) return;
    subscribe(matchId);
    const unsub = on<OrderbookUpdate>("orderbook_update", (data) => {
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
    return () => unsub();
  }, [connected, subscribe, on, matchId]);

  // WebSocket match updates
  useEffect(() => {
    if (!connected) return;
    subscribe(matchId);
    const unsub = on<{ status: string; score?: { teamA: string; teamB: string }; elapsedMinutes?: number }>(
      "match_update",
      (data) => setMatch(prev => prev ? { ...prev, ...data, status: data.status as MatchStatus } : prev)
    );
    return () => unsub();
  }, [connected, subscribe, on, matchId]);

  const handleSelect = (selectionName: string, selectionId: string, odds: number, side: "back" | "lay" = "back") => {
    setSelection({
      matchId: match!.id,
      matchName: `${match!.teamA} v ${match!.teamB}`,
      marketName: "Match Odds",
      selectionId,
      selectionName,
      odds,
      side,
    });
  };

  // Get a simple top-level odds level for 1X2 display
  const getTopOdds = (key: string) => {
    const ob = orderBooks[key] || { backs: [], lays: [] };
    const backs = ob.backs.filter(l => !isNaN(parseFloat(l.price))).sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    return backs[0]?.price || null;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0a0e17] items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0071e3] mx-auto" />
          <p className="text-white/30 text-sm font-bold uppercase tracking-widest">Loading Match Data...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex min-h-screen bg-[#0a0e17] items-center justify-center">
        <p className="text-white/30 text-sm font-bold uppercase tracking-widest">Match not found</p>
      </div>
    );
  }

  const teamAOdds = getTopOdds("team_a") || "3.45";
  const drawOdds = getTopOdds("draw") || "2.10";
  const teamBOdds = getTopOdds("team_b") || "1.85";

  // Compute simple win prob from odds
  const oddsA = parseFloat(teamAOdds);
  const oddsB = parseFloat(teamBOdds);
  const probA = isNaN(oddsA) ? 38.5 : Math.round((1 / oddsA) * 100 * 10) / 10;
  const probB = isNaN(oddsB) ? 42.1 : Math.round((1 / oddsB) * 100 * 10) / 10;

  const isLive = match.status === "in_play";
  const sportLeagues = SPORT_LEAGUES.football;

  return (
    <div className="flex min-h-screen bg-[#0a0e17] -mt-4 -mx-4">
      {/* Left sport sidebar */}
      <aside className="w-48 flex-shrink-0 hidden xl:flex flex-col border-r border-white/5 bg-[#0d1117] py-5">
        <div className="px-5 mb-6">
          <span className="text-white font-black text-base tracking-tight">KINETIC STATS</span>
          <p className="text-white/20 text-[9px] mt-0.5 uppercase tracking-widest">live data stream</p>
        </div>

        <div className="px-4 mb-3">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">GLOBAL LEAGUES</p>
        </div>

        <nav className="flex-1 space-y-0.5 px-2">
          {sportLeagues.map(sport => (
            <button
              key={sport.label}
              onClick={() => setActiveSport(sport.label)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeSport === sport.label
                  ? "bg-[#0071e3]/20 text-[#0071e3] border border-[#0071e3]/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base">{sport.icon}</span>
              {sport.label}
            </button>
          ))}
        </nav>

        <div className="px-4 space-y-1 border-t border-white/5 pt-4">
          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-white/30 hover:text-white rounded-xl hover:bg-white/5 transition-all text-sm">
            <Bookmark className="w-4 h-4" /><span>Manage Favorites</span>
          </button>
          <button className="w-full flex items-center gap-2 px-4 py-2.5 text-white/30 hover:text-white rounded-xl hover:bg-white/5 transition-all text-sm">
            <Settings className="w-4 h-4" /><span>Dark Mode</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top nav */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 h-14 border-b border-white/5 bg-[#0a0e17]/95 backdrop-blur-sm">
          <nav className="flex items-center gap-1">
            {["Live", "Leagues", "Matches", "Insights"].map(item => (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeNav === item
                    ? "text-white border-b-2 border-[#0071e3]"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-white/20 absolute left-3" />
              <input
                placeholder="Search markets..."
                className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/50 placeholder:text-white/20 focus:outline-none focus:border-[#0071e3]/30 w-48 transition-all"
              />
            </div>
            <button className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5 text-white/40" />
            </button>
            <button className="p-2 rounded-xl hover:bg-white/5 transition-colors">
              <Settings className="w-5 h-5 text-white/40" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#0071e3]/20 border border-[#0071e3]/30 flex items-center justify-center">
              <User className="w-4 h-4 text-[#0071e3]" />
            </div>
          </div>
        </header>

        <div className="flex-1 p-5 space-y-5 overflow-y-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/30 text-xs font-bold uppercase tracking-widest">
            <span>{match.tournamentName || "Tournament"}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/50">Semi-Finals</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#0071e3]">Leg 2</span>
          </div>

          {/* ── Match Hero & Live Visualization ─────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Integrated Scoreboard Card (2 cols) */}
            <div className="lg:col-span-2 glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col group hover:border-white/10 transition-all">
              <div className="flex-1 p-8 flex items-center justify-between">
                {/* Team A */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border-2 border-white/10 group-hover:border-[#0071e3]/30 transition-all">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h2 className="font-black text-lg tracking-tight uppercase text-white">{match.teamA}</h2>
                  <div className="flex gap-2">
                    <div className="bg-white/5 px-2 py-1 rounded-md">
                      <p className="text-[8px] text-white/20 font-bold uppercase">Prob</p>
                      <p className="text-xs font-black text-white">{probA}%</p>
                    </div>
                  </div>
                </div>

                {/* Score Center */}
                <div className="flex flex-col items-center gap-1">
                  {isLive && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]">Live {match.elapsedMinutes}&apos;</span>
                    </div>
                  )}
                  <div className="text-6xl font-black tracking-tighter text-white flex items-center gap-5">
                    <span>{match.score?.teamA ?? 0}</span>
                    <span className="text-white/20 text-4xl">:</span>
                    <span>{match.score?.teamB ?? 0}</span>
                  </div>
                  <span className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">{match.tournamentName}</span>
                </div>

                {/* Team B */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border-2 border-white/10 group-hover:border-[#abd45e]/30 transition-all">
                    <span className="text-2xl">🏟️</span>
                  </div>
                  <h2 className="font-black text-lg tracking-tight uppercase text-white">{match.teamB}</h2>
                  <div className="flex gap-2">
                    <div className="bg-white/5 px-2 py-1 rounded-md">
                      <p className="text-[8px] text-white/20 font-bold uppercase">Prob</p>
                      <p className="text-xs font-black text-white">{probB}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 bg-white/2 p-4 border-t border-white/5">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Possession</span>
                  <div className="flex items-center gap-3 w-full px-4 mt-1">
                    <span className="text-[10px] font-bold text-white/60">58%</span>
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden flex">
                      <div className="bg-[#0071e3] h-full" style={{ width: "58%" }} />
                      <div className="bg-[#abd45e] h-full" style={{ width: "42%" }} />
                    </div>
                    <span className="text-[10px] font-bold text-[#abd45e]">42%</span>
                  </div>
                </div>
                <div className="flex flex-col items-center border-x border-white/5 px-4">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Shots on Target</span>
                  <div className="flex items-center justify-between w-full mt-1 px-2">
                    <span className="text-sm font-black text-white">7</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-[#0071e3]" />
                      <div className="w-1 h-1 rounded-full bg-[#0071e3]" />
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                    </div>
                    <span className="text-sm font-black text-[#abd45e]">3</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Aggregate</span>
                  <p className="text-sm font-black text-white mt-1">
                    {parseInt(match.score?.teamA ?? "0") + 3} - {parseInt(match.score?.teamB ?? "0") + 4}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Visualization Panel */}
            <div className="glass-card rounded-2xl border border-white/5 p-4 flex flex-col gap-4">
              {match.sportType === "basketball" ? (
                <LiveCourt 
                  status={isLive ? "danger" : "safe"} 
                  teamA={match.teamA} 
                  teamB={match.teamB} 
                  activeSide="b" 
                  className="flex-1"
                />
              ) : match.sportType === "tennis" ? (
                <LiveTennisCourt 
                  status={isLive ? "rally" : "break"} 
                  teamA={match.teamA} 
                  teamB={match.teamB} 
                  activeSide="a" 
                  className="flex-1"
                />
              ) : (
                <LivePitch 
                  status={isLive ? "danger" : "safe"} 
                  teamA={match.teamA} 
                  teamB={match.teamB} 
                  activeSide="b" 
                  className="flex-1"
                />
              )}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded-xl p-3 flex flex-col justify-between border border-white/5">
                  <span className="text-[8px] text-white/30 font-bold uppercase">Total Corners</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-white">12</span>
                    <span className="text-[8px] text-[#abd45e] font-black">+2 in 10&apos;</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 flex flex-col justify-between border border-white/5">
                  <span className="text-[8px] text-white/30 font-bold uppercase">Total Cards</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-black text-yellow-400">3</span>
                    <span className="text-[8px] text-white/20 font-black">0 RED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── AI Insights Row ──────────────────────────────────────────── */}
          {aiInsights && (
            <div className="glass-card rounded-2xl border border-[#AFFF00]/20 bg-gradient-to-br from-[#0a0e17] to-[#111827] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#AFFF00]/10 rounded-bl-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
              <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#AFFF00]/20 border border-[#AFFF00]/30 flex items-center justify-center text-[#AFFF00]">
                    <Brain className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base tracking-tight uppercase flex items-center gap-2">
                      Kinetic AI Intelligence <span className="px-2 py-0.5 bg-[#AFFF00]/20 text-[#AFFF00] text-[8px] rounded-full">PRO</span>
                    </h3>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Predictive Modeling & Analysis</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Confidence Score</p>
                  <p className="text-3xl font-black text-[#AFFF00]">{aiInsights.confidenceScore}%</p>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Live Context Analysis</h4>
                  <p className="text-white/80 text-sm leading-relaxed font-medium bg-white/5 p-5 rounded-2xl border border-white/5">
                    {aiInsights.liveAnalysis}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Calculated Value Bets</h4>
                  <div className="space-y-3">
                    {aiInsights.predictions?.map((pred: any, i: number) => (
                      <div key={i} className="bg-black/30 p-4 rounded-xl border border-white/5 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-[#AFFF00]/30 flex items-center justify-center flex-shrink-0">
                           <span className="text-[#AFFF00] font-black text-sm">{pred.probability}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-black uppercase text-sm">{pred.recommendation}</span>
                            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">({pred.market})</span>
                          </div>
                          <p className="text-white/50 text-[11px] leading-relaxed">{pred.rationale}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Analytics Row ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Recent Form */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-white text-base">Recent Form</h3>
                <button className="text-[#0071e3] text-xs font-bold uppercase tracking-widest hover:underline">FULL HISTORY</button>
              </div>
              <div className="space-y-4">
                {/* Team A form */}
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm font-bold w-16 flex-shrink-0">
                    {match.teamA.split(" ").pop()?.slice(0, 3).toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    {DEMO_FORM_A.map((r, i) => <FormBadge key={i} result={r} />)}
                  </div>
                </div>
                {/* Team B form */}
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm font-bold w-16 flex-shrink-0">
                    {match.teamB.split(" ").pop()?.slice(0, 3).toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    {DEMO_FORM_B.map((r, i) => <FormBadge key={i} result={r} />)}
                  </div>
                </div>
              </div>

              {/* Tactical Pressure */}
              <div className="mt-6 pt-5 border-t border-white/5">
                <h4 className="text-sm font-black text-white mb-4">Tactical Pressure</h4>
                <TacticalPressureChart teamALabel={match.teamA} teamBLabel={match.teamB} />
              </div>
            </div>

            {/* Kinetic Intelligence + Key Matchup */}
            <div className="space-y-4">
              {/* AI Insight */}
              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#0071e3]/10 border border-[#0071e3]/20 rounded-xl">
                    <Brain className="w-4 h-4 text-[#0071e3]" />
                  </div>
                  <span className="text-white font-black text-sm uppercase tracking-tight">KINETIC INTELLIGENCE</span>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">
                  Algorithm detects high probability for <span className="text-white font-bold">Over 2.5 Goals</span> based on {match.teamB.split(" ").pop()} away form and {match.teamA.split(" ").pop()} defensive xG.
                </p>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Total Goals O/U 2.5</span>
                    <span className="text-[9px] font-black text-white/20 uppercase">MARKET</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelection({ matchId: match.id, matchName: `${match.teamA} v ${match.teamB}`, marketName: "Total Goals", selectionId: "over_2_5", selectionName: "Over 2.5", odds: 1.65, side: "back" })}
                      className="py-2 rounded-xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors"
                    >
                      <p className="text-[9px] text-white/30 font-bold uppercase">O</p>
                      <p className="text-white font-black">1.65</p>
                    </button>
                    <button
                      onClick={() => setSelection({ matchId: match.id, matchName: `${match.teamA} v ${match.teamB}`, marketName: "Total Goals", selectionId: "under_2_5", selectionName: "Under 2.5", odds: 2.25, side: "back" })}
                      className="py-2 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 text-center hover:bg-[#0071e3]/20 transition-colors"
                    >
                      <p className="text-[9px] text-[#0071e3] font-bold uppercase">U</p>
                      <p className="text-[#0071e3] font-black">2.25</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Key Matchup */}
              <div className="glass-card p-5 rounded-2xl border border-white/5">
                <h4 className="text-sm font-black text-white mb-4">Key Matchup</h4>
                <div className="space-y-4">
                  {DEMO_PLAYER_STATS.map((player, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">{player.name}</p>
                        <p className="text-white/30 text-[10px]">
                          {i === 0 ? match.teamA : match.teamB} • {player.role}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-black">{player.xg}</p>
                        <p className="text-white/20 text-[9px]">xG / 90</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>


          {/* ── In-Play Markets ─────────────────────────────────────────── */}
          <div className="border-t border-white/5 pt-6">
            {/* Market tab row */}
            <div className="flex items-center gap-1 flex-wrap mb-5">
              {["MAIN MARKETS", "GOALS", "CORNERS", "HALF", "PLAYERS", "SPECIALS"].map(tab => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    tab === "MAIN MARKETS"
                      ? "bg-[#0071e3] text-white"
                      : "bg-white/5 border border-white/10 text-white/40 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Full Time Result */}
              <div className="glass-card p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black text-white text-sm uppercase tracking-tight">FULL TIME RESULT (1X2)</h4>
                  <span className="w-4 h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-[8px] text-white/20">🔒</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: match?.teamA || "Team A", odds: "1.18", accent: true },
                    { label: "DRAW",                   odds: "5.50", accent: false },
                    { label: match?.teamB || "Team B", odds: "12.00", accent: false },
                  ].map(btn => (
                    <button
                      key={btn.label}
                      onClick={() => match && setSelection({
                        matchId: match.id,
                        matchName: `${match.teamA} v ${match.teamB}`,
                        marketName: "Full Time Result",
                        selectionId: btn.label.toLowerCase().replace(/ /g, "_"),
                        selectionName: btn.label,
                        odds: parseFloat(btn.odds),
                        side: "back",
                      })}
                      className={`py-4 rounded-xl border transition-all active:scale-95 hover:brightness-110 text-center ${
                        btn.accent
                          ? "bg-[#0071e3]/10 border-[#0071e3]/20"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <p className="text-[9px] font-bold text-white/30 uppercase mb-1 truncate px-1">{btn.label}</p>
                      <p className={`text-2xl font-black ${btn.accent ? "text-[#0071e3]" : "text-white"}`}>{btn.odds}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Goal */}
              <div className="glass-card p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black text-white text-sm uppercase tracking-tight">NEXT GOAL (GOAL 4)</h4>
                  <span className="flex items-center gap-1 text-[8px] text-emerald-400 font-black border border-emerald-500/20 rounded-full px-2 py-0.5">● LIVE</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: match?.teamA || "Team A", id: "next_goal_home", defaultOdds: "1.85" },
                    { label: "NO GOAL",                id: "next_goal_none", defaultOdds: "2.40" },
                    { label: match?.teamB || "Team B", id: "next_goal_away", defaultOdds: "4.10" },
                  ].map(btn => {
                    const currentOdds = getTopOdds(btn.id) || btn.defaultOdds;
                    return (
                      <button
                        key={btn.id}
                        onClick={() => match && setSelection({
                          matchId: match.id,
                          matchName: `${match.teamA} v ${match.teamB}`,
                          marketName: "Next Goal",
                          selectionId: btn.id,
                          selectionName: btn.label,
                          odds: parseFloat(currentOdds),
                          side: "back",
                        })}
                        className="py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-95 text-center"
                      >
                        <p className="text-[9px] font-bold text-white/30 uppercase mb-1 truncate px-1">{btn.label}</p>
                        <p className="text-2xl font-black text-white">{currentOdds}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Total Goals O/U */}
              <div className="glass-card p-5 rounded-2xl border border-white/5">
                <h4 className="font-black text-white text-sm uppercase tracking-tight mb-4">TOTAL GOALS (OVER/UNDER)</h4>
                <div className="space-y-2">
                  {[
                    { label: "Over 3.5",  id: "over_35",  defaultOdds: "1.68" },
                    { label: "Under 3.5", id: "under_35", defaultOdds: "2.10" }
                  ].map(row => {
                    const currentOdds = getTopOdds(row.id) || row.defaultOdds;
                    return (
                      <button
                        key={row.id}
                        onClick={() => match && setSelection({
                          matchId: match.id,
                          matchName: `${match.teamA} v ${match.teamB}`,
                          marketName: "Total Goals",
                          selectionId: row.id,
                          selectionName: row.label,
                          odds: parseFloat(currentOdds),
                          side: "back",
                        })}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#0071e3]/20 transition-all group"
                      >
                        <span className="text-white/60 font-bold text-sm group-hover:text-white transition-colors">{row.label}</span>
                        <span className="text-[#0071e3] font-black text-xl">{currentOdds}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Asian Handicap */}
              <div className="glass-card p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black text-white text-sm uppercase tracking-tight">ASIAN HANDICAP (LIVE)</h4>
                </div>
                <div className="space-y-2">
                  {[
                    { label: `${match?.teamA || "Team A"} (-1.0)`, id: "hc_a", defaultOdds: "2.05" },
                    { label: `${match?.teamB || "Team B"} (+1.0)`, id: "hc_b", defaultOdds: "1.75" },
                  ].map(row => {
                    const currentOdds = getTopOdds(row.id) || row.defaultOdds;
                    return (
                      <button
                        key={row.id}
                        onClick={() => match && setSelection({
                          matchId: match.id,
                          matchName: `${match.teamA} v ${match.teamB}`,
                          marketName: "Asian Handicap",
                          selectionId: row.id,
                          selectionName: row.label,
                          odds: parseFloat(currentOdds),
                          side: "back",
                        })}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#0071e3]/20 transition-all group"
                      >
                        <span className="text-white/60 font-bold text-sm group-hover:text-white transition-colors truncate mr-4">{row.label}</span>
                        <span className="text-[#0071e3] font-black text-xl flex-shrink-0">{currentOdds}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Corner / Card / Pressure stats row */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="glass-card p-5 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">TOTAL CORNERS</p>
                <p className="text-4xl font-black text-white">12</p>
                <p className="text-[9px] text-emerald-400 font-bold mt-1">+2 in last 10&apos;</p>
              </div>
              <div className="glass-card p-5 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">TOTAL CARDS</p>
                <p className="text-4xl font-black text-white">3</p>
                <p className="text-[9px] text-white/30 font-bold mt-1">0 Red</p>
              </div>
              <div className="glass-card p-5 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-3">ATTACK PRESSURE (LAST 5&apos;)</p>
                <div className="flex items-center gap-1.5 h-5">
                  {[true, false, true, false, true, false, true, true].map((a, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-full rounded-sm ${a ? "bg-[#0071e3]/70" : "bg-[#AFFF00]/40"}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[8px] text-[#0071e3] font-bold">{match?.teamA?.split(" ")[0] || "H"}</span>
                  <span className="text-[8px] text-[#AFFF00] font-bold">{match?.teamB?.split(" ")[0] || "A"}</span>
                </div>
              </div>
            </div>

            {/* Head to head + boosted row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {/* H2H */}
              <div className="glass-card p-5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-black text-white text-sm uppercase tracking-tight">HEAD TO HEAD</h4>
                  <button className="text-[#0071e3] text-[9px] font-black hover:underline uppercase tracking-widest">FULL STATISTICS CENTER</button>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">LAST 5 MATCHES</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-black text-sm">{match?.teamA?.split(" ").pop() || "Home"}</span>
                    <span className="text-white/20 text-xs">3-1-1</span>
                  </div>
                </div>
                <div className="flex gap-1.5 mb-4">
                  {["W","W","W","L","W"].map((r, i) => (
                    <div key={i} className={`flex-1 h-2 rounded-full ${r === "W" ? "bg-emerald-500" : r === "D" ? "bg-amber-500" : "bg-red-500"}`} />
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { date: "Nov 2023", score: `${match?.teamA?.split(" ").pop() || "MC"} 4 - 4 LIV` },
                    { date: "Apr 2023", score: `${match?.teamA?.split(" ").pop() || "MC"} 4 - 1 LIV` },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-[10px] text-white/30 font-bold">{row.date}</span>
                      <span className="text-[10px] text-white font-black">{row.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Boosted Odds */}
              <div className="glass-card p-5 rounded-2xl border border-amber-500/20 bg-amber-500/3 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-500 opacity-5 blur-2xl" />
                <div className="flex items-center gap-2 mb-4">
                  <div className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30">
                    <span className="text-amber-400 text-[8px] font-black uppercase tracking-widest">BOOSTED ODDS</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl flex-shrink-0">⚽</div>
                  <div>
                    <p className="text-white font-black text-base leading-tight">ERLING HAALAND TO SCORE NEXT</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-4xl font-black text-amber-400">4.50</p>
                    <p className="text-white/20 text-xs font-bold line-through">3.20</p>
                  </div>
                  <button
                    onClick={() => match && setSelection({
                      matchId: match.id,
                      matchName: `${match.teamA} v ${match.teamB}`,
                      marketName: "Next Goalscorer",
                      selectionId: "haaland_next",
                      selectionName: "Haaland Next Goal",
                      odds: 4.50,
                      side: "back",
                    })}
                    className="px-6 py-3 rounded-xl bg-amber-500 text-black font-black text-sm uppercase tracking-widest hover:bg-amber-400 active:scale-95 transition-all"
                  >
                    BET NOW
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Full Order Book + Chart ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3">
              <h3 className="text-sm font-black text-white/30 uppercase tracking-widest mb-3">LIVE ORDER BOOK</h3>
              <OrderBook
                matchId={match.id}
                orderBooks={orderBooks}
                matchTitle={`${match.teamA} v ${match.teamB}`}
                teams={[match.teamA, match.teamB]}
                onSelect={(sel) => handleSelect(sel.selectionName, sel.selectionName === match.teamA ? "team_a" : sel.selectionName === match.teamB ? "team_b" : "draw", sel.odds, sel.side)}
              />
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-sm font-black text-white/30 uppercase tracking-widest mb-3">PRICE HISTORY</h3>
              <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                <MarketChart matchId={match.id} />
              </div>
            </div>
          </div>

          {/* Live score widget if in play */}
          {isLive && (
            <div>
              <h3 className="text-sm font-black text-white/30 uppercase tracking-widest mb-3">LIVE FEED</h3>
              <LiveScoreWidget match={match} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
