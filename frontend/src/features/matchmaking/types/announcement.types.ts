export interface LeagueAnnouncement {
  id: number;
  leagueId: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
}
