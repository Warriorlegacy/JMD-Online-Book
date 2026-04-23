"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Radio } from "lucide-react";

export interface LiveMatch {
  id: string;
  sport: string;
  homeTeam: {
    name: string;
    logo?: string;
    score: number;
  };
  awayTeam: {
    name: string;
    logo?: string;
    score: number;
  };
  minute: number;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

interface LiveNowCarouselProps {
  matches: LiveMatch[];
}

export default function LiveNowCarousel({ matches = [] }: LiveNowCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    
    const cardWidth = 328 + 16; // card width + gap
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
    
    scrollRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth"
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const index = Math.round(scrollRef.current.scrollLeft / 344);
    setActiveIndex(index);
  };

  return (
    <section className="w-full py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#abd45e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#abd45e]"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#abd45e]">Live Now</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Live Matches</h2>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="h-8 w-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors flex items-center justify-center"
            disabled={activeIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="h-8 w-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest transition-colors flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex gap-4 overflow-x-auto scroll-smooth px-4 pb-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {matches.map((match) => (
          <div
            key={match.id}
            className="min-w-[328px] max-w-[328px] relative cursor-pointer"
            style={{
              transform: isHovered ? "translateY(-2px)" : "translateY(0)",
              transition: "all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          >
            {/* Card Background Gradient */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-surface-container-high to-surface-container-low border border-border/20" />
            
            <div className="relative p-5">
              {/* Live Indicator */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-[#abd45e] animate-pulse" />
                  <span className="text-xs font-semibold text-[#abd45e] uppercase">LIVE</span>
                  <span className="text-xs text-muted-foreground">{match.minute}'</span>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{match.sport}</span>
              </div>

              {/* Teams & Score */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="text-xs font-bold">{match.homeTeam.name.substring(0, 3).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-center">{match.homeTeam.name}</span>
                </div>

                <div className="flex flex-col items-center px-3">
                  <span className="text-2xl font-bold tracking-tight">
                    {match.homeTeam.score} - {match.awayTeam.score}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="text-xs font-bold">{match.awayTeam.name.substring(0, 3).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-center">{match.awayTeam.name}</span>
                </div>
              </div>

              {/* Odds Grid */}
              <div className="grid grid-cols-3 gap-2">
                <button className="py-2.5 px-2 rounded-xl bg-surface-container-high hover:bg-[#0071e3] hover:text-white transition-all duration-200 group">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-wider opacity-70 group-hover:opacity-90">1</span>
                    <span className="text-sm font-bold">{match.odds.home.toFixed(2)}</span>
                  </div>
                </button>
                <button className="py-2.5 px-2 rounded-xl bg-surface-container-high hover:bg-[#0071e3] hover:text-white transition-all duration-200 group">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-wider opacity-70 group-hover:opacity-90">X</span>
                    <span className="text-sm font-bold">{match.odds.draw.toFixed(2)}</span>
                  </div>
                </button>
                <button className="py-2.5 px-2 rounded-xl bg-surface-container-high hover:bg-[#0071e3] hover:text-white transition-all duration-200 group">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-wider opacity-70 group-hover:opacity-90">2</span>
                    <span className="text-sm font-bold">{match.odds.away.toFixed(2)}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Indicators */}
      <div className="flex justify-center gap-1.5 mt-4">
        {matches.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex ? "w-6 bg-[#0071e3]" : "w-1.5 bg-surface-container-highest"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

// Sample usage data:
// const sampleMatches: LiveMatch[] = [
//   {
//     id: "1",
//     sport: "Football",
//     homeTeam: { name: "Manchester United", score: 2 },
//     awayTeam: { name: "Liverpool", score: 1 },
//     minute: 67,
//     odds: { home: 2.10, draw: 3.40, away: 2.85 }
//   },
//   {
//     id: "2",
//     sport: "Basketball",
//     homeTeam: { name: "Lakers", score: 89 },
//     awayTeam: { name: "Celtics", score: 92 },
//     minute: 72,
//     odds: { home: 1.95, draw: 0, away: 2.05 }
//   },
//   {
//     id: "3",
//     sport: "Tennis",
//     homeTeam: { name: "Djokovic", score: 2 },
//     awayTeam: { name: "Alcaraz", score: 1 },
//     minute: 124,
//     odds: { home: 1.75, draw: 0, away: 2.20 }
//   }
// ];
