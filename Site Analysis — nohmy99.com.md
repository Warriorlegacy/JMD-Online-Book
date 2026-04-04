Site Analysis — nohmy99.com  
It's a mobile-first web app — looks like a betting/gambling platform (common in Southeast Asian markets). Key features:  
  
User auth (login/register/OTP)  
Wallet system (deposit/withdraw)  
Game lobby with multiple providers  
Transaction history  
Referral/agent system  
Admin panel (likely)  
Payment gateway integration  
Stack guess: React or Vue frontend, Node/Laravel backend, MySQL/Postgres, maybe Firebase for realtime.  
  
Pricing  
Tier	What You'd Deliver	Range (USD)  
MVP clone	Auth, wallet, game lobby UI, basic admin	$3,000–$5,000  
Full feature	Payment gateways, agent tree, reports, notifications	$8,000–$15,000  
Production-grade	Security hardening, scaling, real payment APIs, SMS OTP, anti-fraud	$20,000–$35,000+  
Charge minimum $5K for a visual clone with basic functionality. If they want real payment processing and agent systems, $12K+ is fair.  
  
CLI Auto-Build Prompt  
Paste this into your terminal after setting up a project directory. This uses Next.js + Tailwind + Prisma + PostgreSQL:  
  
  
npx create-next-app@latest jmd-online-book --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" && cd jmd-online-book && npm install prisma @prisma/client next-auth bcryptjs jsonwebtoken zustand axios react-icons framer-motion react-hot-toast && npm install -D @types/bcryptjs @types/jsonwebtoken && npx prisma init  
  
  
mkdir -p src/app/(auth)/login src/app/(auth)/register src/app/(auth)/forgot-password src/app/(main)/home src/app/(main)/wallet src/app/(main)/deposit src/app/(main)/withdraw src/app/(main)/transactions src/app/(main)/games src/app/(main)/profile src/app/(main)/referral src/app/(admin)/dashboard src/app/(admin)/users src/app/(admin)/transactions src/app/(admin)/settings src/app/api/auth/[...nextauth] src/app/api/wallet src/app/api/games src/app/api/admin src/components/ui src/components/layout src/components/games src/components/wallet src/lib src/hooks src/store src/types prisma/seed && touch src/lib/db.ts src/lib/auth.ts src/lib/utils.ts src/store/useUserStore.ts src/store/useWalletStore.ts src/types/index.ts src/components/layout/MobileNav.tsx src/components/layout/Header.tsx src/components/layout/Sidebar.tsx src/components/ui/Button.tsx src/components/ui/Input.tsx src/components/ui/Modal.tsx src/components/ui/Card.tsx src/components/ui/Loader.tsx src/components/wallet/BalanceCard.tsx src/components/wallet/DepositForm.tsx src/components/wallet/WithdrawForm.tsx src/components/games/GameCard.tsx src/components/games/GameGrid.tsx  
  
cat > prisma/schema.prisma << 'EOF'  
generator client {  
  provider = "prisma-client-js"  
}  
  
datasource db {  
  provider = "postgresql"  
  url      = env("DATABASE_URL")  
}  
  
model User {  
  id            String   @id @default(cuid())  
  phone         String   @unique  
  password      String  
  name          String?  
  role          Role     @default(USER)  
  balance       Float    @default(0)  
  referralCode  String   @unique @default(cuid())  
  referredBy    String?  
  referrer      User?    @relation("Referrals", fields: [referredBy], references: [id])  
  referrals     User[]   @relation("Referrals")  
  transactions  Transaction[]  
  bets          Bet[]  
  createdAt     DateTime @default(now())  
  updatedAt     DateTime @updatedAt  
}  
  
enum Role {  
  USER  
  AGENT  
  ADMIN  
}  
  
model Transaction {  
  id        String   @id @default(cuid())  
  userId    String  
  user      User     @relation(fields: [userId], references: [id])  
  type      TransactionType  
  amount    Float  
  status    TransactionStatus @default(PENDING)  
  method    String?  
  reference String?  
  note      String?  
  createdAt DateTime @default(now())  
  updatedAt DateTime @updatedAt  
}  
  
enum TransactionType {  
  DEPOSIT  
  WITHDRAW  
  BET  
  WIN  
  BONUS  
  REFERRAL  
}  
  
enum TransactionStatus {  
  PENDING  
  APPROVED  
  REJECTED  
  COMPLETED  
}  
  
model Game {  
  id          String   @id @default(cuid())  
  name        String  
  provider    String  
  category    String  
  thumbnail   String  
  url         String?  
  isActive    Boolean  @default(true)  
  sortOrder   Int      @default(0)  
  bets        Bet[]  
  createdAt   DateTime @default(now())  
}  
  
