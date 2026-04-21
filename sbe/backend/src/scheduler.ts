import cron from "node-cron";
import { SyncService } from "./services/sync-service.js";
import { MockSportsProvider } from "./services/data/mock-sports-provider.js";
import { ProductionSportsProvider } from "./services/data/production-sports-provider.js";
import { CricketSportsProvider } from "./services/data/cricket-sports-provider.js";

export function initScheduler() {
  const provider = process.env.NODE_ENV === "production" 
    ? new CricketSportsProvider() 
    : new MockSportsProvider();
    
  const syncService = new SyncService(provider);


  // Live Odds: Every 1 minute
  cron.schedule("* * * * *", async () => {
    console.log("[Scheduler] Running Live Sync...");
    await syncService.syncLive();
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
