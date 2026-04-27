import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id,
                tournament_id as "tournamentId",
                team_a as "teamA",
                team_b as "teamB",
                start_time as "startTime",
                status,
                metadata,
                created_at as "createdAt"
         FROM public.matches
         WHERE id = $1
         LIMIT 1`,
        [id]
      );
      const row = result.rows[0];

      if (!row) return NextResponse.json({ error: "Match not found" }, { status: 404 });
      return NextResponse.json(row);
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = {};
    if (body.teamA !== undefined) updates.teamA = body.teamA;
    if (body.teamB !== undefined) updates.teamB = body.teamB;
    if (body.status !== undefined) updates.status = body.status;
    if (body.startTime !== undefined) updates.startTime = new Date(body.startTime);
    if (body.metadata !== undefined) updates.metadata = body.metadata;

    const client = await pool.connect();
    try {
      const currentResult = await client.query(
        `SELECT id,
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
      const current = currentResult.rows[0];

      if (!current) {
        return NextResponse.json({ error: "Match not found" }, { status: 404 });
      }

      const result = await client.query(
        `UPDATE public.matches
         SET team_a = $2,
             team_b = $3,
             status = $4,
             start_time = $5,
             metadata = $6
         WHERE id = $1
         RETURNING id,
                   tournament_id as "tournamentId",
                   team_a as "teamA",
                   team_b as "teamB",
                   start_time as "startTime",
                   status,
                   metadata,
                   created_at as "createdAt"`,
        [
          id,
          body.teamA ?? current.teamA,
          body.teamB ?? current.teamB,
          body.status ?? current.status,
          body.startTime ? new Date(body.startTime).toISOString() : current.startTime,
          body.metadata !== undefined ? JSON.stringify(body.metadata) : current.metadata,
        ]
      );
      const row = result.rows[0];

      if (!row) return NextResponse.json({ error: "Match not found" }, { status: 404 });
      return NextResponse.json(row);
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update match" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const client = await pool.connect();
    try {
      await client.query(`DELETE FROM public.matches WHERE id = $1`, [id]);
      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete match" },
      { status: 500 }
    );
  }
}
