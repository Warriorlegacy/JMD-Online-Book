import { NextRequest, NextResponse } from "next/server";

function legacyProxyRemoved(request: NextRequest) {
  return NextResponse.json(
    {
      error: "Legacy backend proxy removed",
      path: new URL(request.url).pathname,
      message: "Use the native route handlers under /api instead of the deprecated catch-all proxy.",
    },
    { status: 410 }
  );
}

export const GET = legacyProxyRemoved;
export const POST = legacyProxyRemoved;
export const DELETE = legacyProxyRemoved;
export const PATCH = legacyProxyRemoved;
export const PUT = legacyProxyRemoved;
