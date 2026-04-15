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
                  <div className="text-sm font-semibold whitespace-nowrap">₹ 10,450.00 <span className="text-xs text-slate-500 ml-1">(L: ₹ 200.00)</span></div>
                </div>
                <button className="h-9 rounded-full bg-cyan-600 px-4 text-sm font-medium text-white hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-900/20 active:scale-95">
                  Deposit
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="container mx-auto p-4 lg:p-6">
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
        </div>
      </body>
    </html>
  );
}
