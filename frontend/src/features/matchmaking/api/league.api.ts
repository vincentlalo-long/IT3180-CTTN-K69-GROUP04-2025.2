import apiClient from "../../../shared/api/apiClient";
import type { League, LeagueRequest } from "../types/league.types";

export const getPublicLeagues = async (): Promise<League[]> => {
  const response = await apiClient.get<League[]>("/leagues");
  return response.data;
};

export const getAdminLeagues = async (): Promise<League[]> => {
  const response = await apiClient.get<League[]>("/admin/leagues");
  return response.data;
};

export const getLeagueById = async (id: number): Promise<League> => {
  const response = await apiClient.get<League>(`/admin/leagues/${id}`);
  return response.data;
};

export const createLeague = async (data: LeagueRequest): Promise<League> => {
  const response = await apiClient.post<League>("/admin/leagues", data);
  return response.data;
};

export const updateLeague = async (id: number, data: LeagueRequest): Promise<League> => {
  const response = await apiClient.put<League>(`/admin/leagues/${id}`, data);
  return response.data;
};

export const deleteLeague = async (id: number): Promise<void> => {
  await apiClient.delete(`/admin/leagues/${id}`);
};

