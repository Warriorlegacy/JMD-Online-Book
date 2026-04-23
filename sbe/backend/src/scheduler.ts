import cron from "node-cron";
import { SyncService } from "./services/sync-service.js";
import { UnifiedSportsProvider } from "./services/data/unified-sports-provider.js";
import { RiskMonitorService } from "./services/risk-monitor.js";

export function initScheduler() {
  const provider = new UnifiedSportsProvider();
  const syncService = new SyncService(provider);


  // Live Odds: Every 1 minute
  cron.schedule("* * * * *", async () => {
    console.log("[Scheduler] Running Live Sync...");
    await syncService.syncLive();
    
    // Also check for risk alerts
    await RiskMonitorService.checkGlobalLiability();
  });

  // Pre-match: Every 1 hour
  cron.schedule("0 * * * *", async () => {
    console.log("[Scheduler] Running Pre-match Sync...");
    await syncService.syncPreMatch();
  });

  // Settlement: Every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("[Scheduler] Running Settlement Sync...");
    await syncService.settleCompleted();
  });

  console.log("Sports Data Scheduler Initialized");
}
