import { Calendar, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import type { MatchResponse } from "../../types/matchmaking.types";
import { useMatchStore } from "../../model/matchStore";

interface MatchCardProps {
  match: MatchResponse;
  userTeamId?: number | null;
}

export function MatchCard({ match, userTeamId }: MatchCardProps) {
  const joinMatchAction = useMatchStore((state) => state.joinMatchAction);
  const [isJoining, setIsJoining] = useState(false);

  const getSkillLevelLabel = (level: string) => {
    switch (level) {
      case "WEAK":
        return "Phong trào";
      case "AVERAGE":
        return "Trung bình";
      case "GOOD":
        return "Khá / Mạnh";
      default:
        return level;
    }
  };

  const getSkillLevelBadgeColor = (level: string) => {
    switch (level) {
      case "WEAK":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "AVERAGE":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "GOOD":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleJoin = async () => {
    if (!userTeamId) {
      alert("Bạn phải là Đội trưởng của một đội bóng đã được duyệt mới có thể nhận kèo.");
      return;
    }

    if (userTeamId === match.hostTeamId) {
      alert("Bạn không thể tự nhận kèo của chính đội mình.");
      return;
    }

    setIsJoining(true);
    try {
      // Optimistic update: use temporary team name
      await joinMatchAction(match.id, userTeamId, "Đội của bạn");
    } catch (error) {
      console.error(error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errMsg = axiosError.response?.data?.message || "Nhận kèo thất bại. Vui lòng thử lại!";
      alert(errMsg);
    } finally {
      setIsJoining(false);
    }
  };

  const isMatched = match.status === "MATCHED" || match.guestTeamId !== null;
  const isHost = userTeamId === match.hostTeamId;

  // Format date nicely
  let formattedDate = "";
  try {
    formattedDate = format(new Date(match.matchTime), "HH:mm - dd/MM/yyyy", {
      locale: vi,
    });
  } catch {
    formattedDate = match.matchTime;
  }

  return (
    <div className="group overflow-hidden rounded-2xl border-2 border-black/60 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition duration-300 hover:scale-[1.01] hover:brightness-95 w-full text-left">
      {/* Venue Header */}
      <div className="flex items-start justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2 text-[#0B582A]">
          <MapPin size={18} className="text-[#005E2E] shrink-0" />
          <h3 className="text-sm font-extrabold truncate max-w-[180px]" title={match.venueName}>
            {match.venueName}
          </h3>
        </div>
        <span
          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getSkillLevelBadgeColor(
            match.skillLevel,
          )}`}
        >
          {getSkillLevelLabel(match.skillLevel)}
        </span>
      </div>

      {/* Match Details */}
      <div className="my-5 space-y-4">
        {/* Teams Matchup */}
        <div className="flex items-center justify-between rounded-xl bg-[#005E2E]/10 p-3">
          <div className="flex flex-col items-center flex-1 text-center min-w-0">
            <span className="text-xs text-gray-500 font-semibold mb-1">Đội nhà</span>
            <span className="text-sm font-extrabold text-[#0B582A] truncate w-full" title={match.hostTeamName}>
              {match.hostTeamName}
            </span>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="rounded-full bg-[#F8B416] px-2.5 py-1 text-[10px] font-black text-white shadow-sm border-none uppercase tracking-wider">
              VS
            </span>
          </div>

          <div className="flex flex-col items-center flex-1 text-center min-w-0">
            <span className="text-xs text-gray-500 font-semibold mb-1">Đối thủ</span>
            <span
              className={`text-sm font-extrabold truncate w-full ${
                isMatched ? "text-[#0B582A]" : "text-amber-600 italic"
              }`}
              title={match.guestTeamName || "Đang chờ..."}
            >
              {isMatched ? match.guestTeamName : "Chờ đối thủ"}
            </span>
          </div>
        </div>

        {/* Stats & Time */}
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg p-2.5">
            <Calendar size={16} className="text-[#005E2E]" />
            <span className="text-xs truncate font-semibold text-gray-700">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg p-2.5">
            <Users size={16} className="text-[#005E2E]" />
            <span className="text-xs font-semibold text-gray-700">
              {isMatched ? "2 / 2 Đội" : "1 / 2 Đội"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-2">
        {isMatched ? (
          <div className="w-full rounded-full bg-gray-100 py-2.5 text-center text-sm font-semibold text-gray-500 border border-gray-200">
            Kèo đã được nhận (2/2)
          </div>
        ) : isHost ? (
          <div className="w-full rounded-full bg-emerald-50 py-2.5 text-center text-sm font-bold text-emerald-700 border border-emerald-200">
            Kèo do bạn tạo
          </div>
        ) : (
          <button
            type="button"
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full rounded-full bg-[#005E2E] hover:bg-[#004d26] py-2.5 text-center text-sm font-extrabold uppercase text-white shadow-[0_4px_12px_rgba(0,94,46,0.25)] transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isJoining ? "Đang nhận kèo..." : "Nhận kèo ngay (1/2)"}
          </button>
        )}
      </div>
    </div>
  );
}
