import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, MonitorPlay, Gamepad2, Trophy, Clock, Menu } from "lucide-react";
import { getSession } from "@/lib/auth";

export default async function IndexPage() {
  const session = await getSession();

  // Redirect authenticated users to their respective dashboards
  if (session) {
    if (session.role === "admin") {
      redirect("/admin/dashboard");
    }
    redirect("/home");
  }

  // Not authenticated: render the nohmy99-style landing page
  return (
    <div className="min-h-[100dvh] bg-[#EBEBEB] text-[#1e1e1e] font-sans flex flex-col">
      {/* Top Header */}
      <header className="bg-[#FFC107] px-4 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-sm border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-1 active:bg-black/10 rounded">
            <Menu className="w-6 h-6 text-[#1e1e1e]" />
          </button>
          <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-[#1e1e1e] uppercase">
            JMD Online Book
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-white rounded-sm overflow-hidden shadow-sm border border-white/40">
            <input 
              type="text" 
              placeholder="Search Events" 
              className="px-3 py-1.5 text-sm outline-none text-black w-48 bg-white"
            />
            <button className="bg-gray-100 p-1.5 border-l border-gray-200">
              <Search className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <Link 
            href="/rules" 
            className="hidden sm:block text-sm font-bold text-[#1e1e1e] border-b border-transparent hover:border-[#1e1e1e] transition-colors"
          >
            RULES
          </Link>
          <div className="flex gap-2">
            <Link 
              href="/login" 
              className="bg-black text-white px-4 md:px-5 py-1.5 text-sm font-bold rounded shadow-sm hover:bg-gray-800 transition-colors"
            >
              LOGIN
            </Link>
          </div>
        </div>
      </header>

      {/* Primary Navigation */}
      <nav className="bg-black text-white px-2 py-3 overflow-x-auto whitespace-nowrap flex items-center gap-2 md:gap-6 shadow-md shadow-black/20 w-full no-scrollbar">
        <Link href="/" className="px-3 text-sm font-bold hover:text-[#FFC107] text-[#FFC107]">HOME</Link>
        <Link href="/login" className="px-3 text-sm font-bold hover:text-[#FFC107] transition-colors">IN-PLAY</Link>
        <Link href="/login" className="px-3 text-sm font-bold hover:text-[#FFC107] transition-colors">CRICKET</Link>
        <Link href="/login" className="px-3 text-sm font-bold hover:text-[#FFC107] transition-colors">FOOTBALL</Link>
        <Link href="/login" className="px-3 text-sm font-bold hover:text-[#FFC107] transition-colors">TENNIS</Link>
        <Link href="/login" className="px-3 text-sm font-bold hover:text-[#FFC107] transition-colors">CASINO</Link>
        <Link href="/login" className="px-3 text-sm font-bold hover:text-[#FFC107] transition-colors">SPORTSBOOK</Link>
        <Link href="/login" className="px-3 text-sm font-bold hover:text-[#FFC107] transition-colors hidden sm:block">AVIATOR</Link>
      </nav>

      {/* Main Content Area */}
      <div className="w-full xl:max-w-[1400px] mx-auto flex flex-col md:flex-row gap-3 p-2 md:p-4 mt-1 flex-1">
        
        {/* Left Sidebar (Providers / Quick Links) */}
        <aside className="w-full md:w-[220px] lg:w-[260px] space-y-4 hidden md:block shrink-0">
          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 px-3 py-2 font-bold text-gray-800 border-b border-gray-200 flex items-center gap-2 text-sm uppercase">
              <Gamepad2 className="w-4 h-4 text-gray-500" /> All Sports
            </div>
            <ul className="divide-y divide-gray-100 text-gray-700 text-sm">
              <li><Link href="/login" className="block px-3 py-2 hover:bg-gray-50 hover:text-black transition-colors font-semibold">Politics (12)</Link></li>
              <li><Link href="/login" className="block px-3 py-2 hover:bg-gray-50 hover:text-black transition-colors font-semibold">Cricket (34)</Link></li>
              <li><Link href="/login" className="block px-3 py-2 hover:bg-gray-50 hover:text-black transition-colors font-semibold">Football (95)</Link></li>
              <li><Link href="/login" className="block px-3 py-2 hover:bg-gray-50 hover:text-black transition-colors font-semibold">Tennis (42)</Link></li>
              <li><Link href="/login" className="block px-3 py-2 hover:bg-gray-50 hover:text-black transition-colors font-semibold">Table Tennis (8)</Link></li>
            </ul>
          </div>
          
          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 px-3 py-2 font-bold text-gray-800 border-b border-gray-200 flex items-center gap-2 text-sm uppercase">
              <MonitorPlay className="w-4 h-4 text-gray-500" /> Providers
            </div>
            <ul className="divide-y divide-gray-100 text-gray-700 text-sm">
              <li><Link href="/login" className="block px-3 py-2 hover:bg-gray-50 hover:text-black transition-colors font-semibold">Evolution Video</Link></li>
              <li><Link href="/login" className="block px-3 py-2 hover:bg-gray-50 hover:text-black transition-colors font-semibold">Ezugi</Link></li>
              <li><Link href="/login" className="block px-3 py-2 hover:bg-gray-50 hover:text-black transition-colors font-semibold">Supernova</Link></li>
              <li><Link href="/login" className="block px-3 py-2 hover:bg-gray-50 hover:text-black transition-colors font-semibold">QTech</Link></li>
            </ul>
          </div>
        </aside>

        {/* Center Content */}
        <main className="flex-1 space-y-4 max-w-full overflow-hidden">
          {/* Main Highlights/Carousel Area Placeholder */}
          <div className="w-full bg-slate-900 text-white rounded shadow-sm overflow-hidden relative aspect-[5/2] md:aspect-[21/6] flex items-center justify-center bg-gradient-to-br from-blue-900 to-black">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
            <div className="relative text-center space-y-2 p-6 z-10 w-full flex flex-col items-center justify-center">
              <h2 className="text-3xl md:text-5xl font-black text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
                T20 Exchange Live
              </h2>
              <p className="text-sm md:text-xl font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                Best Odds & Instant Withdrawals
              </p>
            </div>
          </div>

          <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
             <div className="flex bg-gray-200 border-b border-gray-300">
              <button className="flex-1 py-3 text-sm font-bold bg-white text-black border-t-2 border-black">LIVE (14)</button>
              <button className="flex-1 py-3 text-sm font-semibold text-gray-600 hover:text-black transition-colors">VIRTUAL</button>
              <button className="flex-1 py-3 text-sm font-semibold text-gray-600 hover:text-black transition-colors">UPCOMING</button>
             </div>
             
             {/* Match Section - CRICKET */}
             <div className="bg-[#f0f0f0] border-b border-gray-300 px-4 py-2 font-bold text-[#1e1e1e] flex gap-2 items-center text-[13px] uppercase tracking-wide">
                <Trophy className="w-4 h-4 text-emerald-600 shrink-0" /> CRICKET
             </div>
             
             <div className="divide-y divide-gray-200/60">
               <MatchRow 
                  title="Chennai Super Kings v Mumbai Indians" 
                  date="Today 19:30"
                  back1="1.85" lay1="1.87"
                  backX="-" layX="-"
                  back2="1.95" lay2="1.98"
               />
               <MatchRow 
                  title="Delhi Capitals v Royal Challengers Bangalore" 
                  date="Tomorrow 19:30"
                  back1="2.10" lay1="2.14"
                  backX="-" layX="-"
                  back2="1.72" lay2="1.76"
               />
               <MatchRow 
                  title="Kolkata Knight Riders v Sunrisers Hyderabad" 
                  date="12 Apr 19:30"
                  back1="1.63" lay1="1.65"
                  backX="-" layX="-"
                  back2="2.40" lay2="2.46"
               />
             </div>
             
             {/* Match Section - FOOTBALL */}
             <div className="bg-[#f0f0f0] border-b border-gray-300 border-t-4 border-t-gray-200 px-4 py-2 font-bold text-[#1e1e1e] flex gap-2 items-center text-[13px] uppercase tracking-wide mt-2">
                <Trophy className="w-4 h-4 text-blue-600 shrink-0" /> FOOTBALL
             </div>
             
             <div className="divide-y divide-gray-200/60">
               <MatchRow 
                  title="Arsenal v Bayern Munich" 
                  date="In-Play"
                  inPlay
                  back1="1.75" lay1="1.76"
                  backX="3.45" layX="3.50"
                  back2="5.10" lay2="5.30"
               />
               <MatchRow 
                  title="Real Madrid v Manchester City" 
                  date="Today 00:30"
                  back1="2.80" lay1="2.84"
                  backX="3.25" layX="3.30"
                  back2="2.46" lay2="2.50"
               />
             </div>
          </div>
        </main>
      </div>
      
      {/* Footer Text */}
      <footer className="text-center py-6 pb-8 text-[11px] md:text-xs text-gray-500 max-w-4xl mx-auto px-4 mt-auto">
        This is a betting exchange platform mock for demonstration purposes. Gambling involves significant risk and is not suitable for all individuals. Ensure you are 18+ and adhere to the jurisdiction&apos;s rules.
      </footer>
    </div>
  );
}

// Client-safe subcomponent for static match rows
function MatchRow({ 
  title, 
  date, 
  inPlay,
  back1, lay1, 
  backX, layX, 
  back2, lay2 
}: { 
  title: string, 
  date: string, 
  inPlay?: boolean,
  back1: string, lay1: string,
  backX: string, layX: string,
  back2: string, lay2: string
}) {
  return (
    <Link href="/login" className="flex flex-col lg:flex-row lg:items-center bg-white hover:bg-[#F8FAFC] transition-colors p-2 text-sm group min-w-0">
      
      {/* Match Info */}
      <div className="flex-1 flex flex-col justify-center px-1 md:px-2 mb-2 lg:mb-0 min-w-0">
        <div className="font-bold text-[#1e1e1e] group-hover:text-amber-600 transition-colors truncate">
          {title}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold mt-0.5 text-gray-500 truncate">
          {inPlay ? (
            <span className="text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> In-Play</span>
          ) : (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {date}</span>
          )}
        </div>
      </div>

      {/* Odds block */}
      <div className="flex justify-start lg:justify-end pr-1 mt-1 lg:mt-0 w-full lg:w-auto overflow-hidden">
        <div className="flex items-center gap-[2px] w-full lg:w-[300px] shrink-0">
          {/* Home (1) */}
          <div className="flex flex-1 gap-[1px]">
             <div className="flex-1 bg-[#72bbff] h-10 flex flex-col justify-center items-center shadow-sm cursor-pointer hover:bg-[#60A5FA] transition-colors rounded-l-sm">
                <span className="font-bold text-[#000] text-[13px]">{back1}</span>
             </div>
             <div className="flex-1 bg-[#faa9ba] h-10 flex flex-col justify-center items-center shadow-sm cursor-pointer hover:bg-[#F472B6] transition-colors">
                <span className="font-bold text-[#000] text-[13px]">{lay1}</span>
             </div>
          </div>
          
          {/* Draw (X) */}
          <div className="flex flex-1 gap-[1px] ml-[2px]">
             <div className="flex-1 bg-[#72bbff] h-10 flex flex-col justify-center items-center shadow-sm cursor-pointer hover:bg-[#60A5FA] transition-colors">
                <span className="font-bold text-[#000] text-[13px]">{backX}</span>
             </div>
             <div className="flex-1 bg-[#faa9ba] h-10 flex flex-col justify-center items-center shadow-sm cursor-pointer hover:bg-[#F472B6] transition-colors">
                <span className="font-bold text-[#000] text-[13px]">{layX}</span>
             </div>
          </div>

          {/* Away (2) */}
          <div className="flex flex-1 gap-[1px] ml-[2px]">
             <div className="flex-1 bg-[#72bbff] h-10 flex flex-col justify-center items-center shadow-sm cursor-pointer hover:bg-[#60A5FA] transition-colors">
                <span className="font-bold text-[#000] text-[13px]">{back2}</span>
             </div>
             <div className="flex-1 bg-[#faa9ba] h-10 flex flex-col justify-center items-center shadow-sm cursor-pointer hover:bg-[#F472B6] transition-colors rounded-r-sm">
                <span className="font-bold text-[#000] text-[13px]">{lay2}</span>
             </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
