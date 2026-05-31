import { useEffect, useState } from "react";
import { getAdminAllMatches, deleteMatch } from "../../features/matchmaking/api/matchmakingApi";
import type { MatchResponse } from "../../features/matchmaking/types/matchmaking.types";
import { toast } from "../../shared/utils/toast";
import { Trash2, Calendar, MapPin, Users, Award, RefreshCw } from "lucide-react";

export function MatchmakingPage() {
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await getAdminAllMatches();
      setMatches(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách kèo đấu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleRemoveMatch = async (matchId: number) => {
    if (!window.confirm(`Bạn có chắc chắn muốn gỡ kèo đấu ID: ${matchId} khỏi hệ thống?`)) {
      return;
    }

    try {
      await deleteMatch(matchId);
      toast.success(`Đã gỡ kèo đấu #${matchId} thành công!`);
      // Update state locally (Optimistic update / immediate screen update)
      setMatches((current) => current.filter((m) => m.id !== matchId));
    } catch (error) {
      console.error(error);
      toast.error("Gỡ kèo đấu thất bại");
    }
  };

  const getSkillBadge = (level: string) => {
    switch (level) {
      case "WEAK":
        return "bg-amber-500/10 text-amber-300 border border-amber-500/20";
      case "AVERAGE":
        return "bg-sky-500/10 text-sky-300 border border-sky-500/20";
      case "GOOD":
        return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20";
      default:
        return "bg-white/10 text-white border border-white/20";
    }
  };

  const getSkillLabel = (level: string) => {
    switch (level) {
      case "WEAK":
        return "Yếu";
      case "AVERAGE":
        return "Trung bình";
      case "GOOD":
        return "Tốt";
      default:
        return level;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-cyan-500/10 text-cyan-300 border border-cyan-500/25";
      case "MATCHED":
        return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-300 border border-rose-500/25";
      default:
        return "bg-white/10 text-white border border-white/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Đang tìm đối";
      case "MATCHED":
        return "Đã chốt kèo";
      case "CANCELLED":
        return "Đã huỷ";
      default:
        return status;
    }
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/15 bg-[#005E2E]/38 px-5 py-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Quản lý cáp kèo</h2>
          <p className="mt-1 text-sm text-white/80">
            Theo dõi kèo đang mở, kèo đã chốt và xử lý nhanh các tin cáp kèo không hợp lệ.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchMatches}
          disabled={loading}
          className="inline-flex items-center gap-1.5 self-start rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </header>

      <div className="rounded-2xl border border-white/15 bg-[#005E2E]/32 p-4 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.55)] sm:p-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/70">
            <RefreshCw size={24} className="animate-spin text-emerald-400" />
            <p className="mt-3 text-sm">Đang tải danh sách kèo đấu...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#0a4d29]/50 py-12 text-center text-white/70">
            Không tìm thấy kèo đấu nào trên hệ thống.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#0d5a2f]/60 text-white font-semibold">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Đội nhà (Host)</th>
                  <th className="px-4 py-3">Đội khách (Guest)</th>
                  <th className="px-4 py-3">Sân bóng</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3 text-center">Trình độ</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/90">
                {matches.map((match) => (
                  <tr
                    key={match.id}
                    className="transition hover:bg-white/5 bg-[#0a4d29]/20"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-white/60">
                      #{match.id}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} className="text-emerald-400" />
                        {match.hostTeamName}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {match.guestTeamName ? (
                        <div className="flex items-center gap-1.5 text-lime-200">
                          <Users size={14} className="text-lime-400" />
                          {match.guestTeamName}
                        </div>
                      ) : (
                        <span className="text-xs italic text-white/40">Chưa có</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-white/80">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-emerald-400/80" />
                        {match.venueName}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-white/80">
                        <Calendar size={14} className="text-emerald-400/80" />
                        {new Date(match.matchTime).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getSkillBadge(match.skillLevel)}`}>
                        <Award size={10} className="mr-1 self-center" />
                        {getSkillLabel(match.skillLevel)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(match.status)}`}>
                        {getStatusLabel(match.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveMatch(match.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600/95 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 active:scale-95"
                      >
                        <Trash2 size={12} />
                        Gỡ kèo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
