import { useState } from 'react';
import { LeagueManager } from "../../features/matchmaking/components/LeagueManager";
import { LeagueStanding, WeeklySchedule, TournamentBracket, calculateStandings } from "../../features/statistics";
import { mockTeams, mockRoundRobinMatches, mockKnockoutMatches } from "../../features/statistics/data/mockStatisticsData";

export function LeaguePage() {
  const [viewMode, setViewMode] = useState<"MANAGER" | "STATS_RR" | "STATS_KO">("MANAGER");

  const roundRobinStandings = calculateStandings(mockRoundRobinMatches, mockTeams);

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/15 bg-[#005E2E]/38 px-5 py-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Quản lý Giải đấu</h2>
          <p className="mt-1 text-sm text-white/80">
            Tạo và quản lý các giải đấu tại sân bóng của bạn.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode("MANAGER")}
            className={`px-4 py-2 rounded text-sm font-medium ${viewMode === 'MANAGER' ? 'bg-white text-[#005E2E]' : 'bg-transparent text-white border border-white/30'}`}
          >
            Quản lý chung
          </button>
          <button 
            onClick={() => setViewMode("STATS_RR")}
            className={`px-4 py-2 rounded text-sm font-medium ${viewMode === 'STATS_RR' ? 'bg-white text-[#005E2E]' : 'bg-transparent text-white border border-white/30'}`}
          >
            Thống kê (Vòng tròn)
          </button>
          <button 
            onClick={() => setViewMode("STATS_KO")}
            className={`px-4 py-2 rounded text-sm font-medium ${viewMode === 'STATS_KO' ? 'bg-white text-[#005E2E]' : 'bg-transparent text-white border border-white/30'}`}
          >
            Thống kê (Knockout)
          </button>
        </div>
      </header>
      
      {viewMode === "MANAGER" && <LeagueManager />}
      
      {viewMode === "STATS_RR" && (
        <div className="space-y-6">
          <LeagueStanding standings={roundRobinStandings} />
          <WeeklySchedule matches={mockRoundRobinMatches} teams={mockTeams} />
        </div>
      )}

      {viewMode === "STATS_KO" && (
        <div className="space-y-6">
          <TournamentBracket matches={mockKnockoutMatches} teams={mockTeams} />
        </div>
      )}
    </section>
  );
}
