import Link from "next/link";
import { Plus, Search, Pause, Play, Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getTenantList } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function SuperAdminTenantsPage() {
  const tenants = await getTenantList(50, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeading
          eyebrow="Tenant Management"
          title="All Tenants"
          subtitle="Manage and monitor all white-label clients."
        />
        <Link href="/super-admin/tenants/new">
          <Button>
            <Plus className="h-4 w-4" />
            Create Tenant
          </Button>
        </Link>
      </div>

      <Card className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tenants..."
              className="w-full rounded-2xl border border-white/10 bg-white/6 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8 text-left text-xs text-slate-400">
                <th className="pb-3 pl-4 font-medium">Name</th>
                <th className="pb-3 font-medium">Slug</th>
                <th className="pb-3 font-medium">Plan</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Created</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No tenants yet. Create your first white-label client.
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-white/4">
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        {tenant.logo_url ? (
                          <img
                            src={tenant.logo_url}
                            alt={tenant.name}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/20 text-amber-400">
                            {tenant.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{tenant.name}</p>
                          {tenant.domain && (
                            <p className="text-xs text-slate-500">{tenant.domain}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-slate-300">{tenant.slug}</span>
                    </td>
                    <td className="py-4">
                      <Badge
                        tone={
                          tenant.subscription_plan === "enterprise"
                            ? "success"
                            : tenant.subscription_plan === "pro"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {tenant.subscription_plan}
                      </Badge>
                    </td>
                    <td className="py-4">
                      {tenant.is_suspended ? (
                        <Badge tone="danger">Suspended</Badge>
                      ) : tenant.is_active ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge tone="neutral">Inactive</Badge>
                      )}
                    </td>
                    <td className="py-4 text-sm text-slate-400">
                      {formatDate(tenant.created_at)}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/super-admin/tenants/${tenant.id}`}>
                          <button className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                        <button className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white">
                          {tenant.is_suspended ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}