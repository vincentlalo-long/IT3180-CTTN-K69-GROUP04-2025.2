export type MatchmakingStatus = "Đang tìm" | "Đã chốt" | "Hết hạn" | "Bị hủy";

export type MatchmakingLevel =
  | "Phong trào"
  | "Trung bình"
  | "Khá"
  | "Bán chuyên";

export type MatchType =
  | "Đấu giao hữu"
  | "Kèo đồng trình"
  | "Đá tập"
  | "Kèo phủi";

export interface MatchmakingPost {
  id: string;
  teamName: string;
  level: MatchmakingLevel;
  fieldAndShift: string;
  matchType: MatchType;
  status: MatchmakingStatus;
  matchDate: string;
}

export interface PlayerMatchItem {
  id: string;
  player: string;
  field: string;
  time: string;
  avatar: string;
}
