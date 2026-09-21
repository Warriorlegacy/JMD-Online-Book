import { SportsDataProvider, MatchData } from "./sports-data-provider.js";
import { ProductionSportsProvider } from "./production-sports-provider.js";
import { CricketSportsProvider } from "./cricket-sports-provider.js";
import { BasketballSportsProvider } from "./basketball-sports-provider.js";
import { TennisSportsProvider } from "./tennis-sports-provider.js";
import { MockSportsProvider } from "./mock-sports-provider.js";

export class UnifiedSportsProvider implements SportsDataProvider {
  private providers: SportsDataProvider[];

  constructor() {
    this.providers = [];
    
    // Always add mock for stable demo data
    // this.providers.push(new MockSportsProvider());

    if (process.env.API_FOOTBALL_KEY) {
      this.providers.push(new ProductionSportsProvider());
    }
    if (process.env.SPORTRADAR_CRICKET_API_KEY) {
      this.providers.push(new CricketSportsProvider());
    }
    if (process.env.API_BASKETBALL_KEY || process.env.API_FOOTBALL_KEY) {
      this.providers.push(new BasketballSportsProvider());
    }
    if (process.env.API_TENNIS_KEY || process.env.API_FOOTBALL_KEY) {
      this.providers.push(new TennisSportsProvider());
    }
  }

  async getUpcomingMatches(): Promise<MatchData[]> {
    const results = await Promise.all(this.providers.map(p => p.getUpcomingMatches().catch(() => [])));
    return results.flat();
  }

  async getLiveMatches(): Promise<MatchData[]> {
    const results = await Promise.all(this.providers.map(p => p.getLiveMatches().catch(() => [])));
    return results.flat();
  }

  async getMatchResult(externalId: string) {
    // We try all providers until one returns a result
    for (const provider of this.providers) {
      try {
        const res = await provider.getMatchResult(externalId);
        if (res) return res;
      } catch {
        continue;
      }
    }
    throw new Error("Match result not found in any provider");
  }
}
