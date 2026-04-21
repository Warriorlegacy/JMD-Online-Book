"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "@/i18n/navigation";
import { Play, ChevronLeft, ChevronRight, Wallet, Trophy, Zap, Star } from "lucide-react";

const SLOT_GAMES = [
  { id: "cosmic-reels", name: "Cosmic Reels", provider: "Pragmatic Play", badge: null, color: "from-purple-900 to-slate-900", accent: "#8B5CF6" },
  { id: "neon-voltage", name: "Neon Voltage", provider: "Netent", badge: "HOT", color: "from-emerald-900 to-slate-900", accent: "#10B981" },
  { id: "golden-scarab", name: "Golden Scarab", provider: "Play'n Go", badge: null, color: "from-amber-900 to-slate-900", accent: "#F59E0B" },
  { id: "kinetic-pulse", name: "Kinetic Pulse", provider: "Exclusives", badge: "NEW", color: "from-[#0071e3]/40 to-slate-900", accent: "#0071e3" },
  { id: "fruit-frenzy", name: "Fruit Frenzy", provider: "Evolution", badge: null, color: "from-red-900 to-slate-900", accent: "#EF4444" },
  { id: "dragon-vault", name: "Dragon Vault", provider: "Pragmatic Play", badge: "JACKPOT", color: "from-orange-900 to-slate-900", accent: "#F97316" },
];

const LIVE_GAMES = [
  { id: "lightning-roulette", name: "Lightning Roulette", players: 1240, min: "$1", max: "$5,000", color: "from-red-900/80 to-black" },
  { id: "vip-blackjack", name: "VIP Blackjack", players: 845, min: "$10", max: "$25,000", color: "from-emerald-900/80 to-black" },
  { id: "speed-baccarat", name: "Speed Baccarat", players: 420, min: "$5", max: "$10,000", color: "from-blue-900/80 to-black" },
];

const WINNERS = [
  { player: "Player_882", amount: "$4,250.00", game: "Starburst X" },
  { player: "MaximusPrime", amount: "$12,800.00", game: "Dragon Vault" },
  { player: "LuckyAce77", amount: "$2,100.00", game: "Neon Voltage" },
  { player: "CosmicKing", amount: "$8,500.00", game: "Lightning Roulette" },
];

const SIDEBAR_LINKS = [
  { id: "slots", label: "Slots", icon: "🎰" },
  { id: "live-dealer", label: "Live Dealer", icon: "👑" },
  { id: "jackpots", label: "Jackpots", icon: "💰" },
  { id: "table-games", label: "Table Games", icon: "🃏" },
  { id: "instant-win", label: "Instant Win", icon: "⚡" },
  { id: "providers", label: "Providers", icon: "🏢" },
];

const GAME_FILTERS = ["Popular", "New", "Jackpots", "Table Games", "All Games"];

