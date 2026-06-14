export type MatchSkillLevel = "WEAK" | "AVERAGE" | "GOOD";
export type MatchStatus = "OPEN" | "MATCHED" | "SCHEDULED" | "CANCELLED" | "COMPLETED";
export type MatchRequestStatus = "PENDING_GUEST_CAPTAIN" | "PENDING_HOST_CAPTAIN" | "APPROVED" | "REJECTED";

export interface MatchResponse {
  id: number;
  venueId: number;
  venueName: string;
  hostTeamId: number;
  hostTeamName: string;
  guestTeamId: number | null;
  guestTeamName: string | null;
  skillLevel: MatchSkillLevel;
  matchTime: string;
  status: MatchStatus;
  description?: string;
  pitchType?: number;
  homeScore?: number;
  awayScore?: number;
  roundNumber?: number;
  nextMatchId?: number;
  recommended?: boolean;
  bookingId?: number;
  price?: number;
}

export interface MatchRequestResponse {
  id: number;
  matchId: number;
  guestTeamId: number;
  guestTeamName: string;
  createdByUsername: string;
  status: MatchRequestStatus;
  createdAt: string;
}

// Keep mock types if any legacy components import them to prevent breaking
export type MatchmakingStatus = "Đang tìm" | "Đã chốt" | "Hết hạn" | "Bị hủy";
export type MatchmakingLevel =
  | "Phong trào"
  | "Trung bình"
  | "Khá"
  | "Bán chuyên";
export type MatchType =
  | "Đấu giao hữu"
  | "Kèo đồng trình"
  | "Đá tập"
  | "Kèo phủi";

export interface MatchmakingPost {
  id: string;
  teamName: string;
  level: MatchmakingLevel;
  fieldAndShift: string;
  matchType: MatchType;
  status: MatchmakingStatus;
  matchDate: string;
}

export interface PlayerMatchItem {
  id: string;
  player: string;
  field: string;
  time: string;
  avatar: string;
}
