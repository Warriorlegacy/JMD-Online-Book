"use client";

import React from "react";
import Link from "next/link";
 import { useAuth } from "@/context/auth-context";
 import { useSocket } from "@/context/socket-context";
 import { User, Wallet, Loader2, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeaderActions() {
  const { user, loading, logout } = useAuth();
  const { connected, on } = useSocket();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [balance, setBalance] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!user) {
      setBalance(null);
      return;
    }
    fetch('/api/wallet/balance')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed');
      })
      .then(data => {
        setBalance(data.available || 0);
      })
      .catch(() => setBalance(null));
   }, [user]);

  React.useEffect(() => {
    if (!connected || !user) return;
    const unsubscribe = on<{ userId: string; available: number; locked: number }>("balance_update", (data) => {
      if (data.userId === user.id) {
        setBalance(data.available);
      }
    });
    return () => unsubscribe();
  }, [connected, user, on]);


  if (loading) {
    return <Loader2 className="w-5 h-5 animate-spin text-slate-500" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link 
          href="/login" 
          className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center"
        >
          Sign In
        </Link>
        <Link 
          href="/register" 
          className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-lg active:scale-95 flex items-center"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 relative">
      <Link 
        href="/wallet" 
        className="hidden sm:flex flex-col items-end group"
      >
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Balance</span>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
        {balance !== null ? (
          <span className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors">
            ₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-sm font-black text-slate-500">—</span>
        )}
      </Link>

      <div className="h-8 w-px bg-white/5 hidden sm:block"></div>

      <div className="relative">
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="h-10 px-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center gap-3 group"
        >
          <div className="w-6 h-6 rounded-lg bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-black italic">
            {user.username[0].toUpperCase()}
          </div>
          <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
            {user.username}
          </span>
          <ChevronDown className={cn("w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-all", dropdownOpen && "rotate-180")} />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
            <div className="absolute right-0 mt-3 w-56 rounded-3xl bg-slate-900 border border-white/10 p-2 shadow-2xl z-20 animate-in fade-in zoom-in-95 duration-200">
              <Link 
                href="/profile" 
                onClick={() => setDropdownOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">My Account</span>
                </div>
                <ChevronDown className="w-3 h-3 -rotate-90 opacity-0 group-hover:opacity-100" />
              </Link>
              <Link 
                href="/wallet" 
                onClick={() => setDropdownOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Wallet</span>
                </div>
                <ChevronDown className="w-3 h-3 -rotate-90 opacity-0 group-hover:opacity-100" />
              </Link>
              <div className="my-2 border-t border-white/5"></div>
              <button 
                onClick={() => { logout(); setDropdownOpen(false); }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
