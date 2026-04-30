import axios from "axios";
import { SportsDataProvider, MatchData } from "./sports-data-provider.js";

export class ProductionSportsProvider implements SportsDataProvider {
  private readonly apiKey = process.env.API_FOOTBALL_KEY;
  private readonly baseUrl = "https://v3.football.api-sports.io";

  async getUpcomingMatches(): Promise<MatchData[]> {
    if (!this.apiKey) throw new Error("API_FOOTBALL_KEY is not defined");

    const response = await axios.get(`${this.baseUrl}/fixtures`, {
      headers: { "x-apisports-key": this.apiKey },
      params: { next: 10 },
    });

    return response.data.response.map((f: any) => ({
      externalId: f.fixture.id.toString(),
      tournamentName: f.league.name,
      teamA: f.teams.home.name,
      teamB: f.teams.away.name,
      startTime: new Date(f.fixture.date),
      status: "scheduled",
      sportType: "Football",
      odds: [], // Odds would require a separate call to /odds
    }));
  }

  async getLiveMatches(): Promise<MatchData[]> {
    if (!this.apiKey) throw new Error("API_FOOTBALL_KEY is not defined");

    const response = await axios.get(`${this.baseUrl}/fixtures`, {
      headers: { "x-apisports-key": this.apiKey },
      params: { live: "all" },
    });

    return response.data.response.map((f: any) => ({
      externalId: f.fixture.id.toString(),
      tournamentName: f.league.name,
      teamA: f.teams.home.name,
      teamB: f.teams.away.name,
      startTime: new Date(f.fixture.date),
      status: "in_play",
      sportType: "Football",
      score: {
        teamA: f.goals.home.toString(),
        teamB: f.goals.away.toString(),
      },
      odds: [], // Odds would require a separate call to /odds
    }));
  }

  async getMatchResult(externalId: string) {
    if (!this.apiKey) throw new Error("API_FOOTBALL_KEY is not defined");

    const response = await axios.get(`${this.baseUrl}/fixtures`, {
      headers: { "x-apisports-key": this.apiKey },
      params: { id: externalId },
    });

    const f = response.data.response[0];
    return {
      status: f.fixture.status.short === "FT" ? "completed" : "cancelled" as "cancelled" | "completed",
      score: {
        teamA: f.goals.home.toString(),
        teamB: f.goals.away.toString(),
      },
    };
  }
}
