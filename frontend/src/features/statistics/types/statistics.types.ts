import type { LucideIcon } from "lucide-react";

export interface PitchPerformanceDto {
  pitchId: number;
  pitchName: string;
  bookingCount: number;
  revenue: number;
}

export interface DashboardStatsResponse {
  totalRevenue: number;
  totalBookings: number;
  canceledBookings: number;
  uniqueCustomers: number;
  occupancyRate: number;
  pitchPerformances: PitchPerformanceDto[];
}

export interface RecentOrderDto {
  id: string;
  customerName: string;
  fieldName: string;
  bookingTime: string;
  price: number;
  status: string;
}

export interface DashboardStatCard {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: {
    value: string;
    direction: "up" | "down";
  };
}

export interface TournamentTeam {
  id: number;
  name: string;
  logoUrl?: string;
}

export interface TournamentMatch {
  id: number;
  homeTeamId: number | null; // null if BYE or TBD
  awayTeamId: number | null; // null if BYE or TBD
  homeScore?: number;
  awayScore?: number;
  roundNumber: number;
  nextMatchId?: number; // Used for Knockout bracket
  status: "SCHEDULED" | "IN_PROGRESS" | "FINISHED";
}

export interface TeamStanding {
  teamId: number;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}
