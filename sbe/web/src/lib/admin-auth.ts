import { cookies } from "next/headers";
import { jwtVerify, JWTPayload } from "jose";
import { NextResponse } from "next/server";

export interface AdminPayload extends JWTPayload {
  userId: string;
  role: string;
}

/**
 * Verifies the request is from an authenticated admin.
 * Returns the JWT payload or a NextResponse error to return early.
 */
export async function verifyAdmin(): Promise<
  { payload: AdminPayload; error: null } | { payload: null; error: NextResponse }
> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sbe_token")?.value;
  if (!token) {
    return { payload: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  try {
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "admin") {
      return { payload: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { payload: payload as AdminPayload, error: null };
  } catch {
    return { payload: null, error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }
}
