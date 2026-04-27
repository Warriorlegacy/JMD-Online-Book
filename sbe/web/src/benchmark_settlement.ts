import { db } from "./db/index";
import { wallets, trades, ledgerEntries, matches, users, tenants } from "./db/schema";
import { SettlementService } from "./services/settlement";
import { eq, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

async function runBenchmark() {
  const tenantId = randomUUID();
  const matchId = randomUUID();

  try {
    await db.insert(tenants).values({
      id: tenantId,
      name: "Benchmark Tenant",
      slug: `bench_${Date.now()}`
    });

    // Create dummy match
    await db.insert(matches).values({
      id: matchId,
      tenantId: tenantId,
      title: "Benchmark Match",
      status: "active",
      teamA: "Team A",
      teamB: "Team B",
      startTime: new Date()
    });

    // Create users and wallets
    const userIds = [];
    const NUM_USERS = 50;
    const usersToInsert = [];
    for (let i = 0; i < NUM_USERS; i++) {
      const userId = randomUUID();
      userIds.push(userId);
      usersToInsert.push({
        id: userId,
        tenantId: tenantId,
        username: `bench_user_${Date.now()}_${i}`,
        email: `bench_${Date.now()}_${i}@example.com`,
        passwordHash: "hash",
        role: "user" as const
      });
    }

    await db.insert(users).values(usersToInsert);

    await db.insert(wallets).values(userIds.map(id => ({
      userId: id,
      tenantId: tenantId,
      balance: "1000.00",
      lockedBalance: "500.00",
      currency: "INR"
    })));

    // Create trades
    const NUM_TRADES = 200;
    const newTrades = [];
    for (let i = 0; i < NUM_TRADES; i++) {
      newTrades.push({
        matchID: matchId,
        tenantId: tenantId,
        backerId: userIds[i % NUM_USERS],
        layerId: userIds[(i + 1) % NUM_USERS],
        stake: "10.00",
        price: "2.00",
        selectionId: i % 2 === 0 ? "team_a" : "team_b",
        settled: 0,
      });
    }

    await db.insert(trades).values(newTrades);

    console.log("Starting benchmark...");
    const start = performance.now();
    await SettlementService.settleMatch(matchId, "team_a", "INR");
    const end = performance.now();

    console.log(`Settled ${NUM_TRADES} trades in ${end - start} ms`);

  } catch (error) {
    console.error("Benchmark failed:", error);
  } finally {
    // Cleanup
    console.log("Cleaning up...");
    await db.delete(trades).where(eq(trades.matchID, matchId));

    // Deletion might be tricky with relations, just do best effort
    const allUsers = await db.select({id: users.id}).from(users).where(eq(users.tenantId, tenantId));
    const uIds = allUsers.map(u => u.id);

    if (uIds.length > 0) {
      const walletRecords = await db.select({id: wallets.id}).from(wallets).where(inArray(wallets.userId, uIds));
      const wIds = walletRecords.map(w => w.id);
      if (wIds.length > 0) {
        await db.delete(ledgerEntries).where(inArray(ledgerEntries.walletId, wIds));
        await db.delete(wallets).where(inArray(wallets.userId, uIds));
      }
      await db.delete(users).where(inArray(users.id, uIds));
    }

    await db.delete(matches).where(eq(matches.id, matchId));
    await db.delete(tenants).where(eq(tenants.id, tenantId));

    process.exit(0);
  }
}

runBenchmark();
