import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("sbe_token")?.value;

    const res = await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });

    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: res.status }
    );

    response.cookies.delete("sbe_token");
    return response;
  } catch (err: any) {
    console.error("[POST /auth/logout] Error:", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
