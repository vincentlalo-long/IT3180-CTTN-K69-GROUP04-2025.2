import { isAxiosError } from "axios";
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

export const deleteTeam = async (teamId: number): Promise<void> => {
  try {
    await apiClient.delete(`/admin/teams/${teamId}`);
  } catch (error) {
    logApiError("deleteTeam", error, { teamId });
    throw error;
  }
};

export const addReputation = async (teamId: number, amount: number): Promise<Team> => {
  try {
    const response = await apiClient.put<Team>(`/admin/teams/${teamId}/reputation/add`, null, {
      params: { amount }
    });
    return response.data;
  } catch (error) {
    logApiError("addReputation", error, { teamId, amount });
    throw error;
  }
};

export const deductReputation = async (teamId: number, amount: number): Promise<Team> => {
  try {
    const response = await apiClient.put<Team>(`/admin/teams/${teamId}/reputation/deduct`, null, {
      params: { amount }
    });
    return response.data;
  } catch (error) {
    logApiError("deductReputation", error, { teamId, amount });
    throw error;
  }
};

export const banTeam = async (teamId: number, days: number): Promise<Team> => {
  try {
    const response = await apiClient.put<Team>(`/admin/teams/${teamId}/ban`, null, {
      params: { days }
    });
    return response.data;
  } catch (error) {
    logApiError("banTeam", error, { teamId, days });
    throw error;
  }
};

export const getMyTeam = async (): Promise<Team | null> => {
  try {
    const response = await apiClient.get<Team | null>("/teams/my-team");
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    logApiError("getMyTeam", error);
    throw error;
  }
};

export const getTeamById = async (teamId: number): Promise<Team> => {
  try {
    const response = await apiClient.get<Team>(`/teams/${teamId}`);
    return response.data;
  } catch (error) {
    logApiError("getTeamById", error, { teamId });
    throw error;
  }
};

export const getApprovedTeams = async (): Promise<Team[]> => {
  try {
    const response = await apiClient.get<Team[]>("/teams");
    return response.data;
  } catch (error) {
    logApiError("getApprovedTeams", error);
    throw error;
  }
};
