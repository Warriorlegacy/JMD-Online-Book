"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LiveTennisCourtProps {
  status?: "serving" | "rally" | "break";
  teamA?: string;
  teamB?: string;
  activeSide?: "a" | "b";
  className?: string;
}

export function LiveTennisCourt({ 
  status = "rally", 
  teamA = "Player 1", 
  teamB = "Player 2", 
  activeSide = "a",
  className 
}: LiveTennisCourtProps) {
  return (
    <div className={cn(
      "relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border border-white/5",
      "bg-[#15803d]/30 bg-gradient-to-br from-[#064e3b] to-[#022c22]",
      className
    )}>
      {/* Tennis Court Markings */}
      <div className="absolute inset-8 border-2 border-white/20 flex flex-col items-center justify-center">
        {/* Service Boxes */}
        <div className="w-full h-1/2 border-b-2 border-white/20 flex">
           <div className="flex-1 border-r border-white/20" />
           <div className="flex-1" />
        </div>
        
        {/* Singles Lines */}
        <div className="absolute left-[10%] right-[10%] top-0 bottom-0 border-x-2 border-white/10" />

        {/* Center Net */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
      </div>

      {/* Dynamic Action Indicators */}
      <div 
        className={cn(
          "absolute transition-all duration-500 ease-in-out",
          activeSide === "a" ? "top-[25%]" : "top-[75%]",
          "left-[50%] -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        )}
      >
        {/* Tennis Ball */}
        <div className="relative">
          <div className={cn(
            "w-2 h-2 bg-[#d9f99d] rounded-full shadow-[0_0_10px_rgba(217,249,157,1)]",
            status === "rally" && "animate-pulse"
          )} />
          {status === "serving" && (
            <div className="absolute inset-[-8px] rounded-full border border-[#d9f99d]/40 animate-ping opacity-50" />
          )}
        </div>

        {/* Status Label */}
        {status !== "break" && (
          <div className={cn(
            "px-2 py-0.5 rounded-md backdrop-blur-md border animate-in fade-in zoom-in-95 duration-500",
            status === "serving" 
              ? "bg-[#d9f99d] text-black border-white/30 font-black" 
              : "bg-white/10 text-white/80 border-white/10 font-bold"
          )}>
            <p className="text-[8px] uppercase tracking-wider whitespace-nowrap">
              {status === "serving" ? "SERVICE" : "IN RALLY"}
            </p>
          </div>
        )}
      </div>

      {/* Set Score Indicator */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
          <div className="flex flex-col items-end">
             <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Sets</span>
             <div className="flex gap-1 mt-1">
                {[1, 2, 3].map(i => (
                   <div key={i} className={cn("w-2 h-2 rounded-full border border-white/10", i <= 1 ? "bg-[#d9f99d]" : "bg-white/5")} />
                ))}
             </div>
          </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5">
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
          <span className="text-white/60">{activeSide === "a" ? teamA : teamB}</span>
          <span>{status === "serving" ? "to serve" : "active"}</span>
        </p>
      </div>
    </div>
  );
}
