import { db } from "../db/index.js";
import { marketHistory } from "../db/schema.js";
import { pubsub } from "./pubsub.js";
import { eq, and, sql } from "drizzle-orm";

interface Trade {
  match_id: string;
  selection_id: string;
  price: number;
  size: number;
  timestamp: string;
}

export class CandleService {
  private static currentCandles: Map<string, any> = new Map();

  static init() {
    if (process.env.NODE_ENV !== 'production') console.log("[CandleService] Listening for trade events...");

    pubsub.subscribe("match_events", (payload: any) => {
      const { matchId, events } = payload;
      for (const event of events) {
        this.processTrade({
          match_id: matchId,
          selection_id: event.selection_id,
          price: event.price,
          size: event.size,
          timestamp: event.timestamp || new Date().toISOString()
        });
      }
    });
  }

  private static async processTrade(trade: Trade) {
    const matchId = trade.match_id;
    const selectionId = trade.selection_id || "team_a";
    const price = trade.price;
    const size = trade.size;
    
    // Round to the minute
    const candleTime = new Date(trade.timestamp);
    candleTime.setSeconds(0, 0);
    const timestamp = candleTime.toISOString();

    const candleKey = `${matchId}_${selectionId}_${timestamp}`;
    let candle = this.currentCandles.get(candleKey);

    if (!candle) {
      candle = {
        matchId,
        selectionId,
        interval: "1m",
        open: price,
        high: price,
        low: price,
        close: price,
        volume: size,
        timestamp: candleTime,
      };
      this.currentCandles.set(candleKey, candle);
    } else {
      candle.high = Math.max(candle.high, price);
      candle.low = Math.min(candle.low, price);
      candle.close = price;
      candle.volume += size;
    }

    // Upsert to DB periodically or on new trades
    await this.persistCandle(candle);
    
    // Broadcast the updated candle to the frontend
    pubsub.publish("candle_update", candle);
  }

  private static async persistCandle(candle: any) {
    try {
      // Find if exists
      const [existing] = await db
        .select()
        .from(marketHistory)
        .where(
          and(
            eq(marketHistory.matchId, candle.matchId),
            eq(marketHistory.selectionId, candle.selectionId),
            eq(marketHistory.timestamp, candle.timestamp)
          )
        )
        .limit(1);

      if (existing) {
        await db.update(marketHistory).set({
          high: candle.high.toString(),
          low: candle.low.toString(),
          close: candle.close.toString(),
          volume: candle.volume.toString(),
        }).where(eq(marketHistory.id, existing.id));
      } else {
        await db.insert(marketHistory).values({
          ...candle,
          open: candle.open.toString(),
          high: candle.high.toString(),
          low: candle.low.toString(),
          close: candle.close.toString(),
          volume: candle.volume.toString(),
        });
      }
    } catch (err) {
      console.error("[CandleService] Persist failed:", err);
    }
  }
}
