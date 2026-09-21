/* eslint-disable @typescript-eslint/no-unused-vars */
import { OrderBook } from "./engine";
import { WalletService } from "./wallet";
import { db } from "../db/index";
import { orders as ordersTable, wallets } from "../db/schema";
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
  static getBook(matchId: string, selectionId: string): OrderBook {
    // In serverless, we instantiate fresh orderbooks that query the DB
    return new OrderBook(matchId, selectionId);
  }

  static async placeOrder(
    userId: string,
    matchId: string,
    selectionId: string,
    type: "back" | "lay",
    price: number, // In cents (e.g. 210 for 2.1)
    stake: number // In cents
  ) {
    let lockAmount: number;
    if (type === "back") {
      lockAmount = stake;
    } else {
      lockAmount = Math.floor((stake * price) / 100) - stake;
    }

    const tempOrderId = crypto.randomUUID();
    await WalletService.lockFunds(
      userId,
      (lockAmount / 100).toFixed(2),
      tempOrderId,
      type === "back" ? "back_stake" : "lay_liability"
    );

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

    return { orderId: dbOrder.id, status: "submitted", matches: matches.length };
  }
}
