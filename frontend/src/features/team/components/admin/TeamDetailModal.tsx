import { Shield, Users, X, Trash2, ArrowUp, ArrowDown, Ban } from "lucide-react";
import type { Team } from "../../types/team.types";
import { getReputationTone, getStatusMeta } from "../../utils/team.utils";

interface TeamDetailModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteTeam?: (teamId: number) => void;
  onAddReputation?: (teamId: number, amount: number) => void;
  onDeductReputation?: (teamId: number, amount: number) => void;
  onBanTeam?: (teamId: number, days: number) => void;
}

export function TeamDetailModal({
  team,
  isOpen,
  onClose,
  onDeleteTeam,
  onAddReputation,
  onDeductReputation,
  onBanTeam,
}: TeamDetailModalProps) {
  if (!isOpen || !team) {
    return null;
  }

  const logoLetter = team.name.charAt(0).toUpperCase();

  const handleBan = () => {
    const input = window.prompt("Nhập số ngày muốn cấm đội (ví dụ: 7):", "7");
    if (input === null) return;
    const days = parseInt(input, 10);
    if (isNaN(days) || days <= 0) {
      alert("Số ngày không hợp lệ!");
      return;
    }
    onBanTeam?.(team.id, days);
  };

  const handleDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA đội bóng "${team.name}"? Tất cả trận đấu liên quan sẽ bị xóa.`)) {
      onDeleteTeam?.(team.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Đóng modal"
        onClick={onClose}
        className="absolute inset-0 bg-[#03150a]/78 backdrop-blur-[2px]"
      />

      <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-white/20 bg-gradient-to-b from-[#05512a] to-[#033b1e] shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/15 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/30 bg-[#0a4d29]/70 font-bold text-white text-2xl">
              {logoLetter}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{team.name}</h3>
              <p className="mt-1 text-sm text-white/75">
                Ngày thành lập:{" "}
                {new Date(team.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/15"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-xl border border-white/15 bg-[#0a4d29]/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/65">
                Thông tin đội trưởng
              </p>
              <p className="mt-2 text-base font-semibold text-white">
                {team.captainName}
              </p>
              <div className="mt-2 space-y-1">
                <p className="inline-flex items-center gap-1.5 text-sm text-white/80">
                  <Shield size={14} />
                  Trạng thái đội:{" "}
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusMeta(team.status).className}`}>
                    {getStatusMeta(team.status).label}
                  </span>
                </p>
                {team.skillLevel && (
                  <p className="flex items-center gap-1.5 text-sm text-white/80">
                    <span className="w-3.5 h-3.5 block bg-amber-400 rounded-full shrink-0" />
                    Trình độ đội:{" "}
                    <span className="font-extrabold text-amber-400">
                      {(() => {
                        switch (team.skillLevel) {
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
                            return team.skillLevel;
                        }
                      })()}
                    </span>
                  </p>
                )}
                {team.status === "BANNED" && team.bannedUntil && (
                  <p className="text-xs text-rose-300 font-medium pl-5">
                    Cấm thi đấu đến: {new Date(team.bannedUntil).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-[#0a4d29]/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/65">
                Mô tả / Tiểu sử đội bóng
              </p>
              <p className="mt-2 text-sm text-white/90 whitespace-pre-line leading-relaxed">
                {team.description || "Chưa có thông tin mô tả."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/15 bg-[#0a4d29]/70 p-4">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/65">
                <Users size={14} />
                Danh sách thành viên ({team.memberEmails.length})
              </p>
              <ul className="mt-3 max-h-48 overflow-y-auto space-y-2 pr-1">
                {team.memberEmails.map((email) => (
                  <li
                    key={email}
                    className="rounded-lg border border-white/10 bg-[#0f5f33]/50 px-3 py-2 text-sm text-white/90 truncate"
                    title={email}
                  >
                    {email}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-white/15 bg-[#0a4d29]/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/65">
                Điểm uy tín
              </p>
              <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${getReputationTone(team.reputationScore)}`}
                    />
                    <p className="text-sm font-semibold text-white">
                      {team.reputationScore}/100
                    </p>
                  </div>
                  <div className="h-1.5 rounded-full bg-black/25">
                    <div
                      className={`h-full rounded-full transition-all ${getReputationTone(team.reputationScore)}`}
                      style={{ width: `${team.reputationScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin actions container in footer */}
        <div className="flex flex-col gap-3 border-t border-white/15 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {onAddReputation && (
              <button
                type="button"
                onClick={() => onAddReputation(team.id, 5)}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
              >
                <ArrowUp size={12} />
                +5 Uy tín
              </button>
            )}

            {onDeductReputation && (
              <button
                type="button"
                onClick={() => onDeductReputation(team.id, 5)}
                className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-700 active:scale-95"
              >
                <ArrowDown size={12} />
                -5 Uy tín
              </button>
            )}

            {onBanTeam && team.status !== "BANNED" && (
              <button
                type="button"
                onClick={handleBan}
                className="inline-flex items-center gap-1 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-700 active:scale-95"
              >
                <Ban size={12} />
                Cấm đội
              </button>
            )}

            {onDeleteTeam && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 active:scale-95"
              >
                <Trash2 size={12} />
                Xoá đội
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="self-end rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15 active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
