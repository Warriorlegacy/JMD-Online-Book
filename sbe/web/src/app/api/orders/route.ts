import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("sbe_token")?.value;
  const body = await request.json();

  const res = await fetch(`${BACKEND_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
