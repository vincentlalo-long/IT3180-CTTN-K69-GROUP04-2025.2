export type TeamStatus = "PENDING" | "APPROVED" | "REJECTED" | "BANNED";

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
}