model Bet {  
  id        String   @id @default(cuid())  
  userId    String  
  user      User     @relation(fields: [userId], references: [id])  
  gameId    String  
  game      Game     @relation(fields: [gameId], references: [id])  
  amount    Float  
  result    BetResult?  
  payout    Float?  
  createdAt DateTime @default(now())  
}  
  
enum BetResult {  
  WIN  
  LOSE  
  DRAW  
  PENDING  
}  
  
model SiteSetting {  
  id    String @id @default(cuid())  
  key   String @unique  
  value String  
}  
EOF  
  
cat > src/app/layout.tsx << 'EOF'  
import type { Metadata } from "next";  
import { Inter } from "next/font/google";  
import "./globals.css";  
import { Toaster } from "react-hot-toast";  
  
const inter = Inter({ subsets: ["latin"] });  
  
export const metadata: Metadata = {  
  title: "JMD ONLINE BOOK",  
  description: "Your trusted online gaming platform",  
};  
  
export default function RootLayout({ children }: { children: React.ReactNode }) {  
  return (  
    <html lang="en">  
      <body className={`${inter.className} bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white min-h-screen`}>  
        <Toaster position="top-center" toastOptions={{ style: { background: "#1e1e2e", color: "#fff", border: "1px solid #333" } }} />  
        {children}  
      </body>  
    </html>  
  );  
}  
EOF  
  
cat > src/app/globals.css << 'EOF'  
@tailwind base;  
@tailwind components;  
@tailwind utilities;  
  
@layer base {  
  :root { --gold: #f59e0b; --gold-dark: #d97706; --accent: #7c3aed; }  
  body { -webkit-tap-highlight-color: transparent; }  
  ::-webkit-scrollbar { width: 4px; }  
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }  
}  
  
@layer components {  
  .btn-gold { @apply bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold py-3 px-6 rounded-xl active:scale-95 transition-all shadow-lg shadow-amber-500/20; }  
  .btn-accent { @apply bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold py-3 px-6 rounded-xl active:scale-95 transition-all; }  
  .card-dark { @apply bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4; }  
  .input-dark { @apply w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all; }  
  .glass { @apply bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl; }  
}  
EOF  
  
cat > src/components/layout/MobileNav.tsx << 'EOF'  
"use client";  
import Link from "next/link";  
import { usePathname } from "next/navigation";  
import { IoHome, IoWallet, IoGameController, IoPerson, IoSwapHorizontal } from "react-icons/io5";  
  
const navItems = [  
  { href: "/home", icon: IoHome, label: "Home" },  
  { href: "/wallet", icon: IoWallet, label: "Wallet" },  
  { href: "/games", icon: IoGameController, label: "Games" },  
  { href: "/transactions", icon: IoSwapHorizontal, label: "History" },  
  { href: "/profile", icon: IoPerson, label: "Profile" },  
];  
  
