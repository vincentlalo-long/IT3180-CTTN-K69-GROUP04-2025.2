import {
  TeamDetailModal,
  TeamList,
  useTeamManagement,
} from "../../features/team";

export function TeamsPage() {
  const {
    sortedTeams,
    selectedTeam,
    isOpen,
    openTeamDetails,
    closeModal,
    handleBanTeam,
    handleModalReputationEdit,
  } = useTeamManagement();

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-white/15 bg-[#005E2E]/38 px-5 py-4">
        <h2 className="text-xl font-semibold text-white">Quản lý đội bóng</h2>
        <p className="mt-1 text-sm text-white/80">
          Theo dõi đội trưởng, điểm uy tín và xử lý nhanh các đội có nguy cơ
          bùng kèo.
        </p>
      </header>

      <div className="rounded-2xl border border-white/15 bg-[#005E2E]/32 p-4 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.55)] sm:p-5">
        <TeamList
          teams={sortedTeams}
          onOpenDetails={openTeamDetails}
          onBanTeam={handleBanTeam}
        />
      </div>

      <TeamDetailModal
        team={selectedTeam}
        isOpen={isOpen}
        onClose={closeModal}
        onEditReputation={handleModalReputationEdit}
      />
    </section>
  );
}
