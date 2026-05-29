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
    matchTime: string,
  ) => Promise<void>;
  joinMatchAction: (
    matchId: number,
    guestTeamId: number,
    guestTeamName: string,
  ) => Promise<void>;
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

  createNewMatch: async (venueId, skillLevel, matchTime) => {
    set({ loading: true });
    try {
      await createMatch({ venueId, skillLevel, matchTime });
      const { selectedVenueId, selectedSkillLevel } = get();
      const list = await getOpenMatches(selectedVenueId, selectedSkillLevel);
      set({ matches: list, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  joinMatchAction: async (matchId, guestTeamId, guestTeamName) => {
    const originalMatches = get().matches;

    // Optimistic Update: Set guest team details immediately and set status to MATCHED
    set({
      matches: originalMatches.map((m) =>
        m.id === matchId
          ? {
              ...m,
              guestTeamId,
              guestTeamName,
              status: "MATCHED" as const,
            }
          : m,
      ),
    });

    try {
      const updatedMatch = await joinMatch(matchId);
      // Update with server response
      set({
        matches: get().matches.map((m) =>
          m.id === matchId ? updatedMatch : m,
        ),
      });
    } catch (error) {
      // Revert on error
      set({ matches: originalMatches });
      throw error;
    }
  },
}));
