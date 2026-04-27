"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { useSocket } from "@/context/socket-context";
import { useRouter } from "@/i18n/navigation";
import {
  Send, ChevronDown, Settings, Headphones,
  RefreshCw, X, Users
} from "lucide-react";

// ─── Static data ──────────────────────────────────────────────────────────────
const SIDEBAR_LINKS = [
  { id: "sportsbook",   label: "Sportsbook",   icon: "🏟️", href: "/sports" },
  { id: "live-dealer",  label: "Live Dealer",  icon: "🎬", href: "/live-dealer" },
  { id: "promotions",   label: "Promotions",   icon: "🎁", href: "/promotions" },
  { id: "wallet",       label: "Wallet",       icon: "💳", href: "/wallet" },
  { id: "verification", label: "Verification", icon: "🛡️", href: "/profile/verification" },
];

const LIVE_TABLES = [
  { id: "speed-baccarat-04", label: "Speed Baccarat #04", players: 1482, category: "BACCARAT", latestWin: "Player_88 +$4,200.00", color: "from-amber-900" },
  { id: "vip-blackjack-01",  label: "VIP Blackjack #01",  players: 856,  category: "BLACKJACK", latestWin: "GoldMember +$1,100.00", color: "from-emerald-900" },
  { id: "lightning-roulette", label: "Lightning Roulette", players: 2204, category: "ROULETTE", latestWin: "LuckyAce +$8,700.00", color: "from-red-900" },
];

interface ChatMessage {
  user: string;
  text: string;
  role: "player" | "dealer" | "vip";
}

const INITIAL_CHAT: ChatMessage[] = [
  { user: "VIP_Slayer",   text: "Banker is on fire tonight! 🔥",          role: "vip" },
  { user: "Dealer Elena", text: "Good luck everyone for the next round.",   role: "dealer" },
  { user: "BigWinner99",  text: "Let's go Player! May her bet land right!", role: "player" },
  { user: "JetSetGambler", text: "Feeling banker tonight 💰",              role: "player" },
];

const CHIPS = [1, 5, 25, 100, 500];

