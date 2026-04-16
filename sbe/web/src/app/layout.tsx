import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/auth-context";
import { SocketProvider } from "@/context/socket-context";
import { BetSlipProvider } from "@/context/bet-slip-context";
import { HeaderActions } from "@/components/header-actions";
import { MobileNav } from "@/components/mobile-nav";
import { AnnouncementTicker } from "@/components/announcement-ticker";
import BetSlip from "@/components/bet-slip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SBE | Sports Betting Exchange",
  description: "Next-generation high-frequency peer-to-peer sports betting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-[#0f1923] text-slate-50 antialiased selection:bg-cyan-500/30 overflow-x-hidden"
        )}
      >
        <AuthProvider>
          <SocketProvider>
            <BetSlipProvider>
              <div className="relative flex min-h-screen flex-col">
                
                {/* Global Header */}
                <header className="sticky top-0 z-[100] w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-2xl px-4">
                  <div className="container mx-auto flex h-16 items-center justify-between">
                    <div className="flex items-center gap-10">
                      <Link href="/" className="flex items-center space-x-2 group">
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-black tracking-tighter text-transparent italic transition-transform group-hover:scale-105">
                          SBE
                        </span>
                      </Link>
                       <nav className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-wider text-slate-400">
  <Link href="/?sport=all" className="hover:text-cyan-400 transition-colors">All</Link>
  <Link href="/?sport=cricket" className="hover:text-cyan-400 transition-colors">Cricket</Link>
  <Link href="/?sport=football" className="hover:text-cyan-400 transition-colors">Football</Link>
  <Link href="/?sport=tennis" className="hover:text-cyan-400 transition-colors">Tennis</Link>
  <Link href="/?sport=horse_racing" className="hover:text-cyan-400 transition-colors">Horse Racing</Link>
  <Link href="/casino" className="text-amber-400 hover:text-amber-300">Casino</Link>
</nav>
                    </div>
                    
                    <HeaderActions />
                  </div>
                </header>

                <AnnouncementTicker />

                {/* Main Content Viewport */}
                <main className="flex-1 relative z-10 px-4">
                  <div className="container mx-auto pb-32 lg:pb-12">
                    {children}
                  </div>
                </main>

                {/* Footer Section */}
                <footer className="border-t border-white/5 bg-slate-950/50 py-12 px-6">
                  <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-4">
                      <span className="text-2xl font-black tracking-tighter text-white italic">SBE</span>
                      <p className="text-[10px] text-slate-500 uppercase font-bold leading-relaxed tracking-widest">
                        The world&apos;s most advanced peer-to-peer sporting exchange. 0% house edge. Institutional liquidity.
                      </p>
                    </div>
                    <div></div>
                    <div className="flex flex-col items-center md:items-end justify-center gap-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                      <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">ToS</a>
                        <a href="#" className="hover:text-white transition-colors">Help</a>
                      </div>
                      <p>© 2026 SBE EXCHANGE LTD. ALL RIGHTS RESERVED.</p>
                    </div>
                  </div>
                </footer>

                {/* Mobile Bottom Navigation */}
                <MobileNav />

                {/* Global Bet Slip Drawer */}
                <BetSlip />
              </div>
            </BetSlipProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
