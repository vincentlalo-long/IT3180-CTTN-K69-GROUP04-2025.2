import type { MatchResponse } from "../../matchmaking/types/matchmaking.types";
import type { TournamentTeam } from "../types/statistics.types";

export const mockTeams: TournamentTeam[] = [
  { id: 1, name: "FC Mixi" },
  { id: 2, name: "Refund FC" },
  { id: 3, name: "Bao Trinh FC" },
  { id: 4, name: "Dong Anh FC" },
  { id: 5, name: "Hanoi VIP" },
  { id: 6, name: "Cau Giay Boys" },
];

export const mockRoundRobinMatches: MatchResponse[] = [
  // Round 1
  {
    id: 101, venueId: 1, venueName: "Sân Bóng Mixi", hostTeamId: 1, hostTeamName: "FC Mixi", guestTeamId: 6, guestTeamName: "Cau Giay Boys",
    skillLevel: "AVERAGE", matchTime: "2026-06-10T18:00:00", status: "COMPLETED", homeScore: 3, awayScore: 1, roundNumber: 1
  },
  {
    id: 102, venueId: 1, venueName: "Sân Bóng Mixi", hostTeamId: 2, hostTeamName: "Refund FC", guestTeamId: 5, guestTeamName: "Hanoi VIP",
    skillLevel: "AVERAGE", matchTime: "2026-06-10T19:30:00", status: "COMPLETED", homeScore: 2, awayScore: 2, roundNumber: 1
  },
  {
    id: 103, venueId: 1, venueName: "Sân Bóng Mixi", hostTeamId: 3, hostTeamName: "Bao Trinh FC", guestTeamId: 4, guestTeamName: "Dong Anh FC",
    skillLevel: "AVERAGE", matchTime: "2026-06-11T18:00:00", status: "COMPLETED", homeScore: 0, awayScore: 1, roundNumber: 1
  },
  // Round 2
  {
    id: 104, venueId: 1, venueName: "Sân Bóng Mixi", hostTeamId: 6, hostTeamName: "Cau Giay Boys", guestTeamId: 4, guestTeamName: "Dong Anh FC",
    skillLevel: "AVERAGE", matchTime: "2026-06-17T18:00:00", status: "COMPLETED", homeScore: 1, awayScore: 4, roundNumber: 2
  },
  {
    id: 105, venueId: 1, venueName: "Sân Bóng Mixi", hostTeamId: 5, hostTeamName: "Hanoi VIP", guestTeamId: 3, guestTeamName: "Bao Trinh FC",
    skillLevel: "AVERAGE", matchTime: "2026-06-17T19:30:00", status: "COMPLETED", homeScore: 3, awayScore: 0, roundNumber: 2
  },
  {
    id: 106, venueId: 1, venueName: "Sân Bóng Mixi", hostTeamId: 1, hostTeamName: "FC Mixi", guestTeamId: 2, guestTeamName: "Refund FC",
    skillLevel: "AVERAGE", matchTime: "2026-06-18T18:00:00", status: "SCHEDULED", roundNumber: 2
  },
  // Round 3 (Upcoming)
  {
    id: 107, venueId: 1, venueName: "Sân Bóng Mixi", hostTeamId: 2, hostTeamName: "Refund FC", guestTeamId: 6, guestTeamName: "Cau Giay Boys",
    skillLevel: "AVERAGE", matchTime: "2026-06-24T18:00:00", status: "SCHEDULED", roundNumber: 3
  },
];

export const mockKnockoutMatches: MatchResponse[] = [
  // Quarter Finals (Round 1)
  {
    id: 201, venueId: 1, venueName: "Sân Bóng Mixi", hostTeamId: 1, hostTeamName: "FC Mixi", guestTeamId: 6, guestTeamName: "Cau Giay Boys",
    skillLevel: "AVERAGE", matchTime: "2026-06-10T18:00:00", status: "COMPLETED", homeScore: 2, awayScore: 0, roundNumber: 1, nextMatchId: 205
  },
  {
    id: 202, venueId: 1, venueName: "Sân Bóng Mixi", hostTeamId: 2, hostTeamName: "Refund FC", guestTeamId: 5, guestTeamName: "Hanoi VIP",
    skillLevel: "AVERAGE", matchTime: "2026-06-10T19:30:00", status: "COMPLETED", homeScore: 1, awayScore: 3, roundNumber: 1, nextMatchId: 205
  },
  {
    id: 203, venueId: 1, venueName: "Sân Bóng Mixi", hostTeamId: 3, hostTeamName: "Bao Trinh FC", guestTeamId: 4, guestTeamName: "Dong Anh FC",
    skillLevel: "AVERAGE", matchTime: "2026-06-11T18:00:00", status: "COMPLETED", homeScore: 0, awayScore: 1, roundNumber: 1, nextMatchId: 206
  },
  {
    id: 204, venueId: 1, venueName: "Sân Bóng Mixi", hostTeamId: 0, hostTeamName: "", guestTeamId: null, guestTeamName: "",
    skillLevel: "AVERAGE", matchTime: "2026-06-11T19:30:00", status: "CANCELLED", roundNumber: 1, nextMatchId: 206 // BYE Match representation
  },
  
  // Semi Finals (Round 2)
  {
    id: 205, venueId: 1, venueName: "Sân Bóng Mixi", hostTeamId: 1, hostTeamName: "FC Mixi", guestTeamId: 5, guestTeamName: "Hanoi VIP",
    skillLevel: "AVERAGE", matchTime: "2026-06-17T18:00:00", status: "COMPLETED", homeScore: 1, awayScore: 2, roundNumber: 2, nextMatchId: 207
  },
  {
    id: 206, venueId: 1, venueName: "Sân Bóng Mixi", hostTeamId: 4, hostTeamName: "Dong Anh FC", guestTeamId: null, guestTeamName: "",
    skillLevel: "AVERAGE", matchTime: "2026-06-17T19:30:00", status: "SCHEDULED", roundNumber: 2, nextMatchId: 207 // Team 4 gets BYE from previous round basically
  },

  // Final (Round 3)
  {
    id: 207, venueId: 1, venueName: "Sân Bóng Mixi", hostTeamId: 5, hostTeamName: "Hanoi VIP", guestTeamId: null, guestTeamName: "",
    skillLevel: "AVERAGE", matchTime: "2026-06-24T18:00:00", status: "SCHEDULED", roundNumber: 3
  },
];
