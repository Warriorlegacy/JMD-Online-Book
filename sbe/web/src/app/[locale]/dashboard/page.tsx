"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, User, ShieldCheck, CreditCard,
  History, AlertTriangle, ChevronRight, ArrowUpRight,
} from "lucide-react";

// ── sidebar nav ──────────────────────────────────────────────────────────────
const SIDEBAR = [
  { id: "overview",    label: "Overview",           icon: LayoutDashboard, href: "/dashboard" },
  { id: "profile",     label: "Profile",            icon: User,            href: "/profile" },
  { id: "verification",label: "Verification",       icon: ShieldCheck,     href: "/profile/verification" },
  { id: "payments",    label: "Payments",           icon: CreditCard,      href: "/wallet" },
  { id: "bet-history", label: "Bet History",        icon: History,         href: "/dashboard/bet-history" },
  { id: "rg",          label: "Responsible Gaming", icon: AlertTriangle,   href: "/dashboard/limits" },
];

const STATUS_COLORS: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  settled: "bg-[#0071e3]/15 text-[#0071e3] border border-[#0071e3]/20",
  pending: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router   = useRouter();
  const [activeNav, setActiveNav] = useState("overview");
  const [activeBets, setActiveBets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<{deposits: any[], withdrawals: any[]}>({deposits: [], withdrawals: []});

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const [betsRes, txRes] = await Promise.all([
          fetch(`/api/bets/active?userId=${user.id}`),
          fetch("/api/wallet/transactions")
        ]);

        if (betsRes.ok) setActiveBets(await betsRes.json());
        if (txRes.ok) setTransactions(await txRes.json());
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e17]">
        <div className="w-8 h-8 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const balance     = parseFloat(user?.balance || "0.00");
  const realMoney   = balance * 1.0; // Standardizing to 100% real for now
  const bonusCredit = 0.00;

  const combinedTransactions = [
    ...transactions.deposits.map(d => ({
      id: d.utrNumber,
      label: "Deposit",
      amount: `+₹${parseFloat(d.amount).toLocaleString()}`,
      date: new Date(d.createdAt).toLocaleDateString(),
      status: d.status
    })),
    ...transactions.withdrawals.map(w => ({
      id: w.id,
      label: "Withdrawal",
      amount: `-₹${parseFloat(w.amount).toLocaleString()}`,
      date: new Date(w.createdAt).toLocaleDateString(),
      status: w.status
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0a0e17] -mt-4 -mx-4 flex">

      {/* ── Left sidebar ─────────────────────────────────────── */}
      <div className="w-52 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0d1120] min-h-screen">

        {/* Sports Hub label */}
        <div className="px-5 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center">
              <span className="text-[#0071e3] text-xs font-black">SH</span>
            </div>
            <div>
              <p className="text-white font-black text-sm">Sports Hub</p>
              <p className="text-emerald-400 text-[9px] font-bold">Live &amp; Upcoming</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-3 space-y-0.5">
          {SIDEBAR.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => { setActiveNav(s.id); router.push(s.href as any); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${
                  activeNav === s.id
                    ? "bg-[#0071e3]/10 text-[#0071e3] border-l-2 border-[#0071e3]"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* View All Sports */}
        <div className="p-3 border-t border-white/5">
          <Link href="/sports" className="flex items-center justify-between px-3 py-2.5 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest">
            VIEW ALL SPORTS <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex gap-5 p-5 overflow-y-auto">

        {/* Centre column */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Balance card */}
          <div className="rounded-2xl border border-white/5 bg-[#0d1120] p-7">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Account Total Balance</p>
            <div className="flex items-end gap-3 mb-5">
              <p className="text-white font-black text-5xl tracking-tight">
                ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-1 pb-2 text-emerald-400 text-sm font-black">
                <ArrowUpRight className="w-4 h-4" /> +0.0%
              </div>
            </div>
            <div className="flex items-center gap-6 mb-6">
              <div>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Real Money</p>
                <p className="text-white font-black text-xl">₹{realMoney.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="w-px h-10 bg-white/5" />
              <div>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-1">Bonus Credit</p>
                <p className="text-[#0071e3] font-black text-xl">₹{bonusCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.push("/wallet" as any)} className="px-6 py-2.5 rounded-xl border border-white/15 text-white font-bold text-sm hover:bg-white/5 transition-all">
                Withdraw
              </button>
              <button onClick={() => router.push("/wallet" as any)} className="px-6 py-2.5 rounded-xl bg-[#0071e3] text-white font-bold text-sm hover:bg-[#0064cc] active:scale-95 transition-all">
                Quick Deposit
              </button>
            </div>
          </div>

          {/* Active Bets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-white font-black text-sm uppercase tracking-tight">Active Bets</h2>
                <span className="px-2 py-0.5 bg-[#0071e3]/20 border border-[#0071e3]/30 rounded-full text-[#0071e3] text-[9px] font-black">{activeBets.length}</span>
              </div>
              <button className="text-[#0071e3] text-[9px] font-black uppercase tracking-widest hover:underline">VIEW ALL</button>
            </div>
            <div className="space-y-3">
              {activeBets.length > 0 ? activeBets.map(bet => (
                <div key={bet.id} className="rounded-2xl border border-white/5 bg-[#0d1120] p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-full">
                        <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">
                          {new Date(bet.createdAt).toLocaleDateString()} • {new Date(bet.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Stake</p>
                      <p className="text-white font-black text-lg">₹{parseFloat(bet.stake).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-white font-black text-base italic uppercase">{bet.type === 'accumulator' ? 'Accumulator' : 'Single Bet'}</p>
                  <p className="text-white/30 text-[10px] mb-3 uppercase tracking-widest">TX REF: {String(bet?.id || '').substring(0, 8)}...</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase border",
                      STATUS_COLORS[bet.status as keyof typeof STATUS_COLORS] || "bg-white/10 text-white/40 border-white/10"
                    )}>
                      {bet.status}
                    </span>
                    {bet.status === 'open' && (
                      <button className="px-5 py-2 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 text-[#0071e3] text-[10px] font-black uppercase hover:bg-[#0071e3]/20 transition-all">
                        VIEW DETAILS
                      </button>
                    )}
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
                  <p className="text-white/20 text-xs font-black uppercase tracking-widest">No active bets found</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h2 className="text-white font-black text-sm uppercase tracking-tight mb-3">Recent Transactions</h2>
            <div className="rounded-2xl border border-white/5 bg-[#0d1120] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-[8px] font-black text-white/20 uppercase tracking-widest border-b border-white/5 bg-white/2">
                    <th className="px-5 py-3.5 text-left">Reference</th>
                    <th className="px-5 py-3.5 text-left">Date</th>
                    <th className="px-5 py-3.5 text-left">Type</th>
                    <th className="px-5 py-3.5 text-left">Status</th>
                    <th className="px-5 py-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {combinedTransactions.length > 0 ? combinedTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4 font-mono text-[11px] text-white font-bold">{String(tx?.id || '').substring(0, 12)}...</td>
                      <td className="px-5 py-4 text-white/40 text-[11px] font-bold uppercase">{tx.date}</td>
                      <td className="px-5 py-4 text-white/70 text-[11px] font-black uppercase italic">{tx.label}</td>
                      <td className="px-5 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[9px] font-black uppercase border",
                          STATUS_COLORS[tx.status as keyof typeof STATUS_COLORS] || "bg-white/10 text-white/40 border-white/10"
                        )}>
                          {tx.status}
                        </span>
                      </td>
                      <td className={`px-5 py-4 text-right font-mono font-black text-sm ${tx.amount.startsWith('+') ? "text-emerald-400" : "text-white"}`}>
                        {tx.amount}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-white/20 text-xs font-black uppercase tracking-widest">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Right rail ─────────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 space-y-4">

          {/* VIP Status */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-900/10 to-[#0d1120] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[9px] font-black text-amber-400/60 uppercase tracking-widest">VIP Status</p>
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 text-sm">👑</span>
              </div>
            </div>
            <h3 className="text-white font-black text-2xl mb-1">Diamond Tier</h3>
            <p className="text-white/40 text-xs mb-4">Next reward: $500 Weekly Rebate</p>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Progress</p>
                <p className="text-[9px] font-black text-amber-400">85%</p>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all" style={{ width: "85%" }} />
              </div>
            </div>
          </div>

          {/* Promos & Security */}
          <div className="space-y-4">

            {/* Enhanced Odds promo */}
            <div className="rounded-2xl border border-[#AFFF00]/15 bg-[#AFFF00]/3 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#AFFF00]" />
                <span className="text-[8px] font-black text-[#AFFF00] uppercase tracking-widest">Enhanced Odds</span>
              </div>
              <p className="text-white font-black text-sm mb-1">NBA Parlay Boost</p>
              <p className="text-white/40 text-[10px]">+15% on any 3+ leg NBA parlay today.</p>
            </div>

            {/* Secure Environment */}
            <div className="mt-3 rounded-2xl border border-white/5 bg-[#0d1120] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0071e3]" />
                <span className="text-white font-black text-xs uppercase">Secure Environment</span>
              </div>
              <p className="text-white/30 text-[10px] leading-relaxed">
                Your account is protected by 256-bit encryption. All funds are held in segregated accounts for your security.
              </p>
              <div className="flex items-center justify-between py-3 border-t border-white/5">
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Daily Deposit Limit</span>
                <span className="text-white font-black text-sm">$500.00</span>
              </div>
              <button className="w-full py-2 rounded-xl border border-white/10 text-white/40 hover:text-white text-[9px] font-black uppercase hover:border-white/20 transition-all">
                Manage Limits
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
