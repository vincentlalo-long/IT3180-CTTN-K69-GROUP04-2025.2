import { useEffect, useState, useCallback } from "react";
import { PlayerNavBar } from "@/layouts/player/PlayerNavBar";
import {
  getMyTeam,
  getApprovedTeams,
  CreateTeamForm,
  MyTeamDetails,
  TeamListCard,
} from "@/features/team";
import type { Team } from "@/features/team";
import { Trophy, Users, PlusCircle, Search } from "lucide-react";
import { getApiErrorMessage, logApiError } from "@/shared/utils/apiError";

export function PlayerTeamPage() {
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [approvedTeams, setApprovedTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "browse">("create");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const team = await getMyTeam();
      setMyTeam(team);

      if (!team) {
        const approved = await getApprovedTeams();
        setApprovedTeams(approved);
      }
    } catch (err) {
      logApiError("PlayerTeamPage.fetchData", err);
      setError(getApiErrorMessage(err, "Không thể tải dữ liệu đội bóng. Vui lòng thử lại!"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateSuccess = () => {
    fetchData();
  };

  const filteredTeams = approvedTeams.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D]">
      <PlayerNavBar />

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-[#005E2E]/40 py-8 border-b border-white/10">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/25">
                <Trophy size={12} className="text-emerald-400" />
                Câu lạc bộ & Đội nhóm
              </span>
              <h1 className="mt-3 text-3xl font-extrabold text-white tracking-tight md:text-4xl">
                Quản Lý Đội Bóng
              </h1>
              <p className="mt-2 text-sm text-white/70 max-w-xl">
                Tạo lập đội bóng riêng, mời các thành viên, thách đấu giao hữu nâng cao trình độ và tích lũy điểm uy tín trên bảng xếp hạng.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
            <p className="mt-4 font-bold">Đang tải thông tin...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border-2 border-red-600 bg-red-50 p-6 text-center text-red-800 shadow-[4px_4px_0px_rgba(220,38,38,1)] max-w-md mx-auto">
            <h3 className="font-extrabold text-lg">Đã xảy ra lỗi</h3>
            <p className="mt-2 text-sm font-semibold">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 rounded-full border-2 border-black/60 bg-white hover:bg-gray-100 px-5 py-2 text-sm font-bold text-gray-800 transition"
            >
              Thử lại
            </button>
          </div>
        ) : myTeam ? (
          // Nếu đã thuộc về một đội bóng
          <div className="max-w-4xl mx-auto">
            <MyTeamDetails team={myTeam} />
          </div>
        ) : (
          // Nếu chưa có đội bóng, hiển thị giao diện Tab
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Tabs Header */}
            <div className="flex border-b-2 border-black/30">
              <button
                type="button"
                onClick={() => setActiveTab("create")}
                className={`flex items-center gap-2 px-6 py-3 font-extrabold text-sm uppercase transition duration-150 border-b-4 -mb-[4px] ${
                  activeTab === "create"
                    ? "border-white text-white"
                    : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                <PlusCircle size={16} />
                Đăng ký thành lập đội
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("browse")}
                className={`flex items-center gap-2 px-6 py-3 font-extrabold text-sm uppercase transition duration-150 border-b-4 -mb-[4px] ${
                  activeTab === "browse"
                    ? "border-white text-white"
                    : "border-transparent text-white/60 hover:text-white"
                }`}
              >
                <Users size={16} />
                Tìm kiếm đội bóng
              </button>
            </div>

            {/* Tabs Content */}
            <div>
              {activeTab === "create" ? (
                <CreateTeamForm isInline={true} onSuccess={handleCreateSuccess} />
              ) : (
                <div className="space-y-6">
                  {/* Search Bar for Teams */}
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm border-2 border-black/60 max-w-md">
                    <Search size={16} className="text-gray-400 shrink-0" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm kiếm đội bóng theo tên..."
                      className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
                    />
                  </div>

                  {filteredTeams.length === 0 ? (
                    <div className="rounded-2xl border-2 border-black/60 bg-white p-8 text-center text-gray-500 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                      <p className="font-semibold italic">
                        {searchTerm ? "Không tìm thấy đội bóng nào khớp với từ khóa." : "Hiện chưa có đội bóng nào được phê duyệt hoạt động."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredTeams.map((team) => (
                        <TeamListCard key={team.id} team={team} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
