import { Phone, Plus, Shield, Users, X } from "lucide-react";

import type { Team } from "../../types/team.types";
import {
  getReputationTone,
  getResultMeta,
  getStatusMeta,
} from "../../utils/team.utils";

interface TeamDetailModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onEditReputation: () => void;
}

export function TeamDetailModal({
  team,
  isOpen,
  onClose,
  onEditReputation,
}: TeamDetailModalProps) {
  if (!isOpen || !team) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Đóng modal"
        onClick={onClose}
        className="absolute inset-0 bg-[#03150a]/78 backdrop-blur-[2px]"
      />

      <div className="relative z-10 w-full max-w-5xl rounded-2xl border border-white/20 bg-gradient-to-b from-[#05512a] to-[#033b1e] shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)]">
        <div className="flex items-start justify-between gap-4 border-b border-white/15 px-6 py-5">
          <div className="flex items-center gap-4">
            <img
              src={team.logoUrl}
              alt={team.teamName}
              className="h-16 w-16 rounded-xl border border-white/30 bg-[#0a4d29]/70 object-cover"
            />
            <div>
              <h3 className="text-xl font-bold text-white">{team.teamName}</h3>
              <p className="mt-1 text-sm text-white/75">
                Tham gia hệ thống:{" "}
                {new Date(team.joinedAt).toLocaleDateString("vi-VN")}
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

        <div className="grid gap-4 px-6 py-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-xl border border-white/15 bg-[#0a4d29]/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/65">
                Thông tin đội trưởng
              </p>
              <p className="mt-2 text-base font-semibold text-white">
                {team.captainName}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-lime-100">
                <Phone size={14} />
                {team.phone}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/80">
                <Shield size={14} />
                Trạng thái đội: {getStatusMeta(team.status).label}
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-[#0a4d29]/70 p-4">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/65">
                <Users size={14} />
                Danh sách thành viên
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {team.members.map((member) => (
                  <li
                    key={member}
                    className="rounded-lg border border-white/10 bg-[#0f5f33]/50 px-3 py-2 text-sm text-white/90"
                  >
                    {member}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/15 bg-[#0a4d29]/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/65">
                Lịch sử thi đấu gần đây
              </p>

              <div className="mt-3 space-y-2.5">
                {team.recentMatches.map((match) => {
                  const resultMeta = getResultMeta(match.result);

                  return (
                    <div
                      key={`${match.opponent}-${match.playedAt}`}
                      className="rounded-lg border border-white/10 bg-[#0f5f33]/50 px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-white">
                          vs {match.opponent}
                        </p>
                        <span
                          className={`text-xs font-semibold ${resultMeta.className}`}
                        >
                          {resultMeta.label}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-white/70">
                        <span>Tỉ số: {match.score}</span>
                        <span>
                          {new Date(match.playedAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-[#0a4d29]/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/65">
                Biểu đồ điểm uy tín
              </p>
              <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                <div className="flex items-end gap-2">
                  {[40, 55, 70, team.reputation].map((point, idx) => (
                    <div key={`${point}-${idx}`} className="flex-1">
                      <div className="h-24 rounded-md bg-[#07361d] p-1">
                        <div
                          className={`mt-auto h-full rounded-sm ${getReputationTone(point)}`}
                          style={{
                            height: `${Math.max(8, point)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-white/70">
                  Điểm hiện tại: {team.reputation}/100
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/15 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onEditReputation}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus size={15} />
            Chỉnh sửa điểm uy tín
          </button>
        </div>
      </div>
    </div>
  );
}
