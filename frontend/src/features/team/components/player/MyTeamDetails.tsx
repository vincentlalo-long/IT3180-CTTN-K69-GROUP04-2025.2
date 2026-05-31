import type { Team } from "../../types/team.types";
import { ShieldAlert, CheckCircle2, Users, User, Clock, Award, Mail } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface MyTeamDetailsProps {
  team: Team;
}

export function MyTeamDetails({ team }: MyTeamDetailsProps) {
  let formattedDate = "";
  try {
    formattedDate = format(new Date(team.createdAt), "dd/MM/yyyy", { locale: vi });
  } catch {
    formattedDate = team.createdAt;
  }

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

        {/* Thông tin chung */}
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
                  className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 bg-white hover:bg-gray-50 transition"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-[#005E2E] font-black text-xs">
                    {idx + 1}
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail size={14} className="text-gray-400 shrink-0" />
                    <span className="text-sm font-semibold text-gray-700 truncate">{email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
