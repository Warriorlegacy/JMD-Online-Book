import { OrderBook } from "./engine.js";
import { WalletService } from "./wallet.js";
import { db } from "../db/index.js";
import { orders as ordersTable } from "../db/schema.js";
import { pubsub } from "./pubsub.js";
import crypto from "crypto";

export class OrderOrchestrator {
  private static books = new Map<string, OrderBook>();

  static getBook(matchId: string): OrderBook {
    if (!this.books.has(matchId)) {
      this.books.set(matchId, new OrderBook());
    }
    return this.books.get(matchId)!;
  }

  static async placeOrder(
    userId: string,
    matchId: string,
    type: "back" | "lay",
    price: number, // In cents (e.g. 210 for 2.1)
    stake: number, // In cents
    ws: any
  ) {
    // 1. Calculate required lock amount
    // Back: Stake
    // Lay: (Stake * Odds) - Stake
    let lockAmount: number;
    if (type === "back") {
      lockAmount = stake;
    } else {
      lockAmount = Math.floor((stake * price) / 100) - stake;
    }

    // 2. Lock Funds (ACID Transaction)
    // We create a temp order ID for the ledger reference
    const tempOrderId = crypto.randomUUID();
    await WalletService.lockFunds(
      userId, 
      (lockAmount / 100).toFixed(2), 
      tempOrderId, 
      type === "back" ? "back_stake" : "lay_liability"
    );

    // 3. Create Order in DB
    const [dbOrder] = await db.insert(ordersTable).values({
      id: tempOrderId,
      userId,
      matchID: matchId,
      type,
      price: (price / 100).toFixed(2),
      stake: (stake / 100).toFixed(2),
      status: "open",
    }).returning();

    // 4. Process in Engine
    const book = this.getBook(matchId);
    const engineOrder: Order = {
      id: dbOrder.id,
      userId: dbOrder.userId,
      type: dbOrder.type as "back" | "lay",
      price: price,
      stake: stake,
      remainingStake: stake,
    };

    const matches = await book.processOrder(engineOrder);

    // 5. Broadcast Updates via Matching Room
    ws.publishToRoom(matchId, "orderbook_update", {
      timestamp: Date.now(),
      snapshot: book.getSnapshot(),
    });

    if (matches.length > 0) {
      // 6. Asynchronous Settlement & Broadcasting
      pubsub.publish("match_events", {
        matchId,
        events: matches,
      });

      ws.publishToRoom(matchId, "match_events", {
        events: matches,
      });
      
      console.log(`Matched ${matches.length} orders for ${matchId}`);
    }

    return { orderId: dbOrder.id, status: "submitted" };
  }
}
