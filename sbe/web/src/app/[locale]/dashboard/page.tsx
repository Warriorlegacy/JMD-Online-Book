'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/context/auth-context';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, UserPlus, Bell, Gift,
  TrendingUp, Clock, Coins, Flame, Trophy, Star, ChevronRight,
  Zap, Crown, Dices, Activity, Shield, BarChart3
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CHART_DATA = [42, 58, 35, 72, 55, 88, 65, 79, 60, 90, 74, 85, 68, 95];

const TRANSACTIONS = [
  { id: '1', type: 'win' as const, amount: 250, date: '2 mins ago', label: 'Game Win — Andar Bahar' },
  { id: '2', type: 'deposit' as const, amount: 500, date: '1 hour ago', label: 'Deposit via UPI' },
  { id: '3', type: 'loss' as const, amount: -120, date: '2 hours ago', label: 'Game Loss — Teen Patti' },
  { id: '4', type: 'bonus' as const, amount: 10, date: 'Yesterday', label: 'Daily Login Bonus' },
  { id: '5', type: 'withdraw' as const, amount: -1000, date: '2 days ago', label: 'Withdrawal Request' },
];

const HOT_GAMES = [
  { id: '1', name: 'Andar Bahar', players: 1245, emoji: '🃏', hot: true },
  { id: '2', name: 'Teen Patti', players: 892, emoji: '🎴', hot: true },
  { id: '3', name: 'Dragon Tiger', players: 761, emoji: '🐉', hot: false },
  { id: '4', name: 'Live Roulette', players: 543, emoji: '🎡', hot: false },
];

