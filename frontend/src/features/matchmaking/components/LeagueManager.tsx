import { useState, useEffect, useCallback, Fragment } from "react";
import { Plus, Pencil, Trash2, RefreshCw, Trophy, Users, ClipboardList, ChevronUp } from "lucide-react";
import { toast } from "../../../shared/utils/toast";
import {
  getAdminLeagues,
  createLeague,
  updateLeague,
  deleteLeague,
} from "../../matchmaking/api/league.api";
import type { League, LeagueRequest, LeagueFormat, LeagueStatus } from "../../matchmaking/types/league.types";
import { LeagueRegistrationComponent } from "./LeagueRegistration";
import { getFields, type FieldDto } from "@/features/venue/api/venueApi";

interface LeagueManagerProps {
  onSelectLeague?: (league: League) => void;
}

const timeSlotOptions = [
  { id: 1, label: "06:30 - 08:00" },
  { id: 2, label: "08:00 - 09:30" },
  { id: 3, label: "09:30 - 11:00" },
  { id: 4, label: "11:00 - 12:30" },
  { id: 5, label: "12:30 - 14:00" },
  { id: 6, label: "14:00 - 15:30" },
  { id: 7, label: "15:30 - 17:00" },
  { id: 8, label: "17:00 - 18:30" },
  { id: 9, label: "18:30 - 20:00" },
  { id: 10, label: "20:00 - 21:30" },
  { id: 11, label: "21:30 - 23:00" },
];

