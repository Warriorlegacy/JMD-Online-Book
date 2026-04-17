"use client";

import React, { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  message: string;
}

export const AnnouncementTicker: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const res = await fetch("/api/announcements");
      if (res.ok) setAnnouncements(await res.json());
    };

    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 60000);
    return () => clearInterval(interval);
  }, []);

  if (announcements.length === 0) return null;

  return (
    <div className="bg-slate-900/50 border-b border-slate-800 h-8 flex items-center overflow-hidden">
      <div className="flex items-center px-4 bg-slate-900 h-full z-10 border-r border-slate-800 text-yellow-500 gap-2 shrink-0">
        <Megaphone className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">News</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="animate-marquee whitespace-nowrap flex items-center h-full">
          {announcements.map((a) => (
            <span key={a.id} className="mx-8 text-xs font-medium text-slate-300">
              {a.message}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {announcements.map((a) => (
            <span key={`${a.id}-dup`} className="mx-8 text-xs font-medium text-slate-300">
              {a.message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
