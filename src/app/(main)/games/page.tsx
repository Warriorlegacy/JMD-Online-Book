import { SectionHeading } from "@/components/ui/section-heading";
import { GameCard } from "@/components/game-card";
import { getAppBootstrap } from "@/lib/data";

export default async function GamesPage() {
  const data = await getAppBootstrap();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Games"
        title="Live lobby catalog"
        subtitle="Featured sports, casino, card, and lottery surfaces from the configured game table."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
