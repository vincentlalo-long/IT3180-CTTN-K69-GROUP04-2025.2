export type LeagueFormat = "KNOCKOUT" | "ROUND_ROBIN" | "GROUP_STAGE";
export type LeagueStatus = "OPENING" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";

export interface League {
  id: number;
  name: string;
  description?: string | null;
  format: LeagueFormat;
  numberOfTeams: number;
  prize: string;
  status: LeagueStatus;
  managerId: number;
  startDate?: string | null;
  endDate?: string | null;
  venueId?: number | null;
  venueName?: string | null;
  timeSlotId?: number | null;
  timeSlotLabel?: string | null;
  createdAt: string;
}

export interface LeagueRequest {
  name: string;
  description?: string | null;
  format: LeagueFormat;
  numberOfTeams: number;
  prize: string;
  startDate?: string | null;
  endDate?: string | null;
  venueId?: number | null;
  timeSlotId?: number | null;
  status: LeagueStatus;
}

export type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LeagueRegistration {
  id: number;
  leagueId: number;
  leagueName: string;
  teamId: number;
  teamName: string;
  captainId: number;
  captainName: string;
  status: RegistrationStatus;
  createdAt: string;
}
