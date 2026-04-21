'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  UserPlus,
  Bell,
  Gift,
  TrendingUp,
  Clock,
  MessageCircle,
  Coins,
  Flame,
  Trophy,
  Star,
  ChevronRight,
  ChevronLeft,
  Zap,
  Crown,
  Dices
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'win' | 'loss' | 'bonus';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

interface DashboardData {
  user: {
    name: string;
    level: number;
    streak: number;
    todayWins: number;
    totalWins: number;
    balance: number;
    pendingRequests: number;
    unreadNotifications: number;
    referralCommission: number;
  };
  recentTransactions: Transaction[];
  hotGames: {
    id: string;
    name: string;
    players: number;
    image: string;
  }[];
}

const mockData: DashboardData = {
  user: {
    name: 'John',
    level: 7,
    streak: 12,
    todayWins: 3,
    totalWins: 147,
    balance: 10,
    pendingRequests: 2,
    unreadNotifications: 5,
    referralCommission: 245.50,
  },
  recentTransactions: [
    { id: '1', type: 'win', amount: 250, date: '2 mins ago', status: 'completed', description: 'Game Win - Andar Bahar' },
    { id: '2', type: 'deposit', amount: 500, date: '1 hour ago', status: 'completed', description: 'Deposit via UPI' },
    { id: '3', type: 'loss', amount: -120, date: '2 hours ago', status: 'completed', description: 'Game Loss - Teen Patti' },
    { id: '4', type: 'bonus', amount: 10, date: 'Yesterday', status: 'completed', description: 'Daily Login Bonus' },
    { id: '5', type: 'withdraw', amount: 1000, date: '2 days ago', status: 'pending', description: 'Withdrawal Request' },
  ],
  hotGames: [
    { id: '1', name: 'Andar Bahar', players: 1245, image: '/games/andar-bahar.jpg' },
    { id: '2', name: 'Teen Patti', players: 892, image: '/games/teen-patti.jpg' },
    { id: '3', name: 'Dragon Tiger', players: 761, image: '/games/dragon-tiger.jpg' },
    { id: '4', name: 'Roulette', players: 543, image: '/games/roulette.jpg' },
  ],
};

const TICKER_MESSAGES = [
  "🎉 Congratulations Rahul won ₹12,500 on Andar Bahar!",
  "💸 New deposit bonus available - 150% match on first deposit!",
  "⚡ Live tournaments starting in 15 minutes. Join now!",
  "🏆 Weekly leaderboard prizes up to ₹50,000!",
  "🎁 Refer a friend and get 10% lifetime commission!",
];

