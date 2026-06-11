import apiClient from "../../../shared/api/apiClient";
import type { League, LeagueRequest } from "../types/league.types";
import type { MatchResponse } from "../types/matchmaking.types";

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


import type { TeamStanding, TopPlayerStatDto } from '../../statistics/types/statistics.types';

export const getLeagueStandings = async (id: number): Promise<TeamStanding[]> => {
  const response = await apiClient.get<TeamStanding[]>(`/leagues/${id}/standings`);
  return response.data;
};

export const getTopScorers = async (id: number): Promise<TopPlayerStatDto[]> => {
  const response = await apiClient.get<TopPlayerStatDto[]>(`/leagues/${id}/statistics/top-scorers`);
  return response.data;
};

export const getTopAssists = async (id: number): Promise<TopPlayerStatDto[]> => {
  const response = await apiClient.get<TopPlayerStatDto[]>(`/leagues/${id}/statistics/top-assists`);
  return response.data;
};

export const getLeagueMatches = async (id: number, isAdmin = false): Promise<MatchResponse[]> => {
  const url = isAdmin ? `/admin/leagues/${id}/matches` : `/leagues/${id}/matches`;
  const response = await apiClient.get<MatchResponse[]>(url);
  return response.data;
};

export interface PlayerMatchStat {
  playerId: number;
  teamId: number;
  goals: number;
  assists: number;
}

export const generateLeagueSchedule = async (id: number): Promise<MatchResponse[]> => {
  const response = await apiClient.post<MatchResponse[]>(`/admin/leagues/${id}/generate-schedule`);
  return response.data;
};

export const submitMatchResult = async (
  matchId: number,
  data: { homeScore: number; awayScore: number; playerStats?: PlayerMatchStat[] }
): Promise<MatchResponse> => {
  const response = await apiClient.put<MatchResponse>(`/admin/matches/${matchId}/result`, data);
  return response.data;
};
