import { Calendar, MapPin, Users, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

import type { MatchResponse, MatchRequestResponse } from "../../types/matchmaking.types";
import { useMatchStore } from "../../model/matchStore";
import { getMatchRequests, approveMatchRequest } from "../../api/matchmakingApi";
import { TeamDetailModal, getTeamById, type Team } from "../../../team";

interface MatchCardProps {
  match: MatchResponse;
  userTeamId?: number | null;
}

export function MatchCard({ match, userTeamId }: MatchCardProps) {
  const navigate = useNavigate();
  const joinMatchAction = useMatchStore((state) => state.joinMatchAction);
  const fetchMatches = useMatchStore((state) => state.fetchMatches);
  const [isJoining, setIsJoining] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<MatchRequestResponse[]>([]);
  const [myRequest, setMyRequest] = useState<MatchRequestResponse | null>(null);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const handleShowTeamDetails = async (teamId: number) => {
    try {
      const team = await getTeamById(teamId);
      setSelectedTeam(team);
      setIsTeamModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi tải thông tin chi tiết đội bóng:", error);
      alert("Không thể tải thông tin đội bóng lúc này. Vui lòng thử lại!");
    }
  };

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

  const getSkillLevelBadgeColor = (level: string) => {
    switch (level) {
      case "WEAK":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "BELOW_AVERAGE":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "AVERAGE":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "ABOVE_AVERAGE":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "GOOD":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "SEMI_PRO":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPitchTypeLabel = (pt?: number) => {
    if (!pt) return null;
    return `Sân ${pt}`;
  };

  const isHost = userTeamId === match.hostTeamId;
  const isMatched = match.status === "MATCHED" || match.status === "SCHEDULED" || match.guestTeamId !== null;

  // Fetch pending requests for the host captain, or check if guest already sent a request
  useEffect(() => {
    if (userTeamId && match.status === "OPEN") {
      setLoadingRequests(true);
      getMatchRequests(match.id)
        .then((data) => {
          if (isHost) {
            const pending = data.filter(
              (r) => r.status === "PENDING_HOST_CAPTAIN" || r.status === "PENDING_GUEST_CAPTAIN"
            );
            setPendingRequests(pending);
          } else {
            const mine = data.find(
              (r) => r.guestTeamId === userTeamId && (r.status === "PENDING_HOST_CAPTAIN" || r.status === "PENDING_GUEST_CAPTAIN")
            );
            setMyRequest(mine || null);
          }
        })
        .catch((err) => console.error("Lỗi khi tải yêu cầu cáp kèo:", err))
        .finally(() => setLoadingRequests(false));
    }
  }, [isHost, match.id, match.status, userTeamId]);

  const handleJoin = async () => {
    if (userTeamId === match.hostTeamId) {
      alert("Bạn không thể tự nhận kèo của chính đội mình.");
      return;
    }

    setIsJoining(true);
    try {
      await joinMatchAction(match.id);
    } catch (error) {
      console.error(error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errMsg = axiosError.response?.data?.message || "Nhận kèo thất bại. Vui lòng thử lại!";
      alert(errMsg);
    } finally {
      setIsJoining(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn chấp nhận yêu cầu cáp kèo này?")) return;

    setApprovingId(requestId);
    try {
      const response = await approveMatchRequest(requestId);
      alert("Đã chấp nhận kèo thành công! Sân đã được đặt tự động. Vui lòng thanh toán cọc để hoàn tất.");
      
      if (response.bookingId && response.price) {
        navigate("/checkout", {
          state: {
            bookingData: {
              bookingId: response.bookingId,
              totalPrice: response.price,
            }
          }
        });
      } else {
        await fetchMatches();
      }
    } catch (error) {
      console.error(error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errMsg = axiosError.response?.data?.message || "Phê duyệt thất bại. Vui lòng thử lại!";
      alert(errMsg);
    } finally {
      setApprovingId(null);
    }
  };

  // Format date nicely
  let formattedDate = "";
  try {
    formattedDate = format(new Date(match.matchTime), "HH:mm - dd/MM/yyyy", {
      locale: vi,
    });
  } catch {
    formattedDate = match.matchTime;
  }

  const getStatusLabel = () => {
    switch (match.status) {
      case "SCHEDULED":
        return "Đã chốt & Đặt sân";
      case "MATCHED":
        return "Kèo đã được nhận";
      case "CANCELLED":
        return "Kèo đã bị huỷ";
      case "COMPLETED":
        return "Đã hoàn thành";
      default:
        return null;
    }
  };

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
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {match.recommended && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 animate-pulse">
              ★ Phù hợp với bạn
            </span>
          )}
          {match.pitchType && (
            <span className="inline-flex rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
              {getPitchTypeLabel(match.pitchType)}
            </span>
          )}
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getSkillLevelBadgeColor(
              match.skillLevel,
            )}`}
          >
            {getSkillLevelLabel(match.skillLevel)}
          </span>
        </div>
      </div>

      {/* Match Details */}
      <div className="my-5 space-y-4">
        {/* Teams Matchup */}
        <div className="flex items-center justify-between rounded-xl bg-[#005E2E]/10 p-3">
          <div className="flex flex-col items-center flex-1 text-center min-w-0">
            <span className="text-xs text-gray-500 font-semibold mb-1">Đội nhà</span>
            <span
              onClick={() => handleShowTeamDetails(match.hostTeamId)}
              className="text-sm font-extrabold text-[#0B582A] truncate w-full cursor-pointer hover:underline hover:text-emerald-600"
              title={match.hostTeamName}
            >
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
              onClick={() => isMatched && match.guestTeamId && handleShowTeamDetails(match.guestTeamId)}
              className={`text-sm font-extrabold truncate w-full ${
                isMatched
                  ? "text-[#0B582A] cursor-pointer hover:underline hover:text-emerald-600"
                  : "text-amber-600 italic"
              }`}
              title={isMatched ? (match.guestTeamName || undefined) : "Đang chờ..."}
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

      {/* Pending Requests for Host Captain */}
      {isHost && match.status === "OPEN" && pendingRequests.length > 0 && (
        <div className="mb-3 space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Yêu cầu cáp kèo ({pendingRequests.length})
          </p>
          {pendingRequests.map((req) => (
            <div key={req.id} className="flex items-center justify-between gap-2 rounded-lg border border-amber-100 bg-white p-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-800 truncate">{req.guestTeamName}</p>
                <p className="text-xs text-gray-500">
                  {req.status === "PENDING_HOST_CAPTAIN" ? "Chờ bạn duyệt" : "Chờ đội trưởng đội khách"}
                </p>
              </div>
              {req.status === "PENDING_HOST_CAPTAIN" && (
                <button
                  type="button"
                  onClick={() => handleApprove(req.id)}
                  disabled={approvingId === req.id}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                >
                  {approvingId === req.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <CheckCircle size={12} />
                  )}
                  Chấp nhận kèo
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Loading indicator for requests */}
      {isHost && match.status === "OPEN" && loadingRequests && (
        <div className="mb-3 flex items-center justify-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500">
          <Loader2 size={14} className="animate-spin" />
          Đang tải yêu cầu cáp kèo...
        </div>
      )}

      {/* Action Button */}
      <div className="mt-2">
        {match.status === "SCHEDULED" ? (
          <div className="w-full rounded-full bg-sky-50 py-2.5 text-center text-sm font-bold text-sky-700 border border-sky-200">
            {getStatusLabel()} ✓
          </div>
        ) : isMatched ? (
          <div className="w-full rounded-full bg-gray-100 py-2.5 text-center text-sm font-semibold text-gray-500 border border-gray-200">
            Kèo đã được nhận (2/2)
          </div>
        ) : isHost ? (
          <div className="w-full rounded-full bg-emerald-50 py-2.5 text-center text-sm font-bold text-emerald-700 border border-emerald-200">
            Kèo do bạn tạo — đang chờ đối thủ
          </div>
        ) : myRequest ? (
          <div className="w-full rounded-full bg-amber-50 py-2.5 text-center text-sm font-bold text-[#b45309] border border-amber-200">
            Đã xin nhận kèo — Đang chờ duyệt
          </div>
        ) : (
          <button
            type="button"
            onClick={handleJoin}
            disabled={isJoining}
            className="w-full rounded-full bg-[#005E2E] hover:bg-[#004d26] py-2.5 text-center text-sm font-extrabold uppercase text-white shadow-[0_4px_12px_rgba(0,94,46,0.25)] transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isJoining ? "Đang gửi yêu cầu..." : "Xin nhận kèo"}
          </button>
        )}
      </div>

      <TeamDetailModal
        team={selectedTeam}
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />
    </div>
  );
}
