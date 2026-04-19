import { OrderBook } from "./engine.js";
import { WalletService } from "./wallet.js";
import { db } from "../db/index.js";
import { orders as ordersTable, wallets } from "../db/schema.js";
import { pubsub } from "./pubsub.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

interface Order {
  id: string;
  userId: string;
  selectionId: string;
  type: "back" | "lay";
  price: number;
  stake: number;
  remainingStake: number;
}

export class OrderOrchestrator {
  private static books = new Map<string, OrderBook>();

  static getBook(matchId: string, selectionId: string): OrderBook {
    const key = `${matchId}:${selectionId}`;
    if (!this.books.has(key)) {
      this.books.set(key, new OrderBook());
    }
    return this.books.get(key)!;
  }

  static async placeOrder(
    userId: string,
    matchId: string,
    selectionId: string,
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

     // Fetch updated wallet and send balance_update event
     const [wallet] = await db.select({ balance: wallets.balance, lockedBalance: wallets.lockedBalance })
       .from(wallets)
       .where(eq(wallets.userId, userId))
       .limit(1);
     if (wallet) {
       ws.sendToUser(userId, {
         topic: "balance_update",
         userId,
         available: parseFloat(wallet.balance),
         locked: parseFloat(wallet.lockedBalance)
       });
     }

     // 3. Create Order in DB
    const [dbOrder] = await db.insert(ordersTable).values({
      id: tempOrderId,
      userId,
      matchID: matchId,
      selectionId,
      type,
      price: (price / 100).toFixed(2),
      stake: (stake / 100).toFixed(2),
      status: "open",
    }).returning();

    // 4. Process in Engine
    const book = this.getBook(matchId, selectionId);
    const engineOrder: Order = {
      id: dbOrder.id,
      userId: dbOrder.userId,
      selectionId: dbOrder.selectionId!,
      type: dbOrder.type as "back" | "lay",
      price: price,
      stake: stake,
      remainingStake: stake,
    };

    const matches = await book.processOrder(engineOrder);

    // 5. Broadcast Updates via Matching Room
    ws.publishToRoom(matchId, "orderbook_update", {
      timestamp: Date.now(),
      selectionId,
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
       
       if (process.env.NODE_ENV !== 'production') console.log(`Matched ${matches.length} orders for ${matchId}`);
     }

    return { orderId: dbOrder.id, status: "submitted" };
  }
}
