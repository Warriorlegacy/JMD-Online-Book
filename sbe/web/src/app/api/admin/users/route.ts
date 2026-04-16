import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = await getTokenFromCookie();
    const res = await fetch(`${process.env.BACKEND_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch users");
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}

async function getTokenFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sbe_token")?.value;
  if (!token) throw new Error("Unauthorized");
  return token;
}
