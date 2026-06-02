import { create } from "zustand";
import type { MatchResponse, MatchSkillLevel } from "../types/matchmaking.types";
import { getOpenMatches, createMatch, joinMatch } from "../api/matchmakingApi";

interface MatchState {
  matches: MatchResponse[];
  loading: boolean;
  selectedVenueId: number | null;
  selectedSkillLevel: MatchSkillLevel | null;
  setFilters: (venueId: number | null, skillLevel: MatchSkillLevel | null) => void;
  fetchMatches: () => Promise<void>;
  createNewMatch: (
    venueId: number,
    skillLevel: MatchSkillLevel,
    timeSlotId: number,
    matchDate: string,
    description: string,
    pitchType: number,
  ) => Promise<void>;
  joinMatchAction: (matchId: number) => Promise<void>;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  loading: false,
  selectedVenueId: null,
  selectedSkillLevel: null,

  setFilters: (venueId, skillLevel) => {
    set({ selectedVenueId: venueId, selectedSkillLevel: skillLevel });
    get().fetchMatches();
  },

  fetchMatches: async () => {
    set({ loading: true });
    try {
      const { selectedVenueId, selectedSkillLevel } = get();
      const list = await getOpenMatches(selectedVenueId, selectedSkillLevel);
      set({ matches: list, loading: false });
    } catch (error) {
      console.error("Lỗi khi tải danh sách kèo đấu:", error);
      set({ loading: false });
    }
  },

  createNewMatch: async (venueId, skillLevel, timeSlotId, matchDate, description, pitchType) => {
    set({ loading: true });
    try {
      await createMatch({ venueId, skillLevel, timeSlotId, matchDate, description, pitchType });
      const { selectedVenueId, selectedSkillLevel } = get();
      const list = await getOpenMatches(selectedVenueId, selectedSkillLevel);
      set({ matches: list, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  joinMatchAction: async (matchId) => {
    await joinMatch(matchId);
    // After successful join, just refresh the match list to get accurate server state
    await get().fetchMatches();
  },
}));
