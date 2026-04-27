import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    balance: "/api/wallet/balance",
    deposit: "/api/wallet/deposit",
    depositInit: "/api/wallet/deposit/init",
    transactions: "/api/wallet/transactions",
    withdraw: "/api/wallet/withdraw",
  });
}
