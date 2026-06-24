import type { MatchSkillLevel } from "../../matchmaking/types/matchmaking.types";

export type TeamStatus = "PENDING" | "APPROVED" | "REJECTED" | "BANNED";
export type TeamMemberStatus = "INVITED" | "ACTIVE" | "REQUESTED";

export interface TeamMember {
  email: string;
  status: TeamMemberStatus;
  id?: number;
  username?: string;
}

export interface Team {
  id: number;
  name: string;
  captainId: number;
  captainName: string;
  description: string;
  reputationScore: number;
  status: TeamStatus;
  skillLevel?: MatchSkillLevel;
  bannedUntil?: string;
  createdAt: string;
  memberEmails: string[];
  members?: TeamMember[];
}
