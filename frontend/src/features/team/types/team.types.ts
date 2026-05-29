export type TeamStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Team {
  id: number;
  name: string;
  captainId: number;
  captainName: string;
  description: string;
  reputationScore: number;
  status: TeamStatus;
  createdAt: string;
  memberEmails: string[];
}
