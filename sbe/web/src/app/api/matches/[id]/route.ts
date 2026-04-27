import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await pool.connect();

    try {
      const matchResult = await client.query(
        `SELECT id,
                tournament_id as "tournamentId",
                team_a as "teamA",
                team_b as "teamB",
                start_time as "startTime",
                status,
                metadata
         FROM public.matches
         WHERE id = $1
         LIMIT 1`,
        [id]
      );
      const match = matchResult.rows[0];

      if (!match) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 });
      }

      const marketsResult = await client.query(
        `SELECT id,
                market_name as "marketName",
                outcome as selection,
                COALESCE(override_back_odds, back_odds, lay_odds) as odds
         FROM public.odds_markets
         WHERE event_id = $1
           AND COALESCE(is_active, true) = true`,
        [id]
      );

      const groupedMarkets: Record<string, { id: string; name: string; selections: Array<{ id: string; name: string; price: number }> }> = {};
      for (const market of marketsResult.rows as Array<{
        id: string;
        marketName: string | null;
        selection: string | null;
        odds: string | null;
      }>) {
        if (!market.marketName || !market.selection || !market.odds) {
          continue;
        }

        if (!groupedMarkets[market.marketName]) {
          groupedMarkets[market.marketName] = {
            id: market.id,
            name: market.marketName,
            selections: [],
          };
        }

        groupedMarkets[market.marketName].selections.push({
          id: market.id,
          name: market.selection,
          price: Number(market.odds),
        });
      }

      return NextResponse.json({ ...match, markets: Object.values(groupedMarkets) });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Match fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch match" }, { status: 500 });
  }
}
