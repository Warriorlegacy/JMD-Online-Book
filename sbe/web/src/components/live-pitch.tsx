"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LivePitchProps {
  status?: "attack" | "danger" | "safe";
  teamA?: string;
  teamB?: string;
  activeSide?: "a" | "b";
  className?: string;
}

export function LivePitch({ 
  status = "safe", 
  teamA = "Team A", 
  teamB = "Team B", 
  activeSide = "a",
  className 
}: LivePitchProps) {
  return (
    <div className={cn(
      "relative w-full aspect-[2/1] rounded-2xl overflow-hidden shadow-2xl border border-white/5",
      "bg-gradient-to-br from-[#162a3d] to-[#09141f]",
      className
    )}>
      {/* Field Markings */}
      <div className="absolute inset-4 border-2 border-white/5 rounded-lg flex items-center justify-center">
        {/* Goal Area A */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-1/3 border-2 border-white/5 border-l-0 rounded-r-md" />
        {/* Goal Area B */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-1/3 border-2 border-white/5 border-r-0 rounded-l-md" />
        {/* Center Circle */}
        <div className="w-1/4 aspect-square rounded-full border-2 border-white/5" />
        {/* Center Line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/5" />
      </div>

      {/* Dynamic Action Indicators */}
      <div 
        className={cn(
          "absolute transition-all duration-1000 ease-in-out",
          activeSide === "a" ? "left-[30%]" : "left-[70%]",
          "top-[45%] flex flex-col items-center gap-3 z-10"
        )}
      >
        {/* Ball */}
        <div className="relative">
          <div className={cn(
            "w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] ring-4 ring-white/10",
            status !== "safe" && "animate-bounce"
          )} />
          {status === "danger" && (
            <div className="absolute inset-[-12px] rounded-full border border-[#0071e3]/40 animate-ping opacity-50" />
          )}
        </div>

        {/* Status Label */}
        {status !== "safe" && (
          <div className={cn(
            "px-2.5 py-1 rounded-lg backdrop-blur-md border animate-in fade-in zoom-in-95 duration-500",
            status === "danger" 
              ? "bg-[#0071e3]/90 text-white border-[#a7c8ff]/30 shadow-[0_0_20px_rgba(0,113,227,0.4)]" 
              : "bg-white/10 text-white/80 border-white/10"
          )}>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] whitespace-nowrap">
              {status === "danger" ? "Dangerous Attack" : "Attacking"}
            </p>
          </div>
        )}
      </div>

      {/* Possession Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
          <span className="text-white/60">{activeSide === "a" ? teamA : teamB}</span>
          <span>in possession</span>
        </p>
      </div>

      {/* Atmospheric Glow */}
      {status === "danger" && (
        <div className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-1000",
          activeSide === "a" 
            ? "bg-gradient-to-r from-[#0071e3]/10 to-transparent" 
            : "bg-gradient-to-l from-[#0071e3]/10 to-transparent"
        )} />
      )}
    </div>
  );
}
