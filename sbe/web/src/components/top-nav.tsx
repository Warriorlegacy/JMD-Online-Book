'use client';

import Link from 'next/link';
import { useAuth } from "@/context/auth-context";

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

const TopNav = () => {
  const { user } = useAuth();
  
  const baseNavLinks: NavLink[] = [
    { label: 'Sports', href: '/sports', active: true },
    { label: 'Virtuals', href: '/virtuals' },
    { label: 'Live', href: '/live' },
    { label: 'Schedules', href: '/sports' },
    { label: 'Casino', href: '/casino' },
    { label: 'Promotions', href: '/promotions' },
  ];

  const navLinks = user 
    ? [...baseNavLinks, { label: 'Dashboard', href: '/dashboard' }]
    : baseNavLinks;

  return (
    <nav className="fixed top-0 left-0 w-full flex items-center justify-between px-6 h-16 bg-[#09141f]/85 backdrop-blur-xl shadow-2xl shadow-[#000000]/40 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-black italic tracking-tighter text-[#a7c8ff]">
          KINETIC LEDGER
        </Link>
        
        <div className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-['Inter'] tracking-tight text-sm uppercase transition-colors duration-200 pb-1 ${
                link.active
                  ? 'text-[#a7c8ff] border-b-2 border-[#a7c8ff] font-bold'
                  : 'text-slate-400 font-medium hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2 mr-4">
          <span className="material-symbols-outlined text-slate-400 hover:text-white cursor-pointer transition-colors">
            settings
          </span>
          <span className="material-symbols-outlined text-slate-400 hover:text-white cursor-pointer transition-colors">
            language
          </span>
          <span className="material-symbols-outlined text-slate-400 hover:text-white cursor-pointer transition-colors">
            account_circle
          </span>
        </div>

        <button className="text-[#a7c8ff] font-bold text-sm uppercase px-4 py-2 hover:opacity-80 active:scale-95 transition-all">
          Login
        </button>
        
        <button className="bg-[#3a91fa] text-[#002a55] font-bold text-sm uppercase px-6 py-2 rounded-lg shadow-lg hover:opacity-90 active:scale-95 transition-all">
          Register
        </button>
      </div>
    </nav>
  );
};

export default TopNav;
