import { NextRequest, NextResponse } from "next/server";
import { OrderOrchestrator } from "@/services/orchestrator";
import { jwtVerify } from "jose";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("sbe_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    const body = await request.json();
    const { matchId, selectionId, type, price, stake } = body;

    if (!matchId || !selectionId || !type || !price || !stake) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await OrderOrchestrator.placeOrder(
      userId,
      matchId,
      selectionId,
      type,
      price,
      stake
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
