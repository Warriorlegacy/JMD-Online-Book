import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await fetch(`${process.env.BACKEND_URL}/matches/${id}`);
    if (!res.ok) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch match" }, { status: 500 });
  }
}
