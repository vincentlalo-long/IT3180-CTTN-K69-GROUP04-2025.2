import { useEffect, useState, useMemo } from "react";
import type { Team } from "../types/team.types";
import { getAllTeams, getPendingTeams, updateTeamStatus } from "../api/teamApi";

export function useTeamManagement() {
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [pendingTeams, setPendingTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING">("ALL");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const [all, pending] = await Promise.all([
        getAllTeams(),
        getPendingTeams(),
      ]);
      setAllTeams(all);
      setPendingTeams(pending);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đội bóng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const sortedTeams = useMemo(() => {
    const teamsToFilter = activeTab === "ALL" ? allTeams : pendingTeams;
    return [...teamsToFilter].sort(
      (a, b) => b.reputationScore - a.reputationScore,
    );
  }, [allTeams, pendingTeams, activeTab]);

  const selectedTeam = useMemo(
    () =>
      allTeams.find((team) => team.id === selectedTeamId) ??
      pendingTeams.find((team) => team.id === selectedTeamId) ??
      null,
    [selectedTeamId, allTeams, pendingTeams],
  );

  const openTeamDetails = (teamId: number) => {
    setSelectedTeamId(teamId);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleApproveTeam = async (teamId: number) => {
    // Optimistic Update: remove from pending list immediately
    const originalPending = [...pendingTeams];
    setPendingTeams((current) => current.filter((t) => t.id !== teamId));

    // Also optimistically update status in allTeams
    setAllTeams((current) =>
      current.map((t) =>
        t.id === teamId ? { ...t, status: "APPROVED" as const } : t,
      ),
    );

    try {
      await updateTeamStatus(teamId, "APPROVED");
    } catch (error) {
      console.error(error);
      // Revert if error
      setPendingTeams(originalPending);
      setAllTeams((current) =>
        current.map((t) =>
          t.id === teamId ? { ...t, status: "PENDING" as const } : t,
        ),
      );
      alert("Duyệt đội bóng thất bại. Vui lòng thử lại!");
    }
  };

  const handleRejectTeam = async (teamId: number) => {
    // Optimistic Update: remove from pending list immediately
    const originalPending = [...pendingTeams];
    setPendingTeams((current) => current.filter((t) => t.id !== teamId));

    // Also optimistically update status in allTeams
    setAllTeams((current) =>
      current.map((t) =>
        t.id === teamId ? { ...t, status: "REJECTED" as const } : t,
      ),
    );

    try {
      await updateTeamStatus(teamId, "REJECTED");
    } catch (error) {
      console.error(error);
      // Revert if error
      setPendingTeams(originalPending);
      setAllTeams((current) =>
        current.map((t) =>
          t.id === teamId ? { ...t, status: "PENDING" as const } : t,
        ),
      );
      alert("Từ chối đội bóng thất bại. Vui lòng thử lại!");
    }
  };

  return {
    sortedTeams,
    selectedTeam,
    isOpen,
    loading,
    activeTab,
    setActiveTab,
    openTeamDetails,
    closeModal,
    handleApproveTeam,
    handleRejectTeam,
    refetch: fetchTeams,
  };
}