const TX_STYLES = {
  win:     { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: <Trophy className="w-4 h-4" /> },
  deposit: { color: 'text-[#0071e3]',   bg: 'bg-[#0071e3]/10 border-[#0071e3]/20',   icon: <ArrowUpRight className="w-4 h-4" /> },
  loss:    { color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',       icon: <TrendingUp className="w-4 h-4 rotate-180" /> },
  bonus:   { color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   icon: <Gift className="w-4 h-4" /> },
  withdraw:{ color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20', icon: <ArrowDownLeft className="w-4 h-4" /> },
};

function TrendChart() {
  const max = Math.max(...CHART_DATA);
  return (
    <div className="flex items-end gap-1 h-full w-full">
      {CHART_DATA.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all duration-300"
          style={{
            height: `${(v / max) * 100}%`,
            background: `rgba(0,113,227,${0.15 + (v / max) * 0.5})`,
          }}
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [chartPeriod, setChartPeriod] = useState<'W' | 'M' | 'Y'>('W');

  const balance = parseFloat(user?.balance || '0');

  return (
    <div className="min-h-screen bg-[#0a0e17] -mt-4 -mx-4 px-4 pt-6 pb-12">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Welcome header ─────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="text-[#0071e3]">{user?.username || 'Player'}</span> 👋
            </h1>
            <p className="text-white/30 text-sm mt-1">All systems operational — your edge awaits.</p>
          </div>
          <button className="relative p-3 glass-card rounded-2xl border border-white/5 hover:border-white/10 transition-all">
            <Bell className="w-5 h-5 text-white/40" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[9px] font-black flex items-center justify-center">5</div>
          </button>
        </div>

        {/* ── Main grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Left: main column */}
          <div className="lg:col-span-8 space-y-5">

            {/* Wallet card */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden">
              {/* decorative glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#0071e3] opacity-5 blur-3xl pointer-events-none" />

              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">LIVE WALLET BALANCE</p>
                  <p className="text-5xl font-black text-white font-mono">
                    ₹{balance.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-bold">+12.5% this week</span>
                  </div>
                </div>
                <div className="p-3.5 bg-[#0071e3]/10 border border-[#0071e3]/20 rounded-2xl">
                  <Wallet className="w-6 h-6 text-[#0071e3]" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Deposit', icon: <ArrowUpRight className="w-5 h-5" />, accent: '#10B981', href: '/wallet' },
                  { label: 'Withdraw', icon: <ArrowDownLeft className="w-5 h-5" />, accent: '#0071e3', href: '/wallet' },
                  { label: 'Referral', icon: <UserPlus className="w-5 h-5" />, accent: '#8B5CF6', href: '/affiliate' },
                  { label: 'Alerts', icon: <Bell className="w-5 h-5" />, accent: '#F97316', href: '#' },
                ].map(btn => (
                  <button
                    key={btn.label}
                    onClick={() => router.push(btn.href as any)}
                    className="flex flex-col items-center gap-2 py-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:scale-105 active:scale-95"
                    style={{ background: `${btn.accent}10` }}
                  >
                    <div style={{ color: btn.accent }}>{btn.icon}</div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Reward */}
            <div className="flex items-center justify-between p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 glass-card">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Gift className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-black text-white">Daily Reward Available!</h3>
                  <p className="text-amber-400/60 text-xs mt-0.5">Your login bonus is waiting for you</p>
                </div>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-amber-500 text-black text-sm font-black hover:bg-amber-400 active:scale-95 transition-all">
                Claim ₹10
              </button>
            </div>

            {/* Balance trend */}
            <div className="glass-card p-6 rounded-3xl border border-white/5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-black text-white">Balance Trend</h3>
                <div className="flex items-center gap-1 p-1 glass rounded-full border border-white/5">
                  {(['W', 'M', 'Y'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setChartPeriod(p)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${chartPeriod === p ? 'bg-[#0071e3] text-white' : 'text-white/30 hover:text-white'}`}
                    >
                      {p === 'W' ? 'WEEK' : p === 'M' ? 'MONTH' : 'YEAR'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-36">
                <TrendChart />
              </div>
            </div>

            {/* Stats mini-cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Pending Requests', value: '2', icon: <Clock className="w-5 h-5" />, color: 'text-[#0071e3]', bg: 'bg-[#0071e3]/10 border-[#0071e3]/20' },
                { label: 'Unread Alerts', value: '5', icon: <Bell className="w-5 h-5" />, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                { label: 'Referral Earnings', value: '₹245', icon: <Coins className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              ].map(card => (
                <div key={card.label} className="glass-card p-5 rounded-2xl border border-white/5">
                  <div className={`p-2.5 rounded-xl border ${card.bg} ${card.color} mb-3 w-fit`}>
                    {card.icon}
                  </div>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{card.label}</p>
                  <p className={`text-2xl font-black mt-1 ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                <h3 className="font-black text-white">Recent Activity</h3>
                <button
                  onClick={() => router.push('/wallet')}
                  className="flex items-center gap-1 text-[#0071e3] text-xs font-bold hover:underline"
                >
                  View all<ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {TRANSACTIONS.map(tx => {
                  const style = TX_STYLES[tx.type];
                  return (
                    <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/2 transition-colors">
                      <div className={`p-2.5 rounded-xl border ${style.bg} ${style.color} flex-shrink-0`}>
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">{tx.label}</p>
                        <p className="text-white/30 text-xs mt-0.5">{tx.date}</p>
                      </div>
                      <p className={`font-black ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.amount >= 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-4 space-y-5">

            {/* Daily Streak */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-orange-500 opacity-5 blur-2xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-black">Daily Streak</h3>
                  <p className="text-white/30 text-xs">Keep it going!</p>
                </div>
              </div>
              <p className="text-4xl font-black text-orange-400 mb-4">12 <span className="text-xl text-orange-400/60 font-bold">days</span></p>
              <div className="flex gap-1.5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded-lg transition-all ${i < 5 ? 'bg-orange-500/80 shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-white/5'}`}
                  />
                ))}
              </div>
            </div>

            {/* Level Progress */}
            <div className="glass-card p-6 rounded-3xl border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-black">Level 7</h3>
                  <p className="text-white/30 text-xs">78% to Level 8</p>
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                  style={{ width: '78%' }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] text-white/20 font-bold uppercase">LVL 7</span>
                <span className="text-[9px] text-white/20 font-bold uppercase">LVL 8</span>
              </div>
            </div>

            {/* Wins */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-2">
                <div className="p-2 bg-[#0071e3]/10 border border-[#0071e3]/20 rounded-xl w-fit">
                  <Zap className="w-4 h-4 text-[#0071e3]" />
                </div>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Today Wins</p>
                <p className="text-2xl font-black text-[#0071e3]">3</p>
              </div>
              <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-2">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl w-fit">
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Total Wins</p>
                <p className="text-2xl font-black text-amber-400">147</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="glass-card p-5 rounded-3xl border border-white/5">
              <h3 className="text-white font-black mb-4 text-sm uppercase tracking-tight">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Sports Betting', icon: <Activity className="w-4 h-4" />, href: '/sports', accent: '#0071e3' },
                  { label: 'Casino Games', icon: <Dices className="w-4 h-4" />, href: '/casino', accent: '#8B5CF6' },
                  { label: 'KYC Verification', icon: <Shield className="w-4 h-4" />, href: '/profile/verification', accent: '#10B981' },
                  { label: 'Affiliate Hub', icon: <BarChart3 className="w-4 h-4" />, href: '/affiliate', accent: '#F97316' },
                ].map(link => (
                  <button
                    key={link.label}
                    onClick={() => router.push(link.href as any)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all text-white/60 hover:text-white group"
                  >
                    <div className="p-1.5 rounded-lg" style={{ background: `${link.accent}15`, color: link.accent }}>
                      {link.icon}
                    </div>
                    <span className="text-sm font-bold flex-1 text-left">{link.label}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: link.accent }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Hot Games */}
            <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <h3 className="text-white font-black text-sm uppercase tracking-tight">Hot Games Now</h3>
              </div>
              <div className="divide-y divide-white/5">
                {HOT_GAMES.map(game => (
                  <button
                    key={game.id}
                    onClick={() => router.push('/casino' as any)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                      {game.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{game.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Flame className="w-3 h-3 text-orange-400" />
                        <p className="text-white/30 text-xs">{game.players.toLocaleString()} online</p>
                      </div>
                    </div>
                    {game.hot && (
                      <span className="px-2 py-1 bg-red-500/15 border border-red-500/20 text-red-400 text-[8px] font-black rounded-full uppercase tracking-widest">
                        HOT
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}