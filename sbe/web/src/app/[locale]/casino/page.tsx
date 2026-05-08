"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Search, ChevronRight, Headphones, Settings, Shield } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { WinnersTicker } from "@/components/winners-ticker";

// ─── Data ──────────────────────────────────────────────────────────────────────
const CASINO_SIDEBAR = [
  { id: "slots",        label: "Slots",        icon: "🎰" },
  { id: "live-dealer",  label: "Live Dealer",  icon: "🃏" },
  { id: "table-games",  label: "Table Games",  icon: "🎲" },
  { id: "providers",    label: "Providers",    icon: "🏢" },
  { id: "jackpots",     label: "Jackpots",     icon: "💰" },
  { id: "instant-win",  label: "Instant Win",  icon: "⚡" },
];

const PROVIDERS = [
  { id: "pragmatic",   name: "Pragmatic Play",  games: 324, color: "from-orange-900/60 to-black", badge: "🔥" },
  { id: "evolution",   name: "Evolution",        games: 118, color: "from-purple-900/60 to-black", badge: null },
  { id: "hacksaw",     name: "Hacksaw Gaming",   games: 86,  color: "from-green-900/60 to-black",  badge: null },
  { id: "nolimit",     name: "Nolimit City",     games: 72,  color: "from-red-900/60 to-black",    badge: null },
  { id: "playngo",     name: "Play'n GO",        games: 290, color: "from-blue-900/60 to-black",   badge: null },
  { id: "redtiger",    name: "Red Tiger",        games: 215, color: "from-rose-900/60 to-black",   badge: null },
  { id: "netent",      name: "NetEnt",           games: 186, color: "from-teal-900/60 to-black",   badge: null },
  { id: "relax",       name: "Relax Gaming",     games: 142, color: "from-slate-700/60 to-black",  badge: null },
  { id: "pg-soft",     name: "PG Soft",          games: 167, color: "from-cyan-900/60 to-black",   badge: null },
  { id: "yggdrasil",   name: "Yggdrasil",        games: 98,  color: "from-indigo-900/60 to-black", badge: null },
  { id: "elk",         name: "ELK Studios",      games: 55,  color: "from-amber-900/60 to-black",  badge: null },
  { id: "thunderkick", name: "Thunderkick",      games: 44,  color: "from-yellow-900/60 to-black", badge: null },
];

const SORT_TABS = ["Popular", "A-Z", "Newest", "Most Games"] as const;
type SortTab = typeof SORT_TABS[number];

export default function CasinoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeSidebar, setActiveSidebar] = useState("providers");
  const [activeTab, setActiveTab] = useState<SortTab>("Popular");
  const [search, setSearch] = useState("");

  const sorted = [...PROVIDERS]
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (activeTab === "A-Z") return a.name.localeCompare(b.name);
      if (activeTab === "Most Games") return b.games - a.games;
      if (activeTab === "Newest") return 0; // static demo
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#0a0e17] -mt-4 -mx-4 flex">

      {/* ── Left Sidebar ──────────────────────────────────── */}
      <div className="w-52 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0d1120] min-h-screen">

        {/* User profile card */}
        <div className="m-3 p-4 rounded-2xl bg-gradient-to-br from-[#0071e3]/10 to-purple-900/20 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0071e3] to-purple-600 flex items-center justify-center text-white font-black text-sm">
              {String(user?.username || "P")[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-black text-sm">{user?.username || "Pro Bettor"}</p>
              <p className="text-[8px] text-amber-400 font-bold border border-amber-500/30 rounded-full px-1.5 py-0.5 inline-block">Level 4 VIP</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {CASINO_SIDEBAR.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSidebar(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                activeSidebar === s.id
                  ? "bg-[#0071e3]/10 text-[#0071e3] border-l-2 border-[#0071e3]"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-2">
          <button
            onClick={() => router.push("/live-dealer" as any)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black hover:bg-emerald-500/15 transition-all"
          >
            <Headphones className="w-3.5 h-3.5" /> Live Support
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-white/20 hover:text-white/50 transition-colors text-[10px] font-bold">
            <Shield className="w-3.5 h-3.5" /> Responsible Gaming
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-white/20 hover:text-white/50 transition-colors text-[10px] font-bold">
            <Settings className="w-3.5 h-3.5" /> Settings
          </button>
        </div>
      </div>

      {/* ── Main Area ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Hero banner */}
        <div className="relative mx-6 mt-6 rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-br from-[#0d1525] to-[#0a0e17] p-10">
          <div className="absolute inset-0 overflow-hidden">
            {/* decorative grid */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="absolute w-full border-t border-white/3" style={{ top: `${i * 25}%` }} />
            ))}
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#0071e3] opacity-5 blur-3xl" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-5xl font-black text-white leading-tight">
              GAME <span className="text-[#0071e3]">PROVIDERS</span>
            </h1>
            <p className="text-white/50 mt-4 text-base leading-relaxed max-w-lg">
              Experience the cutting edge of iGaming. We partner with the world's most innovative studios to bring you a premium library of over 4,000 certified titles.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="flex items-center gap-2 flex-1 max-w-sm px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
                <input
                  className="flex-1 bg-transparent text-white/70 text-sm placeholder:text-white/25 outline-none"
                  placeholder="Find your favorite studio..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button className="px-6 py-3 rounded-xl bg-[#0071e3] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0064cc] active:scale-95 transition-all">
                EXPLORE ALL
              </button>
            </div>
          </div>
        </div>

        <WinnersTicker />

        {/* Filter tabs + count */}
        <div className="flex items-center gap-4 px-6 mt-6 mb-4">
          <div className="flex gap-1">
            {SORT_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab
                    ? "bg-white text-black"
                    : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/20"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="ml-auto text-sm text-white/30">
            Showing <span className="text-white font-black">{sorted.length}</span> total providers
          </div>
        </div>

        {/* Provider grid */}
        <div className="px-6 pb-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map(p => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 py-8 text-center space-y-3">
          <p className="text-white font-black text-lg tracking-tight">KINETIC CASINO</p>
          <div className="flex items-center justify-center gap-6 text-[9px] font-bold text-white/30 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Responsible Gaming</a>
            <a href="#" className="hover:text-white transition-colors">Affiliates</a>
            <a href="#" className="hover:text-white transition-colors">Help Center</a>
          </div>
          <p className="text-[9px] text-white/15">© 2024 KINETIC CASINO. ALL RIGHTS RESERVED. BEGAMBLEAWARE.ORG</p>
        </div>
      </div>
    </div>
  );
}

function ProviderCard({ provider }: { provider: typeof PROVIDERS[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-white/5 cursor-pointer group"
      style={{ aspectRatio: "3/2" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${provider.color} transition-all duration-500 ${hovered ? "brightness-125" : ""}`} />

      {/* Provider logo placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-white/60" />
          </div>
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/80 to-transparent">
        <div>
          <p className="text-white font-black text-sm">{provider.name}</p>
          <p className="text-white/40 text-[10px] font-bold">{provider.games} GAMES</p>
        </div>
        <div className={`p-1.5 rounded-lg bg-white/10 border border-white/15 transition-all ${hovered ? "opacity-100" : "opacity-0"}`}>
          <ChevronRight className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Hot badge */}
      {provider.badge && (
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[8px] font-black">
          {provider.badge} HOT
        </div>
      )}
    </div>
  );
}
