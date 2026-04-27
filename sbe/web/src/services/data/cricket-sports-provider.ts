import axios from "axios";
import { SportsDataProvider, MatchData } from "./sports-data-provider.js";

export class CricketSportsProvider implements SportsDataProvider {
  private readonly apiKey = process.env.SPORTRADAR_CRICKET_API_KEY;
  private readonly baseUrl = "https://api.sportradar.com/cricket";

  async getUpcomingMatches(): Promise<MatchData[]> {
    if (!this.apiKey) throw new Error("SPORTRADAR_CRICKET_API_KEY is not defined");

    try {
      const response = await axios.get(`${this.baseUrl}/upcoming`, {
        headers: { "Authorization": `Bearer ${this.apiKey}` },
      });

      return response.data.matches.map((m: any) => ({
        externalId: m.id,
        tournamentName: m.tournament.name,
        teamA: m.home_team.name,
        teamB: m.away_team.name,
        startTime: new Date(m.start_time),
        status: "scheduled",
        sportType: "Cricket",
        odds: [],
      }));
    } catch (error: any) {
      console.error("[CricketProvider] Error fetching upcoming matches:", error.message);
      return [];
    }
  }

  async getLiveMatches(): Promise<MatchData[]> {
    if (!this.apiKey) throw new Error("SPORTRADAR_CRICKET_API_KEY is not defined");

    try {
      const response = await axios.get(`${this.baseUrl}/live`, {
        headers: { "Authorization": `Bearer ${this.apiKey}` },
      });

      return response.data.matches.map((m: any) => ({
        externalId: m.id,
        tournamentName: m.tournament.name,
        teamA: m.home_team.name,
        teamB: m.away_team.name,
        startTime: new Date(m.start_time),
        status: "in_play",
        sportType: "Cricket",
        score: {
          teamA: m.home_score,
          teamB: m.away_score,
        },
        odds: [],
      }));
    } catch (error: any) {
      console.error("[CricketProvider] Error fetching live matches:", error.message);
      return [];
    }
  }

  async getMatchResult(externalId: string) {
    if (!this.apiKey) throw new Error("SPORTRADAR_CRICKET_API_KEY is not defined");

    try {
      const response = await axios.get(`${this.baseUrl}/match/${externalId}`, {
        headers: { "Authorization": `Bearer ${this.apiKey}` },
      });

      const m = response.data;
      return {
        status: m.status === "finished" ? "completed" : "cancelled" as "completed" | "cancelled",
        score: {
          teamA: m.home_score,
          teamB: m.away_score,
        },
      };
    } catch (error: any) {
      console.error("[CricketProvider] Error fetching match result:", error.message);
      throw error;
    }
  }
}
