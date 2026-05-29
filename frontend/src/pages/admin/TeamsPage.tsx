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
    loading,
    activeTab,
    setActiveTab,
    openTeamDetails,
    closeModal,
    handleApproveTeam,
    handleRejectTeam,
  } = useTeamManagement();

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-white/15 bg-[#005E2E]/38 px-5 py-4">
        <h2 className="text-xl font-semibold text-white">Quản lý đội bóng</h2>
        <p className="mt-1 text-sm text-white/80">
          Theo dõi đội trưởng, điểm uy tín và phê duyệt danh sách đội bóng mới đăng ký tham gia hệ thống.
        </p>
      </header>

      {/* Tabs Layout */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === "ALL"
              ? "border-emerald-500 text-white"
              : "border-transparent text-white/60 hover:text-white/80"
          }`}
        >
          Tất cả đội bóng
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("PENDING")}
          className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 ${
            activeTab === "PENDING"
              ? "border-emerald-500 text-white"
              : "border-transparent text-white/60 hover:text-white/80"
          }`}
        >
          Chờ duyệt
        </button>
      </div>

      <div className="rounded-2xl border border-white/15 bg-[#005E2E]/32 p-4 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.55)] sm:p-5">
        {loading ? (
          <div className="text-center py-8 text-white/80">
            Đang tải danh sách...
          </div>
        ) : (
          <TeamList
            teams={sortedTeams}
            onOpenDetails={openTeamDetails}
            onApproveTeam={handleApproveTeam}
            onRejectTeam={handleRejectTeam}
            activeTab={activeTab}
          />
        )}
      </div>

      <TeamDetailModal
        team={selectedTeam}
        isOpen={isOpen}
        onClose={closeModal}
      />
    </section>
  );
}
