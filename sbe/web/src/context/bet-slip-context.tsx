 "use client";

 import React, { createContext, useContext, useState } from "react";
 import { useAuth } from "@/context/auth-context";

export type BetSide = "back" | "lay";

interface Selection {
  matchId: string;
  matchName: string;
  marketName: string;
  selectionId: string;
  selectionName: string;
  odds: number;
  side: BetSide;
}

interface BetSlipContextType {
  selection: Selection | null;
  stake: string;
  odds: number;
  isOpen: boolean;
  setSelection: (selection: Selection) => void;
  setStake: (stake: string) => void;
  updateOdds: (odds: number) => void;
  setIsOpen: (isOpen: boolean) => void;
  clearSelection: () => void;
  placeBet: () => Promise<void>;
  liability: number;
  profit: number;
}

const BetSlipContext = createContext<BetSlipContextType | undefined>(undefined);

export const BetSlipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selection, setSelectionState] = useState<Selection | null>(null);
    const [stake, setStake] = useState("");
    const [odds, setOdds] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

    const setSelection = (sel: Selection) => {
        setSelectionState(sel);
        setOdds(sel.odds);
        setStake("");
        setIsOpen(true);
    };

    const updateOdds = (newOdds: number) => {
        setOdds(newOdds);
    };

    const clearSelection = () => {
        setSelectionState(null);
        setStake("");
        setOdds(0);
        setIsOpen(false);
    };

    const stakeNum = parseFloat(stake);
    const isValidStake = !isNaN(stakeNum) && stakeNum > 0;

    const liability = selection && isValidStake && selection.side === "lay"
        ? stakeNum * (odds - 1)
        : 0;

    const profit = selection && isValidStake && selection.side === "back"
        ? stakeNum * (odds - 1)
        : selection && isValidStake && selection.side === "lay"
            ? stakeNum
            : 0;

    const placeBet = async () => {
        if (!selection || !stake || !isValidStake) return;

        const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user?.id,
                matchId: selection.matchId,
                selectionId: selection.selectionId,
                type: selection.side,
                price: odds.toString(),
                stake: stake,
            }),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || "Failed to place bet");
        }

        clearSelection();
    };

   return (
     <BetSlipContext.Provider value={{
         selection,
         stake,
         odds,
         isOpen,
         setSelection,
         setStake,
         updateOdds,
         setIsOpen,
         clearSelection,
         placeBet,
         liability,
         profit,
     }}>
       {children}
     </BetSlipContext.Provider>
   );
};

export const useBetSlip = () => {
  const context = useContext(BetSlipContext);
  if (context === undefined) {
    throw new Error("useBetSlip must be used within a BetSlipProvider");
  }
  return context;
};
