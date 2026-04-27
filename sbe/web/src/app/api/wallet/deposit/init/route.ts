import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { depositRequests } from "@/db/schema";
import { jwtVerify } from "jose";
import { paymentService } from "@/services/payments/PaymentService";

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
    let { amount, provider } = body;
    amount = parseFloat(amount);
    provider = provider || "simulation";

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const payProvider = paymentService.getProvider(provider);
    const session = await payProvider.createSession(amount, userId, "INR");

    await db.insert(depositRequests).values({
      userId,
      amount: amount.toString(),
      upiId: "", // not needed for gateways
      utrNumber: session.reference,
      paymentGateway: payProvider.name,
      paymentReference: session.reference,
      status: "pending"
    });

    return NextResponse.json({
      url: session.url,
      confirmation: session.confirmation,
      reference: session.reference
    });
  } catch (err: any) {
    console.error("Deposit init error:", err);
    return NextResponse.json({ error: "Failed to initialize deposit" }, { status: 500 });
  }
}
