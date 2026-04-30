import { db } from "../db/index";
import { orders as ordersTable, trades as tradesTable } from "../db/schema";
import { eq, and, lte, gte, asc } from "drizzle-orm";


export class OrderBook {
  private matchId: string;
  private selectionId: string;

  constructor(matchId: string, selectionId: string) {
    this.matchId = matchId;
    this.selectionId = selectionId;
  }

  // Purely database-driven matching engine
  async processOrder(order: { id: string; userId: string; type: "back" | "lay"; price: number; stake: number }) {
    const matchedTrades: any[] = [];
    let remainingStake = order.stake;
    const orderPrice = order.price;

    // Use a transaction for safety
    await db.transaction(async (tx) => {
      // Find opposite orders
      const oppositeType = order.type === "back" ? "lay" : "back";
      
      const openOppositeOrders = await tx.select()
        .from(ordersTable)
        .where(
          and(
            eq(ordersTable.matchID, this.matchId),
            eq(ordersTable.selectionId, this.selectionId),
            eq(ordersTable.type, oppositeType),
            eq(ordersTable.status, "open"),
            oppositeType === "lay" 
              ? lte(ordersTable.price, (orderPrice / 100).toFixed(2)) // Looking for lay price <= back price
              : gte(ordersTable.price, (orderPrice / 100).toFixed(2)) // Looking for back price >= lay price
          )
        )
        .orderBy(
          oppositeType === "lay" ? asc(ordersTable.price) : asc(ordersTable.price), // Usually we'd sort descending for back, but simplistic for now
          asc(ordersTable.createdAt)
        );

      for (const opp of openOppositeOrders) {
        if (remainingStake <= 0) break;

        const oppRemaining = parseFloat(opp.stake) - parseFloat(opp.filledStake);
        const matchStake = Math.min(remainingStake, oppRemaining * 100); // stakes in cents internally here

        if (matchStake <= 0) continue;

        // Execute match
        const tradePrice = parseFloat(opp.price);
        
        // Update opposing order
        const newOppFilled = parseFloat(opp.filledStake) + (matchStake / 100);
        await tx.update(ordersTable)
          .set({
            filledStake: newOppFilled.toFixed(2),
            status: newOppFilled >= parseFloat(opp.stake) ? "filled" : "partially_filled"
          })
          .where(eq(ordersTable.id, opp.id));

        // Create trade
        const trade = await tx.insert(tradesTable).values({
          tenantId: opp.tenantId, // keep same tenant
          matchID: this.matchId,
          selectionId: this.selectionId,
          backerId: order.type === "back" ? order.userId : opp.userId,
          layerId: order.type === "lay" ? order.userId : opp.userId,
          price: tradePrice.toFixed(2),
          stake: (matchStake / 100).toFixed(2),
        }).returning();

        matchedTrades.push(trade[0]);
        remainingStake -= matchStake;
      }

      // Update the incoming order
      const newFilledStake = (order.stake - remainingStake) / 100;
      await tx.update(ordersTable)
        .set({
          filledStake: newFilledStake.toFixed(2),
          status: newFilledStake >= (order.stake / 100) ? "filled" : (newFilledStake > 0 ? "partially_filled" : "open")
        })
        .where(eq(ordersTable.id, order.id));
    });

    return matchedTrades;
  }

  getSnapshot() {
    return { backs: [], lays: [] }; // Simplified snapshot, relies on DB queries instead
  }
}

export class OrderEngineBridge {
  private static instance: OrderEngineBridge;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new OrderEngineBridge();
    }
    return this.instance;
  }
}
