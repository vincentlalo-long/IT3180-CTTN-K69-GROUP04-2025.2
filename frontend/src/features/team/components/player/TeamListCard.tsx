import type { Team } from "../../types/team.types";
import { User, Award, Users } from "lucide-react";

interface TeamListCardProps {
  team: Team;
}

export function TeamListCard({ team }: TeamListCardProps) {
  const handleJoinRequest = () => {
    alert("Tính năng gửi yêu cầu gia nhập đội bóng đang được phát triển.");
  };

  return (
    <div className="group overflow-hidden rounded-2xl border-2 border-black/60 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition duration-300 hover:scale-[1.01] hover:brightness-95 w-full text-left text-gray-800 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 pb-3 mb-3">
          <h4 className="text-base font-extrabold text-[#0B582A] truncate" title={team.name}>
            {team.name}
          </h4>
          <span className="flex items-center gap-1.5 rounded-full bg-[#F8B416]/10 border border-[#F8B416]/30 px-2.5 py-0.5 text-xs font-bold text-amber-700">
            <Award size={12} className="text-[#F8B416]" />
            {team.reputationScore} uy tín
          </span>
        </div>

        {/* Body Description */}
        <p className="text-xs font-semibold text-gray-500 line-clamp-2 h-8 mb-4">
          {team.description || "Chưa có giới thiệu về đội bóng này."}
        </p>

        {/* Info list */}
        <div className="space-y-2 text-xs font-semibold text-gray-600 mb-5">
          <div className="flex items-center gap-2">
            <User size={14} className="text-[#005E2E] shrink-0" />
            <span className="truncate">Đội trưởng: <strong className="text-gray-800">{team.captainName}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#005E2E] shrink-0" />
            <span>Thành viên: <strong className="text-gray-800">{team.memberEmails.length} người</strong></span>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div>
        <button
          type="button"
          onClick={handleJoinRequest}
          className="w-full rounded-full bg-white hover:bg-emerald-50 border-2 border-black/60 py-2 text-center text-xs font-extrabold uppercase text-[#0B582A] transition duration-200 active:scale-[0.98]"
        >
          Xin gia nhập
        </button>
      </div>
    </div>
  );
}
