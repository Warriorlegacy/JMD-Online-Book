"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function useRealtimeBalance(userId: string, initialBalance: number) {
  const [balance, setBalance] = useState(initialBalance);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel("balance-update")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          if (typeof payload.new.balance === "number") {
            setBalance(payload.new.balance);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return balance;
}
