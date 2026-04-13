import { Ban, Eye, Phone, Plus, Shield, Users, X } from "lucide-react";
import { useMemo, useState } from "react";

type TeamStatus = "Active" | "Warning" | "Banned";
type MatchResult = "Thắng" | "Thua" | "Hủy kèo";

interface RecentMatch {
  opponent: string;
  result: MatchResult;
  score: string;
  playedAt: string;
}

interface Team {
  id: string;
  logoUrl: string;
  teamName: string;
  captainName: string;
  phone: string;
  reputation: number;
  status: TeamStatus;
  joinedAt: string;
  members: string[];
  recentMatches: RecentMatch[];
}

const mockTeams: Team[] = [
  {
    id: "tm-001",
    logoUrl:
      "https://ui-avatars.com/api/?name=MIXI+Thunder&background=0f5d30&color=ffffff&bold=true",
    teamName: "MIXI Thunder",
    captainName: "Khải Nguyễn",
    phone: "0987 654 321",
    reputation: 92,
    status: "Active",
    joinedAt: "2025-11-03T09:15:00",
    members: [
      "Khải Nguyễn",
      "Tuấn Anh",
      "Huy Trần",
      "Dũng Phạm",
      "Minh Hoàng",
      "Long Vũ",
      "Sơn Lê",
    ],
    recentMatches: [
      {
        opponent: "Đền Lừ Brothers",
        result: "Thắng",
        score: "4-2",
        playedAt: "2026-04-10T18:30:00",
      },
      {
        opponent: "Hà Đông Ballers",
        result: "Thua",
        score: "1-3",
        playedAt: "2026-04-08T19:00:00",
      },
      {
        opponent: "Đầm Hồng FC",
        result: "Thắng",
        score: "2-1",
        playedAt: "2026-04-04T17:30:00",
      },
    ],
  },
  {
    id: "tm-002",
    logoUrl:
      "https://ui-avatars.com/api/?name=Den+Lu+Brothers&background=1d6f3b&color=ffffff&bold=true",
    teamName: "Đền Lừ Brothers",
    captainName: "Linh Trần",
    phone: "0935 114 778",
    reputation: 76,
    status: "Warning",
    joinedAt: "2025-12-12T11:00:00",
    members: [
      "Linh Trần",
      "Nam Nguyễn",
      "Đạt Lương",
      "Bảo Trần",
      "Hiếu Đặng",
      "Nghĩa Bùi",
    ],
    recentMatches: [
      {
        opponent: "MIXI Thunder",
        result: "Thua",
        score: "2-4",
        playedAt: "2026-04-10T18:30:00",
      },
      {
        opponent: "Đại Từ United",
        result: "Hủy kèo",
        score: "-",
        playedAt: "2026-04-07T20:00:00",
      },
      {
        opponent: "Khương Đình Wolves",
        result: "Thắng",
        score: "3-2",
        playedAt: "2026-04-05T17:00:00",
      },
    ],
  },
  {
    id: "tm-003",
    logoUrl:
      "https://ui-avatars.com/api/?name=Dam+Hong+FC&background=0a4d29&color=ffffff&bold=true",
    teamName: "Đầm Hồng FC",
    captainName: "Hải Đăng",
    phone: "0966 418 226",
    reputation: 58,
    status: "Warning",
    joinedAt: "2026-01-08T10:20:00",
    members: [
      "Hải Đăng",
      "Quốc Việt",
      "Sang Trần",
      "Khôi Nguyễn",
      "Đức Anh",
      "Tiến Mạnh",
    ],
    recentMatches: [
      {
        opponent: "Hoàng Mai Rangers",
        result: "Hủy kèo",
        score: "-",
        playedAt: "2026-04-09T20:00:00",
      },
      {
        opponent: "MIXI Thunder",
        result: "Thua",
        score: "1-2",
        playedAt: "2026-04-06T17:30:00",
      },
      {
        opponent: "Đại Từ United",
        result: "Thắng",
        score: "3-0",
        playedAt: "2026-04-02T18:00:00",
      },
    ],
  },
  {
    id: "tm-004",
    logoUrl:
      "https://ui-avatars.com/api/?name=Dai+Tu+United&background=204830&color=ffffff&bold=true",
    teamName: "Đại Từ United",
    captainName: "Minh Vũ",
    phone: "0908 552 114",
    reputation: 16,
    status: "Banned",
    joinedAt: "2025-10-19T14:40:00",
    members: [
      "Minh Vũ",
      "Duy Khoa",
      "Ngọc Sơn",
      "Bình An",
      "Trọng Nhân",
      "Phúc Huy",
    ],
    recentMatches: [
      {
        opponent: "Đền Lừ Brothers",
        result: "Hủy kèo",
        score: "-",
        playedAt: "2026-04-07T20:00:00",
      },
      {
        opponent: "Đầm Hồng FC",
        result: "Thua",
        score: "0-3",
        playedAt: "2026-04-02T18:00:00",
      },
      {
        opponent: "Khương Đình Wolves",
        result: "Thua",
        score: "1-4",
        playedAt: "2026-03-30T19:00:00",
      },
    ],
  },
  {
    id: "tm-005",
    logoUrl:
      "https://ui-avatars.com/api/?name=Hoang+Mai+Rangers&background=195f35&color=ffffff&bold=true",
    teamName: "Hoàng Mai Rangers",
    captainName: "Phúc Trần",
    phone: "0981 607 945",
    reputation: 84,
    status: "Active",
    joinedAt: "2025-09-27T08:30:00",
    members: [
      "Phúc Trần",
      "Bảo Lâm",
      "Quang Huy",
      "Hải Long",
      "An Khang",
      "Quân Vũ",
      "Nguyên Lộc",
    ],
    recentMatches: [
      {
        opponent: "Đầm Hồng FC",
        result: "Hủy kèo",
        score: "-",
        playedAt: "2026-04-09T20:00:00",
      },
      {
        opponent: "MIXI Thunder",
        result: "Thắng",
        score: "2-1",
        playedAt: "2026-04-03T18:30:00",
      },
      {
        opponent: "Đại Từ United",
        result: "Thắng",
        score: "4-0",
        playedAt: "2026-03-28T17:30:00",
      },
    ],
  },
  {
    id: "tm-006",
    logoUrl:
      "https://ui-avatars.com/api/?name=Khuong+Dinh+Wolves&background=0d5a2f&color=ffffff&bold=true",
    teamName: "Khương Đình Wolves",
    captainName: "Tuấn Lê",
    phone: "0912 223 889",
    reputation: 32,
    status: "Warning",
    joinedAt: "2026-02-11T16:00:00",
    members: [
      "Tuấn Lê",
      "Công Minh",
      "Đức Tài",
      "Bình Dương",
      "Trung Nghĩa",
      "Văn Cường",
    ],
    recentMatches: [
      {
        opponent: "Đền Lừ Brothers",
        result: "Thua",
        score: "2-3",
        playedAt: "2026-04-05T17:00:00",
      },
      {
        opponent: "Đại Từ United",
        result: "Thắng",
        score: "4-1",
        playedAt: "2026-03-30T19:00:00",
      },
      {
        opponent: "MIXI Thunder",
        result: "Thua",
        score: "1-2",
        playedAt: "2026-03-26T20:00:00",
      },
    ],
  },
];

