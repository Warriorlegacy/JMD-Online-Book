"use client";

import { useState } from "react";
import { Search, Clock, User, Zap, Send, Paperclip, Smile, AlertTriangle, Star, RotateCcw, Gift, Edit, HelpCircle } from "lucide-react";


// ─── Types ────────────────────────────────────────────────────────────────────
interface Ticket { id: string; channel: "CHAT" | "WHATSAPP" | "EMAIL" | "RESOLVED"; name: string; preview: string; time: string; isVip?: boolean; isOnline?: boolean; }
interface Message { id: string; from: "user" | "agent" | "system"; text: string; time: string; read?: boolean; }
interface RecentBet { match: string; market: string; amount: string; settled: boolean; pnl: string; }

const INBOX: Ticket[] = [
  { id: "julian", channel: "CHAT", name: "Julian Rossi (VIP)", preview: "My withdrawal for $12,400 is still pending. Can you check the transaction status?", time: "2m ago", isVip: true, isOnline: true },
  { id: "sarah", channel: "WHATSAPP", name: "Sarah Jenkins", preview: "I can't see the odds for the upcoming Derby match. Is the market suspended?", time: "14m ago" },
  { id: "marcus", channel: "EMAIL", name: "Marcus Vogt", preview: "KYC verification documents attached for Tier 2 account limit increase.", time: "1h ago" },
  { id: "elena", channel: "RESOLVED", name: "Elena Kosta", preview: "Password reset successful. Thank you for the quick assistance!", time: "3h ago" },
];

const MESSAGES: Message[] = [
  { id: "1", from: "user", text: "Hi, I requested a withdrawal of $12,400 to my bank account yesterday morning. It's still showing as \"Pending\" in my transaction history. My regular withdrawals usually clear within 4 hours.", time: "10:42 AM", read: true },
  { id: "2", from: "agent", text: "Hello Julian! I hope you're having a great day. Let me look into that for you right away. Due to the high value, it might have triggered a standard secondary compliance review. One moment please while I access the Ledger records.", time: "10:44 AM", read: true },
  { id: "3", from: "user", text: "Thanks for the quick response. I have some big plays planned for the weekend, so I'd like to get this settled so I can re-allocate my bankroll.", time: "10:45 AM" },
  { id: "4", from: "system", text: "Auto-system: User has exceeded the $50k weekly volume threshold. KYC refresh may be required soon.", time: "10:45 AM" },
];

const RECENT_BETS: RecentBet[] = [
  { match: "Lakers v Celtics", market: "Over 224.5 Pts", amount: "+$840", settled: true, pnl: "+" },
  { match: "Man City v Arsenal", market: "Home Win", amount: "-$1,200", settled: true, pnl: "-" },
];