export default function DashboardPage() {
  const [tickerOffset, setTickerOffset] = useState(0);
  const [chartData] = useState([12, 19, 8, 25, 15, 30, 22]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerOffset(prev => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Ticker Banner */}
      <div className="bg-yellow-500 text-black overflow-hidden py-2">
        <div
          className="whitespace-nowrap flex gap-16"
          style={{ transform: `translateX(-${tickerOffset % 2000}px)` }}
        >
          {[...TICKER_MESSAGES, ...TICKER_MESSAGES, ...TICKER_MESSAGES].map((msg, i) => (
            <span key={i} className="font-medium text-sm">{msg}</span>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Welcome Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {mockData.user.name} 👋</h1>
              <p className="text-gray-400 mt-1">Good to see you again</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                  {mockData.user.unreadNotifications}
                </span>
              </div>
            </div>
          </div>

          {/* Live Wallet Card */}
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-xl">
                  <Wallet className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Live Balance</p>
                  <p className="text-3xl font-bold">₹{mockData.user.balance.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+12.5%</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <button className="flex flex-col items-center gap-2 bg-gradient-to-b from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 transition-all rounded-xl py-3 px-2">
                <ArrowUpRight className="w-5 h-5" />
                <span className="text-sm font-medium">Deposit</span>
              </button>
              <button className="flex flex-col items-center gap-2 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all rounded-xl py-3 px-2">
                <ArrowDownLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Withdraw</span>
              </button>
              <button className="flex flex-col items-center gap-2 bg-gradient-to-b from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 transition-all rounded-xl py-3 px-2">
                <UserPlus className="w-5 h-5" />
                <span className="text-sm font-medium">Referral</span>
              </button>
              <button className="flex flex-col items-center gap-2 bg-gradient-to-b from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 transition-all rounded-xl py-3 px-2">
                <Bell className="w-5 h-5" />
                <span className="text-sm font-medium">Alerts</span>
              </button>
            </div>
          </div>

          {/* Daily Reward Banner */}
          <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-500 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-black/20 rounded-xl">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-black">Daily Reward Available!</h3>
                <p className="text-black/80 text-sm">Claim your free bonus now</p>
              </div>
            </div>
            <button className="bg-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-900 transition-all">
              Claim ₹10
            </button>
          </div>

          {/* Balance Trend Chart */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Balance Trend</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <button className="px-3 py-1 bg-gray-700/50 rounded-lg">Week</button>
                <button className="px-3 py-1 hover:bg-gray-700/30 rounded-lg">Month</button>
                <button className="px-3 py-1 hover:bg-gray-700/30 rounded-lg">Year</button>
              </div>
            </div>
            <div className="h-40 flex items-end gap-2">
              {chartData.map((value, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg transition-all hover:brightness-110"
                  style={{ height: `${(value / 35) * 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400 text-sm">Pending Requests</span>
              </div>
              <p className="text-2xl font-bold">{mockData.user.pendingRequests}</p>
            </div>
            <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400 text-sm">Unread Notifications</span>
              </div>
              <p className="text-2xl font-bold">{mockData.user.unreadNotifications}</p>
            </div>
            <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Referral Commission</span>
              </div>
              <p className="text-2xl font-bold">₹{mockData.user.referralCommission.toFixed(2)}</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Activity</h3>
              <button className="text-yellow-500 text-sm flex items-center gap-1 hover:underline">
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {mockData.recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      tx.type === 'win' || tx.type === 'deposit' || tx.type === 'bonus'
                        ? 'bg-green-500/20 text-green-400'
                        : tx.type === 'loss'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {tx.type === 'deposit' && <ArrowUpRight className="w-4 h-4" />}
                      {tx.type === 'withdraw' && <ArrowDownLeft className="w-4 h-4" />}
                      {tx.type === 'win' && <Trophy className="w-4 h-4" />}
                      {tx.type === 'loss' && <TrendingUp className="w-4 h-4 rotate-180" />}
                      {tx.type === 'bonus' && <Gift className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-gray-400 text-xs">{tx.date}</p>
                    </div>
                  </div>
                  <div className={`font-semibold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount >= 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          {/* Daily Streak */}
          <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-xl border border-orange-700/30 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Flame className="w-6 h-6 text-orange-400" />
              <h3 className="font-semibold">Daily Streak</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-orange-400">{mockData.user.streak} days</p>
                <p className="text-gray-400 text-sm">Current streak</p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-lg ${i < mockData.user.streak % 7 ? 'bg-orange-500' : 'bg-gray-700/50'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Level Indicator */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h3 className="font-semibold">Current Level</h3>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">Level {mockData.user.level}</span>
              <span className="text-gray-400 text-sm">78% to next</span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
              <div className="w-[78%] h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full" />
            </div>
          </div>

          {/* Wins Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400 text-sm">Today Wins</span>
              </div>
              <p className="text-2xl font-bold">{mockData.user.todayWins}</p>
            </div>
            <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-400 text-sm">Total Wins</span>
              </div>
              <p className="text-2xl font-bold">{mockData.user.totalWins}</p>
            </div>
          </div>

          {/* Featured Hot Games */}
          <div className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold">Hot Games</h3>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 bg-gray-700/50 rounded">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 bg-gray-700/50 rounded">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {mockData.hotGames.map(game => (
                <div key={game.id} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                    <Dices className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{game.name}</p>
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {game.players} players online
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}