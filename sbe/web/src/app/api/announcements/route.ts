import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://jmd-online-book.onrender.com";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/announcements`);
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch {
    return NextResponse.json([]);
  }
}
