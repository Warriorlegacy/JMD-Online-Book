import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { depositRequests } from "@/db/schema";
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
    const { amount, utrNumber } = body;

    if (!amount || amount <= 0 || !utrNumber) {
      return NextResponse.json({ error: "Invalid amount or UTR Number" }, { status: 400 });
    }

    const [requestRecord] = await db.insert(depositRequests).values({
      userId,
      amount: amount.toString(),
      utrNumber,
      status: "pending"
    }).returning();

    return NextResponse.json({ message: "Deposit request submitted successfully", request: requestRecord });
  } catch (err: any) {
    console.error("Deposit error:", err);
    if (err.code === "23505") { // Unique violation for UTR
      return NextResponse.json({ error: "This UTR number has already been submitted." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
