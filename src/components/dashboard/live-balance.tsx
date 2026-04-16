"use client";

import { useRealtimeBalance } from "@/hooks/use-realtime-balance";
import { AnimatedBalance } from "@/components/ui/animated-balance";

interface LiveBalanceProps {
  userId: string;
  initialBalance: number;
  size?: "sm" | "md" | "lg" | "xl";
}

export function LiveBalance({ userId, initialBalance, size = "xl" }: LiveBalanceProps) {
  const balance = useRealtimeBalance(userId, initialBalance);

  return <AnimatedBalance balance={balance} size={size} />;
}