function SlotCard({ game, onPlay }: { game: typeof SLOT_GAMES[0]; onPlay: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[4/5]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onPlay(game.id)}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${game.color} transition-all duration-500`} />

      {/* Game icon placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${game.accent}20`, border: `1px solid ${game.accent}40` }}
        >
          <div className="w-10 h-10 rounded-lg" style={{ background: game.accent }} />
        </div>
      </div>

      {/* Badge */}
      {game.badge && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500 text-black text-[9px] font-black uppercase rounded-full">
          {game.badge}
        </div>
      )}

      {/* Hover overlay */}
      <div className={`absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}>
        <button
          className="px-6 py-2.5 rounded-full text-black text-xs font-bold transition-transform hover:scale-105"
          style={{ background: game.accent }}
        >
          <Play className="w-3 h-3 inline mr-1" />PLAY NOW
        </button>
        <button className="px-6 py-2 rounded-full border border-white/20 text-white text-xs font-bold hover:bg-white/10 transition-colors">
          DEMO
        </button>
      </div>

      {/* Info footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white font-bold text-sm leading-tight">{game.name}</p>
        <p className="text-white/40 text-[10px] uppercase tracking-wider">{game.provider}</p>
      </div>
    </div>
  );
}

function LiveGameCard({ game, onPlay }: { game: typeof LIVE_GAMES[0]; onPlay: (id: string) => void }) {
  return (
    <div className="relative rounded-2xl overflow-hidden cursor-pointer group" onClick={() => onPlay(game.id)}>
      <div className={`h-52 bg-gradient-to-br ${game.color} relative`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <Play className="w-7 h-7 text-white fill-white" />
          </div>
        </div>
        {/* Live badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-red-500/90 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-white text-[9px] font-black uppercase">LIVE NOW</span>
        </div>
        {/* Player count */}
        <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/60 rounded-full">
          <span className="text-white/70 text-[9px] font-bold">▲ {game.players.toLocaleString()}</span>
        </div>
      </div>
      <div className="p-4 bg-[#0d1117] border-t border-white/5">
        <p className="text-white font-black text-base uppercase italic">{game.name}</p>
        <p className="text-white/40 text-[10px] mt-1">Min: {game.min} | Max: {game.max}</p>
      </div>
    </div>
  );
}

export default function CasinoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("slots");
  const [activeFilter, setActiveFilter] = useState("Popular");

  const handlePlay = (id: string) => {
    if (!user) { router.push("/login"); return; }
    router.push(`/casino/${id}`);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0e17]">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0d1117] py-6 hidden lg:flex">
        {/* Brand */}
        <div className="px-6 mb-8">
          <span className="text-white font-black text-lg tracking-tight">KINETIC CASINO</span>
        </div>

        {/* User level bubble */}
        {user && (
          <div className="mx-4 mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-amber-400 font-bold text-xs">Gaming Floor</span>
            </div>
            <p className="text-amber-400/60 text-[10px] mt-1 uppercase tracking-wider">PLATINUM ELITE</p>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-2">
          {SIDEBAR_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveSection(link.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeSection === link.id
                  ? "bg-[#0071e3]/20 text-[#0071e3] border border-[#0071e3]/20"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </nav>

        {/* Tournament Leaderboard button */}
        <div className="px-4 mt-auto pt-6">
          <button className="w-full flex items-center justify-between p-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-sm">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-medium">Tournament Leaderboard</span>
            </div>
            <ChevronRight className="w-3 h-3" />
          </button>
          <div className="mt-3 space-y-1">
            <button className="w-full text-left px-3 py-2 text-white/30 hover:text-white/60 text-xs transition-colors">Support</button>
            <button className="w-full text-left px-3 py-2 text-white/30 hover:text-white/60 text-xs transition-colors">Responsible Gaming</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top nav */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 h-14 bg-[#0a0e17]/95 backdrop-blur-sm border-b border-white/5">
          <nav className="flex items-center gap-6 text-sm">
            {["SPORTS", "IN-PLAY", "CASINO", "LIVE CASINO", "PROMOS"].map(item => (
              <button
                key={item}
                className={`font-bold tracking-wide transition-colors ${item === "CASINO" ? "text-white border-b-2 border-[#0071e3] pb-1" : "text-white/40 hover:text-white"}`}
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
                  <Wallet className="w-3 h-3 text-white/40" />
                  <span className="text-sm font-bold text-white">BALANCE: $12,450.00</span>
                </div>
                <button className="px-5 py-2 bg-[#0071e3] text-white text-sm font-bold rounded-full hover:bg-[#0071e3]/90 transition-all active:scale-95">
                  DEPOSIT
                </button>
              </>
            ) : (
              <button onClick={() => router.push("/login")} className="px-5 py-2 bg-[#0071e3] text-white text-sm font-bold rounded-full">
                Sign In
              </button>
            )}
          </div>
        </header>

        <div className="p-6 space-y-8">
          {/* Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden h-64 lg:h-72 bg-gradient-to-r from-purple-900/80 via-[#1a0533] to-black border border-white/5">
            {/* Animated background elements */}
            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute top-0 right-1/4 w-48 h-48 bg-[#0071e3]/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex items-center h-full px-10 gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-4">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">NEW RELEASES</span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white uppercase italic leading-tight">
                  UNLEASH THE<br />
                  <span className="text-[#0071e3]">CYBER REELS</span>
                </h1>
                <p className="text-white/50 mt-3 text-sm max-w-md">
                  Experience the next generation of 4D slot mechanics. Play exclusive Kinetic titles before anyone else.
                </p>
                <div className="flex items-center gap-4 mt-6">
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#AFFF00] text-black font-black text-sm rounded-xl hover:scale-105 transition-all active:scale-95">
                    <Play className="w-4 h-4 fill-black" />PLAY NOW
                  </button>
                  <button className="px-6 py-3 border border-white/20 text-white text-sm font-bold rounded-xl hover:bg-white/5 transition-colors">
                    LEARN MORE
                  </button>
                </div>
              </div>
              <div className="hidden lg:flex w-64 h-48 items-center justify-center">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500/30 to-[#0071e3]/30 border border-purple-500/20 flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/40" />
                </div>
              </div>
            </div>
          </div>

          {/* Winner Ticker */}
          <div className="flex items-center gap-4 overflow-hidden">
            {[...WINNERS, ...WINNERS].map((w, i) => (
              <div key={i} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                <span className="text-white/30 text-[10px] font-bold uppercase">LATEST WINNER</span>
                <span className="text-white text-[10px] font-bold">{w.player}</span>
                <span className="text-[10px]">won</span>
                <span className="text-[#AFFF00] font-black text-[10px]">{w.amount}</span>
                <span className="text-white/30 text-[10px]">on {w.game}</span>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              {GAME_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    activeFilter === f
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative hidden md:flex items-center">
              <input
                type="text"
                placeholder="Search games, providers..."
                className="pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 placeholder:text-white/20 focus:outline-none focus:border-[#0071e3]/40 w-56"
              />
            </div>
          </div>

          {/* Top Slots */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-black uppercase italic text-xl">TOP SLOTS</h2>
              <button className="text-[#0071e3] text-xs font-bold uppercase tracking-wider hover:underline">VIEW ALL</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {SLOT_GAMES.map(game => (
                <SlotCard key={game.id} game={game} onPlay={handlePlay} />
              ))}
            </div>
          </section>

          {/* Live Casino */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-white font-black uppercase italic text-xl">LIVE CASINO</h2>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-red-400 text-[9px] font-black uppercase">LIVE NOW</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"><ChevronLeft className="w-4 h-4 text-white" /></button>
                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"><ChevronRight className="w-4 h-4 text-white" /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {LIVE_GAMES.map(game => (
                <LiveGameCard key={game.id} game={game} onPlay={handlePlay} />
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-white/5 bg-[#0d1117] px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-white font-black italic text-lg">KINETIC CASINO</span>
              <p className="text-white/20 text-[10px] mt-1">© 2024 KINETIC LEDGER GAMING. LICENSED AND REGULATED.</p>
            </div>
            <div className="flex gap-6 text-white/30 text-xs font-medium">
              {["TERMS OF SERVICE", "PRIVACY POLICY", "FAIR PLAY", "PAYOUT RATES"].map(link => (
                <button key={link} className="hover:text-white/60 transition-colors">{link}</button>
              ))}
            </div>
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/40 text-xs hover:text-white transition-colors">
              HELP CENTER
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
