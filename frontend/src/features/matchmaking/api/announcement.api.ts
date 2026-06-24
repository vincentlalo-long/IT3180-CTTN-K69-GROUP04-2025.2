import type { CreateAnnouncementRequest, LeagueAnnouncement } from "../types/announcement.types";
import {
  createLeagueAnnouncement,
  getLeagueAnnouncements,
} from "./league.api";

export const announcementApi = {
  getAnnouncementsByLeague: async (leagueId: number): Promise<LeagueAnnouncement[]> => {
    return getLeagueAnnouncements(leagueId);
  },

  createAnnouncement: async (
    leagueId: number,
    data: CreateAnnouncementRequest,
  ): Promise<LeagueAnnouncement> => {
    return createLeagueAnnouncement(leagueId, data);
  },
};
