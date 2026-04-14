import { db } from "../db/index.js";
import { marketHistory } from "../db/schema.js";
import { pubsub } from "./pubsub.js";
import { eq, and, sql } from "drizzle-orm";

interface Trade {
  match_id: string;
  price: number;
  size: number;
  timestamp: string;
}

export class CandleService {
  private static currentCandles: Map<string, any> = new Map();

  static init() {
    console.log("[CandleService] Listening for trade events...");
    
    pubsub.subscribe("trade_matched", (trade: Trade) => {
      this.processTrade(trade);
    });
  }

  private static async processTrade(trade: Trade) {
    const matchId = trade.match_id;
    const price = trade.price;
    const size = trade.size;
    
    // Round to the minute
    const candleTime = new Date(trade.timestamp);
    candleTime.setSeconds(0, 0);
    const timestamp = candleTime.toISOString();

    const candleKey = `${matchId}_${timestamp}`;
    let candle = this.currentCandles.get(candleKey);

    if (!candle) {
      candle = {
        matchId,
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

    // Upsert to DB periodically or on new trades? 
    // For high frequency, we should throttle. For now, we do it simplified.
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
