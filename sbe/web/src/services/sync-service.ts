import { db } from "../db/index.js";
import { matches, oddsMarkets, tournaments, tenants } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { SportsDataProvider, MatchData } from "./data/sports-data-provider.js";
import { SettlementService } from "./settlement.js";
import { pubsub } from "./pubsub.js";

const syncLocks = new Map<string, number>();

export class SyncService {
  private provider: SportsDataProvider;

  constructor(provider: SportsDataProvider) {
    this.provider = provider;
  }

  private async getLock(lockName: string, ttl = 60000): Promise<boolean> {
    const expiresAt = syncLocks.get(lockName);
    if (expiresAt && expiresAt > Date.now()) {
      return false;
    }

    syncLocks.set(lockName, Date.now() + ttl);
    return true;
  }

  private async releaseLock(lockName: string) {
    syncLocks.delete(lockName);
  }

  private async ensureTournament(name: string, sportType: string = "Football", tenantId: string) {
    const existing = await db.select().from(tournaments).where(and(eq(tournaments.name, name), eq(tournaments.tenantId, tenantId))).limit(1);
    if (existing.length > 0) return existing[0].id;

    const [newTournament] = await db.insert(tournaments).values({
      name,
      sportType,
      tenantId,
    }).returning();
    return newTournament.id;
  }

  async syncPreMatch() {
    if (!(await this.getLock("sync:prematch"))) return;
    try {
      const data = await this.provider.getUpcomingMatches();
      const tenantsList = await db.select().from(tenants).where(eq(tenants.isActive, 1));

      for (const tenant of tenantsList) {
        for (const matchData of data) {
          await this.syncMatch(matchData, tenant.id);
        }
      }
    } finally {
      await this.releaseLock("sync:prematch");
    }
  }

  async syncLive() {
    if (!(await this.getLock("sync:live"))) return;
    try {
      const data = await this.provider.getLiveMatches();
      const tenantsList = await db.select().from(tenants).where(eq(tenants.isActive, 1));

      for (const tenant of tenantsList) {
        for (const matchData of data) {
          await this.syncMatch(matchData, tenant.id);
        }
      }
    } finally {
      await this.releaseLock("sync:live");
    }
  }

  async settleCompleted() {
    if (!(await this.getLock("sync:settle"))) return;
    try {
      // We look for matches that are still 'in_play' in our DB but 'completed' in provider
      const activeMatches = await db.select().from(matches).where(eq(matches.status, "in_play"));
      
      for (const match of activeMatches) {
        const result = await this.provider.getMatchResult(match.externalId!);
        if (result.status === "completed") {
          const winningResult = this.deriveWinner(result.score);
          await SettlementService.settleMatch(match.id, winningResult);
          console.log(`[SyncService] Settled match ${match.id}`);
        }
      }
    } finally {
      await this.releaseLock("sync:settle");
    }
  }

  private async syncMatch(matchData: MatchData, tenantId: string) {
    const tournamentId = await this.ensureTournament(matchData.tournamentName, matchData.sportType, tenantId);

    // Upsert match
    const existingMatch = await db.select().from(matches).where(and(eq(matches.externalId, matchData.externalId!), eq(matches.tenantId, tenantId))).limit(1);
    
    let matchId: string;
    if (existingMatch.length > 0) {
      matchId = existingMatch[0].id;
      await db.update(matches)
        .set({
          status: matchData.status,
          startTime: matchData.startTime,
        })
        .where(eq(matches.id, matchId));
    } else {
      const [newMatch] = await db.insert(matches).values({
        externalId: matchData.externalId,
        tournamentId,
        teamA: matchData.teamA,
        teamB: matchData.teamB,
        startTime: matchData.startTime,
        status: matchData.status,
        tenantId,
      }).returning();
      matchId = newMatch.id;
    }

    // Fetch all existing odds for this match upfront to avoid N+1 queries
    const allExistingOdds = await db.select()
      .from(oddsMarkets)
      .where(eq(oddsMarkets.matchId, matchId));

    // Create a map for O(1) lookups
    const existingOddsMap = new Map();
    for (const row of allExistingOdds) {
      existingOddsMap.set(row.selection, row);
    }

    const oddsToInsert = [];
    const oddsToUpdate = [];
    const pubsubUpdates = [];

    // Process all odds
    for (const odd of matchData.odds) {
      const existingOdd = existingOddsMap.get(odd.selection);
      
      if (existingOdd) {
        const oldOdds = parseFloat(existingOdd.odds);
        if (oldOdds !== odd.odds || existingOdd.status !== odd.status) {
          oddsToUpdate.push({
            id: existingOdd.id,
            odds: odd.odds.toString(),
            status: odd.status,
            updatedAt: new Date(),
          });
          pubsubUpdates.push({ matchId, selection: odd.selection, odds: odd.odds });
        }
      } else {
        oddsToInsert.push({
          matchId,
          tenantId,
          marketName: odd.marketName,
          selection: odd.selection,
          odds: odd.odds.toString(),
          status: odd.status,
        });
      }
    }

    // Bulk insert
    if (oddsToInsert.length > 0) {
      await db.insert(oddsMarkets).values(oddsToInsert);
    }

    // Update existing odds (Drizzle doesn't have bulk update natively without raw SQL,
    // but Promise.all is much faster here since we avoided N selects)
    if (oddsToUpdate.length > 0) {
      await Promise.all(
        oddsToUpdate.map((updateData) =>
          db.update(oddsMarkets)
            .set({
              odds: updateData.odds,
              status: updateData.status,
              updatedAt: updateData.updatedAt,
            })
            .where(eq(oddsMarkets.id, updateData.id))
        )
      );
    }

    // Publish all updates
    for (const pub of pubsubUpdates) {
      await pubsub.publish("odds_update", pub);
    }

    // Score update notification
    if (matchData.score) {
      await pubsub.publish("score_update", { matchId, score: matchData.score });
    }
  }

  private deriveWinner(score: { teamA: string; teamB: string }): "team_a" | "team_b" | "draw" {
    const a = parseInt(score.teamA);
    const b = parseInt(score.teamB);
    if (a > b) return "team_a";
    if (b > a) return "team_b";
    return "draw";
  }
}
