import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://jmd-online-book.onrender.com";

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${BACKEND_URL}/tenant/config`, {
      next: { revalidate: 60 } // Cache tenant config for 60s
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch tenant config" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
