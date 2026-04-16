import Link from "next/link";

const CASINO_GAMES = [
  { name: "Teen Patti", icon: "🃏", href: "/casino/teen-patti" },
  { name: "Dragon Tiger", icon: "🐉", href: "/casino/dragon-tiger" },
  { name: "Andar Bahar", icon: "🎴", href: "/casino/andar-bahar" },
  { name: "Aviator", icon: "✈️", href: "/casino/aviator" },
];

export function CasinoSection() {
  return (
    <section className="space-y-3">
      <h2
        className="text-[17px] font-semibold text-white"
        style={{ fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' }}
      >
        Casino Games
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {CASINO_GAMES.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className="rounded-[18px] bg-[#1c1c1e] p-5 transition-colors hover:bg-[#272729]"
          >
            <span className="text-3xl block mb-2">{game.icon}</span>
            <p className="text-[14px] font-semibold text-white">{game.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
