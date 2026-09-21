import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { AuthProvider } from "@/context/auth-context";
import { SocketProvider } from "@/context/socket-context";
import { BetSlipProvider } from "@/context/bet-slip-context";
import { TenantProvider } from "@/context/tenant-context";
import { MobileNav } from "@/components/mobile-nav";
import { AnnouncementTicker } from "@/components/announcement-ticker";
import BetSlip from "@/components/bet-slip";
import { AiAssistant } from "@/components/ai-assistant";
import "../globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "SBE | Sports Betting Exchange",
  description: "Next-generation high-frequency peer-to-peer sports betting.",
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { children } = props;
  const params = await props.params;
  const locale = params?.locale || "en";
  
  // Safely load messages with fallback
  let messages = {};
  try {
    // next-intl expects getMessages to be called in a request context
    messages = await getMessages();
  } catch (error) {
    console.warn(`[I18N] Failed to load messages for locale: ${locale}`, error);
    messages = {}; // Fallback
  }

  return (
    <html lang={locale} className="dark scroll-smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 overflow-x-hidden font-sans"
        )}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TenantProvider>
            <AuthProvider>
              <SocketProvider>
                <BetSlipProvider>
                <div className="relative flex min-h-screen flex-col">
                  {/* Ticker */}
                  <AnnouncementTicker />
                  
                  {/* Main Content */}
                  <main className="flex-1 relative z-10">
                    <div className="container mx-auto pb-32 lg:pb-12 px-4">
                      {children}
                    </div>
                  </main>
                  
                  {/* Footer - Kinetic Ledger Design */}
                  <footer className="border-t border-white/5 bg-black/50 backdrop-blur-3xl py-12 px-6">
                    <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                      <div className="space-y-4">
                        <span className="text-2xl font-bold tracking-tighter text-foreground uppercase">
                          Kinetic Ledger
                        </span>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Precision settlement. Institutional liquidity. The ultimate high-frequency betting exchange.
                        </p>
                      </div>
                      <div></div>
                      <div></div>
                      <div className="flex flex-col items-center md:items-end justify-center gap-6 text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em]">
                        <div className="flex gap-8">
                          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                          <a href="#" className="hover:text-primary transition-colors">Terms</a>
                          <a href="#" className="hover:text-primary transition-colors">Support</a>
                        </div>
                        <p>© 2026 KINETIC LEDGER. ALL RIGHTS RESERVED.</p>
                      </div>
                    </div>
                  </footer>
                  
                  {/* Mobile Nav & Bet Slip */}
                  <MobileNav />
                  <BetSlip />
                  
                  {/* AI Assistant */}
                  <AiAssistant />
                </div>
              </BetSlipProvider>
            </SocketProvider>
          </AuthProvider>
        </TenantProvider>
      </NextIntlClientProvider>
      </body>
    </html>
  );
}