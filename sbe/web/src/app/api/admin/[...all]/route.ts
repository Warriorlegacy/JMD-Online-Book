import { NextRequest, NextResponse } from "next/server";

/**
 * This catch-all route exists as a safety net.
 * All admin routes should have dedicated native implementations.
 * Any request reaching here is hitting an unmigrated endpoint.
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: `Admin route not implemented: ${request.nextUrl.pathname}` },
    { status: 501 }
  );
}

export const POST = GET;
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
