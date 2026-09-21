import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";
import { SettlementService } from "@/services/settlement";

type SettlementResult = "team_a" | "team_b" | "draw";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const client = await pool.connect();
    let match;
    try {
      const result = await client.query(
        `SELECT id, metadata
         FROM public.matches
         WHERE id = $1
         LIMIT 1`,
        [id]
      );
      match = result.rows[0];
    } finally {
      client.release();
    }

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const metadata = safeParseMetadata(match.metadata);
    const winner = resolveWinner(body.result, metadata.winner);

    if (!winner) {
      return NextResponse.json(
        { error: "result must be one of team_a, team_b, draw" },
        { status: 400 }
      );
    }

    await SettlementService.settleMatch(id, winner);

    const updateClient = await pool.connect();
    try {
      await updateClient.query(
        `UPDATE public.matches
         SET status = 'completed',
             metadata = $2
         WHERE id = $1`,
        [
          id,
          JSON.stringify({
            ...metadata,
            winner,
            settledAt: new Date().toISOString(),
          }),
        ]
      );
    } finally {
      updateClient.release();
    }

    return NextResponse.json({ success: true, matchId: id, winner });
  } catch (err) {
    return NextResponse.json(
      { error: "An error occurred", detail: "Failed" },
      { status: 500 }
    );
  }
}

function resolveWinner(...values: Array<unknown>): SettlementResult | null {
  for (const value of values) {
    if (value === "team_a" || value === "team_b" || value === "draw") {
      return value;
    }
  }

  return null;
}

function safeParseMetadata(metadata: string | null) {
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
