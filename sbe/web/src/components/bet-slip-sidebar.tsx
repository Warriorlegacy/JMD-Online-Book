"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// TypeScript Interfaces
interface BetSelection {
  id: string;
  match: string;
  market: string;
  selection: string;
  odds: number;
}

interface ActiveBet {
  id: string;
  match: string;
  selection: string;
  stake: number;
  odds: number;
  potentialReturn: number;
  cashOutValue: number;
}

interface PopularBet {
  id: string;
  match: string;
  selection: string;
  odds: number;
  volume: number;
}

export default function BetSlipSidebar() {
  // State Management
  const [selections, setSelections] = useState<BetSelection[]>([]);
  
  const [stake, setStake] = useState<string>("100");
  const [activeTab, setActiveTab] = useState<'bet-slip' | 'my-bets'>('bet-slip');
  
  // Calculations
  const totalOdds = useMemo(() => {
    return selections.reduce((acc, sel) => acc * sel.odds, 1);
  }, [selections]);
  
  const stakeValue = parseFloat(stake) || 0;
  const potentialReturn = stakeValue * totalOdds;
  const potentialProfit = potentialReturn - stakeValue;
  
  // Sample Data
  const activeBets: ActiveBet[] = [];
  
  const popularBets: PopularBet[] = [];

  // Handlers
  const removeSelection = (id: string) => {
    setSelections(prev => prev.filter(s => s.id !== id));
  };

  const clearAll = () => {
    setSelections([]);
    setStake("0");
  };

  return (
    <aside className="fixed right-0 top-0 h-screen w-[320px] flex flex-col z-40 border-l border-white/10">
      {/* Glass Backdrop Container */}
      <div className="absolute inset-0 bg-surface-container/90 backdrop-blur-xl" />
      
      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('bet-slip')}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all",
                activeTab === 'bet-slip' 
                  ? "bg-primary text-on-primary" 
                  : "bg-surface text-on-surface-variant hover:bg-surface-variant/50"
              )}
            >
              Bet Slip
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary-container text-primary text-[10px] font-bold">
                {selections.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('my-bets')}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all",
                activeTab === 'my-bets' 
                  ? "bg-primary text-on-primary" 
                  : "bg-surface text-on-surface-variant hover:bg-surface-variant/50"
              )}
            >
              My Bets
            </button>
          </div>
          
          {selections.length > 0 && (
            <button 
              onClick={clearAll}
              className="text-xs text-on-surface-variant hover:text-error transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'bet-slip' && (
            <>
              {/* Active Selections */}
              {selections.length > 0 ? (
                <div className="space-y-3">
                  {selections.map((selection) => (
                    <div 
                      key={selection.id}
                      className="bg-surface-variant/30 rounded-xl p-3 border border-outline-variant/10 relative group"
                    >
                      <button
                        onClick={() => removeSelection(selection.id)}
                        className="absolute right-2 top-2 w-6 h-6 rounded-full bg-surface-variant/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-error"
                      >
                        <span className="material-symbols-rounded text-[16px]">close</span>
                      </button>
                      
                      <p className="text-xs text-on-surface-variant mb-0.5">{selection.match}</p>
                      <p className="text-[11px] text-on-surface-variant/70 mb-1">{selection.market}</p>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-on-surface">{selection.selection}</p>
                        <span className="text-sm font-bold text-[#abd45e]">{selection.odds.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="material-symbols-rounded text-5xl text-outline-variant/50 mb-3">receipt_long</span>
                  <p className="text-on-surface-variant text-sm">No selections added</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">Tap odds to add selections to your bet slip</p>
                </div>
              )}

              {/* Stake & Calculations Section */}
              {selections.length > 0 && (
                <div className="space-y-3">
                  {/* Total Odds */}
                  <div className="flex justify-between items-center py-2 border-t border-outline-variant/10">
                    <span className="text-sm text-on-surface-variant">Total Odds</span>
                    <span className="text-sm font-semibold text-on-surface">{totalOdds.toFixed(2)}</span>
                  </div>

                  {/* Stake Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-on-surface-variant">Stake</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span>
                      <input
                        type="number"
                        value={stake}
                        onChange={(e) => setStake(e.target.value)}
                        className="w-full bg-surface-variant/30 border border-outline-variant/10 rounded-xl pl-8 pr-4 py-3 text-on-surface font-medium focus:outline-none focus:border-primary/50 transition-colors"
                        min="0"
                        step="1"
                      />
                    </div>
                    
                    {/* Quick Stake Buttons */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[100, 500, 1000, 5000].map(amount => (
                        <button
                          key={amount}
                          onClick={() => setStake(amount.toString())}
                          className="py-1.5 rounded-lg bg-surface-variant/20 text-xs font-medium text-on-surface-variant hover:bg-surface-variant/40 transition-colors"
                        >
                          ₹{amount >= 1000 ? `${amount/1000}k` : amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Potential Return */}
                  <div className="bg-tertiary-container/30 rounded-xl p-3 border border-tertiary/10">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-on-surface-variant">Potential Return</span>
                      <span className="text-lg font-bold text-[#abd45e]">₹ {potentialReturn.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-on-surface-variant/70">Potential Profit</span>
                      <span className="text-sm font-medium text-on-surface">₹ {potentialProfit.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Place Bet Button */}
                  <button
                    disabled={stakeValue <= 0}
                    className="w-full h-12 rounded-xl bg-gradient-to-b from-tertiary to-tertiary-container text-on-tertiary font-semibold text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform shadow-lg shadow-tertiary/15"
                  >
                    Place Bet
                  </button>
                </div>
              )}

              {/* Popular Today Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Popular Today</h4>
                <div className="space-y-2">
                  {popularBets.map(bet => (
                    <div key={bet.id} className="bg-surface-variant/20 rounded-lg p-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-on-surface">{bet.selection}</p>
                        <p className="text-[10px] text-on-surface-variant/70">{bet.match}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#abd45e]">{bet.odds.toFixed(2)}</p>
                        <p className="text-[10px] text-on-surface-variant/50">{bet.volume.toLocaleString()} bets</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'my-bets' && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Active Bets</h4>
              
              {activeBets.map(bet => (
                <div key={bet.id} className="bg-surface-variant/25 rounded-xl p-3 space-y-2 border border-outline-variant/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-on-surface">{bet.selection}</p>
                      <p className="text-[10px] text-on-surface-variant/70">{bet.match}</p>
                    </div>
                    <span className="text-xs font-bold text-[#abd45e]">@{bet.odds.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-1 border-t border-outline-variant/10">
                    <div>
                      <p className="text-[10px] text-on-surface-variant/50">Stake</p>
                      <p className="text-xs font-medium text-on-surface">₹{bet.stake.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-on-surface-variant/50">Return</p>
                      <p className="text-xs font-medium text-[#abd45e]">₹{bet.potentialReturn.toFixed(2)}</p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-tertiary/10 text-tertiary text-xs font-semibold hover:bg-tertiary/20 transition-colors">
                      Cash Out ₹{bet.cashOutValue.toFixed(2)}
                    </button>
                  </div>
                </div>
              ))}

              {activeBets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="material-symbols-rounded text-4xl text-outline-variant/50 mb-2">sports_soccer</span>
                  <p className="text-on-surface-variant text-sm">No active bets</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
