import type { Team } from "../../types/team.types"; // Giữ nguyên type-only import chuẩn xác
import { ShieldAlert, CheckCircle2, Users, User, Clock, Award, Mail, PlusCircle, Check, UserMinus } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import React, { useState } from "react";
import { isAxiosError } from "axios";
import { inviteMember, approveMember, kickMember } from "../../api/teamApi";

interface MyTeamDetailsProps {
  team: Team;
  currentUserId: number; // ID người dùng hiện tại để check quyền Captain
  onRefresh: () => void; // Hàm re-fetch dữ liệu sau khi thực hiện thao tác
}

export function MyTeamDetails({ team, currentUserId, onRefresh }: MyTeamDetailsProps) {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Kiểm tra xem user đang xem trang này có phải là Đội trưởng không
  const isCaptain = team.captainId === currentUserId;

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
      if (isAxiosError(error)) {
        showAlert(error.response?.data?.message || "Gửi lời mời thất bại", "error");
      }
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
    } catch {
      showAlert("Phê duyệt thành viên thất bại", "error");
    }
  };

  // 3. Thao tác Kích thành viên - ĐÃ KHẮC PHỤC LỖI UNUSED-VARS
  const handleKick = async (email: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên ${email} ra khỏi đội?`)) {
      try {
        await kickMember(team.id, email);
        showAlert(`Đã xóa thành viên ${email} ra khỏi đội bóng!`, "success");
        onRefresh();
      } catch {
        showAlert("Xóa thành viên thất bại", "error");
      }
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
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-black text-[#0B582A] tracking-tight">{team.name}</h2>
          <p className="mt-2 text-sm font-semibold text-gray-500">
            {team.description || "Chưa có giới thiệu cho đội bóng này."}
          </p>
        </div>

        {/* Informational Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>

        {/* FORM MỜI THÀNH VIÊN (CHỈ DÀNH CHO ĐỘI TRƯỞNG) */}
        {isCaptain && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <PlusCircle size={20} className="text-[#005E2E]" />
              <h3 className="text-base font-extrabold text-gray-800 uppercase tracking-wider">
                Mời thành viên mới
              </h3>
            </div>

            {/* Thông báo kết quả thao tác nhanh */}
            {successMessage && <div className="p-3 mb-4 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">{successMessage}</div>}
            {errorMessage && <div className="p-3 mb-4 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">{errorMessage}</div>}

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
              Thành viên đội bóng ({team.memberEmails.length})
            </h3>
          </div>

          {team.memberEmails.length === 0 ? (
            <p className="text-sm font-semibold text-gray-500 italic">Đội bóng chưa mời thành viên nào.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {team.memberEmails.map((email, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border border-gray-200 rounded-xl p-3 bg-white hover:bg-gray-50 transition shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-[#005E2E] font-black text-xs">
                      {idx + 1}
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail size={14} className="text-gray-400 shrink-0" />
                      <span className="text-sm font-semibold text-gray-700 truncate">{email}</span>
                    </div>
                  </div>

                  {/* NÚT THAO TÁC QUẢN TRỊ (CHỈ ĐỘI TRƯỞNG MỚI NHÌN THẤY) */}
                  {isCaptain && (
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        title="Phê duyệt thành viên"
                        onClick={() => handleApprove(email)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#005E2E] rounded-lg border border-emerald-200 transition"
                      >
                        <Check size={14} className="stroke-[3]" />
                      </button>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
