import { Search, Trophy, ShieldAlert, PlusCircle, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { MatchCard, useMatchStore, CreateMatchModal } from "../../features/matchmaking";
import { CreateTeamForm } from "../../features/team";
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

  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showCreateMatch, setShowCreateMatch] = useState(false);

  useEffect(() => {
    fetchMatches();
    getVenues()
      .then((data) => setVenues(data))
      .catch((err) => console.error("Lỗi khi tải danh sách khu sân:", err));
  }, [fetchMatches]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#004D23] via-[#05361b] to-[#012411]">
      <PlayerNavBar />

      {/* Main Banner & Header Title */}
      <div className="relative overflow-hidden bg-black/35 py-8 border-b border-white/5">
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
                Tìm kiếm đối thủ chất lượng, giao lưu học hỏi, tích lũy điểm uy tín và khẳng định vị thế đội bóng của bạn trên bảng xếp hạng.
              </p>
            </div>

            {/* Quick Action Button based on Team Status */}
            <div>
              {userInfo && (
                <>
                  {userInfo.teamId ? (
                    <button
                      onClick={() => setShowCreateMatch(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] transition duration-200 hover:scale-[1.03] active:scale-[0.98]"
                    >
                      <PlusCircle size={18} />
                      Tạo kèo tìm đối
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowCreateTeam(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(245,158,11,0.5)] transition duration-200 hover:scale-[1.03] active:scale-[0.98]"
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
      <div className="bg-black/20 backdrop-blur-sm sticky top-0 z-40 border-b border-white/5 py-4 shadow-md">
        <div className="mx-auto flex max-w-[1280px] flex-col md:flex-row items-center gap-4 px-6">
          {/* Search Input */}
          <div className="flex w-full md:flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 shadow-inner focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
            <Search size={16} className="text-white/40 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên đội bóng hoặc sân..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
            />
          </div>

          {/* Filters Select Dropdowns */}
          <div className="flex w-full md:w-auto items-center gap-3">
            <select
              value={selectedVenueId || ""}
              onChange={handleVenueChange}
              className="w-full md:w-[200px] rounded-xl border border-white/10 bg-[#04331b] px-4 py-2.5 text-sm font-semibold text-white/90 focus:border-emerald-500 focus:outline-none"
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
              className="w-full md:w-[180px] rounded-xl border border-white/10 bg-[#04331b] px-4 py-2.5 text-sm font-semibold text-white/90 focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Tất cả trình độ</option>
              <option value="WEAK">Phong trào (Yếu)</option>
              <option value="AVERAGE">Trung bình</option>
              <option value="GOOD">Khá / Mạnh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Match Grid Section */}
      <main className="mx-auto max-w-[1280px] px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="mt-4 text-sm text-white/60">Đang tải danh sách kèo đấu...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/5 px-6 py-16 text-center shadow-lg">
            <ShieldAlert size={48} className="mx-auto text-amber-400/80 mb-3" />
            <h3 className="text-lg font-bold text-white">Chưa tìm thấy kèo phù hợp</h3>
            <p className="mt-1 text-sm text-white/60">
              Hãy thử thay đổi điều kiện bộ lọc hoặc tự mình tạo một kèo đấu mới ngay bây giờ!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMatches.map((match) => (
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
