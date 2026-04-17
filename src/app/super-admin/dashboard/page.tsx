import { Building2, Users, CreditCard, AlertCircle, Activity } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPlatformStats } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export default async function SuperAdminDashboardPage() {
  const stats = await getPlatformStats();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Platform Overview"
        title="Super Admin Dashboard"
        subtitle="Monitor all tenants, revenue, and system health."
      />
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Total Tenants</p>
            <div className="rounded-2xl bg-amber-400/12 p-2 text-amber-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-white">
            {stats.total_tenants}
          </p>
          <p className="text-xs text-slate-500">{stats.active_tenants} active, {stats.suspended_tenants} suspended</p>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Total Users</p>
            <div className="rounded-2xl bg-emerald-400/12 p-2 text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-white">
            {stats.total_users}
          </p>
          <p className="text-xs text-slate-500">{stats.total_admins} admins</p>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Total Revenue</p>
            <div className="rounded-2xl bg-purple-400/12 p-2 text-purple-400">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <p className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-white">
            {formatCurrency(stats.total_revenue)}
          </p>
          <p className="text-xs text-slate-500">{formatCurrency(stats.monthly_revenue)} this month</p>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Pending Approvals</p>
            <div className="rounded-2xl bg-rose-400/12 p-2 text-rose-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-white">
            {stats.pending_approvals}
          </p>
          <p className="text-xs text-slate-500">Across all tenants</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <SectionHeading title="Platform Health" subtitle="System status and metrics." />
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/4 p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-emerald-400" />
                <span className="text-slate-300">API Response Time</span>
              </div>
              <Badge tone="success">Fast</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/4 p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-400" />
                <span className="text-slate-300">Active Sessions</span>
              </div>
              <Badge tone="neutral">{stats.total_users}</Badge>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeading title="Quick Actions" subtitle="Common super admin tasks." />
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/super-admin/tenants/new"
              className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-center hover:bg-amber-400/20"
            >
              <p className="font-semibold text-amber-300">Add Tenant</p>
            </a>
            <a
              href="/super-admin/users"
              className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-center hover:bg-emerald-400/20"
            >
              <p className="font-semibold text-emerald-300">View Users</p>
            </a>
            <a
              href="/super-admin/revenue"
              className="rounded-2xl border border-purple-400/20 bg-purple-400/10 p-4 text-center hover:bg-purple-400/20"
            >
              <p className="font-semibold text-purple-300">Revenue Report</p>
            </a>
            <a
              href="/super-admin/settings"
              className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-center hover:bg-sky-400/20"
            >
              <p className="font-semibold text-sky-300">Settings</p>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}