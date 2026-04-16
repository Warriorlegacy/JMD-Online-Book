"use client";

import React, { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi, ColorType, CandlestickSeries, CandlestickData } from 'lightweight-charts';
import { useSocket } from "@/context/socket-context";
import { Candle } from "@/types";

interface MarketChartProps {
  matchId: string;
}

export function MarketChart({ matchId }: MarketChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const { subscribe, on } = useSocket();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#d1d4dc' },
      grid: { vertLines: { color: 'rgba(42, 46, 57, 0.5)' }, horzLines: { color: 'rgba(42, 46, 57, 0.5)' } },
      crosshair: { mode: 0, vertLine: { color: '#758696', width: 1, style: 2 }, horzLine: { color: '#758696', width: 1, style: 2 } },
      rightPriceScale: { borderColor: 'rgba(197, 203, 206, 0.3)' },
      timeScale: { borderColor: 'rgba(197, 203, 206, 0.3)', timeVisible: true, secondsVisible: false },
    });

    candlestickSeriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350'
    });

    chartRef.current = chart;

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: 300 });
      }
    };
    window.addEventListener('resize', handleResize);

    // Fetch initial history
    fetch(`/api/matches/${matchId}/history`)
      .then(res => res.json())
      .then((candles: Candle[]) => {
        const formatted = candles.map(c => ({
          time: Math.floor(c.time / 1000) as import('lightweight-charts').Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        candlestickSeriesRef.current?.setData(formatted);
      });

    // WebSocket subscription
    subscribe(matchId);
    interface CandleUpdate {
      room: string;
      candle: Candle;
    }
    const unsubscribe = on<CandleUpdate>("candle_update", (data) => {
      if (data.room === matchId) {
        candlestickSeriesRef.current?.update({
          time: Math.floor(data.candle.time / 1000) as import('lightweight-charts').Time,
          open: data.candle.open,
          high: data.candle.high,
          low: data.candle.low,
          close: data.candle.close,
        });
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribe();
      chart.remove();
    };
  }, [matchId, subscribe, on]);

  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/40 overflow-hidden">
      <div ref={chartContainerRef} className="w-full h-[300px]" />
    </div>
  );
}
