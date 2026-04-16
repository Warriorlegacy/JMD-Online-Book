import Link from "next/link";

const CATEGORIES = [
  { label: "Cricket", icon: "🏏", slug: "cricket" },
  { label: "Football", icon: "⚽", slug: "football" },
  { label: "Tennis", icon: "🎾", slug: "tennis" },
  { label: "Horse Racing", icon: "🐎", slug: "horse_racing" },
  { label: "Kabaddi", icon: "🤼", slug: "kabaddi" },
  { label: "Politics", icon: "🗳️", slug: "politics" },
  { label: "Binary", icon: "📊", slug: "binary" },
  { label: "Other", icon: "🎯", slug: "other" },
];

export function SportsCategoryStrip() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/sports?sport=${cat.slug}`}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 rounded-[18px] bg-[#1c1c1e] px-4 py-3 transition-colors hover:bg-[#272729]"
        >
          <span className="text-2xl">{cat.icon}</span>
          <span className="text-[12px] text-[rgba(255,255,255,0.56)] whitespace-nowrap">{cat.label}</span>
        </Link>
      ))}
    </div>
  );
}
