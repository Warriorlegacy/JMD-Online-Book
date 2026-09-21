import type { Match } from '../types';

export function normalizeMatch(m: any): Match {
  return {
    id: m.id,
    tournamentId: m.tournamentId || m.tournament_id || '',
    tournamentName: m.tournamentName || m.tournament_name || '',
    teamA: m.teamA || m.team_a || 'Team A',
    teamB: m.teamB || m.team_b || 'Team B',
    startTime: m.startTime || m.start_time || new Date().toISOString(),
    status: m.status,
    sportType: m.sportType || m.sport_type || 'other',
    score: m.score,
    elapsedMinutes: m.elapsedMinutes || m.elapsed_minutes,
  };
}
