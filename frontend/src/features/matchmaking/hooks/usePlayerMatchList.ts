import { useState } from "react";

import Hieugay from "../../../assets/images/Hieugay.jpg";
import type { PlayerMatchItem } from "../types/matchmaking.types";

const initialMatches: PlayerMatchItem[] = Array.from(
  { length: 8 },
  (_, index) => ({
    id: `pm-${index + 1}`,
    player: "Đinh Thái Sơn",
    field: "Sân bóng Đền Lừ 3",
    time: "16h30 – 18h00",
    avatar: Hieugay,
  }),
);

export function usePlayerMatchList() {
  const [matches] = useState<PlayerMatchItem[]>(initialMatches);
  const [isLoading] = useState(false);

  return { matches, isLoading };
}
