import Link from "next/link";
import { LogOut, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import type { AppSession, Profile } from "@/types/database";

export function TopBar({
  session,
  profile,
  announcement,
}: {
  session: AppSession;
  profile: Profile | null;
  announcement: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#08101a]/82 backdrop-blur-xl">
      <div className="page-shell flex flex-col gap-3 pb-3 pt-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-amber-400/20 bg-amber-400/10 font-black text-amber-300">
              {getInitials(profile?.full_name ?? session.fullName)}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-amber-200/55">
                Welcome Back
              </p>
              <p className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold text-white">
                {profile?.full_name ?? session.fullName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session.role === "admin" ? (
              <Link
                href="/admin/dashboard"
                className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white backdrop-blur-xl sm:inline-flex"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            ) : null}
            <form action="/api/auth/logout" method="post">
              <Button variant="secondary" className="px-3" type="submit">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        <div className="overflow-hidden rounded-full border border-white/6 bg-white/5 px-4 py-2 text-xs text-slate-300">
          <div className="marquee-track flex min-w-max gap-12 whitespace-nowrap">
            <span>{announcement}</span>
            <span>{announcement}</span>
            <span>{announcement}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
