import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://jmd-online-book.onrender.com";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("sbe_token")?.value;

  const res = await fetch(`${BACKEND_URL}/wallet/transactions`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.json();
    return NextResponse.json(error, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
