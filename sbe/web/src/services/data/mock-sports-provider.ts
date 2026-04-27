import { SportsDataProvider, MatchData, OddsData } from "./sports-data-provider.js";

export class MockSportsProvider implements SportsDataProvider {
  private matches: Map<string, MatchData> = new Map();

  constructor() {
    this.generateInitialData();
  }

  private generateInitialData() {
    for (let i = 0; i < 10; i++) {
      const id = `mock-match-${i}`;
      this.matches.set(id, {
        externalId: id,
        tournamentName: "Mock League",
        teamA: `Team ${i * 2 + 1}`,
        teamB: `Team ${i * 2 + 2}`,
        startTime: new Date(Date.now() + i * 3600000),
        status: i < 3 ? "in_play" : "scheduled",
        sportType: "Football",
        score: i < 3 ? { teamA: "0", teamB: "0" } : undefined,
        odds: [
          { marketName: "Match Winner", selection: "Home", odds: 2.1, status: "active" },
          { marketName: "Match Winner", selection: "Away", odds: 3.4, status: "active" },
          { marketName: "Match Winner", selection: "Draw", odds: 3.1, status: "active" },
        ],
      });
    }
  }

  async getUpcomingMatches(): Promise<MatchData[]> {
    return Array.from(this.matches.values()).filter(m => m.status === "scheduled");
  }

  async getLiveMatches(): Promise<MatchData[]> {
    // Simulate some score updates
    const live = Array.from(this.matches.values()).filter(m => m.status === "in_play");
    live.forEach(m => {
      if (m.score) {
        m.score.teamA = Math.floor(Math.random() * 4).toString();
        m.score.teamB = Math.floor(Math.random() * 4).toString();
      }
      m.odds.forEach((o: OddsData) => {
        o.odds = parseFloat((o.odds + (Math.random() - 0.5) * 0.2).toFixed(2));
      });
    });
    return live;
  }

  async getMatchResult(externalId: string) {
    return {
      status: "completed" as const,
      score: { teamA: "2", teamB: "1" },
    };
  }
}
