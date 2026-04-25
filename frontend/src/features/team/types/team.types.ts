export type TeamStatus = "Active" | "Warning" | "Banned";
export type MatchResult = "Thắng" | "Thua" | "Hủy kèo";

export interface RecentMatch {
  opponent: string;
  result: MatchResult;
  score: string;
  playedAt: string;
}

export interface Team {
  id: string;
  logoUrl: string;
  teamName: string;
  captainName: string;
  phone: string;
  reputation: number;
  status: TeamStatus;
  joinedAt: string;
  members: string[];
  recentMatches: RecentMatch[];
}
