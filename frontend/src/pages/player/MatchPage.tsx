import { Search } from "lucide-react";
import { MatchCard, usePlayerMatchList } from "../../features/matchmaking";
import { PlayerNavBar } from "../../layouts/player/PlayerNavBar";

export function MatchPage() {
  const { matches } = usePlayerMatchList();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#005E2E] to-[#29721D]">
      {/* Header */}
      <PlayerNavBar />
      {/* Search bar */}
      <div className="bg-[#005E2E]/40">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-6 py-4">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              placeholder="Hinted search text"
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={() => {
              /* TODO */
            }}
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Khu vực
          </button>
          <button
            onClick={() => {
              /* TODO */
            }}
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Trình độ
          </button>
          <button
            onClick={() => {
              /* TODO */
            }}
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Ngày đặt sân
          </button>
        </div>
      </div>

      {/* Match grid */}
      <main className="mx-auto max-w-[1280px] px-6 py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} data={match} />
          ))}
        </div>
      </main>
    </div>
  );
}
