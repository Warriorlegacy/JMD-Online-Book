"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/socket-context";
import { useBetSlip } from "@/context/bet-slip-context";
import { useAuth } from "@/context/auth-context";
import { Zap, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BetSlip() {
  const { connected } = useSocket();
  const {
    selection,
    isOpen,
    stake,
    odds,
    setStake,
    updateOdds,
    clearSelection,
    liability,
    profit,
    placeBet,
  } = useBetSlip();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!connected) {
      setError("Connecting to market...");
      return;
    }
    const stakeNum = parseFloat(stake) || 0;
    if (stakeNum <= 0) {
      setError("Enter valid stake");
      return;
    }
    if (odds <= 1) {
      setError("Odds must be greater than 1");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await placeBet();
      setSuccess(true);
      clearSelection();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const deltaY = e.touches[0].clientY - touchStartY;
    if (deltaY > 50) {
      clearSelection();
      setTouchStartY(null);
    }
  }, [touchStartY, clearSelection]);

  const handleTouchEnd = useCallback(() => {
    setTouchStartY(null);
  }, []);

  if (!selection) return null;

  const side = selection.side;
  const stakeNum = parseFloat(stake) || 0;
  const displayProfitLiability = side === "back" ? profit : liability;
  const potentialReturn = stakeNum + (side === "back" ? profit : 0);

  const quickStakes = ["100", "500", "1000", "2000", "5000"];

  const DrawerContent = () => (
    <div
      className={cn(
        "flex flex-col overflow-y-auto relative",
        "rounded-t-3xl md:rounded-2xl border-t md:border md:border-white/10",
        "bg-slate-900/60 backdrop-blur-3xl shadow-2xl"
      )}
    >
      {/* Mobile handle */}
      <div className="md:hidden w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-2 mb-4" />

      {/* Close button */}
      <button
        onClick={clearSelection}
        className="absolute top-2 right-2 md:top-4 md:right-4 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        aria-label="Close bet slip"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Background flare */}
      <div className={cn(
        "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 transition-colors duration-1000",
        side === "back" ? "bg-blue-600" : "bg-pink-500"
      )} />

      <div className="flex flex-col p-4 md:p-6 pb-safe md:pb-6 gap-4 md:gap-6 relative z-10 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className={cn(
              "p-1.5 md:p-2 rounded-xl",
              side === "back" ? "bg-blue-600/10 text-blue-400" : "bg-pink-500/10 text-pink-400"
            )}>
              <Zap className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <h3 className="text-[10px] md:text-xs font-black text-white uppercase tracking-wider italic">
                Active Bet Slip
              </h3>
              <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                {selection.marketName}
              </p>
            </div>
          </div>
        </div>

        {/* Selection card */}
        <div className={cn(
          "p-3 md:p-4 rounded-2xl md:rounded-3xl border transition-all duration-500",
          side === "back" ? "bg-blue-600/5 border-blue-500/20" : "bg-pink-500/5 border-pink-500/20"
        )}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {(selection as unknown as { selectionName: string }).selectionName}
            </span>
            <span className={cn(
              "text-[8px] md:text-[10px] font-black uppercase px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full",
              side === "back" ? "bg-blue-600 text-white" : "bg-pink-500 text-white"
            )}>
              {side.toUpperCase()}
            </span>
          </div>
          <p className="text-base md:text-lg font-black text-white italic">
            Odds: {odds.toFixed(2)}
          </p>
        </div>

        {/* Odds input */}
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Odds
          </label>
          <input
            type="number"
            step="0.01"
            min="1.01"
            value={odds}
            onChange={(e) => updateOdds(parseFloat(e.target.value) || 0)}
            className={cn(
              "w-full bg-white/5 border rounded-2xl px-4 text-sm font-black text-white focus:outline-none transition-all",
              side === "back" ? "focus:border-blue-500/50" : "focus:border-pink-500/50",
              "border-white/5",
              "h-12",
              "min-h-[44px]"
            )}
          />
        </div>

        {/* Stake input & quick stakes */}
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          <div className="space-y-1 md:space-y-2">
            <label className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
              Stake (₹)
            </label>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className={cn(
                "w-full bg-white/5 border rounded-xl md:rounded-2xl px-3 md:px-4 text-sm md:text-sm font-black text-white focus:outline-none transition-all",
                side === "back"
                  ? "focus:border-blue-500/50"
                  : "focus:border-pink-500/50",
                "border-white/5",
                "h-11 md:h-12",
                "min-h-[44px]"
              )}
              style={{ minHeight: "44px" }}
            />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-2 grid-rows-2 gap-1 md:gap-1.5">
            {quickStakes.map((v) => (
              <button
                key={v}
                onClick={() => setStake(v)}
                className="rounded-lg md:rounded-xl bg-white/5 border border-white/5 text-[8px] md:text-[9px] font-black text-slate-400 hover:bg-white/10 hover:text-white transition-all uppercase"
                style={{ minHeight: "44px" }}
              >
                ₹{Number(v) >= 1000 ? `${Number(v) / 1000}k` : v}
              </button>
            ))}
          </div>
        </div>

        {/* Summary panel */}
        <div className="flex justify-between items-center p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 shrink-0">
          <div className="space-y-1">
            <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Potential Return
            </p>
            <p className={cn(
              "text-sm md:text-sm font-black",
              side === "back" ? "text-emerald-400" : "text-slate-300"
            )}>
              ₹ {potentialReturn.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">
              {side === "back" ? "Profit" : "Liability"}
            </p>
            <p className={cn(
              "text-sm md:text-sm font-black",
              side === "back" ? "text-emerald-400" : "text-pink-400"
            )}>
              ₹ {displayProfitLiability.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Place bet button */}
         <button
            onClick={handlePlaceOrder}
            disabled={loading || stakeNum <= 0 || odds <= 1}
          className={cn(
            "w-full rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] transition-all relative overflow-hidden group/btn h-11 md:h-14 flex items-center justify-center shrink-0",
            "min-h-[44px]",
            loading
              ? "bg-slate-800 text-slate-600"
              : success
              ? "bg-emerald-500 text-white"
              : side === "back"
              ? "bg-blue-600 text-white shadow-lg md:shadow-xl shadow-blue-900/40"
              : "bg-pink-600 text-white shadow-lg md:shadow-xl shadow-pink-900/40"
          )}
        >
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 skew-x-12" />
          {loading ? (
            <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
          ) : success ? (
            <div className="flex items-center justify-center gap-1 md:gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Matched</span>
            </div>
          ) : (
            `Confirm ${side.toUpperCase()} Order`
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center gap-1 md:gap-2 text-[8px] md:text-[10px] font-bold text-red-400 uppercase tracking-wider animate-bounce">
            <AlertCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
            {error}
          </div>
        )}

        {/* Connectivity */}
        <div className="flex items-center gap-1.5 md:gap-2 px-1">
          <div className={cn("w-1.5 h-1.5 rounded-full", connected ? "bg-emerald-500" : "bg-amber-500")} />
          <span className="text-[7px] md:text-[8px] font-black text-slate-600 uppercase tracking-widest">
            {connected ? "Market Connectivity High" : "Searching for sync..."}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: fixed bottom drawer with swipe */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden",
          "animate-in slide-in-from-bottom duration-300",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <DrawerContent />
      </div>

      {/* Desktop: fixed right sidebar */}
      <div className="animate-in fade-in duration-300 hidden md:flex md:fixed md:right-4 md:top-24 md:bottom-4 md:w-96 md:max-w-full md:flex-col md:rounded-2xl md:overflow-y-auto z-50">
        <DrawerContent />
      </div>
    </>
  );
}
