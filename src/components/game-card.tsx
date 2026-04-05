"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface Game {
  id: string;
  name: string;
  provider: string;
  is_hot: boolean | null;
  category: string;
  description: string | null;
  min_bet: number | null;
  max_bet: number | null;
}

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [odds, setOdds] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !odds) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/bet/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_id: game.id,
          amount: parseFloat(amount),
          odds: parseFloat(odds),
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Bet placed successfully!");
        setIsModalOpen(false);
        setAmount("");
        setOdds("");
      } else {
        toast.error(result.error ?? "Failed to place bet");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-[family-name:var(--font-space-grotesk)] text-xl font-bold text-white">
              {game.name}
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">{game.provider}</p>
          </div>
          <Badge tone={game.is_hot ? "warning" : "neutral"}>
            {game.is_hot ? "Hot" : game.category}
          </Badge>
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">{game.description || ""}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/6 bg-white/4 p-3">
            <p className="text-[var(--color-text-muted)]">Min bet</p>
            <p className="mt-1 font-semibold text-white">
              {formatCurrency(Number(game.min_bet ?? 0))}
            </p>
          </div>
          <div className="rounded-2xl border border-white/6 bg-white/4 p-3">
            <p className="text-[var(--color-text-muted)]">Max bet</p>
            <p className="mt-1 font-semibold text-white">
              {formatCurrency(Number(game.max_bet ?? 0))}
            </p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full">
          Place Bet
        </Button>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-[var(--color-background)] p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-white">Place Bet on {game.name}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-white">
                  Bet Amount
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="odds" className="block text-sm font-medium text-white">
                  Odds
                </label>
                <Input
                  id="odds"
                  type="number"
                  step="0.01"
                  value={odds}
                  onChange={(e) => setOdds(e.target.value)}
                  placeholder="Enter odds"
                  required
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Placing..." : "Place Bet"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}