export default function MobileNav() {  
  const pathname = usePathname();  
  return (  
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 px-2 pb-[env(safe-area-inset-bottom)]">  
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">  
        {navItems.map(({ href, icon: Icon, label }) => {  
          const active = pathname.startsWith(href);  
          return (  
            <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${active ? "text-amber-400 scale-105" : "text-gray-500"}`}>  
              <Icon size={22} />  
              <span className="text-[10px] font-medium">{label}</span>  
            </Link>  
          );  
        })}  
      </div>  
    </nav>  
  );  
}  
EOF  
  
cat > src/components/layout/Header.tsx << 'EOF'  
"use client";  
import { IoNotifications, IoMenu } from "react-icons/io5";  
  
export default function Header() {  
  return (  
    <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-lg border-b border-gray-800/50 px-4 py-3">  
      <div className="flex items-center justify-between max-w-md mx-auto">  
        <div className="flex items-center gap-2">  
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center font-black text-black text-sm">J</div>  
          <span className="font-bold text-lg tracking-tight">JMD <span className="text-amber-400">BOOK</span></span>  
        </div>  
        <div className="flex items-center gap-3">  
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">  
            <IoNotifications size={20} />  
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />  
          </button>  
          <button className="p-2 text-gray-400 hover:text-white transition-colors"><IoMenu size={20} /></button>  
        </div>  
      </div>  
    </header>  
  );  
}  
EOF  
  
cat > src/app/(main)/layout.tsx << 'EOF'  
import Header from "@/components/layout/Header";  
import MobileNav from "@/components/layout/MobileNav";  
  
export default function MainLayout({ children }: { children: React.ReactNode }) {  
  return (  
    <div className="max-w-md mx-auto min-h-screen relative">  
      <Header />  
      <main className="px-4 py-4 pb-24">{children}</main>  
      <MobileNav />  
    </div>  
  );  
}  
EOF  
  
cat > src/app/(main)/home/page.tsx << 'EOF'  
"use client";  
import { IoWallet, IoArrowDown, IoArrowUp, IoTrophy, IoFlash } from "react-icons/io5";  
import Link from "next/link";  
  
const quickActions = [  
  { icon: IoArrowDown, label: "Deposit", href: "/deposit", color: "from-green-500 to-emerald-600" },  
  { icon: IoArrowUp, label: "Withdraw", href: "/withdraw", color: "from-red-500 to-rose-600" },  
  { icon: IoTrophy, label: "Results", href: "/games", color: "from-blue-500 to-cyan-600" },  
  { icon: IoFlash, label: "Quick Play", href: "/games", color: "from-purple-500 to-violet-600" },  
];  
  
const games = [  
  { name: "Cricket Bet", provider: "JMD Sports", img: "🏏", hot: true },  
  { name: "Teen Patti", provider: "JMD Casino", img: "🃏", hot: true },  
  { name: "Roulette", provider: "JMD Casino", img: "🎰", hot: false },  
  { name: "Football", provider: "JMD Sports", img: "⚽", hot: false },  
  { name: "Lottery", provider: "JMD Luck", img: "🎲", hot: true },  
  { name: "Horse Racing", provider: "JMD Sports", img: "🏇", hot: false },  
];  
  
export default function HomePage() {  
  return (  
    <div className="space-y-6">  
      {/* Balance Card */}  
      <div className="bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 rounded-2xl p-5 text-black shadow-xl shadow-amber-500/20">  
        <div className="flex items-center gap-2 mb-1 opacity-80 text-sm font-medium"><IoWallet /> Total Balance</div>  
        <div className="text-3xl font-black tracking-tight">₹0.00</div>  
        <div className="flex gap-3 mt-4">  
          <Link href="/deposit" className="flex-1 bg-black/20 backdrop-blur-sm text-center py-2.5 rounded-xl font-bold text-sm hover:bg-black/30 transition-all">Deposit</Link>  
          <Link href="/withdraw" className="flex-1 bg-black/20 backdrop-blur-sm text-center py-2.5 rounded-xl font-bold text-sm hover:bg-black/30 transition-all">Withdraw</Link>  
        </div>  
      </div>  
  
      {/* Marquee */}  
      <div className="card-dark overflow-hidden">  
        <div className="animate-marquee whitespace-nowrap text-sm text-amber-300">  
          🎉 Welcome to JMD ONLINE BOOK — Your most trusted platform! 🏆 Big wins daily! 💰 Fast withdrawals guaranteed!  
        </div>  
      </div>  
  
      {/* Quick Actions */}  
      <div className="grid grid-cols-4 gap-3">  
        {quickActions.map(({ icon: Icon, label, href, color }) => (  
          <Link key={label} href={href} className="flex flex-col items-center gap-2">  
            <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center shadow-lg`}>  
              <Icon size={22} className="text-white" />  
            </div>  
            <span className="text-[11px] text-gray-400 font-medium">{label}</span>  
          </Link>  
        ))}  
      </div>  
  
      {/* Games */}  
      <div>  
        <div className="flex items-center justify-between mb-3">  
          <h2 className="font-bold text-lg">Popular Games</h2>  
          <Link href="/games" className="text-amber-400 text-sm font-medium">See All →</Link>  
        </div>  
        <div className="grid grid-cols-3 gap-3">  
          {games.map((game) => (  
            <Link key={game.name} href="/games" className="card-dark text-center py-4 hover:border-amber-500/50 transition-all relative group">  
              {game.hot && <span className="absolute -top-1 -right-1 bg-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full">HOT</span>}  
              <div className="text-3xl mb-2">{game.img}</div>  
              <div className="text-xs font-bold truncate px-1">{game.name}</div>  
              <div className="text-[10px] text-gray-500 truncate px-1">{game.provider}</div>  
            </Link>  
          ))}  
        </div>  
      </div>  
    </div>  
  );  
}  
EOF  
  
cat > src/app/(auth)/login/page.tsx << 'EOF'  
"use client";  
import { useState } from "react";  
import Link from "next/link";  
import { IoCall, IoLockClosed, IoEye, IoEyeOff } from "react-icons/io5";  
  
