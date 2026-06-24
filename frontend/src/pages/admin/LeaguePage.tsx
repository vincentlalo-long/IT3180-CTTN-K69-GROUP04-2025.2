import { useState, useEffect } from 'react';
import { LeagueManager } from "../../features/matchmaking/components/LeagueManager";
import { LeagueStanding, WeeklySchedule, TournamentBracket, calculateStandings } from "../../features/statistics";
import { LeagueAnnouncementTab } from "../../features/matchmaking/components/LeagueAnnouncementTab";
import { getAdminLeagues, getLeagueMatches, submitMatchResult } from "../../features/matchmaking/api/league.api";
import { leagueRegistrationApi } from "../../features/matchmaking/api/leagueRegistrationApi";
import { getTeamById } from "../../features/team/api/teamApi";
import type { Team } from "../../features/team/types/team.types";
import type { League } from "../../features/matchmaking/types/league.types";
import type { MatchResponse } from "../../features/matchmaking/types/matchmaking.types";
import type { TournamentTeam } from "../../features/statistics/types/statistics.types";

export function LeaguePage() {
  const [viewMode, setViewMode] = useState<"MANAGER" | "STATS_RR" | "STATS_KO" | "ANNOUNCEMENTS">("MANAGER");
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [matches, setMatches] = useState<MatchResponse[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<MatchResponse | null>(null);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [playerStats, setPlayerStats] = useState<{ playerId: number; teamId: number; goals: number; assists: number }[]>([]);
  const [hostTeam, setHostTeam] = useState<Team | null>(null);
  const [guestTeam, setGuestTeam] = useState<Team | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenResultModal = async (matchId: number) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    setCurrentMatch(match);
    setHomeScore(match.homeScore ?? 0);
    setAwayScore(match.awayScore ?? 0);
    setPlayerStats([]);
    setHostTeam(null);
    setGuestTeam(null);
    setIsModalOpen(true);

    try {
      if (match.hostTeamId) {
        const hTeam = await getTeamById(match.hostTeamId);
        setHostTeam(hTeam);
      }
      if (match.guestTeamId) {
        const gTeam = await getTeamById(match.guestTeamId);
        setGuestTeam(gTeam);
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin đội bóng", err);
    }
  };

  const handleSaveResult = async () => {
    if (!currentMatch) return;
    setIsSubmitting(true);
    try {
      await submitMatchResult(currentMatch.id, {
        homeScore,
        awayScore,
        playerStats
      });
      alert("Cập nhật kết quả trận đấu thành công!");
      setIsModalOpen(false);
      // Reload league details
      if (selectedLeagueId) {
        const leagueMatches = await getLeagueMatches(selectedLeagueId, true);
        setMatches(leagueMatches);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật kết quả trận đấu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const roundRobinStandings = calculateStandings(matches, teams);

  useEffect(() => {
    const fetchLeagues = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminLeagues();
        setLeagues(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách giải đấu");
      } finally {
        setLoading(false);
      }
    };
    fetchLeagues();
  }, []);

  useEffect(() => {
    if (!selectedLeagueId) {
      setTeams([]);
      setMatches([]);
      return;
    }
    const fetchLeagueDetails = async () => {
      try {
        const [registrations, leagueMatches] = await Promise.all([
          leagueRegistrationApi.getRegistrationsByLeague(selectedLeagueId),
          getLeagueMatches(selectedLeagueId, true),
        ]);
        const approvedTeams = registrations
          .filter(r => r.status === "APPROVED")
          .map(r => ({
            id: r.teamId,
            name: r.teamName,
            logoUrl: undefined
          }));
        setTeams(approvedTeams);
        setMatches(leagueMatches);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu giải đấu", err);
        setTeams([]);
        setMatches([]);
      }
    };
    fetchLeagueDetails();
  }, [selectedLeagueId]);

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-white/15 bg-[#005E2E]/38 px-5 py-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Quản lý Giải đấu</h2>
          <p className="mt-1 text-sm text-white/80">
            Tạo và quản lý các giải đấu tại sân bóng của bạn.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setViewMode("MANAGER")}
            className={`px-4 py-2 rounded text-sm font-medium transition ${viewMode === 'MANAGER' ? 'bg-white/20 text-white shadow-inner border-b-2 border-emerald-400' : 'bg-transparent text-white border border-white/30 hover:bg-white/10'}`}
          >
            Quản lý chung
          </button>
          <button
            onClick={() => setViewMode("ANNOUNCEMENTS")}
            className={`px-4 py-2 rounded text-sm font-medium transition ${viewMode === 'ANNOUNCEMENTS' ? 'bg-white/20 text-white shadow-inner border-b-2 border-emerald-400' : 'bg-transparent text-white border border-white/30 hover:bg-white/10'}`}
          >
            Bảng tin
          </button>
          <button
            onClick={() => setViewMode("STATS_RR")}
            className={`px-4 py-2 rounded text-sm font-medium transition ${viewMode === 'STATS_RR' ? 'bg-white/20 text-white shadow-inner border-b-2 border-emerald-400' : 'bg-transparent text-white border border-white/30 hover:bg-white/10'}`}
          >
            Thống kê (Vòng tròn)
          </button>
          <button
            onClick={() => setViewMode("STATS_KO")}
            className={`px-4 py-2 rounded text-sm font-medium transition ${viewMode === 'STATS_KO' ? 'bg-white/20 text-white shadow-inner border-b-2 border-emerald-400' : 'bg-transparent text-white border border-white/30 hover:bg-white/10'}`}
          >
            Thống kê (Knockout)
          </button>
        </div>
      </header>

      {viewMode === "MANAGER" ? (
        <LeagueManager />
      ) : (
        <div className="rounded-2xl border border-white/15 bg-[#0C5E2A] p-5 shadow-lg">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-2">Chọn giải đấu:</label>
            <select
              value={selectedLeagueId || ""}
              onChange={(e) => setSelectedLeagueId(e.target.value ? Number(e.target.value) : null)}
              className="w-full max-w-md rounded-lg border border-white/20 bg-[#0C5E2A] px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 [&>option]:bg-[#0C5E2A] [&>option]:text-white"
            >
              <option value="">-- Chọn giải đấu --</option>
              {leagues.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            {loading && <p className="text-sm text-white/50 mt-2">Đang tải dữ liệu...</p>}
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          </div>

          {!selectedLeagueId ? (
            <div className="py-10 text-center text-white/50 border border-dashed border-white/10 rounded-xl">
              Vui lòng chọn giải đấu ở trên để xem chi tiết.
            </div>
          ) : (
            <>
              {viewMode === "ANNOUNCEMENTS" && (
                <LeagueAnnouncementTab leagueId={selectedLeagueId} isAdmin={true} />
              )}

              {viewMode === "STATS_RR" && (
                <div className="space-y-6">
                  <LeagueStanding standings={roundRobinStandings} />
                  <WeeklySchedule matches={matches} teams={teams} isAdmin={true} onUpdateResult={handleOpenResultModal} />
                </div>
              )}

              {viewMode === "STATS_KO" && (
                <div className="space-y-6">
                  <TournamentBracket matches={matches} teams={teams} isAdmin={true} onUpdateResult={handleOpenResultModal} />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {isModalOpen && currentMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#005E2E] shadow-2xl p-6 text-white space-y-6">
            <header className="border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold">Nhập Kết Quả Trận Đấu #{currentMatch.id}</h3>
              <p className="text-xs text-white/60">Cập nhật tỉ số và thống kê bàn thắng / kiến tạo</p>
            </header>

            {/* Score inputs */}
            <div className="flex justify-between items-center gap-6 py-4 bg-black/20 rounded-xl px-6">
              <div className="flex-1 text-center">
                <span className="block text-sm font-semibold mb-2">{currentMatch.hostTeamName || "Đội nhà"}</span>
                <input
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 text-center text-xl font-bold rounded-lg border border-white/20 bg-black/30 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="text-xl font-bold text-white/50">VS</div>

              <div className="flex-1 text-center">
                <span className="block text-sm font-semibold mb-2">{currentMatch.guestTeamName || "Đội khách"}</span>
                <input
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 text-center text-xl font-bold rounded-lg border border-white/20 bg-black/30 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Player stats section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm">Thống kê cầu thủ (Bàn thắng / Kiến tạo)</h4>
                <button
                  type="button"
                  onClick={() => {
                    const defaultTeamId = currentMatch.hostTeamId || 0;
                    const defaultTeam = hostTeam;
                    const defaultPlayer = defaultTeam?.members?.find(m => m.id !== undefined && m.id !== null);
                    setPlayerStats([
                      ...playerStats,
                      {
                        playerId: defaultPlayer?.id || 0,
                        teamId: defaultTeamId,
                        goals: 1,
                        assists: 0
                      }
                    ]);
                  }}
                  className="rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold px-3 py-1.5 transition"
                >
                  + Thêm cầu thủ
                </button>
              </div>

              <div className="space-y-2">
                {playerStats.map((stat, index) => {
                  const selectedTeam = stat.teamId === currentMatch.hostTeamId ? hostTeam : guestTeam;
                  const availablePlayers = selectedTeam?.members?.filter(m => m.id !== undefined && m.id !== null && m.status === "ACTIVE") || [];

                  return (
                    <div key={index} className="flex gap-2 items-center bg-black/10 p-2.5 rounded-lg text-xs">
                      {/* Team select */}
                      <select
                        value={stat.teamId}
                        onChange={(e) => {
                          const newTeamId = Number(e.target.value);
                          const nextTeam = newTeamId === currentMatch.hostTeamId ? hostTeam : guestTeam;
                          const nextPlayer = nextTeam?.members?.find(m => m.id !== undefined && m.id !== null && m.status === "ACTIVE");
                          const updated = [...playerStats];
                          updated[index] = {
                            ...stat,
                            teamId: newTeamId,
                            playerId: nextPlayer?.id || 0
                          };
                          setPlayerStats(updated);
                        }}
                        className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-emerald-500 [&>option]:bg-[#005E2E] [&>option]:text-white"
                      >
                        <option value={currentMatch.hostTeamId || 0}>{currentMatch.hostTeamName || "Đội nhà"}</option>
                        {currentMatch.guestTeamId && (
                          <option value={currentMatch.guestTeamId}>{currentMatch.guestTeamName || "Đội khách"}</option>
                        )}
                      </select>

                      {/* Player select */}
                      <select
                        value={stat.playerId}
                        onChange={(e) => {
                          const updated = [...playerStats];
                          updated[index] = { ...stat, playerId: Number(e.target.value) };
                          setPlayerStats(updated);
                        }}
                        className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-emerald-500 [&>option]:bg-[#005E2E] [&>option]:text-white"
                      >
                        <option value="0">-- Chọn cầu thủ --</option>
                        {availablePlayers.map(p => (
                          <option key={p.id} value={p.id}>{p.username} ({p.email})</option>
                        ))}
                      </select>

                      {/* Goals input */}
                      <div className="flex items-center gap-1">
                        <span>G:</span>
                        <input
                          type="number"
                          min="0"
                          value={stat.goals}
                          onChange={(e) => {
                            const updated = [...playerStats];
                            updated[index] = { ...stat, goals: Math.max(0, parseInt(e.target.value) || 0) };
                            setPlayerStats(updated);
                          }}
                          className="w-12 text-center bg-black/30 border border-white/10 rounded py-1 text-white focus:outline-none"
                        />
                      </div>

                      {/* Assists input */}
                      <div className="flex items-center gap-1">
                        <span>A:</span>
                        <input
                          type="number"
                          min="0"
                          value={stat.assists}
                          onChange={(e) => {
                            const updated = [...playerStats];
                            updated[index] = { ...stat, assists: Math.max(0, parseInt(e.target.value) || 0) };
                            setPlayerStats(updated);
                          }}
                          className="w-12 text-center bg-black/30 border border-white/10 rounded py-1 text-white focus:outline-none"
                        />
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => setPlayerStats(playerStats.filter((_, idx) => idx !== index))}
                        className="p-1 text-rose-400 hover:text-rose-300 transition"
                      >
                        Xóa
                      </button>
                    </div>
                  );
                })}

                {playerStats.length === 0 && (
                  <p className="text-center text-xs text-white/40 py-4">Chưa thêm số liệu thống kê cầu thủ nào.</p>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 border-t border-white/10 pt-4 mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveResult}
                disabled={isSubmitting}
                className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2 font-semibold transition disabled:opacity-50"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu kết quả"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
