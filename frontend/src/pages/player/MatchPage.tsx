import { Search, Trophy, ShieldAlert, PlusCircle, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { MatchCard, useMatchStore, CreateMatchModal } from "../../features/matchmaking";
import { CreateTeamForm, getMyTeam, type Team } from "../../features/team";
import { PlayerNavBar } from "../../layouts/player/PlayerNavBar";
import { usePlayerProfile } from "../../features/account";
import { getVenues } from "@/features/venue/api/venueApi";
import type { VenueResponseDTO } from "@/features/venue/types/venue.types";
import type { MatchSkillLevel } from "../../features/matchmaking/types/matchmaking.types";

export function MatchPage() {
  const { matches, loading, selectedVenueId, selectedSkillLevel, setFilters, fetchMatches } =
    useMatchStore();

  const { userInfo, refetch: refetchProfile } = usePlayerProfile();
  const [venues, setVenues] = useState<VenueResponseDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [prevUserId, setPrevUserId] = useState<number | string | null>(null);

  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "recommended">("all");
  const isCaptain = !!(myTeam && userInfo && myTeam.captainId === userInfo.id);

  // Sync state during rendering to reset myTeam when user changes, avoiding cascading renders in useEffect
  const currentUserId = userInfo?.id || null;
  if (currentUserId !== prevUserId) {
    setPrevUserId(currentUserId);
    setMyTeam(null);
  }

  useEffect(() => {
    if (userInfo?.teamId) {
      getMyTeam()
        .then((team) => setMyTeam(team))
        .catch((err) => {
          console.error("Lỗi khi tải thông tin đội bóng:", err);
          setMyTeam(null);
        });
    }
  }, [userInfo?.teamId]);

  useEffect(() => {
    refetchProfile();
    fetchMatches();
    getVenues()
      .then((data) => setVenues(data))
      .catch((err) => console.error("Lỗi khi tải danh sách khu sân:", err));
  }, [fetchMatches, refetchProfile]);

  const handleVenueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilters(val ? parseInt(val) : null, selectedSkillLevel);
  };

  const handleSkillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilters(selectedVenueId, val ? (val as MatchSkillLevel) : null);
  };

  // Local filter for search text (searches for host team name or venue name)
  const filteredMatches = matches.filter((m) => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    return (
      m.hostTeamName.toLowerCase().includes(search) ||
      m.venueName.toLowerCase().includes(search)
    );
  });

  const displayedMatches = filteredMatches.filter((m) => {
    if (activeTab === "recommended") {
      return !!m.recommended && m.hostTeamId !== userInfo?.teamId;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D]">
      <PlayerNavBar />

      {/* Main Banner & Header Title */}
      <div className="relative overflow-hidden bg-[#005E2E]/40 py-8 border-b border-white/10">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/25">
                <Trophy size={12} className="text-emerald-400" />
                Hệ thống matchmaking tự động
              </span>
              <h1 className="mt-3 text-3xl font-extrabold text-white tracking-tight md:text-4xl">
                Chợ Kèo Giao Hữu
              </h1>
              <p className="mt-2 text-sm text-white/70 max-w-xl">
                Tìm kiếm đối thủ chất lượng, giao lưu học hỏi, tích luy điểm uy tín và khẳng định vị thế đội bóng của bạn trên bảng xếp hạng.
              </p>
            </div>

            {/* Quick Action Button based on Team Status */}
            <div>
              {userInfo && (
                <>
                  {userInfo.teamId ? (
                    <button
                      onClick={() => {
                        if (!isCaptain) {
                          alert("Chỉ đội trưởng mới được phép tạo kèo.");
                          return;
                        }
                        if (myTeam?.status !== "APPROVED") {
                          alert("Đội bóng của bạn chưa được phê duyệt hoạt động. Không thể tạo kèo lúc này!");
                          return;
                        }
                        setShowCreateMatch(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-[#F8B416] hover:bg-[#e09e10] px-6 py-3.5 text-sm font-extrabold uppercase text-white shadow-[0_4px_12px_rgba(248,180,22,0.35)] transition duration-200 hover:scale-[1.03] active:scale-[0.98]"
                    >
                      <PlusCircle size={18} />
                      Tạo kèo tìm đối
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowCreateTeam(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-white text-[#0B582A] hover:bg-emerald-50 px-6 py-3.5 text-sm font-extrabold uppercase shadow-[0_4px_12px_rgba(255,255,255,0.2)] transition duration-200 hover:scale-[1.03] active:scale-[0.98]"
                    >
                      <UserCheck size={18} />
                      Đăng ký Đội bóng của bạn
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#005E2E]/20 backdrop-blur-sm sticky top-0 z-40 border-b border-white/10 py-4 shadow-md">
        <div className="mx-auto flex max-w-[1280px] flex-col md:flex-row items-center gap-4 px-6">
          {/* Search Input */}
          <div className="flex w-full md:flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm focus-within:ring-1 focus-within:ring-[#005E2E]">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên đội bóng hoặc sân..."
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
            />
          </div>

          {/* Filters Select Dropdowns */}
          <div className="flex w-full md:w-auto items-center gap-3">
            <select
              value={selectedVenueId || ""}
              onChange={handleVenueChange}
              className="w-full md:w-[200px] rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur outline-none focus:outline-none cursor-pointer transition hover:bg-white/20 [&>option]:bg-[#005E2E] [&>option]:text-white"
            >
              <option value="">Tất cả khu sân</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSkillLevel || ""}
              onChange={handleSkillChange}
              className="w-full md:w-[180px] rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur outline-none focus:outline-none cursor-pointer transition hover:bg-white/20 [&>option]:bg-[#005E2E] [&>option]:text-white"
            >
              <option value="">Tất cả trình độ</option>
              <option value="WEAK">Phong trào (Yếu)</option>
              <option value="AVERAGE">Trung bình</option>
              <option value="GOOD">Khá / Mạnh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="mx-auto max-w-[1280px] px-6 mt-8 flex gap-6 border-b border-white/10 pb-0">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 text-sm font-extrabold uppercase tracking-wider transition-all relative ${
            activeTab === "all"
              ? "text-emerald-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          Tất cả kèo đấu
          {activeTab === "all" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("recommended")}
          className={`pb-3 text-sm font-extrabold uppercase tracking-wider transition-all relative flex items-center gap-1.5 ${
            activeTab === "recommended"
              ? "text-emerald-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Trophy size={14} className="text-amber-400 animate-pulse" />
          Kèo gợi ý (Đối thủ phù hợp)
          {activeTab === "recommended" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Match Grid Section */}
      <main className="mx-auto max-w-[1280px] px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="mt-4 text-sm text-white/60">Đang tải danh sách kèo đấu...</p>
          </div>
        ) : displayedMatches.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/5 px-6 py-16 text-center shadow-lg">
            <ShieldAlert size={48} className="mx-auto text-amber-400/80 mb-3" />
            <h3 className="text-lg font-bold text-white">Chưa tìm thấy kèo phù hợp</h3>
            <p className="mt-1 text-sm text-white/60">
              {activeTab === "recommended"
                ? "Hệ thống chưa tìm thấy đối thủ phù hợp gợi ý cho đội của bạn lúc này. Hãy quay lại sau nhé!"
                : "Hãy thử thay đổi điều kiện bộ lọc hoặc tự mình tạo một kèo đấu mới ngay bây giờ!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                userTeamId={userInfo?.teamId}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Team Form Modal */}
      {showCreateTeam && (
        <CreateTeamForm
          onClose={() => setShowCreateTeam(false)}
          onSuccess={() => {
            setShowCreateTeam(false);
            refetchProfile(); // Refresh profile state to get teamId
          }}
        />
      )}

      {/* Create Match Modal */}
      {showCreateMatch && (
        <CreateMatchModal
          onClose={() => setShowCreateMatch(false)}
          onSuccess={() => {
            setShowCreateMatch(false);
            fetchMatches(); // Reload matchboard
          }}
        />
      )}
    </div>
  );
}
