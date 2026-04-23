"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LiveCourtProps {
  status?: "attack" | "danger" | "safe";
  teamA?: string;
  teamB?: string;
  activeSide?: "a" | "b";
  className?: string;
}

export function LiveCourt({ 
  status = "safe", 
  teamA = "Home", 
  teamB = "Away", 
  activeSide = "a",
  className 
}: LiveCourtProps) {
  return (
    <div className={cn(
      "relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border border-white/5",
      "bg-[#d97706]/20 bg-gradient-to-br from-[#1e1b4b] to-[#0f172a]",
      className
    )}>
      {/* Court Markings */}
      <div className="absolute inset-4 border-2 border-white/10 rounded-sm flex items-center justify-center">
        {/* Three Point Line A */}
        <div className="absolute left-[-2%] top-1/2 -translate-y-1/2 w-[35%] h-[80%] border-2 border-white/10 rounded-r-[100px] border-l-0" />
        {/* Three Point Line B */}
        <div className="absolute right-[-2%] top-1/2 -translate-y-1/2 w-[35%] h-[80%] border-2 border-white/10 rounded-l-[100px] border-r-0" />
        
        {/* Paint A */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[18%] h-[35%] border-2 border-white/10 bg-white/5" />
        {/* Paint B */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[18%] h-[35%] border-2 border-white/10 bg-white/5" />

        {/* Center Circle */}
        <div className="w-[20%] aspect-square rounded-full border-2 border-white/10" />
        {/* Center Line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10" />
      </div>

      {/* Dynamic Action Indicators */}
      <div 
        className={cn(
          "absolute transition-all duration-700 ease-out",
          activeSide === "a" ? "left-[20%]" : "left-[80%]",
          "top-[45%] flex flex-col items-center gap-2 z-10"
        )}
      >
        {/* Basketball */}
        <div className="relative">
          <div className={cn(
            "w-2.5 h-2.5 bg-[#f59e0b] rounded-full shadow-[0_0_15px_rgba(245,158,11,1)]",
            status !== "safe" && "animate-bounce"
          )} />
          {status === "danger" && (
            <div className="absolute inset-[-10px] rounded-full border border-[#f59e0b]/40 animate-ping opacity-50" />
          )}
        </div>

        {/* Status Label */}
        {status !== "safe" && (
          <div className={cn(
            "px-2 py-0.5 rounded-md backdrop-blur-md border animate-in fade-in zoom-in-95 duration-500",
            status === "danger" 
              ? "bg-[#f59e0b] text-black border-white/30 font-black" 
              : "bg-white/10 text-white/80 border-white/10 font-bold"
          )}>
            <p className="text-[8px] uppercase tracking-wider whitespace-nowrap">
              {status === "danger" ? "IN THE PAINT" : "TRANSITION"}
            </p>
          </div>
        )}
      </div>

      {/* Shot Clock / Possession */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <div className="px-3 py-1 bg-black/60 rounded-lg border border-white/10 font-mono text-orange-500 text-xs font-black">
            24s
          </div>
          <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5">
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
              <span className="text-white/60">{activeSide === "a" ? teamA : teamB}</span>
              <span>Ball</span>
            </p>
          </div>
      </div>
    </div>
  );
}
