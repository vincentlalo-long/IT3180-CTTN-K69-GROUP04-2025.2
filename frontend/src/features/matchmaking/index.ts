export { MatchCard } from "./components/player/MatchCard";
export { CreateMatchModal } from "./components/player/CreateMatchModal";
export { useMatchStore } from "./model/matchStore";
export type { MatchResponse, MatchSkillLevel, MatchStatus } from "./types/matchmaking.types";
export * from "./api/matchmakingApi";

// Legacy exports to prevent Admin matchmaking pages from breaking
export { MatchmakingList } from "./components/admin/MatchmakingList";
export { useMatchmakingManagement } from "./hooks/useMatchmakingManagement";
export { usePlayerMatchList } from "./hooks/usePlayerMatchList";
export type { PlayerMatchItem } from "./types/matchmaking.types";
