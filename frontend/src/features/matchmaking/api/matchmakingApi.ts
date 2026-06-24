import apiClient from "@/shared/api/apiClient";
import { logApiError } from "@/shared/utils/apiError";
import type { MatchResponse, MatchSkillLevel, MatchRequestResponse } from "../types/matchmaking.types";

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
  pitchType: number;
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

export const getMatchRequests = async (matchId: number): Promise<MatchRequestResponse[]> => {
  try {
    const response = await apiClient.get<MatchRequestResponse[]>(
      `/matches/${matchId}/requests`,
    );
    return response.data;
  } catch (error) {
    logApiError("getMatchRequests", error, { matchId });
    throw error;
  }
};

export const approveMatchRequest = async (requestId: number): Promise<MatchResponse> => {
  try {
    const response = await apiClient.post<MatchResponse>(
      `/matches/requests/${requestId}/approve`,
    );
    return response.data;
  } catch (error) {
    logApiError("approveMatchRequest", error, { requestId });
    throw error;
  }
};

export const getAdminAllMatches = async (
  venueId?: number | null,
): Promise<MatchResponse[]> => {
  try {
    const params: Record<string, string | number> = {};
    if (venueId) params.venueId = venueId;

    const response = await apiClient.get<MatchResponse[]>("/admin/matches", {
      params,
    });
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
