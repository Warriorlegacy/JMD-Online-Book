import Link from "next/link";

import { MobileNav } from "@/components/layout/mobile-nav";
import { TopBar } from "@/components/layout/top-bar";
import { ClientHydrator } from "@/components/providers/client-hydrator";
import { getMainDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let data: Awaited<ReturnType<typeof getMainDashboardData>> | null = null;

  try {
    data = await getMainDashboardData();
  } catch (err) {
    console.error("Main layout data fetch error:", err);
  }

  if (!data?.session) {
    return (
      <div className="min-h-screen bg-[#080b12] text-white flex flex-col items-center justify-center gap-6 p-6 text-center">
        <h1 className="text-3xl font-black">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            JMD Online Book
          </span>
        </h1>
        <p className="text-gray-400 max-w-md">
          Sign in to access your wallet, games, and transactions.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-bold text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-all"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const session = data.session;
  const profile = data.profile ?? null;
  const siteSettings = data.siteSettings ?? [];
  const notifications = data.notifications ?? [];
  const paymentMethods = data.paymentMethods ?? [];

  // Admin redirect will be handled by middleware

  const announcement =
    siteSettings.find((item) => item.key === "announcement")?.value ?? "Welcome back";

  return (
    <>
      <TopBar session={session} profile={profile} announcement={announcement} />
      <ClientHydrator
        session={session}
        profile={profile}
        notifications={notifications}
        settings={siteSettings}
        paymentMethods={paymentMethods}
      />
      <main className="page-shell pb-28 pt-6 md:pb-10">{children}</main>
      <MobileNav />
    </>
  );
}