const clampReputation = (value: number): number =>
  Math.min(100, Math.max(0, value));

const getStatusFromReputation = (reputation: number): TeamStatus => {
  if (reputation > 80) {
    return "Active";
  }

  if (reputation < 20) {
    return "Banned";
  }

  return "Warning";
};

const getStatusMeta = (
  status: TeamStatus,
): { label: string; className: string } => {
  if (status === "Active") {
    return {
      label: "Hoạt động",
      className: "border border-lime-100/85 bg-lime-300/45 text-[#123915]",
    };
  }

  if (status === "Warning") {
    return {
      label: "Cảnh báo",
      className: "border border-amber-100/75 bg-amber-300/30 text-amber-50",
    };
  }

  return {
    label: "Bị chặn",
    className: "border border-rose-100/80 bg-rose-400/35 text-rose-50",
  };
};

const getResultMeta = (
  result: MatchResult,
): { className: string; label: MatchResult } => {
  if (result === "Thắng") {
    return { className: "text-lime-100", label: result };
  }

  if (result === "Thua") {
    return { className: "text-amber-100", label: result };
  }

  return { className: "text-rose-100", label: result };
};

const getReputationTone = (reputation: number): string => {
  if (reputation > 80) {
    return "bg-lime-300";
  }

  if (reputation < 20) {
    return "bg-rose-400";
  }

  return "bg-amber-300";
};

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => b.reputation - a.reputation),
    [teams],
  );

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) ?? null,
    [selectedTeamId, teams],
  );

  const handleBanTeam = (teamId: string) => {
    setTeams((currentTeams) =>
      currentTeams.map((team) =>
        team.id === teamId
          ? {
              ...team,
              status: "Banned",
              reputation: Math.min(team.reputation, 19),
            }
          : team,
      ),
    );
  };

  const handleAdjustReputation = (teamId: string, delta: number) => {
    setTeams((currentTeams) =>
      currentTeams.map((team) => {
        if (team.id !== teamId) {
          return team;
        }

        const nextReputation = clampReputation(team.reputation + delta);

        if (team.status === "Banned" && delta > 0) {
          return {
            ...team,
            reputation: nextReputation,
            status: "Banned",
          };
        }

        return {
          ...team,
          reputation: nextReputation,
          status: getStatusFromReputation(nextReputation),
        };
      }),
    );
  };

  const openTeamDetails = (teamId: string) => {
    setSelectedTeamId(teamId);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleModalReputationEdit = () => {
    if (!selectedTeamId) {
      return;
    }

    handleAdjustReputation(selectedTeamId, 5);
  };

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-white/15 bg-[#005E2E]/38 px-5 py-4">
        <h2 className="text-xl font-semibold text-white">Quản lý đội bóng</h2>
        <p className="mt-1 text-sm text-white/80">
          Theo dõi đội trưởng, điểm uy tín và xử lý nhanh các đội có nguy cơ
          bùng kèo.
        </p>
      </header>

      <div className="rounded-2xl border border-white/15 bg-[#005E2E]/32 p-4 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.55)] sm:p-5">
        <div className="space-y-3">
          <div className="hidden rounded-xl border border-white/20 bg-[#004f27] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/90 md:grid md:grid-cols-[1.55fr_1.25fr_0.8fr_0.9fr_1fr] md:gap-3">
            <span>Đội bóng</span>
            <span>Đội trưởng</span>
            <span>Điểm uy tín</span>
            <span>Trạng thái</span>
            <span>Thao tác</span>
          </div>

          {sortedTeams.map((team, index) => {
            const statusMeta = getStatusMeta(team.status);
            const rowTone =
              index % 2 === 0 ? "bg-[#0d5a2f]/65" : "bg-[#0a4d29]/65";

            return (
              <article
                key={team.id}
                className={`rounded-xl border border-white/10 px-4 py-3 shadow-sm transition hover:border-white/25 hover:bg-[#146f3d]/70 ${rowTone}`}
              >
                <div className="grid gap-3 md:grid-cols-[1.55fr_1.25fr_0.8fr_0.9fr_1fr] md:items-center">
                  <div className="flex items-center gap-3">
                    <img
                      src={team.logoUrl}
                      alt={team.teamName}
                      className="h-10 w-10 rounded-full border border-white/25 bg-[#0a4d29]/60 object-cover"
                    />
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-white/65 md:hidden">
                        Đội bóng
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-white">
                        {team.teamName}
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
                    <p className="mt-0.5 text-xs text-white/70">{team.phone}</p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-white/65 md:hidden">
                      Điểm uy tín
                    </p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${getReputationTone(team.reputation)}`}
                        />
                        <p className="text-sm font-semibold text-white">
                          {team.reputation}/100
                        </p>
                      </div>
                      <div className="h-1.5 rounded-full bg-black/25">
                        <div
                          className={`h-full rounded-full transition-all ${getReputationTone(team.reputation)}`}
                          style={{ width: `${team.reputation}%` }}
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
                      onClick={() => openTeamDetails(team.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      <Eye size={14} />
                      Chi tiết
                    </button>

                    <button
                      type="button"
                      onClick={() => handleBanTeam(team.id)}
                      disabled={team.status === "Banned"}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-900/35 disabled:text-rose-100/65"
                    >
                      <Ban size={13} />
                      Cấm
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {sortedTeams.length === 0 ? (
          <div className="rounded-xl border border-white/15 bg-[#0a4d29]/60 px-4 py-8 text-center text-sm text-white/80">
            Chưa có đội bóng nào trong hệ thống.
          </div>
        ) : null}
      </div>

      {isOpen && selectedTeam ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <button
            type="button"
            aria-label="Đóng modal"
            onClick={closeModal}
            className="absolute inset-0 bg-[#03150a]/78 backdrop-blur-[2px]"
          />

          <div className="relative z-10 w-full max-w-5xl rounded-2xl border border-white/20 bg-gradient-to-b from-[#05512a] to-[#033b1e] shadow-[0_28px_70px_-30px_rgba(0,0,0,0.9)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/15 px-6 py-5">
              <div className="flex items-center gap-4">
                <img
                  src={selectedTeam.logoUrl}
                  alt={selectedTeam.teamName}
                  className="h-16 w-16 rounded-xl border border-white/30 bg-[#0a4d29]/70 object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedTeam.teamName}
                  </h3>
                  <p className="mt-1 text-sm text-white/75">
                    Tham gia hệ thống:{" "}
                    {new Date(selectedTeam.joinedAt).toLocaleDateString(
                      "vi-VN",
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
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
                    {selectedTeam.captainName}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-lime-100">
                    <Phone size={14} />
                    {selectedTeam.phone}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/80">
                    <Shield size={14} />
                    Trạng thái đội: {getStatusMeta(selectedTeam.status).label}
                  </p>
                </div>

                <div className="rounded-xl border border-white/15 bg-[#0a4d29]/70 p-4">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/65">
                    <Users size={14} />
                    Danh sách thành viên
                  </p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {selectedTeam.members.map((member) => (
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
                    {selectedTeam.recentMatches.map((match) => {
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
                              {new Date(match.playedAt).toLocaleDateString(
                                "vi-VN",
                              )}
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
                      {[40, 55, 70, selectedTeam.reputation].map(
                        (point, idx) => (
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
                        ),
                      )}
                    </div>
                    <p className="mt-2 text-xs text-white/70">
                      Điểm hiện tại: {selectedTeam.reputation}/100
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-white/15 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleModalReputationEdit}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <Plus size={15} />
                Chỉnh sửa điểm uy tín
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
