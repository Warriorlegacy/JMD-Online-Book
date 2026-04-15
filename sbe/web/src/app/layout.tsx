import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

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
    <html lang="en" className="dark">
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-slate-950 text-slate-50 antialiased selection:bg-cyan-500/30"
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-slate-800/50 bg-slate-950/70 backdrop-blur-xl">
            <div className="container flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="bg-linear-to-r from-cyan-400 to-blue-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                    SBE
                  </span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
                  <Link href="/?sport=in-play" className="hover:text-cyan-400 transition-colors">In-Play</Link>
                  <Link href="/?sport=football" className="hover:text-cyan-400 transition-colors">Football</Link>
                  <Link href="/?sport=tennis" className="hover:text-cyan-400 transition-colors">Tennis</Link>
                  <Link href="/?sport=cricket" className="hover:text-cyan-400 transition-colors">Cricket</Link>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Balance</div>
                  <div className="text-sm font-semibold whitespace-nowrap text-slate-300">Demo Mode</div>
                </div>
                <button className="h-9 rounded-full bg-cyan-600 px-4 text-sm font-medium text-white hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/20 active:scale-95">
                  Deposit
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="container mx-auto p-4 lg:p-6 pb-16 md:pb-0">
              <h1 className="sr-only">SBE Sports Betting Exchange Dashboard</h1>
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-900 bg-slate-950/50 py-6">
            <div className="container flex flex-col items-center justify-between gap-4 md:flex-row text-xs text-slate-500">
              <p>© 2026 SBE Global Exchange. Gamble Responsibly.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:underline underline-offset-4">Terms</a>
                <a href="#" className="hover:underline underline-offset-4">Privacy</a>
                <a href="#" className="hover:underline underline-offset-4">API Documentation</a>
              </div>
            </div>
          </footer>

          {/* Mobile Bottom Nav */}
          <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl pb-safe">
            <Link href="/" className="flex flex-1 flex-col items-center gap-1 py-3 text-slate-400 hover:text-cyan-400 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
            </Link>
            <Link href="/?sport=cricket" className="flex flex-1 flex-col items-center gap-1 py-3 text-slate-400 hover:text-cyan-400 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span className="text-[10px] font-bold uppercase tracking-wider">Sports</span>
            </Link>
            <Link href="/" className="flex flex-1 flex-col items-center gap-1 py-3 text-slate-400 hover:text-cyan-400 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <span className="text-[10px] font-bold uppercase tracking-wider">Markets</span>
            </Link>
            <button className="flex flex-1 flex-col items-center gap-1 py-3 text-cyan-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-[10px] font-bold uppercase tracking-wider">Wallet</span>
            </button>
          </nav>
        </div>
      </body>
    </html>
  );
}