export default function LiveDealerPage() {
  const { user } = useAuth();
  const { connected, subscribe, on, send } = useSocket();
  const router = useRouter();

  const [activeTable, setActiveTable] = useState(LIVE_TABLES[0]);
  const [selectedChip, setSelectedChip] = useState(5);
  const [playerBet, setPlayerBet] = useState(0);
  const [bankerBet, setBankerBet] = useState(0);
  const [tieBet, setTieBet]     = useState(0);
  const [chatOpen, setChatOpen]  = useState(true);
  const [chatMsg, setChatMsg]    = useState("");
  const [messages, setMessages]  = useState<ChatMessage[]>(INITIAL_CHAT);
  const [activeSidebar, setActiveSidebar] = useState("live-dealer");
  const chatRef = useRef<HTMLDivElement>(null);

  // Subscribe to table room
  useEffect(() => {
    if (connected) {
      subscribe(activeTable.id);
    }
  }, [connected, activeTable.id, subscribe]);

  // Listen for chat messages
  useEffect(() => {
    const unsub = on<ChatMessage & { room: string }>("chat_message", (data) => {
      if (data.room === activeTable.id) {
        setMessages(prev => [...prev, { user: data.user, text: data.text, role: data.role }]);
      }
    });
    return () => unsub();
  }, [on, activeTable.id]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const balance = parseFloat(user?.balance || "42850.50");
  const totalBet = playerBet + bankerBet + tieBet;

  const sendChat = () => {
    if (!chatMsg.trim() || !connected) return;
    
    // Send to server
    send({
      type: "chat_message",
      room: activeTable.id,
      text: chatMsg.trim(),
      user: user?.username || "Player",
      role: (user as any)?.role === "admin" ? "dealer" : "player"
    });
    
    setChatMsg("");
  };

  const placeBet = (target: "player" | "banker" | "tie") => {
    if (target === "player") setPlayerBet(b => b + selectedChip);
    if (target === "banker") setBankerBet(b => b + selectedChip);
    if (target === "tie")    setTieBet(b => b + selectedChip);
  };

  const clearBets = () => { setPlayerBet(0); setBankerBet(0); setTieBet(0); };
  const repeatBets = () => { setPlayerBet(b => b * 2); setBankerBet(b => b * 2); setTieBet(b => b * 2); };

  const CHIP_COLORS: Record<number, string> = {
    1:   "bg-slate-600 border-slate-400",
    5:   "bg-blue-600 border-blue-400",
    25:  "bg-orange-600 border-orange-400",
    100: "bg-green-700 border-green-400",
    500: "bg-purple-700 border-purple-400",
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] -mt-4 -mx-4 flex">

      {/* ── Left Sidebar ───────────────────────────────────────── */}
      <div className="w-52 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0d1120] min-h-screen">

        {/* VIP Card */}
        <div className="m-3 p-4 rounded-2xl bg-gradient-to-br from-amber-600/20 to-amber-900/20 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-sm">
              {(user?.username || "P")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[8px] font-black text-amber-400/70 uppercase tracking-widest">VIP MEMBER</p>
              <p className="text-white font-black text-sm">{user?.username || "Pro Bettor"}</p>
              <p className="text-amber-400 text-[9px] font-bold">Gold Tier</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 pt-2">
          {SIDEBAR_LINKS.map(s => (
            <button
              key={s.id}
              onClick={() => { setActiveSidebar(s.id); router.push(s.href as any); }}
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

        {/* Quick Deposit */}
        <div className="p-3 border-t border-white/5 space-y-2">
          <button onClick={() => router.push("/wallet" as any)} className="w-full py-2.5 rounded-xl bg-[#0071e3] text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#0064cc] active:scale-95 transition-all">
            QUICK DEPOSIT
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-white/30 hover:text-white/60 transition-colors text-[10px] font-bold">
            <Headphones className="w-3.5 h-3.5" /> Support
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-white/30 hover:text-white/60 transition-colors text-[10px] font-bold">
            <Settings className="w-3.5 h-3.5" /> Settings
          </button>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Table selector row */}
        <div className="flex gap-2 px-5 pt-4 pb-3 border-b border-white/5 overflow-x-auto scrollbar-hide">
          {LIVE_TABLES.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTable(t)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                activeTable.id === t.id
                  ? "bg-[#0071e3]/15 border-[#0071e3]/30 text-[#0071e3]"
                  : "border-white/5 text-white/40 hover:text-white hover:border-white/10"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t.label}
              <span className="text-[9px] text-white/20 font-black">
                <Users className="w-3 h-3 inline mr-0.5" />{t.players.toLocaleString()}
              </span>
            </button>
          ))}
        </div>

        {/* Live video area */}
        <div className="relative flex-1 flex flex-col min-h-0">

          {/* Live feed mock - cinematic baccarat table */}
          <div className="relative flex-1" style={{ minHeight: "340px", maxHeight: "420px" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-[#0a0a00] to-black overflow-hidden">
              {/* Decorative card table */}
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <div className="w-96 h-56 rounded-[50%] border-4 border-amber-700/40 bg-gradient-to-br from-emerald-900/30 to-emerald-950/50" />
              </div>
              {/* Felt texture lines */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full border-t border-amber-900/10"
                  style={{ top: `${(i + 1) * 12}%`, transform: `rotate(${-5 + i * 1.5}deg)` }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-4">
                  {[1, 2].map(c => (
                    <div
                      key={c}
                      className="w-20 h-28 rounded-xl border-2 border-white/20 bg-white/95 flex items-center justify-center shadow-2xl"
                      style={{ transform: `rotate(${-5 + c * 10}deg) translateY(${c === 1 ? -10 : 10}px)` }}
                    >
                      <span className="text-red-600 font-black text-3xl">{c === 1 ? "K" : "8"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overlay header bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white font-black text-xs">LIVE NOW</span>
                  <span className="text-white/30 text-xs">|</span>
                  <span className="text-white/60 text-xs font-bold">{activeTable.label}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2">
                  <Users className="w-3 h-3 text-white/40" />
                  <span className="text-white/60 text-xs font-bold">{activeTable.players.toLocaleString()}</span>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 backdrop-blur-md border border-emerald-500/20">
                <span className="text-[9px] font-black text-emerald-400 uppercase">LATEST WIN</span>
                <span className="text-emerald-400 font-black text-xs ml-2">{activeTable.latestWin}</span>
              </div>
            </div>

            {/* dealer avatar mock */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-xs font-black">D</div>
              <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                <p className="text-white/40 text-[8px] font-bold">DEALER</p>
                <p className="text-white font-black text-[10px]">Elena</p>
              </div>
            </div>

            {/* Road (bead plate dots) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {["bg-red-500","bg-blue-500","bg-red-500","bg-red-500","bg-blue-500","bg-blue-500","bg-red-500","bg-blue-500","bg-red-500","bg-blue-500","bg-red-500","bg-blue-500"].map((c, i) => (
                <div key={i} className={`w-5 h-5 rounded-full ${c} opacity-80 border-2 border-white/20`} />
              ))}
            </div>

            {/* Chat overlay */}
            {chatOpen && (
              <div className="absolute bottom-4 right-4 w-72 bg-[#0d1120]/90 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">TABLE CHAT</span>
                  <div className="flex items-center gap-2">
                    <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                    <button onClick={() => setChatOpen(false)}>
                      <X className="w-3 h-3 text-white/20 hover:text-white/60 transition-colors" />
                    </button>
                  </div>
                </div>
                <div ref={chatRef} className="h-32 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-hide">
                  {messages.map((m, i) => (
                    <div key={i}>
                      <span className={`text-[10px] font-black ${m.role === "dealer" ? "text-purple-400" : m.role === "vip" ? "text-amber-400" : "text-[#0071e3]"}`}>
                        {m.user}
                      </span>
                      <p className="text-white/50 text-[10px] mt-0.5">{m.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 border-t border-white/5">
                  <input
                    className="flex-1 bg-transparent text-xs text-white/60 placeholder:text-white/20 outline-none"
                    placeholder="Type a message..."
                    value={chatMsg}
                    onChange={e => setChatMsg(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendChat()}
                  />
                  <button onClick={sendChat} className="text-white/20 hover:text-[#0071e3] transition-colors">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
            {!chatOpen && (
              <button onClick={() => setChatOpen(true)} className="absolute bottom-4 right-4 p-3 bg-[#0d1120]/90 border border-white/10 rounded-full text-white/40 hover:text-white transition-colors">
                💬
              </button>
            )}
          </div>

          {/* ── Betting interface ──────────────────────────────── */}
          <div className="bg-[#0d1120] border-t border-white/5 px-6 py-5">
            {/* Outcome boxes */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {/* Player */}
              <button
                onClick={() => placeBet("player")}
                className="p-5 rounded-2xl border border-[#0071e3]/20 bg-[#0071e3]/5 hover:bg-[#0071e3]/10 transition-all active:scale-95 text-center group"
              >
                <p className="text-[#0071e3] font-black text-xl uppercase tracking-tight">PLAYER</p>
                <p className="text-white/30 text-xs font-bold mt-1">1:1</p>
                <p className="text-[8px] text-white/20 uppercase mt-2">TOTAL: ${(playerBet * 2.5 * 1000).toLocaleString()}</p>
                {playerBet > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-[#0071e3]/20 rounded-full">
                    <span className="text-[#0071e3] font-black text-xs">${playerBet}</span>
                  </div>
                )}
              </button>

              {/* Tie (middle) */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => placeBet("tie")}
                  className="flex-1 p-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all active:scale-95 text-center"
                >
                  <p className="text-amber-400 font-black text-lg uppercase">TIE</p>
                  <p className="text-white/30 text-[9px] font-bold">8:1</p>
                  {tieBet > 0 && <span className="text-amber-400 font-black text-xs">${tieBet}</span>}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[8px] font-black hover:bg-white/10 transition-all">P PAIR</button>
                  <button className="py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[8px] font-black hover:bg-white/10 transition-all">B PAIR</button>
                </div>
              </div>

              {/* Banker */}
              <button
                onClick={() => placeBet("banker")}
                className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all active:scale-95 text-center"
              >
                <p className="text-red-400 font-black text-xl uppercase tracking-tight">BANKER</p>
                <p className="text-white/30 text-xs font-bold mt-1">0.95:1</p>
                <p className="text-[8px] text-white/20 uppercase mt-2">TOTAL: ${(bankerBet * 3.2 * 1000).toLocaleString()}</p>
                {bankerBet > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-full">
                    <span className="text-red-400 font-black text-xs">${bankerBet}</span>
                  </div>
                )}
              </button>
            </div>

            {/* Chip selector + action buttons */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                {CHIPS.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedChip(c)}
                    className={`w-12 h-12 rounded-full border-2 font-black text-xs transition-all ${CHIP_COLORS[c]} ${selectedChip === c ? "scale-110 shadow-[0_0_12px_rgba(255,255,255,0.2)]" : "opacity-60 hover:opacity-100"} text-white`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={repeatBets}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> REPEAT
                </button>
                <button
                  onClick={clearBets}
                  className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-all active:scale-95"
                >
                  CLEAR
                </button>
              </div>

              <div className="ml-auto text-right">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">YOUR BALANCE</p>
                <p className="text-white font-black text-lg">${balance.toLocaleString("en", { minimumFractionDigits: 2 })}</p>
                {totalBet > 0 && <p className="text-[8px] text-amber-400">BET: ${totalBet}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
