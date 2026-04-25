import type { MatchmakingPost } from "../types/matchmaking.types";

export const hoursFromNow = (hours: number): string =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

export const mockMatchmaking: MatchmakingPost[] = [
  {
    id: "mk-001",
    teamName: "FC Đền Lừ Lightning",
    level: "Khá",
    fieldAndShift: "Sân 1 - Ca 1 (17:30 - 19:00)",
    matchType: "Kèo đồng trình",
    status: "Đang tìm",
    matchDate: hoursFromNow(6),
  },
  {
    id: "mk-002",
    teamName: "Đầm Hồng Brothers",
    level: "Trung bình",
    fieldAndShift: "Sân 2 - Ca 2 (19:00 - 20:30)",
    matchType: "Đấu giao hữu",
    status: "Đã chốt",
    matchDate: hoursFromNow(26),
  },
  {
    id: "mk-003",
    teamName: "Đại Từ Warriors",
    level: "Phong trào",
    fieldAndShift: "Sân 3 - Ca 3 (20:30 - 22:00)",
    matchType: "Đá tập",
    status: "Đang tìm",
    matchDate: hoursFromNow(2),
  },
  {
    id: "mk-004",
    teamName: "MIXI Young Stars",
    level: "Bán chuyên",
    fieldAndShift: "Sân 1 - Ca 2 (18:00 - 19:30)",
    matchType: "Kèo phủi",
    status: "Hết hạn",
    matchDate: hoursFromNow(-1),
  },
  {
    id: "mk-005",
    teamName: "Hà Đông Ballers",
    level: "Khá",
    fieldAndShift: "Sân 2 - Ca 1 (16:00 - 17:30)",
    matchType: "Đấu giao hữu",
    status: "Bị hủy",
    matchDate: hoursFromNow(14),
  },
  {
    id: "mk-006",
    teamName: "Tây Hồ Falcons",
    level: "Trung bình",
    fieldAndShift: "Sân 4 - Ca 1 (17:30 - 19:00)",
    matchType: "Kèo đồng trình",
    status: "Đang tìm",
    matchDate: hoursFromNow(10),
  },
];
