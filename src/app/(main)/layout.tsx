import { redirect } from "next/navigation";

import { MobileNav } from "@/components/layout/mobile-nav";
import { TopBar } from "@/components/layout/top-bar";
import { ClientHydrator } from "@/components/providers/client-hydrator";
import { getMainDashboardData } from "@/lib/data";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await getMainDashboardData();

  if (!data.session) {
    redirect("/login");
  }

  if (data.session.role === "admin") {
    redirect("/admin/dashboard");
  }

  const announcement =
    data.siteSettings.find((item) => item.key === "announcement")?.value ?? "Welcome back";

  return (
    <>
      <TopBar session={data.session} profile={data.profile} announcement={announcement} />
      <ClientHydrator
        session={data.session}
        profile={data.profile}
        notifications={data.notifications}
        settings={data.siteSettings}
        paymentMethods={data.paymentMethods}
      />
      <main className="page-shell pb-28 pt-6 md:pb-10">{children}</main>
      <MobileNav />
    </>
  );
}
