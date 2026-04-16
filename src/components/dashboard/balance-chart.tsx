"use client";

import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface BalanceChartProps {
  data: { day: string; balance: number }[];
}

export function BalanceChart({ data }: BalanceChartProps) {
  if (!data.length) {
    return (
      <div className="rounded-[18px] bg-[#1c1c1e] p-5">
        <p className="text-[12px] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.48)] mb-4">Balance Trend</p>
        <div className="h-[180px] flex items-center justify-center text-[rgba(255,255,255,0.3)] text-[14px]">
          No transaction history yet
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[18px] bg-[#1c1c1e] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12px] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.48)]">Balance Trend</p>
        {data.length >= 2 && (
          <span className={`text-[12px] font-semibold ${
            data[data.length - 1].balance >= data[0].balance
              ? "text-[#30d158]"
              : "text-[#ff453a]"
          }`}>
            {data[data.length - 1].balance >= data[0].balance ? "↑" : "↓"}{" "}
            ₹{Math.abs(data[data.length - 1].balance - data[0].balance).toLocaleString("en-IN")}
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0071e3" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
          <Tooltip
            contentStyle={{
              background: "#272729",
              border: "none",
              borderRadius: "12px",
              color: "#ffffff",
              fontSize: "12px",
            }}
            formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Balance"]}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#0071e3"
            strokeWidth={2}
            fill="url(#balanceGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
