import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

type Prediction = {
  recommendation: string;
  market: string;
  probability: string;
  rationale: string;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const client = await pool.connect();

    try {
      const matchResult = await client.query(
        `SELECT id, team_a as "teamA", team_b as "teamB", status, start_time as "startTime", metadata
         FROM public.matches
         WHERE id = $1
         LIMIT 1`,
        [matchId]
      );

      const match = matchResult.rows?.[0];
      if (!match) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 });
      }

      const marketsResult = await client.query(
        `SELECT market_name as "marketName",
                outcome as selection,
                COALESCE(override_back_odds, back_odds, lay_odds) as odds
         FROM public.odds_markets
         WHERE event_id = $1
         ORDER BY COALESCE(override_back_odds, back_odds, lay_odds) ASC`,
        [matchId]
      );

      const markets = marketsResult.rows as Array<{
        marketName: string;
        selection: string | null;
        odds: string | null;
      }>;
      const insights = buildInsights(match, markets);

      return NextResponse.json(insights);
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

function buildInsights(
  match: {
    teamA: string;
    teamB: string;
    status: string;
    startTime: string;
    metadata: string | null;
  },
  markets: Array<{ marketName: string; selection: string | null; odds: string | null }>
) {
  const parsedMetadata = safeParse(match.metadata);
  const primaryMarkets = markets
    .filter((market): market is { marketName: string; selection: string; odds: string } =>
      Boolean(market.selection && market.odds)
    )
    .slice(0, 3);
  const favorite = primaryMarkets?.[0];
  const confidenceScore = favorite
    ? Math.max(54, Math.min(92, Math.round(100 / Number(favorite.odds || 2))))
    : 58;

  const liveAnalysis = [
    `${match.teamA} vs ${match.teamB} remains in ${match.status.replace("_", " ")} state.`,
    parsedMetadata.winner
      ? `Current match metadata points to ${parsedMetadata.winner} as the decisive result signal.`
      : "No final winner is locked in metadata yet, so pricing pressure remains the strongest signal.",
    favorite
      ? `${favorite.selection} is trading as the shortest price in ${favorite.marketName}.`
      : "Market depth is currently limited, so the model is leaning on baseline match context.",
  ].join(" ");

  const predictions: Prediction[] = primaryMarkets.length > 0
    ? primaryMarkets.map((market, index) => ({
        recommendation: market.selection.toUpperCase(),
        market: market.marketName,
        probability: `${Math.max(40, Math.min(88, confidenceScore - index * 7))}%`,
        rationale: `${market.selection} is currently priced at ${market.odds}, which places it near the top of the active order book for ${market.marketName}.`,
      }))
    : [
        {
          recommendation: `${match.teamA.toUpperCase()} OR ${match.teamB.toUpperCase()}`,
          market: "Match Context",
          probability: `${confidenceScore}%`,
          rationale: "No live odds were returned for this match, so the model is using the match state and kickoff timing as fallback context.",
        },
      ];

  return {
    confidenceScore,
    liveAnalysis,
    predictions,
  };
}

function safeParse(metadata: string | null) {
  if (!metadata) {
    return {};
  }

  try {
    const parsed = JSON.parse(metadata);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
