import { createAdminClient } from "@/lib/supabase/admin";

export async function PopularBetsSection() {
  let bets: Array<{
    id: string;
    outcome: string;
    amount: number;
    result: string | null;
    games: { name: string } | null;
  }> = [];

  try {
    const db = createAdminClient();
    const { data } = await db
      .from("bets")
      .select("id, outcome, amount, result, games(name)")
      .order("created_at", { ascending: false })
      .limit(5);
    bets = (data ?? []).map((b) => ({
      id: b.id as string,
      outcome: b.outcome as string,
      amount: b.amount as number,
      result: b.result as string | null,
      games: Array.isArray(b.games) ? (b.games[0] ?? null) : (b.games as { name: string } | null),
    })) as typeof bets;
  } catch { /* silent */ }

  if (bets.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2
        className="text-[17px] font-semibold text-white"
        style={{ fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif' }}
      >
        Popular Bets
      </h2>
      <div className="space-y-2">
        {bets.map((bet) => (
          <div
            key={bet.id}
            className="flex items-center justify-between rounded-[18px] bg-[#1c1c1e] px-4 py-3"
          >
            <div>
              <p className="text-[14px] font-semibold text-white">{bet.games?.name ?? "Game"}</p>
              <p className="text-[12px] text-[rgba(255,255,255,0.48)]">{bet.outcome}</p>
            </div>
            <div className="text-right">
              <p className="text-[14px] text-[rgba(255,255,255,0.56)]">
                ₹{Math.round(Number(bet.amount) / 100) * 100}+
              </p>
              {bet.result && bet.result !== "pending" && (
                <span className={`text-[12px] font-semibold ${bet.result === "win" ? "text-[#30d158]" : "text-[rgba(255,255,255,0.3)]"}`}>
                  {bet.result === "win" ? "Won" : bet.result}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
