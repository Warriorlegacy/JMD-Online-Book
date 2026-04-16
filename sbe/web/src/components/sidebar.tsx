"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Trophy, 
  Flag, 
  Gamepad2, 
  Zap, 
  Star, 
  Target, 
  Sword,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "in-play", name: "In-Play", icon: Zap, color: "text-amber-500", count: 12 },
  { id: "cricket", name: "Cricket", icon: Target, color: "text-emerald-500", count: 8 },
  { id: "football", name: "Football", icon: Flag, color: "text-sky-500", count: 15 },
  { id: "tennis", name: "Tennis", icon: Star, color: "text-lime-500", count: 4 },
  { id: "e-sports", name: "E-Sports", icon: Gamepad2, color: "text-purple-500", count: 20 },
  { id: "kabaddi", name: "Kabaddi", icon: Sword, color: "text-orange-500", count: 3 },
];

export function Sidebar() {
  const searchParams = useSearchParams();
  const activeSport = searchParams.get("sport") || "in-play";

  return (
    <aside className="w-full h-full flex flex-col gap-8 pb-10">
      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-cyan-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Find Market..." 
          className="w-full h-12 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
        />
      </div>

      <div className="space-y-6">
        <div className="px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4">Categories</h3>
          <nav className="space-y-1">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeSport === cat.id;
              
              return (
                <Link 
                  key={cat.id} 
                  href={`/?sport=${cat.id}`}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-2xl transition-all duration-300 group",
                    isActive 
                      ? "bg-linear-to-r from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 text-cyan-400" 
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-xl transition-colors",
                      isActive ? "bg-cyan-500 text-white shadow-lg shadow-cyan-900/40" : "bg-white/5 group-hover:bg-white/10"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest">{cat.name}</span>
                  </div>
                  {cat.count > 0 && (
                    <span className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded-full",
                      isActive ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-slate-700"
                    )}>
                      {cat.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4">Popular</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 group hover:bg-indigo-600/20 transition-all cursor-pointer">
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Premier League</p>
              <p className="text-xs font-bold text-white mb-2">Man City v Arsenal</p>
              <div className="flex justify-between items-center text-[9px] font-black text-slate-500">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> In-Play</span>
                <span className="text-indigo-400">View →</span>
              </div>
            </div>
            
            <div className="p-4 rounded-3xl bg-emerald-600/10 border border-emerald-500/20 group hover:bg-emerald-600/20 transition-all cursor-pointer">
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">CPL 2026</p>
              <p className="text-xs font-bold text-white mb-2">TKR v GAW</p>
              <div className="flex justify-between items-center text-[9px] font-black text-slate-500">
                <span>Today 19:30</span>
                <span className="text-emerald-400">View →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto px-4 py-6 rounded-[2rem] bg-linear-to-br from-slate-900 to-indigo-950/50 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/20 blur-3xl"></div>
        <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 italic">Pro Version</p>
        <p className="text-xs font-bold text-white leading-relaxed mb-4">Unlock advanced charts and depth analysis.</p>
        <button className="w-full py-3 bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}
