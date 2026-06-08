import type { TournamentTeam, TeamStanding } from "../types/statistics.types";
import type { MatchResponse } from "../../matchmaking/types/matchmaking.types";

export const calculateStandings = (
  matches: MatchResponse[],
  teams: TournamentTeam[]
): TeamStanding[] => {
  const standingsMap = new Map<number, TeamStanding>();

  // Initialize standings for all teams
  teams.forEach((team) => {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  });

  // Process matches
  matches.forEach((match) => {
    if (
      match.status === "COMPLETED" &&
      match.hostTeamId !== null &&
      match.guestTeamId !== null &&
      match.homeScore !== undefined &&
      match.awayScore !== undefined &&
      match.homeScore !== null &&
      match.awayScore !== null
    ) {
      const homeStanding = standingsMap.get(match.hostTeamId);
      const awayStanding = standingsMap.get(match.guestTeamId);

      if (homeStanding && awayStanding) {
        homeStanding.played += 1;
        awayStanding.played += 1;

        homeStanding.goalsFor += match.homeScore;
        homeStanding.goalsAgainst += match.awayScore;
        homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;

        awayStanding.goalsFor += match.awayScore;
        awayStanding.goalsAgainst += match.homeScore;
        awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;

        if (match.homeScore > match.awayScore) {
          homeStanding.won += 1;
          homeStanding.points += 3;
          awayStanding.lost += 1;
        } else if (match.homeScore < match.awayScore) {
          awayStanding.won += 1;
          awayStanding.points += 3;
          homeStanding.lost += 1;
        } else {
          homeStanding.drawn += 1;
          homeStanding.points += 1;
          awayStanding.drawn += 1;
          awayStanding.points += 1;
        }
      }
    }
  });

  // Convert map to array and sort
  const standingsArray = Array.from(standingsMap.values());
  standingsArray.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return standingsArray;
};