export default function LoginPage() {  
  const [show, setShow] = useState(false);  
  return (  
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6 py-12">  
      <div className="text-center mb-10">  
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-4 shadow-xl shadow-amber-500/30">J</div>  
        <h1 className="text-2xl font-black tracking-tight">JMD <span className="text-amber-400">ONLINE BOOK</span></h1>  
        <p className="text-gray-500 text-sm mt-1">Sign in to continue</p>  
      </div>  
      <form className="space-y-4">  
        <div className="relative">  
          <IoCall className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />  
          <input type="tel" placeholder="Phone Number" className="input-dark pl-11" />  
        </div>  
        <div className="relative">  
          <IoLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />  
          <input type={show ? "text" : "password"} placeholder="Password" className="input-dark pl-11 pr-11" />  
          <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">  
            {show ? <IoEyeOff /> : <IoEye />}  
          </button>  
        </div>  
        <div className="text-right"><Link href="/forgot-password" className="text-amber-400 text-sm">Forgot Password?</Link></div>  
        <button type="submit" className="btn-gold w-full text-lg">Sign In</button>  
      </form>  
      <p className="text-center text-gray-500 text-sm mt-8">  
        New here? <Link href="/register" className="text-amber-400 font-medium">Create Account</Link>  
      </p>  
    </div>  
  );  
}  
EOF  
  
cat > src/app/(auth)/register/page.tsx << 'EOF'  
"use client";  
import { useState } from "react";  
import Link from "next/link";  
import { IoCall, IoLockClosed, IoPerson, IoEye, IoEyeOff, IoGift } from "react-icons/io5";  
  
export default function RegisterPage() {  
  const [show, setShow] = useState(false);  
  return (  
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-6 py-12">  
      <div className="text-center mb-10">  
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-4 shadow-xl shadow-amber-500/30">J</div>  
        <h1 className="text-2xl font-black">Create Account</h1>  
        <p className="text-gray-500 text-sm mt-1">Join JMD ONLINE BOOK today</p>  
      </div>  
      <form className="space-y-4">  
        <div className="relative"><IoPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" /><input placeholder="Full Name" className="input-dark pl-11" /></div>  
        <div className="relative"><IoCall className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" /><input type="tel" placeholder="Phone Number" className="input-dark pl-11" /></div>  
        <div className="relative">  
          <IoLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />  
          <input type={show ? "text" : "password"} placeholder="Password" className="input-dark pl-11 pr-11" />  
          <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">{show ? <IoEyeOff /> : <IoEye />}</button>  
        </div>  
        <div className="relative"><IoGift className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" /><input placeholder="Referral Code (Optional)" className="input-dark pl-11" /></div>  
        <button type="submit" className="btn-gold w-full text-lg">Create Account</button>  
      </form>  
      <p className="text-center text-gray-500 text-sm mt-8">Already have an account? <Link href="/login" className="text-amber-400 font-medium">Sign In</Link></p>  
    </div>  
  );  
}  
EOF  
  
cat > src/app/(main)/wallet/page.tsx << 'EOF'  
"use client";  
import Link from "next/link";  
import { IoWallet, IoArrowDown, IoArrowUp, IoTime } from "react-icons/io5";  
  
const recentTx = [  
  { type: "Deposit", amount: "+₹500", status: "Completed", time: "2 hrs ago", color: "text-green-400" },  
  { type: "Bet", amount: "-₹100", status: "Completed", time: "3 hrs ago", color: "text-red-400" },  
  { type: "Win", amount: "+₹250", status: "Completed", time: "3 hrs ago", color: "text-green-400" },  
  { type: "Withdraw", amount: "-₹300", status: "Pending", time: "5 hrs ago", color: "text-yellow-400" },  
];  
  
