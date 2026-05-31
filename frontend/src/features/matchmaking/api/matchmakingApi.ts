import apiClient from "@/shared/api/apiClient";
import { logApiError } from "@/shared/utils/apiError";
import type { MatchResponse, MatchSkillLevel } from "../types/matchmaking.types";

export const getOpenMatches = async (
  venueId?: number | null,
  skillLevel?: MatchSkillLevel | null,
): Promise<MatchResponse[]> => {
  try {
    const params: Record<string, string | number> = {};
    if (venueId) params.venueId = venueId;
    if (skillLevel) params.skillLevel = skillLevel;

    const response = await apiClient.get<MatchResponse[]>("/matches", {
      params,
    });
    return response.data;
  } catch (error) {
    logApiError("getOpenMatches", error);
    throw error;
  }
};

export const createMatch = async (data: {
  venueId: number;
  skillLevel: MatchSkillLevel;
  timeSlotId: number;
  matchDate: string;
  description: string;
}): Promise<MatchResponse> => {
  try {
    const response = await apiClient.post<MatchResponse>("/matches", data);
    return response.data;
  } catch (error) {
    logApiError("createMatch", error);
    throw error;
  }
};

export const joinMatch = async (matchId: number): Promise<MatchResponse> => {
  try {
    const response = await apiClient.post<MatchResponse>(
      `/matches/${matchId}/join`,
    );
    return response.data;
  } catch (error) {
    logApiError("joinMatch", error, { matchId });
    throw error;
  }
};

export const getAdminAllMatches = async (): Promise<MatchResponse[]> => {
  try {
    const response = await apiClient.get<MatchResponse[]>("/admin/matches");
    return response.data;
  } catch (error) {
    logApiError("getAdminAllMatches", error);
    throw error;
  }
};

export const deleteMatch = async (matchId: number): Promise<void> => {
  try {
    await apiClient.delete(`/admin/matches/${matchId}`);
  } catch (error) {
    logApiError("deleteMatch", error, { matchId });
    throw error;
  }
};
