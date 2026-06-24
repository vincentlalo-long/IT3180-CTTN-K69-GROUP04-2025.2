import { calculateStandings } from "../standings.utils";
import type { TournamentTeam } from "../../types/statistics.types";
import type { MatchResponse } from "../../../matchmaking/types/matchmaking.types";

const makeTeam = (id: number, name: string): TournamentTeam => ({ id, name });

const makeMatch = (
  overrides: Partial<MatchResponse> & {
    hostTeamId: number;
    guestTeamId: number;
  },
): MatchResponse => ({
  id: 1,
  venueId: 1,
  venueName: "Test Venue",
  hostTeamId: overrides.hostTeamId,
  hostTeamName: "Home",
  guestTeamId: overrides.guestTeamId,
  guestTeamName: "Away",
  skillLevel: "AVERAGE",
  matchTime: "2025-01-01T10:00:00",
  status: "COMPLETED",
  homeScore: 0,
  awayScore: 0,
  ...overrides,
});

describe("calculateStandings", () => {
  const teams: TournamentTeam[] = [
    makeTeam(1, "Team A"),
    makeTeam(2, "Team B"),
    makeTeam(3, "Team C"),
  ];

  it("returns all zeros when there are no matches", () => {
    const standings = calculateStandings([], teams);

    expect(standings).toHaveLength(3);
    standings.forEach((s) => {
      expect(s.played).toBe(0);
      expect(s.won).toBe(0);
      expect(s.drawn).toBe(0);
      expect(s.lost).toBe(0);
      expect(s.goalsFor).toBe(0);
      expect(s.goalsAgainst).toBe(0);
      expect(s.goalDifference).toBe(0);
      expect(s.points).toBe(0);
    });
  });

  it("records a home win correctly", () => {
    const matches = [makeMatch({ hostTeamId: 1, guestTeamId: 2, homeScore: 3, awayScore: 1 })];
    const standings = calculateStandings(matches, teams);

    const teamA = standings.find((s) => s.teamId === 1)!;
    const teamB = standings.find((s) => s.teamId === 2)!;

    expect(teamA.played).toBe(1);
    expect(teamA.won).toBe(1);
    expect(teamA.points).toBe(3);
    expect(teamA.goalsFor).toBe(3);
    expect(teamA.goalsAgainst).toBe(1);
    expect(teamA.goalDifference).toBe(2);

    expect(teamB.played).toBe(1);
    expect(teamB.lost).toBe(1);
    expect(teamB.points).toBe(0);
  });

  it("records a draw correctly", () => {
    const matches = [makeMatch({ hostTeamId: 1, guestTeamId: 2, homeScore: 2, awayScore: 2 })];
    const standings = calculateStandings(matches, teams);

    const teamA = standings.find((s) => s.teamId === 1)!;
    const teamB = standings.find((s) => s.teamId === 2)!;

    expect(teamA.drawn).toBe(1);
    expect(teamA.points).toBe(1);
    expect(teamB.drawn).toBe(1);
    expect(teamB.points).toBe(1);
  });

  it("records an away win correctly", () => {
    const matches = [makeMatch({ hostTeamId: 1, guestTeamId: 2, homeScore: 0, awayScore: 2 })];
    const standings = calculateStandings(matches, teams);

    const teamA = standings.find((s) => s.teamId === 1)!;
    const teamB = standings.find((s) => s.teamId === 2)!;

    expect(teamA.lost).toBe(1);
    expect(teamA.points).toBe(0);
    expect(teamB.won).toBe(1);
    expect(teamB.points).toBe(3);
  });

  it("sorts by points descending", () => {
    const matches = [
      makeMatch({ hostTeamId: 1, guestTeamId: 2, homeScore: 2, awayScore: 0 }),
      makeMatch({ hostTeamId: 2, guestTeamId: 3, homeScore: 1, awayScore: 1 }),
      makeMatch({ hostTeamId: 1, guestTeamId: 3, homeScore: 3, awayScore: 0 }),
    ];
    const standings = calculateStandings(matches, teams);

    expect(standings[0].teamId).toBe(1);
    expect(standings[0].points).toBe(6);

    expect(standings[1].teamId).toBe(2);
    expect(standings[1].points).toBe(1);

    expect(standings[2].teamId).toBe(3);
    expect(standings[2].points).toBe(1);
  });

  it("sorts by goal difference when points are equal", () => {
    const matches = [
      makeMatch({ hostTeamId: 1, guestTeamId: 2, homeScore: 3, awayScore: 1 }),
      makeMatch({ hostTeamId: 2, guestTeamId: 3, homeScore: 0, awayScore: 2 }),
      makeMatch({ hostTeamId: 1, guestTeamId: 3, homeScore: 0, awayScore: 0 }),
    ];
    const standings = calculateStandings(matches, teams);

    expect(standings[0].teamId).toBe(1);
    expect(standings[0].points).toBe(4);

    expect(standings[1].teamId).toBe(3);
    expect(standings[1].points).toBe(4);

    expect(standings[2].teamId).toBe(2);
    expect(standings[2].points).toBe(0);
  });

  it("sorts by goals for when points and goal difference are equal", () => {
    const matches = [
      makeMatch({ hostTeamId: 1, guestTeamId: 2, homeScore: 2, awayScore: 1 }),
      makeMatch({ hostTeamId: 3, guestTeamId: 2, homeScore: 1, awayScore: 0 }),
      makeMatch({ hostTeamId: 1, guestTeamId: 3, homeScore: 0, awayScore: 0 }),
    ];
    const standings = calculateStandings(matches, teams);

    const teamA = standings.find((s) => s.teamId === 1)!;
    const teamC = standings.find((s) => s.teamId === 3)!;

    expect(teamA.points).toBe(4);
    expect(teamC.points).toBe(4);
    expect(teamA.goalDifference).toBe(1);
    expect(teamC.goalDifference).toBe(1);
    expect(teamA.goalsFor).toBe(2);
    expect(teamC.goalsFor).toBe(1);
    expect(standings[0].teamId).toBe(1);
    expect(standings[1].teamId).toBe(3);
  });

  it("ignores non-completed matches", () => {
    const matches: MatchResponse[] = [
      {
        ...makeMatch({ hostTeamId: 1, guestTeamId: 2, homeScore: 5, awayScore: 0 }),
        status: "SCHEDULED",
      },
      {
        ...makeMatch({ hostTeamId: 1, guestTeamId: 2, homeScore: 5, awayScore: 0 }),
        status: "OPEN",
      },
    ];
    const standings = calculateStandings(matches, teams);

    standings.forEach((s) => {
      expect(s.played).toBe(0);
      expect(s.points).toBe(0);
    });
  });

  it("handles matches with null scores as non-completed", () => {
    const matches: MatchResponse[] = [
      makeMatch({ hostTeamId: 1, guestTeamId: 2, homeScore: null as unknown as number, awayScore: null as unknown as number }),
    ];
    const standings = calculateStandings(matches, teams);

    standings.forEach((s) => {
      expect(s.played).toBe(0);
    });
  });
});
