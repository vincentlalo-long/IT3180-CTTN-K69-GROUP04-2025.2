import type { MatchResult, TeamStatus } from "../types/team.types";

export const clampReputation = (value: number): number =>
  Math.min(100, Math.max(0, value));

export const getStatusFromReputation = (reputation: number): TeamStatus => {
  if (reputation > 80) {
    return "Active";
  }

  if (reputation < 20) {
    return "Banned";
  }

  return "Warning";
};

export const getStatusMeta = (
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

export const getResultMeta = (
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

export const getReputationTone = (reputation: number): string => {
  if (reputation > 80) {
    return "bg-lime-300";
  }

  if (reputation < 20) {
    return "bg-rose-400";
  }

  return "bg-amber-300";
};
