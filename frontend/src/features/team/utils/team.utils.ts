import type { TeamStatus } from "../types/team.types";

export const clampReputation = (value: number): number =>
  Math.min(100, Math.max(0, value));

export const getStatusMeta = (
  status: TeamStatus,
): { label: string; className: string } => {
  if (status === "APPROVED") {
    return {
      label: "Đã duyệt",
      className: "border border-lime-100/85 bg-lime-300/45 text-[#123915]",
    };
  }

  if (status === "PENDING") {
    return {
      label: "Chờ duyệt",
      className: "border border-amber-100/75 bg-amber-300/30 text-amber-50",
    };
  }

  return {
    label: "Từ chối",
    className: "border border-rose-100/80 bg-rose-400/35 text-rose-50",
  };
};

export const getReputationTone = (reputation: number): string => {
  if (reputation > 80) {
    return "bg-lime-300";
  }

  if (reputation < 20) {
    return "bg-rose-400";
  }

  return "bg-amber-300";
};
