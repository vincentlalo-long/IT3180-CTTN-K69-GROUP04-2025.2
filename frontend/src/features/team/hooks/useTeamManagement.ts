import { useEffect, useState, useMemo } from "react";
import type { Team } from "../types/team.types";
import { getAllTeams, getPendingTeams, updateTeamStatus, deleteTeam, addReputation, deductReputation, banTeam } from "../api/teamApi";
import { toast } from "../../../shared/utils/toast";

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

  const handleDeleteTeam = async (teamId: number) => {
    try {
      await deleteTeam(teamId);
      toast.success("Xóa đội bóng thành công!");
      closeModal();
      fetchTeams();
    } catch (error) {
      console.error(error);
      toast.error("Xóa đội bóng thất bại.");
    }
  };

  const handleAddReputation = async (teamId: number, amount: number) => {
    try {
      const updated = await addReputation(teamId, amount);
      toast.success(`Đã cộng ${amount} điểm uy tín cho đội bóng!`);
      setAllTeams((current) => current.map((t) => (t.id === teamId ? updated : t)));
      setPendingTeams((current) => current.map((t) => (t.id === teamId ? updated : t)));
    } catch (error) {
      console.error(error);
      toast.error("Cộng điểm uy tín thất bại.");
    }
  };

  const handleDeductReputation = async (teamId: number, amount: number) => {
    try {
      const updated = await deductReputation(teamId, amount);
      toast.success(`Đã trừ ${amount} điểm uy tín của đội bóng!`);
      setAllTeams((current) => current.map((t) => (t.id === teamId ? updated : t)));
      setPendingTeams((current) => current.map((t) => (t.id === teamId ? updated : t)));
    } catch (error) {
      console.error(error);
      toast.error("Trừ điểm uy tín thất bại.");
    }
  };

  const handleBanTeam = async (teamId: number, days: number) => {
    try {
      const updated = await banTeam(teamId, days);
      toast.success(`Đã cấm đội bóng thi đấu trong ${days} ngày!`);
      setAllTeams((current) => current.map((t) => (t.id === teamId ? updated : t)));
      setPendingTeams((current) => current.map((t) => (t.id === teamId ? updated : t)));
    } catch (error) {
      console.error(error);
      toast.error("Cấm đội bóng thất bại.");
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
    handleDeleteTeam,
    handleAddReputation,
    handleDeductReputation,
    handleBanTeam,
    refetch: fetchTeams,
  };
}
