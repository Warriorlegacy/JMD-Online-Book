import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL || "https://jmd-online-book.onrender.com"}/matches/active`,
      { next: { revalidate: 10 } }
    );
    if (!res.ok) {
      return NextResponse.json({ error: "No matches found" }, { status: 404 });
    }
    const data = await res.json();
    if (data?.error) {
      return NextResponse.json({ error: data.error }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}
