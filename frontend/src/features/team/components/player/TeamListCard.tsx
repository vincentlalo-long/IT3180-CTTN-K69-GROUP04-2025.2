import type { Team } from "../../types/team.types";
import { User, Award, Users, Trophy } from "lucide-react";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { joinTeam } from "../../api/teamApi";
import { toast } from "@/shared/utils/toast";
import { useState } from "react";
import { getApiErrorMessage } from "@/shared/utils/apiError";

interface TeamListCardProps {
  team: Team;
}

export function TeamListCard({ team }: TeamListCardProps) {
  const { user, isAuthenticated } = useAuthContext();
  const [isJoining, setIsJoining] = useState(false);
  const [hasSentRequest, setHasSentRequest] = useState(false);

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

  const currentUserEmail = user?.email?.toLowerCase() || "";
  const isPendingRequest = hasSentRequest || team.members?.some(
    (m) => m.email.toLowerCase() === currentUserEmail && m.status === "REQUESTED"
  );
  const isInvited = team.members?.some(
    (m) => m.email.toLowerCase() === currentUserEmail && m.status === "INVITED"
  );

  let buttonText = "Xin gia nhập";
  let isButtonDisabled = false;

  if (isPendingRequest) {
    buttonText = "Đang chờ duyệt";
    isButtonDisabled = true;
  } else if (isInvited) {
    buttonText = "Đã được mời";
    isButtonDisabled = true;
  }

  const handleJoinRequest = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thực hiện tính năng này!");
      return;
    }

    setIsJoining(true);
    try {
      await joinTeam(team.id);
      toast.success("Gửi yêu cầu gia nhập đội bóng thành công!");
      setHasSentRequest(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Gửi yêu cầu gia nhập thất bại!"));
    } finally {
      setIsJoining(false);
    }
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
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-[#005E2E] shrink-0" />
            <span>Trình độ: <strong className="text-gray-800">{getSkillLevelLabel(team.skillLevel || "AVERAGE")}</strong></span>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div>
        <button
          type="button"
          onClick={handleJoinRequest}
          disabled={isButtonDisabled || isJoining}
          className={`w-full rounded-full py-2 text-center text-xs font-extrabold uppercase border-2 border-black/60 transition duration-200 ${
            isButtonDisabled || isJoining
              ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
              : "bg-white hover:bg-emerald-50 text-[#0B582A] active:scale-[0.98]"
          }`}
        >
          {isJoining ? "Đang gửi..." : buttonText}
        </button>
      </div>
    </div>
  );
}