export default function WalletPage() {  
  return (  
    <div className="space-y-6">  
      <div className="bg-gradient-to-br from-violet-600 to-purple-800 rounded-2xl p-5 shadow-xl">  
        <div className="flex items-center gap-2 text-purple-200 text-sm mb-1"><IoWallet /> Available Balance</div>  
        <div className="text-3xl font-black">₹0.00</div>  
        <div className="flex gap-3 mt-4">  
          <Link href="/deposit" className="flex-1 btn-gold text-center text-sm py-2.5"><IoArrowDown className="inline mr-1" />Deposit</Link>  
          <Link href="/withdraw" className="flex-1 bg-white/10 backdrop-blur text-center py-2.5 rounded-xl font-bold text-sm"><IoArrowUp className="inline mr-1" />Withdraw</Link>  
        </div>  
      </div>  
      <div>  
        <div className="flex items-center justify-between mb-3">  
          <h2 className="font-bold">Recent Transactions</h2>  
          <Link href="/transactions" className="text-amber-400 text-sm">View All →</Link>  
        </div>  
        <div className="space-y-2">  
          {recentTx.map((tx, i) => (  
            <div key={i} className="card-dark flex items-center justify-between">  
              <div>  
                <div className="font-medium text-sm">{tx.type}</div>  
                <div className="text-[11px] text-gray-500 flex items-center gap-1"><IoTime size={10} />{tx.time}</div>  
              </div>  
              <div className="text-right">  
                <div className={`font-bold text-sm ${tx.color}`}>{tx.amount}</div>  
                <div className="text-[10px] text-gray-500">{tx.status}</div>  
              </div>  
            </div>  
          ))}  
        </div>  
      </div>  
    </div>  
  );  
}  
EOF  
  
cat > src/app/(main)/deposit/page.tsx << 'EOF'  
"use client";  
import { useState } from "react";  
  
const amounts = [100, 200, 500, 1000, 2000, 5000];  
const methods = [  
  { name: "UPI", icon: "📱" },  
  { name: "Bank Transfer", icon: "🏦" },  
  { name: "PhonePe", icon: "💜" },  
  { name: "Google Pay", icon: "🟢" },  
];  
  
export default function DepositPage() {  
  const [amount, setAmount] = useState("");  
  const [method, setMethod] = useState("");  
  return (  
    <div className="space-y-6">  
      <h1 className="text-xl font-black">Deposit Funds</h1>  
      <div className="card-dark space-y-4">  
        <label className="text-sm text-gray-400 font-medium">Amount (₹)</label>  
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" className="input-dark text-2xl font-bold text-center" />  
        <div className="grid grid-cols-3 gap-2">  
          {amounts.map(a => (  
            <button key={a} onClick={() => setAmount(String(a))} className={`py-2.5 rounded-xl text-sm font-bold transition-all ${amount === String(a) ? "bg-amber-500 text-black" : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"}`}>₹{a}</button>  
          ))}  
        </div>  
      </div>  
      <div className="card-dark space-y-3">  
        <label className="text-sm text-gray-400 font-medium">Payment Method</label>  
        <div className="grid grid-cols-2 gap-2">  
          {methods.map(m => (  
            <button key={m.name} onClick={() => setMethod(m.name)} className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${method === m.name ? "bg-amber-500/20 border-amber-500 border" : "bg-gray-700/30 border border-gray-700"}`}>  
              <span className="text-xl">{m.icon}</span>{m.name}  
            </button>  
          ))}  
        </div>  
      </div>  
      <button className="btn-gold w-full text-lg">Proceed to Pay</button>  
    </div>  
  );  
}  
EOF  
  
cat > src/app/(main)/withdraw/page.tsx << 'EOF'  
"use client";  
import { useState } from "react";  
  
export default function WithdrawPage() {  
  const [amount, setAmount] = useState("");  
  return (  
   
  
I want you to generate a detailed god level auto build + auto deploy prompt to directly paste it into cli like (cursor, codex, antigravity, Claude code, opencode etc.) to build this app on production grade for free. Just make sure that I don’t want to spend any money for building, deploying and running it.  
  
NEXT_PUBLIC_SUPABASE_URL= https://zkvrlwqcfeecsecrzlnu.supabase.co  
NEXT_PUBLIC_SUPABASE_ANON_KEY= eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdnJsd3FjZmVlY3NlY3J6bG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMTczNjYsImV4cCI6MjA5MDY5MzM2Nn0.o_I6dhJW_fnmCFmhg2j-ASc1uU9ZUb7JSquV0aw8v6E  
SUPABASE_SERVICE_ROLE_KEY= eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdnJsd3FjZmVlY3NlY3J6bG51Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTExNzM2NiwiZXhwIjoyMDkwNjkzMzY2fQ.-oKRDatrYiUfWZHm7xkzuf32zAciJEOGgc6oY18grK0  
RESEND_API_KEY= re_fHwpnKsC_2wXwZgxfssLHXBmDj36obxj2  
NEXT_PUBLIC_APP_NAME="JMD Online Book"  
NEXT_PUBLIC_APP_URL=  
OTP_SECRET=generate_a_random_32char_string_here  
Legacy_JWT_Secret= tw1+B9szpqjfhE4gAPlmTLoLEw90mHTU08b932/iRiJnBCFhV0Cj+JCGz/2ErLm49bIBvbpeE0Ca5PCXTrC1XA==  
  
