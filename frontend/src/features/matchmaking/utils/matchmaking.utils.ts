import type {
  MatchmakingPost,
  MatchmakingStatus,
} from "../types/matchmaking.types";

const THREE_HOURS = 3 * 60 * 60 * 1000;

export const getDisplayStatus = (post: MatchmakingPost): MatchmakingStatus => {
  const timeToMatch = new Date(post.matchDate).getTime() - Date.now();

  if (post.status === "Đang tìm" && timeToMatch < THREE_HOURS) {
    return "Hết hạn";
  }

  return post.status;
};

export const getStatusClass = (status: MatchmakingStatus): string => {
  if (status === "Đang tìm") {
    return "animate-pulse border border-cyan-100/75 bg-cyan-300/40 text-cyan-900";
  }

  if (status === "Đã chốt") {
    return "border border-lime-100/90 bg-lime-300/45 text-[#123915]";
  }

  if (status === "Bị hủy") {
    return "border border-rose-100/80 bg-rose-400/35 text-rose-50";
  }

  return "border border-slate-200/45 bg-white/12 text-slate-100";
};

export const getTimeLeftText = (matchDate: string): string => {
  const diff = new Date(matchDate).getTime() - Date.now();

  if (diff <= 0) {
    return "Đã quá giờ ghép kèo";
  }

  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  if (hours <= 0) {
    return `Hết hạn sau ${minutes}m`;
  }

  return `Hết hạn sau ${hours}h ${minutes}m`;
};
