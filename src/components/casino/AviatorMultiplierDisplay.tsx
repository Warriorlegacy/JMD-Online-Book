"use client";

import { useState, useEffect, useRef } from "react";

interface AviatorState {
  round_id: string | null;
  status: string;
  multiplier: number;
  crash_point_revealed: number | null;
  history: Array<{ id: string; crash_point: number | null }>;
}

interface AviatorMultiplierDisplayProps {
  onStateChange?: (state: AviatorState) => void;
}

export function AviatorMultiplierDisplay({ onStateChange }: AviatorMultiplierDisplayProps) {
  const [state, setState] = useState<AviatorState>({
    round_id: null,
    status: "waiting",
    multiplier: 1.0,
    crash_point_revealed: null,
    history: [],
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch("/api/casino/aviator/state");
        if (res.ok) {
          const json = await res.json();
          const newState = json.data as AviatorState;
          setState(newState);
          onStateChange?.(newState);
        }
      } catch { /* silent */ }
    }

    poll();
    intervalRef.current = setInterval(poll, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onStateChange]);

  const isCrashed = state.status === "crashed";
  const isFlying = state.status === "dealing";

  return (
    <div className="space-y-4">
      {/* Main multiplier display */}
      <div
        className="relative flex items-center justify-center rounded-[18px] p-12 transition-all duration-300"
        style={{
          background: isCrashed
            ? "rgba(255,69,58,0.08)"
            : isFlying
            ? "rgba(48,209,88,0.08)"
            : "rgba(255,255,255,0.04)",
          border: `1px solid ${isCrashed ? "rgba(255,69,58,0.3)" : isFlying ? "rgba(48,209,88,0.3)" : "rgba(255,255,255,0.08)"}`,
        }}
      >
        <div className="text-center">
          <p
            className="text-6xl font-bold tabular-nums transition-all duration-100"
            style={{
              color: isCrashed ? "#ff453a" : isFlying ? "#30d158" : "rgba(255,255,255,0.4)",
              fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
            }}
          >
            {state.multiplier.toFixed(2)}x
          </p>
          {isCrashed && (
            <p className="mt-2 text-[#ff453a] font-semibold text-[14px]">CRASHED!</p>
          )}
          {state.status === "betting_open" && (
            <p className="mt-2 text-[#2997ff] text-[14px]">Place your bets...</p>
          )}
          {state.status === "waiting" && (
            <p className="mt-2 text-[rgba(255,255,255,0.3)] text-[14px]">Waiting for round...</p>
          )}
        </div>
      </div>

      {/* Crash history */}
      {state.history.length > 0 && (
        <div>
          <p className="text-[12px] text-[rgba(255,255,255,0.48)] uppercase tracking-wider mb-2">Crash History</p>
          <div className="flex flex-wrap gap-1.5">
            {state.history.map((h) => {
              const cp = Number(h.crash_point ?? 0);
              return (
                <span
                  key={h.id}
                  className="rounded-lg px-2 py-1 text-[12px] font-semibold"
                  style={{
                    background: cp < 2 ? "rgba(255,69,58,0.15)" : cp < 5 ? "rgba(0,113,227,0.15)" : "rgba(48,209,88,0.15)",
                    color: cp < 2 ? "#ff453a" : cp < 5 ? "#2997ff" : "#30d158",
                  }}
                >
                  {cp.toFixed(2)}x
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
