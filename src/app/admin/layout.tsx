import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Settings, Users, Wallet } from "lucide-react";

import { TopBar } from "@/components/layout/top-bar";
import { ClientHydrator } from "@/components/providers/client-hydrator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAdminDashboardData } from "@/lib/data";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/transactions", label: "Transactions", icon: Wallet },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getAdminDashboardData();

  if (!data.session) {
    redirect("/login");
  }

  if (data.session.role !== "admin") {
    redirect("/home");
  }

  const announcement =
    data.siteSettings.find((item) => item.key === "announcement")?.value ?? "Admin control center";

  return (
    <>
      <TopBar session={data.session} profile={data.profile} announcement={announcement} />
      <ClientHydrator
        session={data.session}
        profile={data.profile}
        notifications={[]}
        settings={data.siteSettings}
        paymentMethods={data.paymentMethods}
      />
      <div className="page-shell grid gap-6 pb-10 pt-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="hidden h-fit space-y-3 lg:block">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-amber-300/70">Admin</p>
              <h2 className="mt-2 font-[family-name:var(--font-space-grotesk)] text-xl font-bold">
                Control Room
              </h2>
            </div>
            <Badge tone="warning">Live</Badge>
          </div>
          <div className="space-y-2">
            {adminLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[var(--color-text-muted)] transition hover:bg-white/6 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </Card>
        <div>{children}</div>
      </div>
    </>
  );
}
