import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://jmd-online-book.onrender.com";

export async function GET(request: NextRequest, { params }: { params: { matchId: string } }) {
  try {
    const res = await fetch(`${BACKEND_URL}/ai/insights/${params.matchId}`, {
      next: { revalidate: 300 } // Cache AI insights for 5 minutes to avoid spamming the backend
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch AI insights" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
