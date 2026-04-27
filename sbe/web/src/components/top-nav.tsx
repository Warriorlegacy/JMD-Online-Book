'use client';

import Link from 'next/link';
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

const TopNav = () => {
  const { user, logout } = useAuth();
  
  const baseNavLinks: NavLink[] = [
    { label: 'Sports', href: '/sports', active: true },
    { label: 'Live', href: '/live' },
    { label: 'Casino', href: '/casino' },
    { label: 'Promotions', href: '/promotions' },
  ];

  const navLinks = user 
    ? [...baseNavLinks, { label: 'Dashboard', href: '/dashboard' }]
    : baseNavLinks;

  return (
    <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-6 h-16 glass-nav z-50">
      <div className="flex items-center gap-10">
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
          KINETIC<span className="text-[#0071e3]">LEDGER</span>
        </Link>
        
        <div className="hidden md:flex gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[13px] font-medium transition-all duration-200 py-1 relative group",
                link.active
                  ? 'text-white'
                  : 'text-[#86868b] hover:text-white'
              )}
            >
              {link.label}
              {link.active && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#0071e3] rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex gap-4 items-center">
          <button className="text-[#86868b] hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
          <button className="text-[#86868b] hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">language</span>
          </button>
        </div>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {user ? (
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-end">
              <span className="text-white text-[11px] font-semibold tracking-tight">{user.username}</span>
              <span className="text-[#abd45e] text-[12px] font-bold tracking-tight">â‚¹{parseFloat(user.balance || "0").toLocaleString()}</span>
            </div>
            
            <Link href="/profile" className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[20px] text-white">account_circle</span>
            </Link>

            <button 
              onClick={() => logout()}
              className="text-[12px] font-medium text-[#ff3b30] hover:text-[#ff453a] transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="text-white text-[13px] font-medium px-4 py-1.5 hover:opacity-80 transition-opacity">
                Sign In
              </button>
            </Link>
            
            <Link href="/register">
              <button className="bg-[#0071e3] text-white text-[13px] font-semibold px-5 py-1.5 rounded-full hover:bg-[#0077ed] active:scale-95 transition-all">
                Get Started
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopNav;
