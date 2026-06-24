import apiClient from "@/shared/api/apiClient";
import type { LeagueRegistration, RegistrationStatus } from "../types/league.types";

export const leagueRegistrationApi = {
  registerTeam: async (leagueId: number, teamId: number): Promise<LeagueRegistration> => {
    const response = await apiClient.post<LeagueRegistration>(
      `/league-registrations/leagues/${leagueId}/teams/${teamId}`
    );
    return response.data;
  },

  getRegistrationsByLeague: async (leagueId: number): Promise<LeagueRegistration[]> => {
    const response = await apiClient.get<LeagueRegistration[]>(
      `/league-registrations/leagues/${leagueId}`
    );
    return response.data;
  },

  updateRegistrationStatus: async (
    registrationId: number,
    status: RegistrationStatus
  ): Promise<LeagueRegistration> => {
    const response = await apiClient.patch<LeagueRegistration>(
      `/league-registrations/${registrationId}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  deleteRegistration: async (registrationId: number): Promise<void> => {
    await apiClient.delete(`/league-registrations/${registrationId}`);
  },

  finalizeRegistration: async (leagueId: number): Promise<void> => {
    await apiClient.post(`/league-registrations/leagues/${leagueId}/finalize`);
  },
};
