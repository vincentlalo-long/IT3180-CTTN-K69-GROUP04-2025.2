import apiClient from "@/shared/api/apiClient";
import { logApiError } from "@/shared/utils/apiError";
import type { Team, TeamStatus } from "../types/team.types";

export const getPendingTeams = async (): Promise<Team[]> => {
  try {
    const response = await apiClient.get<Team[]>("/admin/teams/pending");
    return response.data;
  } catch (error) {
    logApiError("getPendingTeams", error);
    throw error;
  }
};

export const getAllTeams = async (): Promise<Team[]> => {
  try {
    const response = await apiClient.get<Team[]>("/admin/teams");
    return response.data;
  } catch (error) {
    logApiError("getAllTeams", error);
    throw error;
  }
};

export const updateTeamStatus = async (
  teamId: number,
  status: TeamStatus,
): Promise<Team> => {
  try {
    const response = await apiClient.put<Team>(`/admin/teams/${teamId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    logApiError("updateTeamStatus", error, { teamId, status });
    throw error;
  }
};

export const createTeam = async (data: {
  name: string;
  description: string;
  memberEmails: string[];
}): Promise<Team> => {
  try {
    const response = await apiClient.post<Team>("/teams", data);
    return response.data;
  } catch (error) {
    logApiError("createTeam", error);
    throw error;
  }
};
