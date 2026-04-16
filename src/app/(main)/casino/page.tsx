import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";

export const dynamic = "force-dynamic";

const CASINO_GAMES = [
  { name: "Teen Patti", icon: "🃏", href: "/casino/teen-patti", desc: "Classic Indian card game" },
  { name: "Dragon Tiger", icon: "🐉", href: "/casino/dragon-tiger", desc: "Fast-paced card battle" },
  { name: "Andar Bahar", icon: "🎴", href: "/casino/andar-bahar", desc: "Traditional Indian game" },
  { name: "Aviator", icon: "✈️", href: "/casino/aviator", desc: "Crash game — cash out before it crashes!" },
];

export default function CasinoLobbyPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Casino"
        title="Choose your game"
        subtitle="Live dealer games and crash games available 24/7."
      />
      <div className="grid grid-cols-2 gap-4">
        {CASINO_GAMES.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className="rounded-[18px] bg-[#1c1c1e] p-5 transition-colors hover:bg-[#272729]"
          >
            <span className="text-4xl block mb-3">{game.icon}</span>
            <p className="text-[17px] font-semibold text-white">{game.name}</p>
            <p className="text-[12px] text-[rgba(255,255,255,0.48)] mt-1">{game.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
