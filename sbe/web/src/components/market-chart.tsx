"use client";

import React, { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, ColorType, CandlestickSeries } from "lightweight-charts";
import { useSocket } from "@/lib/socket";

interface CandleUpdate {
  room: string;
  candle: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

export function MarketChart({ matchId }: { matchId: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const { connected, subscribe, on } = useSocket();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#64748b",
      },
      grid: {
        vertLines: { color: "rgba(30, 41, 59, 0.5)" },
        horzLines: { color: "rgba(30, 41, 59, 0.5)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 350,
      timeScale: {
         timeVisible: true,
         secondsVisible: false,
         borderColor: "#1e293b",
      },
    });

    // Lightweight Charts v5 Syntax
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Load initial data from API
    async function loadHistory() {
      try {
        const res = await fetch(`/api/matches/${matchId}/history`);
        if (!res.ok) return; // silently skip if no history yet
        const data = await res.json();
        if (Array.isArray(data)) {
           const formattedData: CandlestickData<Time>[] = data.map((d: any) => ({
             time: (d.time / 1000) as Time,
             open: Number(d.open),
             high: Number(d.high),
             low: Number(d.low),
             close: Number(d.close),
           }));
           series.setData(formattedData);
        }
      } catch (e) {
        console.error("Failed to load chart history", e);
      }
    }

    loadHistory();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [matchId]);

  useEffect(() => {
    if (connected) {
      subscribe(matchId);
    }
    const unsubscribe = on("candle_update", (data) => {
      const update = data as CandleUpdate;
      if (update.room === matchId && seriesRef.current) {
        seriesRef.current.update({
          time: (update.candle.time / 1000) as Time,
          open: update.candle.open,
          high: update.candle.high,
          low: update.candle.low,
          close: update.candle.close,
        } as CandlestickData<Time>);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [connected, subscribe, on, matchId]);

  return (
    <div className="rounded-xl border border-slate-900 bg-slate-950/50 p-4 backdrop-blur-sm shadow-2xl">
      <div className="items-center justify-between mb-4 hidden md:flex">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
            Price Action (1m)
        </h3>
        <div className="flex gap-2">
            <div className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-slate-400 font-bold border border-slate-800 uppercase">Live VPS</div>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
