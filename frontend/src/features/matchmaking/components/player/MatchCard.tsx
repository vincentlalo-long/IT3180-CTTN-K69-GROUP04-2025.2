import type { PlayerMatchItem } from "../../types/matchmaking.types";

interface MatchCardProps {
  data: PlayerMatchItem;
}

export function MatchCard({ data }: MatchCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/20 bg-[#EEF3D6] shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-3 px-4 py-3">
        <img
          src={data.avatar}
          alt="avatar"
          className="h-16 w-16 rounded-full object-cover shadow shrink-0"
        />
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900 leading-tight">
            {data.player}
          </h3>
          <p className="text-sm font-bold text-gray-900 leading-tight">
            {data.field}
          </p>
          <p className="mt-0.5 text-xs text-gray-600">{data.time}</p>
        </div>
      </div>
    </div>
  );
}