function ChannelPill({ channel }: { channel: Ticket["channel"] }) {
  const styles: Record<Ticket["channel"], string> = {
    CHAT: "bg-[#0071e3]/20 text-[#0071e3] border-[#0071e3]/30",
    WHATSAPP: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    EMAIL: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    RESOLVED: "bg-white/10 text-white/30 border-white/10",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${styles[channel]}`}>
      {channel}
    </span>
  );
}

export default function SupportTab() {
  const [activeTicket, setActiveTicket] = useState("julian");
  const [reply, setReply] = useState("");
  const [internalNote, setInternalNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-[700px] glass-card rounded-3xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Inbox Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-white/5 bg-black/20">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-black uppercase tracking-tight text-sm">PRIORITY INBOX</h3>
            <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <Search className="w-4 h-4 text-white/30" />
            </button>
          </div>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tickets..."
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white/60 placeholder:text-white/20 focus:outline-none"
          />
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {INBOX.map(ticket => (
            <div
              key={ticket.id}
              onClick={() => setActiveTicket(ticket.id)}
              className={`p-4 cursor-pointer transition-colors hover:bg-white/5 ${activeTicket === ticket.id ? "bg-[#0071e3]/10 border-l-2 border-[#0071e3]" : ""}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <ChannelPill channel={ticket.channel} />
                <span className="text-[10px] text-white/20">{ticket.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {ticket.isOnline && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
                <p className="text-white font-bold text-sm truncate">{ticket.name}</p>
              </div>
              <p className="text-white/30 text-xs mt-0.5 line-clamp-2 leading-relaxed">{ticket.preview}</p>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/5">
          <button className="w-full py-3 bg-[#0071e3]/10 border border-[#0071e3]/20 rounded-xl text-[#0071e3] text-xs font-black uppercase tracking-widest hover:bg-[#0071e3]/20 transition-colors">
            GENERATE REPORT
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/10">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-amber-400" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a0e17]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-black text-white">Julian Rossi</p>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-500/25 rounded-full">
                  <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  <span className="text-amber-400 text-[8px] font-black uppercase tracking-widest">VIP PLATINUM</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white text-xs font-bold transition-colors">
              <Clock className="w-3.5 h-3.5" />Logs
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors">
              <AlertTriangle className="w-3.5 h-3.5" />Escalate
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="text-center mb-6">
            <span className="px-4 py-1.5 bg-white/5 rounded-full text-white/20 text-[10px] font-bold uppercase">TODAY</span>
          </div>

          {MESSAGES.map(msg => (
            <div key={msg.id} className={`flex ${msg.from === "agent" ? "justify-end" : msg.from === "system" ? "justify-center" : "justify-start"}`}>
              {msg.from === "user" && (
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center mr-2 flex-shrink-0 mt-auto">
                  <User className="w-3.5 h-3.5 text-white/40" />
                </div>
              )}
              {msg.from === "system" ? (
                <div className="flex items-start gap-2 max-w-sm px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                  <p className="text-emerald-300 text-xs leading-relaxed">{msg.text}</p>
                </div>
              ) : (
                <div className="max-w-[65%]">
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.from === "agent"
                      ? "bg-[#0071e3] text-white rounded-br-sm"
                      : "bg-white/10 text-white/80 rounded-bl-sm"
                  }`}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-white/20 text-[10px]">{msg.time}</span>
                    {msg.read && msg.from === "agent" && <span className="text-[#0071e3] text-[10px]">• Read</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reply area */}
        <div className="px-6 py-4 border-t border-white/5 bg-black/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              {["INTERNAL", "ONLY"].map((tog, i) => (
                <button
                  key={i}
                  onClick={() => i === 0 && setInternalNote(!internalNote)}
                  className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-colors ${internalNote ? "text-amber-400" : "text-white/20 hover:text-white/40"}`}
                >
                  {tog}
                </button>
              ))}
              <div className="w-8 h-4 rounded-full bg-white/5 flex items-center px-0.5 cursor-pointer" onClick={() => setInternalNote(!internalNote)}>
                <div className={`w-3 h-3 rounded-full transition-all ${internalNote ? "translate-x-4 bg-amber-400" : "bg-white/20"}`} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus-within:border-[#0071e3]/30 transition-colors">
              <input
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Type your response... (Use '/' for canned responses)"
                className="flex-1 bg-transparent text-sm text-white/60 placeholder:text-white/20 focus:outline-none"
              />
              <div className="flex items-center gap-2 text-white/20">
                <button className="hover:text-white/40 transition-colors"><Paperclip className="w-4 h-4" /></button>
                <button className="hover:text-white/40 transition-colors"><Smile className="w-4 h-4" /></button>
              </div>
            </div>
            <button
              disabled={!reply.trim()}
              className="flex items-center gap-2 px-5 py-3 bg-[#0071e3] text-white text-sm font-bold rounded-2xl hover:bg-[#0071e3]/90 active:scale-95 transition-all disabled:opacity-40"
            >
              Send Message<Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* User Intelligence Panel */}
      <div className="w-64 flex-shrink-0 flex flex-col border-l border-white/5 bg-black/20 overflow-y-auto">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-white font-black text-xs uppercase tracking-widest">USER INTELLIGENCE</h3>
        </div>
        <div className="p-5 space-y-5 flex-1">
          {/* Balance + KYC */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">BALANCE</p>
              <p className="text-white font-black">$42,910.40</p>
            </div>
            <div>
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-1">KYC STATUS</p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <p className="text-emerald-400 font-bold text-sm">Verified</p>
              </div>
            </div>
          </div>

          {/* Risk Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">RISK SCORE</p>
              <p className="text-emerald-400 text-xs font-black">LOW (12/100)</p>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: "12%" }} />
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-3">QUICK ACTIONS</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Reset Pass", icon: <RotateCcw className="w-4 h-4" /> },
                { label: "Issue Bonus", icon: <Gift className="w-4 h-4" /> },
                { label: "Correction", icon: <Edit className="w-4 h-4" /> },
                { label: "Help Article", icon: <HelpCircle className="w-4 h-4" /> },
              ].map(action => (
                <button key={action.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-white/50 hover:text-white">
                  {action.icon}
                  <span className="text-[9px] font-bold">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Escalate button */}
          <button className="w-full py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors">
            ESCALATE TO RISK DEPT
          </button>

          {/* Recent Bets */}
          <div>
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-3">RECENT BETS</p>
            <div className="space-y-2">
              {RECENT_BETS.map((bet, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="text-white text-xs font-bold">{bet.match}</p>
                    <p className="text-white/30 text-[10px]">{bet.market}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-sm ${bet.pnl === "+" ? "text-emerald-400" : "text-red-400"}`}>
                      {bet.amount}
                    </p>
                    <p className="text-white/20 text-[9px]">Settled</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Team Notes */}
          <div>
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-3">INTERNAL TEAM NOTES</p>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <p className="text-white/60 text-xs italic leading-relaxed">
                "Compliance team noted Julian has regular high-stakes activity. Approved for fast-track withdrawals up to $5k."
              </p>
              <p className="text-white/20 text-[10px] mt-2">— Sarah (Compliance)</p>
            </div>
            <input
              placeholder="Add a team note..."
              className="w-full mt-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-white/40 placeholder:text-white/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Floating Zap button */}
        <div className="p-4 sticky bottom-0">
          <button className="w-10 h-10 ml-auto flex items-center justify-center bg-[#AFFF00] rounded-2xl hover:scale-110 transition-all shadow-lg shadow-[#AFFF00]/20">
            <Zap className="w-5 h-5 text-black fill-black" />
          </button>
        </div>
      </div>
    </div>
  );
}
