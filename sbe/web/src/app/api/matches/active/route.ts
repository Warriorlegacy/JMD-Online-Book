import { NextResponse } from "next/server";

// Demo fallback when backend is unavailable
const DEMO_MATCH = {
  id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
  team_a: "Manchester City",
  team_b: "Arsenal",
  start_time: new Date().toISOString(),
  status: "in_play",
  metadata: JSON.stringify({ venue: "Etihad Stadium", round: "Matchday 30" }),
};

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL || "https://jmd-online-book.onrender.com"}/matches/active`,
      { next: { revalidate: 10 }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return NextResponse.json(DEMO_MATCH);
    const data = await res.json();
    if (data?.error) return NextResponse.json(DEMO_MATCH);
    return NextResponse.json(data);
  } catch {
    // Backend unavailable — return demo match so UI still works
    return NextResponse.json(DEMO_MATCH);
  }
}
