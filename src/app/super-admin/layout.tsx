import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Building2, Settings, CreditCard } from "lucide-react";

import { requireSuperAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/card";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-[#08101a]">
      <header className="border-b border-white/8 bg-[#0a0f18] px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-amber-400">
            Super Admin Panel
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-400 hover:text-white">
              ← Back to Platform
            </Link>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="w-64 border-r border-white/8 bg-[#0a0f18] p-4">
          <nav className="space-y-2">
            <Link
              href="/super-admin/dashboard"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/super-admin/tenants"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <Building2 className="h-5 w-5" />
              Tenants
            </Link>
            <Link
              href="/super-admin/users"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <Users className="h-5 w-5" />
              All Users
            </Link>
            <Link
              href="/super-admin/revenue"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <CreditCard className="h-5 w-5" />
              Revenue
            </Link>
            <Link
              href="/super-admin/settings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}