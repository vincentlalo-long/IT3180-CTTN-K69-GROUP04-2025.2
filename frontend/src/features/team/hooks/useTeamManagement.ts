import { useMemo, useState } from "react";

import { mockTeams } from "../data/team.mock";
import type { Team } from "../types/team.types";
import { clampReputation, getStatusFromReputation } from "../utils/team.utils";

export function useTeamManagement() {
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => b.reputation - a.reputation),
    [teams],
  );

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) ?? null,
    [selectedTeamId, teams],
  );

  const handleBanTeam = (teamId: string) => {
    setTeams((currentTeams) =>
      currentTeams.map((team) =>
        team.id === teamId
          ? {
              ...team,
              status: "Banned",
              reputation: Math.min(team.reputation, 19),
            }
          : team,
      ),
    );
  };

  const handleAdjustReputation = (teamId: string, delta: number) => {
    setTeams((currentTeams) =>
      currentTeams.map((team) => {
        if (team.id !== teamId) {
          return team;
        }

        const nextReputation = clampReputation(team.reputation + delta);

        if (team.status === "Banned" && delta > 0) {
          return {
            ...team,
            reputation: nextReputation,
            status: "Banned",
          };
        }

        return {
          ...team,
          reputation: nextReputation,
          status: getStatusFromReputation(nextReputation),
        };
      }),
    );
  };

  const openTeamDetails = (teamId: string) => {
    setSelectedTeamId(teamId);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleModalReputationEdit = () => {
    if (!selectedTeamId) {
      return;
    }

    handleAdjustReputation(selectedTeamId, 5);
  };

  return {
    sortedTeams,
    selectedTeam,
    isOpen,
    openTeamDetails,
    closeModal,
    handleBanTeam,
    handleModalReputationEdit,
  };
}
