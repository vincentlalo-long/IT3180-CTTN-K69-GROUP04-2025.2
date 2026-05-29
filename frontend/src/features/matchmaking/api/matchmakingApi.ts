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
  matchTime: string; // Already formatted as yyyy-MM-ddTHH:mm:ss
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
