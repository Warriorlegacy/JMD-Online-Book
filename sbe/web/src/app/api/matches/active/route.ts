import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const client = await pool.connect();

    try {
      const matchesResult = await client.query(
        `SELECT id,
                team_a as "teamA",
                team_b as "teamB",
                start_time as "startTime",
                status
         FROM public.matches
         WHERE status IN ('in_play', 'scheduled')
         ORDER BY start_time ASC`
      );
      const activeMatches = matchesResult.rows as Array<{
        id: string;
        teamA: string;
        teamB: string;
        startTime: string;
        status: string;
      }>;
      const matchIds = activeMatches.map((match) => match.id);

      let marketsByMatch: Record<string, Array<{ marketName: string; selection: string; odds: string }>> = {};
      if (matchIds.length > 0) {
        const marketsResult = await client.query(
          `SELECT event_id as "matchId",
                  market_name as "marketName",
                  outcome as selection,
                  COALESCE(override_back_odds, back_odds, lay_odds) as odds
           FROM public.odds_markets
           WHERE event_id = ANY($1::uuid[])
             AND COALESCE(is_active, true) = true`,
          [matchIds]
        );

        marketsByMatch = marketsResult.rows.reduce((acc, market) => {
          if (!market.matchId || !market.marketName || !market.selection || !market.odds) {
            return acc;
          }
          if (!acc[market.matchId]) {
            acc[market.matchId] = [];
          }
          acc[market.matchId].push(market);
          return acc;
        }, {} as Record<string, Array<{ marketName: string; selection: string; odds: string }>>);
      }

      const matchesWithOdds = activeMatches.map((match) => {
        const matchMarkets = marketsByMatch[match.id] || [];
        return {
          id: match.id,
          teamA: match.teamA,
          teamB: match.teamB,
          startTime: match.startTime,
          status: match.status,
          odds: matchMarkets.reduce((acc, market) => {
            if (!acc[market.marketName]) {
              acc[market.marketName] = { back: [], lay: [] };
            }
            acc[market.marketName].back.push({
              selection: market.selection,
              price: Number(market.odds),
              size: 1000,
            });
            return acc;
          }, {} as Record<string, { back: Array<{ selection: string; price: number; size: number }>; lay: Array<{ selection: string; price: number; size: number }> }>)
        };
      });

      return NextResponse.json(matchesWithOdds);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Matches API error:", error);
    return NextResponse.json({ error: "Internal Server Error", message: "An error occurred" }, { status: 500 });
  }
}
