import { Check, Eye, X } from "lucide-react";

import type { Team } from "../../types/team.types";
import { getReputationTone, getStatusMeta } from "../../utils/team.utils";

interface TeamListProps {
  teams: Team[];
  onOpenDetails: (teamId: number) => void;
  onApproveTeam?: (teamId: number) => void;
  onRejectTeam?: (teamId: number) => void;
  activeTab: "ALL" | "PENDING";
}

export function TeamList({
  teams,
  onOpenDetails,
  onApproveTeam,
  onRejectTeam,
  activeTab,
}: TeamListProps) {
  return (
    <div className="space-y-3">
      <div className="hidden rounded-xl border border-white/20 bg-[#004f27] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/90 md:grid md:grid-cols-[1.5fr_1.2fr_0.8fr_0.9fr_1fr] md:gap-3">
        <span>Đội bóng</span>
        <span>Đội trưởng</span>
        <span>Điểm uy tín</span>
        <span>Trạng thái</span>
        <span>Thao tác</span>
      </div>

      {teams.map((team, index) => {
        const statusMeta = getStatusMeta(team.status);
        const rowTone = index % 2 === 0 ? "bg-[#0d5a2f]/65" : "bg-[#0a4d29]/65";
        const logoLetter = team.name.charAt(0).toUpperCase();

        return (
          <article
            key={team.id}
            className={`rounded-xl border border-white/10 px-4 py-3 shadow-sm transition hover:border-white/25 hover:bg-[#146f3d]/70 ${rowTone}`}
          >
            <div className="grid gap-3 md:grid-cols-[1.5fr_1.2fr_0.8fr_0.9fr_1fr] md:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-emerald-700 font-bold text-white">
                  {logoLetter}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/65 md:hidden">
                    Đội bóng
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-white">
                    {team.name}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/65 md:hidden">
                  Đội trưởng
                </p>
                <p className="mt-0.5 text-sm font-medium text-white/95">
                  {team.captainName}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/65 md:hidden">
                  Điểm uy tín
                </p>
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

              <div>
                <p className="text-[11px] uppercase tracking-wide text-white/65 md:hidden">
                  Trạng thái
                </p>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.className}`}
                >
                  {statusMeta.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenDetails(team.id)}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <Eye size={14} />
                  Chi tiết
                </button>

                {activeTab === "PENDING" && (
                  <>
                    <button
                      type="button"
                      onClick={() => onApproveTeam?.(team.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-lime-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-lime-700"
                    >
                      <Check size={14} />
                      Duyệt
                    </button>

                    <button
                      type="button"
                      onClick={() => onRejectTeam?.(team.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
                    >
                      <X size={14} />
                      Từ chối
                    </button>
                  </>
                )}
              </div>
            </div>
          </article>
        );
      })}

      {teams.length === 0 ? (
        <div className="rounded-xl border border-white/15 bg-[#0a4d29]/60 px-4 py-8 text-center text-sm text-white/80">
          Chưa có đội bóng nào trong hệ thống.
        </div>
      ) : null}
    </div>
  );
}
