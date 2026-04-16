"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Zap, 
  Trophy, 
  Gamepad2, 
  Wallet 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: "Home", icon: Home, href: "/" },
    { label: "In-Play", icon: Zap, href: "/?sport=in-play" },
    { label: "Sports", icon: Trophy, href: "/sports" },
    { label: "Casino", icon: Gamepad2, href: "/casino", color: "text-amber-500" },
    { label: "Wallet", icon: Wallet, href: "/wallet" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-60 flex md:hidden border-t border-white/5 bg-slate-950/90 backdrop-blur-2xl pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link 
            key={item.label} 
            href={item.href} 
            className="flex flex-1 flex-col items-center gap-1.5 py-4 transition-all duration-300 relative group"
          >
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
            )}
            <Icon className={cn(
              "w-5 h-5 transition-transform duration-300",
              isActive ? "text-cyan-400 scale-110" : item.color || "text-slate-600 group-hover:text-slate-400"
            )} />
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest transition-colors",
              isActive ? "text-cyan-400" : "text-slate-600 group-hover:text-slate-400 font-bold"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
