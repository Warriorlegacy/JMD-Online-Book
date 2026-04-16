"use client";

import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine, Gamepad2, User } from "lucide-react";

export function StickyActionBar() {
  return (
    <div className="fixed bottom-[60px] left-0 right-0 z-40 md:hidden">
      <div
        className="mx-4 mb-2 flex items-center gap-2 rounded-[18px] px-2 py-2"
        style={{
          background: "rgba(28,28,30,0.95)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Link
          href="/deposit"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[rgba(0,113,227,0.15)] py-2.5 text-[12px] font-medium text-[#2997ff] active:scale-95 transition-transform"
        >
          <ArrowDownToLine className="h-4 w-4" />
          Deposit
        </Link>
        <Link
          href="/withdraw"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[rgba(255,69,58,0.12)] py-2.5 text-[12px] font-medium text-[#ff453a] active:scale-95 transition-transform"
        >
          <ArrowUpFromLine className="h-4 w-4" />
          Withdraw
        </Link>
        <Link
          href="/games"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[rgba(0,113,227,0.15)] py-2.5 text-[12px] font-medium text-[#2997ff] active:scale-95 transition-transform"
        >
          <Gamepad2 className="h-4 w-4" />
          Games
        </Link>
        <Link
          href="/profile"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[rgba(255,255,255,0.06)] py-2.5 text-[12px] font-medium text-[rgba(255,255,255,0.7)] active:scale-95 transition-transform"
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
      </div>
    </div>
  );
}
