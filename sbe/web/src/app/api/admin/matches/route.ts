import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
      SELECT 
        m.id, m.tournament_id as "tournamentId",
        m.team_a as "teamA", m.team_b as "teamB", m.start_time as "startTime",
        m.status, m.metadata, m.created_at as "createdAt",
        t.name as "tournamentName", t.sport_type as "sportType"
      FROM public.matches m
      LEFT JOIN public.tournaments t ON m.tournament_id = t.id
      ORDER BY m.created_at DESC
    `);
      return NextResponse.json(result.rows);
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

export async function POST(request: NextRequest) {
  const { error } = await verifyAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const { tournamentId, teamA, teamB, startTime, status, metadata } = body;

    if (!tournamentId || !teamA || !teamB || !startTime) {
      return NextResponse.json(
        { error: "tournamentId, teamA, teamB, startTime are required" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO public.matches (tournament_id, team_a, team_b, start_time, status, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id,
                   tournament_id as "tournamentId",
                   team_a as "teamA",
                   team_b as "teamB",
                   start_time as "startTime",
                   status,
                   metadata,
                   created_at as "createdAt"`,
        [
          tournamentId,
          teamA,
          teamB,
          new Date(startTime).toISOString(),
          status ?? "scheduled",
          metadata ? JSON.stringify(metadata) : null,
        ]
      );

      return NextResponse.json(result.rows?.[0], { status: 201 });
    } finally {
      client.release();
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create match" },
      { status: 500 }
    );
  }
}
