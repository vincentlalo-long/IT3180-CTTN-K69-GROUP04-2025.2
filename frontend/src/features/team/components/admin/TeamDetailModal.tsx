import { Shield, Users, X } from "lucide-react";

import type { Team } from "../../types/team.types";
import { getReputationTone, getStatusMeta } from "../../utils/team.utils";

interface TeamDetailModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamDetailModal({
  team,
  isOpen,
  onClose,
}: TeamDetailModalProps) {
  if (!isOpen || !team) {
    return null;
  }

  const logoLetter = team.name.charAt(0).toUpperCase();

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
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/80">
                <Shield size={14} />
                Trạng thái đội: {getStatusMeta(team.status).label}
              </p>
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

        <div className="flex items-center justify-end gap-2 border-t border-white/15 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
