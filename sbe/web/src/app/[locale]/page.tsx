"use client";

import React, { Suspense, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import TopNav from "@/components/top-nav";
import { LeftSidebar } from "@/components/left-sidebar";
import LiveNowCarousel from "@/components/live-now-carousel";
import { TopMatchesGrid } from "@/components/top-matches-grid";
import BetSlipSidebar from "@/components/bet-slip-sidebar";
import { AiAssistant } from "@/components/ai-assistant";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

function HomeContent() {
  return (
    <>
      {/* Fixed Top Navigation - z-index 50 */}
      <TopNav />

      {/* Fixed Left Sidebar - 256px width, z-index 40 */}
      <LeftSidebar />

      {/* Fixed Right Bet Slip - 320px width, z-index 40 */}
      <BetSlipSidebar />

      {/* Main Content Area */}
      <main className="min-h-screen pt-16 lg:pl-64 lg:pr-80 bg-[#f5f5f7]">
        <div className="max-w-none px-4 md:px-6 py-6 space-y-8">
          {/* Live Now Carousel */}
          <LiveNowCarousel />

          {/* Top Matches Grid */}
          <TopMatchesGrid />
        </div>
      </main>

      {/* Kinetic AI Assistant */}
      <AiAssistant />
    </>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0071e3]" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7]">
          <Loader2 className="w-8 h-8 animate-spin text-[#0071e3]" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
