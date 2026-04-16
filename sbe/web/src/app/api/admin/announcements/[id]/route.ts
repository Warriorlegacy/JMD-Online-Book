import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getTokenFromCookie();
    const { id } = await params;
    const body = await request.json();
    const res = await fetch(
      `${process.env.BACKEND_URL}/admin/announcements/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update announcement");
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await getTokenFromCookie();
    const { id } = await params;
    const res = await fetch(
      `${process.env.BACKEND_URL}/admin/announcements/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete announcement");
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
