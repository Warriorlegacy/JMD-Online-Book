import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";


import { WalletService } from "@/services/wallet";

/**
 * Vercel Cron: runs every 5 minutes.
 * Settles completed matches by paying out winning bets.
 */
export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron (or locally)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find completed matches with unsettled trades
    const unsettledTrades = await db.execute(`
      SELECT t.id, t.match_id as "matchId", t.backer_id as "backerId",
             t.layer_id as "layerId", t.price, t.stake, t.selection_id as "selectionId",
             m.status as "matchStatus", m.metadata as "matchMetadata"
      FROM trades t
      JOIN matches m ON t.match_id = m.id
      WHERE t.settled = 0 AND m.status = 'completed'
      LIMIT 100
    `);

    const rows = unsettledTrades.rows as Array<{
      id: string;
      matchId: string;
      backerId: string;
      layerId: string;
      price: string;
      stake: string;
      selectionId: string;
      matchStatus: string;
      matchMetadata: string;
    }>;

    let settled = 0;
    for (const trade of rows) {
      try {
        // Parse match result from metadata
        const metadata = trade.matchMetadata ? JSON.parse(trade.matchMetadata) : {};
        const winner = metadata.winner as string | undefined; // e.g. "team_a"

        const backerWon = winner && trade.selectionId === winner;
        const payout = (parseFloat(trade.stake) * parseFloat(trade.price)).toFixed(8);

        if (backerWon) {
          // Backer wins: credit payout to backer, layer forfeits locked stake
          await WalletService.credit(trade.backerId, payout, trade.id, "settlement_win");
        } else {
          // Layer wins: credit layer with backer's stake
          await WalletService.credit(trade.layerId, trade.stake, trade.id, "settlement_win");
        }

        // Mark trade as settled
        await db.execute(
          `UPDATE trades SET settled = 1 WHERE id = '${trade.id}'`
        );
        settled++;
      } catch (tradeErr) {
        console.error(`Failed to settle trade ${trade.id}:`, tradeErr);
      }
    }

    return NextResponse.json({
      success: true,
      processed: rows.length,
      settled,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Settlement cron error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Settlement failed" },
      { status: 500 }
    );
  }
}
