export interface MatchData {
  externalId: string;
  tournamentName: string;
  teamA: string;
  teamB: string;
  startTime: Date;
  status: 'scheduled' | 'in_play' | 'completed' | 'cancelled';
  sportType: string;
  score?: {
    teamA: string;
    teamB: string;
  };
  odds: OddsData[];
}

export interface OddsData {
  marketName: string;
  selection: string;
  odds: number;
  status: 'active' | 'suspended';
}

export interface SportsDataProvider {
  getUpcomingMatches(): Promise<MatchData[]>;
  getLiveMatches(): Promise<MatchData[]>;
  getMatchResult(externalId: string): Promise<{
    status: 'completed' | 'cancelled';
    score: { teamA: string; teamB: string };
  }>;
}
