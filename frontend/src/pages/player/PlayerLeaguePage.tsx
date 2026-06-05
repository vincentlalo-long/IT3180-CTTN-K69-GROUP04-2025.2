import { useState, useEffect, useCallback } from "react";
import { Trophy, Users, RefreshCw } from "lucide-react";
import { getPublicLeagues } from "../../features/matchmaking/api/league.api";
import type { League } from "../../features/matchmaking/types/league.types";
import { toast } from "../../shared/utils/toast";
import { PlayerNavBar } from "../../layouts/player/PlayerNavBar";

export function PlayerLeaguePage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeagues = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicLeagues();
      // Chỉ lấy giải đấu đang mở hoặc đang diễn ra
      const activeLeagues = data.filter(
        (league) => league.status === "OPENING" || league.status === "IN_PROGRESS"
      );
      setLeagues(activeLeagues);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách giải đấu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeagues();
  }, [fetchLeagues]);

  const getFormatLabel = (format: string) => {
    switch (format) {
      case "KNOCKOUT":
        return "Đấu loại trực tiếp";
      case "ROUND_ROBIN":
        return "Đấu vòng tròn";
      case "GROUP_STAGE":
        return "Chia bảng";
      default:
        return format;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPENING":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25";
      case "IN_PROGRESS":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/25";
      default:
        return "bg-white/10 text-white border border-white/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPENING":
        return "Đang mở đăng ký";
      case "IN_PROGRESS":
        return "Đang diễn ra";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#00170B] flex flex-col font-sans">
      <PlayerNavBar />
      
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Trophy className="text-amber-400" size={32} />
              Hệ thống Giải Đấu
            </h1>
            <p className="text-white/60 max-w-2xl text-sm">
              Tham gia các giải đấu hấp dẫn, tranh tài cùng các đội bóng khác và giành những phần thưởng giá trị.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchLeagues}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 px-4 py-2 text-sm font-semibold transition hover:bg-emerald-600/30 border border-emerald-500/20"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/50">
            <RefreshCw size={32} className="animate-spin text-emerald-500 mb-4" />
            <p>Đang tải dữ liệu giải đấu...</p>
          </div>
        ) : leagues.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-white/60">
            <Trophy size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-lg">Hiện tại không có giải đấu nào đang mở.</p>
            <p className="text-sm mt-1">Vui lòng quay lại sau nhé!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {leagues.map((league) => (
              <div 
                key={league.id} 
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-6 transition hover:border-emerald-500/30 hover:bg-white/15"
              >
                <div className="mb-4 flex items-start justify-between">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(league.status)}`}>
                    {getStatusLabel(league.status)}
                  </span>
                  <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium text-white/80">
                    <Users size={12} className="text-emerald-400" />
                    {league.numberOfTeams} đội
                  </div>
                </div>
                
                <h3 className="mb-3 text-xl font-bold text-white line-clamp-2">
                  {league.name}
                </h3>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-white/70">
                    <span className="w-24 text-white/50">Thể thức:</span>
                    <span className="font-medium text-white">{getFormatLabel(league.format)}</span>
                  </div>
                  <div className="flex items-start text-sm text-white/70">
                    <span className="w-24 text-white/50 shrink-0">Giải thưởng:</span>
                    <span className="font-medium text-amber-400 leading-snug">{league.prize || "Đang cập nhật"}</span>
                  </div>
                </div>

                <button 
                  className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600"
                  disabled={league.status !== "OPENING"}
                >
                  {league.status === "OPENING" ? "Đăng ký tham gia" : "Xem chi tiết"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
