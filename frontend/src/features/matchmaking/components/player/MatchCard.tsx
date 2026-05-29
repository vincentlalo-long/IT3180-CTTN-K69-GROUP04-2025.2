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
        return "bg-teal-500/20 text-teal-300 border-teal-500/30";
      case "AVERAGE":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "GOOD":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#054125]/90 to-[#032e1a]/95 p-5 shadow-[0_12px_24px_rgba(0,0,0,0.4)] transition duration-300 hover:scale-[1.02] hover:border-white/20">
      {/* Venue Header */}
      <div className="flex items-start justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2 text-white">
          <MapPin size={18} className="text-emerald-400 shrink-0" />
          <h3 className="text-base font-bold truncate max-w-[180px]" title={match.venueName}>
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
        <div className="flex items-center justify-between rounded-xl bg-black/20 p-3">
          <div className="flex flex-col items-center flex-1 text-center min-w-0">
            <span className="text-xs text-white/50 mb-1">Đội nhà</span>
            <span className="text-sm font-bold text-white truncate w-full" title={match.hostTeamName}>
              {match.hostTeamName}
            </span>
          </div>

          <div className="flex flex-col items-center px-2">
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              VS
            </span>
          </div>

          <div className="flex flex-col items-center flex-1 text-center min-w-0">
            <span className="text-xs text-white/50 mb-1">Đối thủ</span>
            <span
              className={`text-sm font-bold truncate w-full ${
                isMatched ? "text-white" : "text-amber-400 italic"
              }`}
              title={match.guestTeamName || "Đang chờ..."}
            >
              {isMatched ? match.guestTeamName : "Chờ đối thủ"}
            </span>
          </div>
        </div>

        {/* Stats & Time */}
        <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2.5">
            <Calendar size={16} className="text-emerald-400" />
            <span className="text-xs truncate">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2.5">
            <Users size={16} className="text-emerald-400" />
            <span className="text-xs">
              {isMatched ? "2 / 2 Đội" : "1 / 2 Đội"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-2">
        {isMatched ? (
          <div className="w-full rounded-xl bg-[#0a4d29]/40 py-2.5 text-center text-sm font-semibold text-emerald-400 border border-emerald-500/20">
            Kèo đã được nhận (2/2)
          </div>
        ) : isHost ? (
          <div className="w-full rounded-xl bg-white/5 py-2.5 text-center text-sm font-semibold text-white/60 border border-white/5">
            Kèo do bạn tạo
          </div>
        ) : (
          <button
            type="button"
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-center text-sm font-bold text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition duration-200 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isJoining ? "Đang nhận kèo..." : "Nhận kèo ngay (1/2)"}
          </button>
        )}
      </div>
    </div>
  );
}
