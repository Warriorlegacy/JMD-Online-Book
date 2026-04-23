import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const KINETIC_KNOWLEDGE = `
You are the Kinetic Assistant, the AI support for Kinetic Ledger (SBE - Sports Betting Exchange).
Kinetic Ledger is a high-frequency, peer-to-peer sports betting exchange.

Key Features:
- Precision Settlement: Bets are settled instantly upon event completion.
- Institutional Liquidity: High volume markets for professional traders.
- Back and Lay: Users can bet for (Back - Blue) or against (Lay - Pink) outcomes.
- Markets: Football (Soccer), Basketball, Tennis, Cricket, Horse Racing, and Casino.
- Multi-currency Wallet: Supports INR, USDT, and other currencies.
- Referral Program: Earn commissions on winning trades from referees.

Current Status: The exchange is in Production/Live mode.
Live Support: You provide real-time navigation and technical help.
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent({
        contents: [
          { role: "user", parts: [{ text: KINETIC_KNOWLEDGE }] },
          ...messages.map((m: any) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
        ],
      });

      const response = result.response.text();
      return NextResponse.json({ role: "assistant", content: response });
    }

    // Fallback: High-quality Kinetic AI Mock
    let response = "I'm currently in high-performance simulation mode. I can help you with exchange navigation, market rules, or account queries.";
    
    const query = lastMessage.toLowerCase();
    if (query.includes("odds") || query.includes("back") || query.includes("lay") || query.includes("button") || query.includes("pink") || query.includes("blue")) {
      response = "In Kinetic Ledger, Blue buttons represent 'Back' bets (betting FOR an outcome), and Pink buttons represent 'Lay' bets (betting AGAINST an outcome). This peer-to-peer model allows you to act as the bookmaker by laying outcomes you believe won't happen.";
    } else if (query.includes("wallet") || query.includes("deposit") || query.includes("balance") || query.includes("money") || query.includes("withdraw")) {
      response = "Manage your funds in the Wallet section. We support instant deposits and withdrawals via various local and global gateways. Your balance is updated millisecond-by-millisecond by our Kinetic Settlement engine.";
    } else if (query.includes("sports") || query.includes("cricket") || query.includes("soccer") || query.includes("football") || query.includes("match")) {
      response = "The Sports Hub features live in-play markets and upcoming events. You can trade positions on matches in real-time. Try the In-Play filter to see matches happening right now.";
    } else if (query.includes("referral") || query.includes("invite") || query.includes("earn")) {
      response = "Our Referral Program is industry-leading. Generate your unique link in the Profile section and earn a percentage of the commission on every winning trade made by your referees, paid out instantly.";
    } else if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
      response = "Welcome to Kinetic Ledger! I'm your AI assistant, powered by the Kinetic Intelligence Layer. I can help you navigate the exchange or explain our high-frequency trading rules. What can I do for you?";
    } else if (query.includes("kinetic") || query.includes("ledger") || query.includes("sbe")) {
      response = "Kinetic Ledger (SBE) is a next-generation sports betting exchange built for speed and precision. We focus on low-latency settlement and institutional-grade liquidity for all traders.";
    }

    return NextResponse.json({ role: "assistant", content: response });
  } catch (error: any) {
    console.error("[AI Chat Error]:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
