import type { Team, TeamMember, TeamMemberStatus } from "../../types/team.types"; // Giữ nguyên type-only import chuẩn xác
import type { MatchSkillLevel } from "../../../matchmaking/types/matchmaking.types";
import { ShieldAlert, CheckCircle2, Users, User, Clock, Award, Mail, PlusCircle, Check, UserMinus, LogOut, Crown, Trophy } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import React, { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { inviteMember, approveMember, kickMember, leaveTeam, updateTeam } from "../../api/teamApi";

interface MyTeamDetailsProps {
  team: Team;
  currentUserEmail?: string | null; // Email người dùng hiện tại để check quyền Captain
  onRefresh: () => void; // Hàm re-fetch dữ liệu sau khi thực hiện thao tác
}

export function MyTeamDetails({ team, currentUserEmail, onRefresh }: MyTeamDetailsProps) {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(team.name);
  const [editDescription, setEditDescription] = useState(team.description || "");
  const [editSkillLevel, setEditSkillLevel] = useState<MatchSkillLevel>(team.skillLevel || "AVERAGE");
  const [updatingDetails, setUpdatingDetails] = useState(false);

  useEffect(() => {
    setEditName(team.name);
    setEditDescription(team.description || "");
    setEditSkillLevel(team.skillLevel || "AVERAGE");
  }, [team]);

  const getSkillLevelLabel = (level: string) => {
    switch (level) {
      case "WEAK":
        return "Yếu";
      case "BELOW_AVERAGE":
        return "Trung bình yếu";
      case "AVERAGE":
        return "Trung bình";
      case "ABOVE_AVERAGE":
        return "Trung bình khá";
      case "GOOD":
        return "Cao";
      case "SEMI_PRO":
        return "Bán chuyên";
      default:
        return level;
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showAlert("Tên đội bóng không được để trống.", "error");
      return;
    }

    setUpdatingDetails(true);
    try {
      await updateTeam(team.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        skillLevel: editSkillLevel,
      });
      showAlert("Cập nhật thông tin đội bóng thành công!", "success");
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      showAlert(getActionErrorMessage(err, "Cập nhật thông tin thất bại"), "error");
    } finally {
      setUpdatingDetails(false);
    }
  };

  const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() ?? "";
  const members: TeamMember[] =
    team.members && team.members.length > 0
      ? team.members
      : team.memberEmails.map((email, index) => ({
          email,
          status: (index === 0 ? "ACTIVE" : "INVITED") as TeamMemberStatus,
        }));
  const captainEmail = members[0]?.email ?? "";
  const currentEmail = normalizeEmail(currentUserEmail);
  // Email đầu tiên trong danh sách thành viên là đội trưởng.
  const isCaptain = currentEmail.length > 0 && currentEmail === normalizeEmail(captainEmail);
  const isCurrentMember = members.some((member) => normalizeEmail(member.email) === currentEmail);

  let formattedDate = "";
  try {
    formattedDate = format(new Date(team.createdAt), "dd/MM/yyyy", { locale: vi });
  } catch {
    formattedDate = team.createdAt;
  }

  const showAlert = (msg: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccessMessage(msg);
      setErrorMessage("");
    } else {
      setErrorMessage(msg);
      setSuccessMessage("");
    }
    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 4000);
  };

  const getActionErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError(error)) {
      return error.response?.data?.message || fallback;
    }
    return fallback;
  };

  // 1. Thao tác Mời thành viên
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setLoading(true);
    try {
      await inviteMember(team.id, emailInput.trim());
      showAlert("Đã gửi lời mời tham gia thành công!", "success");
      setEmailInput("");
      onRefresh();
    } catch (error) {
      showAlert(getActionErrorMessage(error, "Gửi lời mời thất bại"), "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. Thao tác Duyệt thành viên - ĐÃ KHẮC PHỤC LỖI UNUSED-VARS
  const handleApprove = async (email: string) => {
    try {
      await approveMember(team.id, email);
      showAlert(`Đã duyệt thành viên ${email} vào đội!`, "success");
      onRefresh();
    } catch (error) {
      showAlert(getActionErrorMessage(error, "Phê duyệt thành viên thất bại"), "error");
    }
  };

  // 3. Thao tác Kích thành viên - ĐÃ KHẮC PHỤC LỖI UNUSED-VARS
  const handleKick = async (email: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên ${email} ra khỏi đội?`)) {
      try {
        await kickMember(team.id, email);
        showAlert(`Đã xóa thành viên ${email} ra khỏi đội bóng!`, "success");
        onRefresh();
      } catch (error) {
        showAlert(getActionErrorMessage(error, "Xóa thành viên thất bại"), "error");
      }
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn rời khỏi đội bóng này?")) {
      return;
    }

    setLoading(true);
    try {
      await leaveTeam(team.id);
      showAlert("Bạn đã rời khỏi đội bóng!", "success");
      onRefresh();
    } catch (error) {
      showAlert(getActionErrorMessage(error, "Rời đội thất bại"), "error");
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBanner = () => {
    switch (team.status) {
      case "PENDING":
        return (
          <div className="flex items-start gap-3 rounded-xl border-2 border-amber-600 bg-amber-50 p-4 text-amber-800 shadow-[2px_2px_0px_rgba(217,119,6,1)]">
            <Clock size={20} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <h4 className="font-extrabold text-sm uppercase">Đang chờ phê duyệt</h4>
              <p className="mt-1 text-xs font-semibold text-amber-700">
                Hồ sơ thành lập đội bóng đang được quản trị viên xét duyệt. Các tính năng tạo kèo hoặc nhận kèo sẽ mở khóa ngay sau khi đội bóng được duyệt.
              </p>
            </div>
          </div>
        );
      case "BANNED":
        return (
          <div className="flex items-start gap-3 rounded-xl border-2 border-rose-600 bg-rose-50 p-4 text-rose-800 shadow-[2px_2px_0px_rgba(225,29,72,1)]">
            <ShieldAlert size={20} className="mt-0.5 shrink-0 text-rose-600" />
            <div>
              <h4 className="font-extrabold text-sm uppercase">Đội bóng đang bị cấm (BANNED)</h4>
              <p className="mt-1 text-xs font-semibold text-rose-700">
                Đội bóng của bạn tạm thời bị khóa hoạt động do vi phạm quy định hoặc nhận quá nhiều phản hồi tiêu cực. 
                {team.bannedUntil && (
                  <span className="block mt-1 font-bold">
                    Thời hạn cấm đến: {format(new Date(team.bannedUntil), "dd/MM/yyyy")}
                  </span>
                )}
              </p>
            </div>
          </div>
        );
      case "REJECTED":
        return (
          <div className="flex items-start gap-3 rounded-xl border-2 border-red-600 bg-red-50 p-4 text-red-800 shadow-[2px_2px_0px_rgba(220,38,38,1)]">
            <ShieldAlert size={20} className="mt-0.5 shrink-0 text-red-600" />
            <div>
              <h4 className="font-extrabold text-sm uppercase">Đăng ký bị từ chối</h4>
              <p className="mt-1 text-xs font-semibold text-red-700">
                Hồ sơ đăng ký tạo đội bóng của bạn đã bị từ chối bởi Admin. Vui lòng liên hệ ban quản trị để biết thêm chi tiết.
              </p>
            </div>
          </div>
        );
      case "APPROVED":
      default:
        return (
          <div className="flex items-start gap-3 rounded-xl border-2 border-[#005E2E] bg-emerald-50 p-4 text-[#0B582A] shadow-[2px_2px_0px_rgba(0,94,46,1)]">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[#005E2E]" />
            <div>
              <h4 className="font-extrabold text-sm uppercase">Đội bóng đang hoạt động</h4>
              <p className="mt-1 text-xs font-semibold text-emerald-800">
                Đội bóng của bạn đã được phê duyệt thành công. Bạn hiện có thể tham gia cáp kèo, thi đấu giao hữu trên hệ thống.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Trạng thái */}
      {renderStatusBanner()}

      {/* Card Thông tin Chi tiết Đội bóng */}
      <div className="rounded-2xl border-2 border-black/60 bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.15)] text-gray-800">
        <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#0B582A] tracking-tight">{team.name}</h2>
            <p className="mt-2 text-sm font-semibold text-gray-500">
              {team.description || "Chưa có giới thiệu cho đội bóng này."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isCaptain && (
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-black/60 bg-white px-4 py-2 text-sm font-extrabold text-gray-800 transition hover:bg-gray-50"
              >
                {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
              </button>
            )}

            {!isCaptain && isCurrentMember && (
              <button
                type="button"
                onClick={handleLeaveTeam}
                disabled={loading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-rose-200 bg-rose-50 px-4 py-2 text-sm font-extrabold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
              >
                <LogOut size={16} className="stroke-[3]" />
                Rời đội
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveDetails} className="mt-6 space-y-4 border-b border-gray-200 pb-6">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                Tên đội bóng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-xl border-2 border-black/40 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#005E2E] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                Trình độ đội bóng
              </label>
              <select
                value={editSkillLevel}
                onChange={(e) => setEditSkillLevel(e.target.value as MatchSkillLevel)}
                className="w-full rounded-xl border-2 border-black/40 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#005E2E] focus:outline-none cursor-pointer"
              >
                <option value="WEAK">Yếu</option>
                <option value="BELOW_AVERAGE">Trung bình yếu</option>
                <option value="AVERAGE">Trung bình</option>
                <option value="ABOVE_AVERAGE">Trung bình khá</option>
                <option value="GOOD">Cao</option>
                <option value="SEMI_PRO">Bán chuyên</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                Thông tin / Tiểu sử đội bóng
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full rounded-xl border-2 border-black/40 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#005E2E] focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full border-2 border-black/60 bg-white px-5 py-2 text-sm font-bold text-gray-800 transition hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={updatingDetails}
                className="rounded-full bg-[#005E2E] hover:bg-[#004d26] px-6 py-2.5 text-sm font-extrabold uppercase text-white shadow-[0_4px_12px_rgba(0,94,46,0.25)] transition duration-200 disabled:opacity-50"
              >
                {updatingDetails ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        ) : (
          /* Thông tin chung */
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <Award size={24} className="text-[#F8B416]" />
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase">Điểm uy tín</span>
                <span className="text-lg font-extrabold text-gray-800">{team.reputationScore} điểm</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <User size={24} className="text-[#005E2E]" />
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase">Đội trưởng</span>
                <span className="text-lg font-extrabold text-gray-800">{team.captainName}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <Clock size={24} className="text-[#005E2E]" />
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase">Ngày thành lập</span>
                <span className="text-lg font-extrabold text-gray-800">{formattedDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <Trophy size={24} className="text-[#005E2E]" />
              <div>
                <span className="block text-xs font-bold text-gray-500 uppercase">Trình độ</span>
                <span className="text-lg font-extrabold text-gray-800">
                  {getSkillLevelLabel(team.skillLevel || "AVERAGE")}
                </span>
              </div>
            </div>
          </div>
        )}

        {(successMessage || errorMessage) && (
          <div className="mt-6 space-y-2">
            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">
                {errorMessage}
              </div>
            )}
          </div>
        )}

        {/* FORM MỜI THÀNH VIÊN (CHỈ DÀNH CHO ĐỘI TRƯỞNG) */}
        {isCaptain && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <PlusCircle size={20} className="text-[#005E2E]" />
              <h3 className="text-base font-extrabold text-gray-800 uppercase tracking-wider">
                Mời thành viên mới
              </h3>
            </div>

            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Nhập chính xác địa chỉ email người chơi..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 px-4 py-2.5 border-2 border-black/40 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#005E2E] transition"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#005E2E] text-white text-sm font-black uppercase tracking-wider rounded-xl border-2 border-black/80 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#0b4d29] disabled:opacity-50 transition active:translate-y-0.5 active:shadow-none"
              >
                {loading ? "Đang gửi..." : "Gửi lời mời"}
              </button>
            </form>
          </div>
        )}

        {/* Danh sách thành viên */}
        <div className="mt-8">
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-4">
            <Users size={20} className="text-[#005E2E]" />
            <h3 className="text-base font-extrabold text-gray-800 uppercase tracking-wider">
              Thành viên đội bóng ({members.length})
            </h3>
          </div>

          {members.length === 0 ? (
            <p className="text-sm font-semibold text-gray-500 italic">Đội bóng chưa mời thành viên nào.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {members.map((member, idx) => {
                const email = member.email;
                const isCaptainEmail = normalizeEmail(email) === normalizeEmail(captainEmail);
                const isPending = member.status === "INVITED" || member.status === "REQUESTED";

                return (
                  <div
                    key={email}
                    className="flex items-center justify-between border border-gray-200 rounded-xl p-3 bg-white hover:bg-gray-50 transition shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-[#005E2E] font-black text-xs">
                        {idx + 1}
                      </div>
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <Mail size={14} className="text-gray-400 shrink-0" />
                        <span className="text-sm font-semibold text-gray-700 truncate">{email}</span>
                        {isCaptainEmail && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-extrabold text-amber-700 border border-amber-200">
                            <Crown size={12} className="stroke-[3]" />
                            Đội trưởng
                          </span>
                        )}
                        {!isCaptainEmail && member.status === "INVITED" && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-extrabold text-blue-600 border border-blue-200">
                            Đã mời
                          </span>
                        )}
                        {!isCaptainEmail && member.status === "REQUESTED" && (
                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-extrabold text-amber-700 border border-amber-200">
                            Xin gia nhập
                          </span>
                        )}
                      </div>
                    </div>

                    {isCaptain && !isCaptainEmail && (
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isPending && (
                          <button
                            title="Phê duyệt thành viên"
                            onClick={() => handleApprove(email)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#005E2E] rounded-lg border border-emerald-200 transition"
                          >
                            <Check size={14} className="stroke-[3]" />
                          </button>
                        )}
                        <button
                          title="Kích khỏi đội"
                          onClick={() => handleKick(email)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition"
                        >
                          <UserMinus size={14} className="stroke-[3]" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
