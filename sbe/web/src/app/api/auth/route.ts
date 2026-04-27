import { NextRequest, NextResponse } from "next/server";

function legacyAuthProxyRemoved(request: NextRequest) {
  return NextResponse.json(
    {
      error: "Legacy auth proxy removed",
      path: new URL(request.url).pathname,
      message: "Use /api/auth/login, /api/auth/register, /api/auth/me, and /api/auth/logout.",
    },
    { status: 410 }
  );
}

export const GET = legacyAuthProxyRemoved;
export const POST = legacyAuthProxyRemoved;
export const DELETE = legacyAuthProxyRemoved;
export const PATCH = legacyAuthProxyRemoved;
