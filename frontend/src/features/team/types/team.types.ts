export type TeamStatus = "PENDING" | "APPROVED" | "REJECTED" | "BANNED";
export type TeamMemberStatus = "INVITED" | "ACTIVE";

export interface TeamMember {
  email: string;
  status: TeamMemberStatus;
}

export interface Team {
  id: number;
  name: string;
  captainId: number;
  captainName: string;
  description: string;
  reputationScore: number;
  status: TeamStatus;
  bannedUntil?: string;
  createdAt: string;
  memberEmails: string[];
  members?: TeamMember[];
}
