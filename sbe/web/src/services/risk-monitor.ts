import { db } from "../db/index.js";
import { sql } from "drizzle-orm";
import { pubsub } from "./pubsub.js";

const RISK_THRESHOLD = 50000; // ₹50,000 threshold for alerts

export class RiskMonitorService {
  static async checkGlobalLiability() {
    try {
      // Net exposure check
      const result = await db.execute(sql`
        SELECT 
          u.username,
          o.match_id,
          m.team_a,
          m.team_b,
          COALESCE(SUM(CAST(o.stake AS NUMERIC) * (CAST(o.price AS NUMERIC) - 1)), 0) as user_exposure
        FROM orders o
        JOIN users u ON o.user_id = u.id
        JOIN matches m ON o.match_id = m.id
        WHERE o.status IN ('open', 'partially_filled')
        GROUP BY u.username, o.match_id, m.team_a, m.team_b
        HAVING SUM(CAST(o.stake AS NUMERIC) * (CAST(o.price AS NUMERIC) - 1)) > ${RISK_THRESHOLD}
      `);

      for (const row of result.rows as any[]) {
        await pubsub.publish("notification", {
          notifType: "alert",
          title: "HIGH EXPOSURE ALERT",
          body: `User ${row.username} has ₹${parseFloat(row.user_exposure).toLocaleString()} exposure on ${row.team_a} vs ${row.team_b}`,
          badge: "CRITICAL RISK",
          badgeColor: "text-red-400 border border-red-500/20 bg-red-500/10",
          borderColor: "border-red-500/30 bg-red-500/5",
          cta: "VIEW LEDGER",
          ctaColor: "text-red-400"
        });
        
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[RiskMonitor] Alert published for ${row.username} - Liability: ₹${row.user_exposure}`);
        }
      }
    } catch (err: any) {
      console.error("[RiskMonitor] Error checking liability:", err.message);
    }
  }
}
