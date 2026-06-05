import { LeagueManager } from "../../features/matchmaking/components/LeagueManager";

export function LeaguePage() {
  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/15 bg-[#005E2E]/38 px-5 py-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Quản lý Giải đấu</h2>
          <p className="mt-1 text-sm text-white/80">
            Tạo và quản lý các giải đấu tại sân bóng của bạn.
          </p>
        </div>
      </header>
      
      <LeagueManager />
    </section>
  );
}
