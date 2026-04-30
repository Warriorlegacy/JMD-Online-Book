import axios from "axios";
import { SportsDataProvider, MatchData } from "./sports-data-provider.js";

export class BasketballSportsProvider implements SportsDataProvider {
  private readonly apiKey = process.env.API_BASKETBALL_KEY || process.env.API_FOOTBALL_KEY;
  private readonly baseUrl = "https://v1.basketball.api-sports.io";

  async getUpcomingMatches(): Promise<MatchData[]> {
    if (!this.apiKey) return [];

    try {
      const response = await axios.get(`${this.baseUrl}/games`, {
        headers: { "x-apisports-key": this.apiKey },
        params: { date: new Date().toISOString().split('T')[0] },
      });

      return (response.data.response || []).filter((g: any) => g.status.short === "NS").map((g: any) => ({
        externalId: g.id.toString(),
        tournamentName: g.league.name,
        teamA: g.teams.home.name,
        teamB: g.teams.away.name,
        startTime: new Date(g.date),
        status: "scheduled",
        sportType: "Basketball",
        odds: [],
      }));
    } catch (error) {
      console.error("[BasketballProvider] Error:", error);
      return [];
    }
  }

  async getLiveMatches(): Promise<MatchData[]> {
    if (!this.apiKey) return [];

    try {
      const response = await axios.get(`${this.baseUrl}/games`, {
        headers: { "x-apisports-key": this.apiKey },
        params: { live: "all" },
      });

      return (response.data.response || []).map((g: any) => ({
        externalId: g.id.toString(),
        tournamentName: g.league.name,
        teamA: g.teams.home.name,
        teamB: g.teams.away.name,
        startTime: new Date(g.date),
        status: "in_play",
        sportType: "Basketball",
        score: {
          teamA: g.scores.home.total?.toString() || "0",
          teamB: g.scores.away.total?.toString() || "0",
        },
        odds: [],
      }));
    } catch (error) {
      console.error("[BasketballProvider] Live Error:", error);
      return [];
    }
  }

  async getMatchResult(externalId: string) {
    if (!this.apiKey) throw new Error("API Key missing");

    const response = await axios.get(`${this.baseUrl}/games`, {
      headers: { "x-apisports-key": this.apiKey },
      params: { id: externalId },
    });

    const g = response?.data?.response?.[0];
    return {
      status: g.status.short === "FT" ? "completed" : "cancelled" as "completed" | "cancelled",
      score: {
        teamA: g.scores.home.total.toString(),
        teamB: g.scores.away.total.toString(),
      },
    };
  }
}