export function LeagueManager({ onSelectLeague }: LeagueManagerProps) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [venues, setVenues] = useState<FieldDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [expandedLeagueId, setExpandedLeagueId] = useState<number | null>(null);

  const [formData, setFormData] = useState<LeagueRequest>({
    name: "",
    description: "",
    format: "KNOCKOUT",
    numberOfTeams: 8,
    prize: "",
    startDate: "",
    endDate: "",
    venueId: null,
    timeSlotId: null,
    status: "OPENING",
  });

  const fetchLeagues = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminLeagues();
      setLeagues(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách giải đấu");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVenues = useCallback(async () => {
    try {
      const data = await getFields();
      setVenues(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách khu sân");
    }
  }, []);

  useEffect(() => {
    fetchLeagues();
    fetchVenues();
  }, [fetchLeagues, fetchVenues]);

  const handleOpenCreateModal = () => {
    setEditingLeague(null);
    setFormData({
      name: "",
      description: "",
      format: "KNOCKOUT",
      numberOfTeams: 8,
      prize: "",
      startDate: "",
      endDate: "",
      venueId: venues[0]?.id ? Number(venues[0].id) : null,
      timeSlotId: 8,
      status: "OPENING",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (league: League) => {
    setEditingLeague(league);
    setFormData({
      name: league.name,
      description: league.description ?? "",
      format: league.format,
      numberOfTeams: league.numberOfTeams,
      prize: league.prize,
      startDate: league.startDate ?? "",
      endDate: league.endDate ?? "",
      venueId: league.venueId ?? null,
      timeSlotId: league.timeSlotId ?? null,
      status: league.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa giải đấu này?")) return;
    try {
      await deleteLeague(id);
      toast.success("Xóa giải đấu thành công");
      fetchLeagues();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xóa giải đấu");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: LeagueRequest = {
        ...formData,
        description: formData.description?.trim() || null,
        prize: formData.prize?.trim() || "",
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        venueId: formData.venueId ?? null,
        timeSlotId: formData.timeSlotId ?? null,
      };

      if (editingLeague) {
        await updateLeague(editingLeague.id, payload);
        toast.success("Cập nhật giải đấu thành công");
      } else {
        await createLeague(payload);
        toast.success("Tạo giải đấu thành công");
      }
      setIsModalOpen(false);
      fetchLeagues();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi lưu giải đấu");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPENING":
        return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/25";
      case "IN_PROGRESS":
        return "bg-amber-500/10 text-amber-300 border border-amber-500/25";
      case "FINISHED":
        return "bg-gray-500/10 text-gray-300 border border-gray-500/25";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-300 border border-rose-500/25";
      default:
        return "bg-white/10 text-white border border-white/20";
    }
  };

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPENING":
        return "Đang mở đăng ký";
      case "IN_PROGRESS":
        return "Đang diễn ra";
      case "FINISHED":
        return "Đã kết thúc";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={fetchLeagues}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#005E2E]/60 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#005E2E]/80 border border-white/10"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
        >
          <Plus size={16} />
          Tạo giải đấu
        </button>
      </div>

      <div className="rounded-2xl border border-white/15 bg-[#005E2E]/32 p-4 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.55)] sm:p-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/70">
            <RefreshCw size={24} className="animate-spin text-emerald-400" />
            <p className="mt-3 text-sm">Đang tải danh sách giải đấu...</p>
          </div>
        ) : leagues.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#0a4d29]/50 py-12 text-center text-white/70">
            Chưa có giải đấu nào được tạo.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#0d5a2f]/60 text-white font-semibold">
                  <th className="px-4 py-3">Tên giải đấu</th>
                  <th className="px-4 py-3">Thể thức</th>
                  <th className="px-4 py-3 text-center">Số đội</th>
                  <th className="px-4 py-3">Giải thưởng</th>
                  <th className="px-4 py-3">Khu sân</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/90">
                {leagues.map((league) => (
                  <Fragment key={league.id}>
                    <tr
                      className="transition hover:bg-white/5 bg-[#0a4d29]/20"
                    >
                      <td className="px-4 py-3.5 font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <Trophy size={14} className="text-amber-400" />
                          {league.name}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-white/80">
                        {getFormatLabel(league.format)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-white/80">
                          <Users size={14} className="text-emerald-400/80" />
                          {league.numberOfTeams}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-white/80 max-w-[200px] truncate">
                        {league.prize || "-"}
                      </td>
                      <td className="px-4 py-3.5 text-white/80 max-w-[180px] truncate">
                        {league.venueName || "-"}
                      </td>
                      <td className="px-4 py-3.5 text-white/80">
                        <div className="flex flex-col">
                          <span>{league.startDate || "-"}</span>
                          <span className="text-xs text-white/50">
                            {league.timeSlotLabel || "Chưa chọn ca"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(
                            league.status
                          )}`}
                        >
                          {getStatusLabel(league.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        {onSelectLeague && (
                          <button
                            onClick={() => onSelectLeague(league)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/90 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                          >
                            <Trophy size={12} />
                            Lịch & Bảng đấu
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedLeagueId(expandedLeagueId === league.id ? null : league.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/90 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                        >
                          {expandedLeagueId === league.id ? <ChevronUp size={12} /> : <ClipboardList size={12} />}
                          {expandedLeagueId === league.id ? "Đóng" : "Đăng ký"}
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(league)}
                          className="inline-flex items-center gap-1 rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-white/20"
                        >
                          <Pencil size={12} />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(league.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-600/95 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
                        >
                          <Trash2 size={12} />
                          Xóa
                        </button>
                      </td>
                    </tr>
                    {expandedLeagueId === league.id && (
                      <tr>
                        <td colSpan={8} className="px-4 py-2 bg-black/10">
                          <LeagueRegistrationComponent 
                            leagueId={league.id} 
                            isManager={true} 
                            leagueStatus={league.status}
                            onStatusChange={() => fetchLeagues()}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#005E2E] shadow-2xl">
            <div className="border-b border-white/10 px-6 py-4">
              <h3 className="text-lg font-semibold text-white">
                {editingLeague ? "Cập nhật giải đấu" : "Tạo giải đấu mới"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Tên giải đấu <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Nhập tên giải đấu..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Mô tả</label>
                <textarea
                  value={formData.description ?? ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Thông tin thể lệ, địa điểm hoặc ghi chú cho đội tham gia..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Thể thức <span className="text-rose-400">*</span></label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value as LeagueFormat })}
                    className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="KNOCKOUT" className="text-black">Đấu loại trực tiếp</option>
                    <option value="ROUND_ROBIN" className="text-black">Đấu vòng tròn</option>
                    <option value="GROUP_STAGE" className="text-black">Chia bảng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Số đội <span className="text-rose-400">*</span></label>
                  <input
                    type="number"
                    min="2"
                    required
                    value={formData.numberOfTeams}
                    onChange={(e) => setFormData({ ...formData, numberOfTeams: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Giải thưởng</label>
                <input
                  type="text"
                  value={formData.prize}
                  onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                  className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="VD: Cúp + 5.000.000 VNĐ"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={formData.startDate ?? ""}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={formData.endDate ?? ""}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Khu sân</label>
                  <select
                    value={formData.venueId ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        venueId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="" className="text-black">Chưa chọn khu sân</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id} className="text-black">
                        {venue.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1">Ca thi đấu</label>
                  <select
                    value={formData.timeSlotId ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeSlotId: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="" className="text-black">Chưa chọn ca</option>
                    {timeSlotOptions.map((slot) => (
                      <option key={slot.id} value={slot.id} className="text-black">
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Trạng thái <span className="text-rose-400">*</span></label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as LeagueStatus })}
                  className="w-full rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="OPENING" className="text-black">Đang mở đăng ký</option>
                  <option value="IN_PROGRESS" className="text-black">Đang diễn ra</option>
                  <option value="FINISHED" className="text-black">Đã kết thúc</option>
                  <option value="CANCELLED" className="text-black">Đã hủy</option>
                </select>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition"
                >
                  {editingLeague ? "Lưu thay đổi" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
