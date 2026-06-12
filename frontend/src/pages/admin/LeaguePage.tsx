import { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Trophy, Calendar, Award, Play, Users, Loader2 } from 'lucide-react';
import { toast } from "../../shared/utils/toast";
import { LeagueManager } from "../../features/matchmaking/components/LeagueManager";
import { LeagueStanding, WeeklySchedule, TournamentBracket, calculateStandings } from "../../features/statistics";
import { 
  getLeagueMatches, 
  generateLeagueSchedule, 
  submitMatchResult 
} from "../../features/matchmaking/api/league.api";
import { leagueRegistrationApi } from "../../features/matchmaking/api/leagueRegistrationApi";
import { LeagueAnnouncementTab } from "../../features/matchmaking/components/LeagueAnnouncementTab";
import type { League } from "../../features/matchmaking/types/league.types";
import type { MatchResponse } from "../../features/matchmaking/types/matchmaking.types";
import type { TournamentTeam } from "../../features/statistics/types/statistics.types";

export function LeaguePage() {
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Tab within detail view
  const [activeTab, setActiveTab] = useState<"SCHEDULE" | "STANDINGS" | "BRACKET" | "ANNOUNCEMENTS">("SCHEDULE");
  
  // Modal states for result entry
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchResponse | null>(null);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [submittingResult, setSubmittingResult] = useState(false);
  
  // Player stats inside result entry
  const [playerStats, setPlayerStats] = useState<Array<{ playerId: number; teamId: number; goals: number; assists: number }>>([]);
  const [newPlayerId, setNewPlayerId] = useState<string>("");
  const [newPlayerTeamId, setNewPlayerTeamId] = useState<number>(0);
  const [newGoals, setNewGoals] = useState<number>(0);
  const [newAssists, setNewAssists] = useState<number>(0);

  const loadLeagueDetails = useCallback(async (leagueId: number) => {
    setLoading(true);
    try {
      const [matchesData, regsData] = await Promise.all([
        getLeagueMatches(leagueId, true),
        leagueRegistrationApi.getRegistrationsByLeague(leagueId)
      ]);
      
      setMatches(matchesData);
      
      const approvedTeams = regsData
        .filter(r => r.status === "APPROVED")
        .map(r => ({ id: r.teamId, name: r.teamName }));
      setTeams(approvedTeams);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải chi tiết giải đấu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadLeagueDetails(selectedLeague.id);
      setActiveTab("ANNOUNCEMENTS");
    }
  }, [selectedLeague, loadLeagueDetails]);

  const handleSelectLeague = (league: League) => {
    setSelectedLeague(league);
  };

  const handleGenerateSchedule = async () => {
    if (!selectedLeague) return;
    setGenerating(true);
    try {
      const generated = await generateLeagueSchedule(selectedLeague.id);
      setMatches(generated);
      toast.success("Xếp lịch thi đấu tự động thành công!");
      loadLeagueDetails(selectedLeague.id);
    } catch (error) {
      console.error(error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errMsg = axiosError.response?.data?.message || "Lỗi khi xếp lịch thi đấu";
      toast.error(errMsg);
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenResultModal = (matchId: number) => {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      setHomeScore(match.homeScore ?? 0);
      setAwayScore(match.awayScore ?? 0);
      setPlayerStats([]);
      setNewPlayerId("");
      setNewPlayerTeamId(Number(match.hostTeamId));
      setNewGoals(0);
      setNewAssists(0);
      setIsResultModalOpen(true);
    }
  };

  const handleAddPlayerStat = () => {
    const pId = parseInt(newPlayerId);
    if (isNaN(pId)) {
      toast.error("ID cầu thủ phải là số nguyên");
      return;
    }
    
    // Add to stats
    setPlayerStats([
      ...playerStats,
      {
        playerId: pId,
        teamId: newPlayerTeamId,
        goals: newGoals,
        assists: newAssists
      }
    ]);
    
    // Clear inputs
    setNewPlayerId("");
    setNewGoals(0);
    setNewAssists(0);
  };

  const handleRemovePlayerStat = (index: number) => {
    setPlayerStats(playerStats.filter((_, i) => i !== index));
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;
    
    setSubmittingResult(true);
    try {
      await submitMatchResult(selectedMatch.id, {
        homeScore,
        awayScore,
        playerStats: playerStats.length > 0 ? playerStats : undefined
      });
      toast.success("Cập nhật tỷ số trận đấu thành công!");
      setIsResultModalOpen(false);
      if (selectedLeague) {
        loadLeagueDetails(selectedLeague.id);
      }
    } catch (error) {
      console.error(error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errMsg = axiosError.response?.data?.message || "Lỗi khi cập nhật kết quả";
      toast.error(errMsg);
    } finally {
      setSubmittingResult(false);
    }
  };

  const getFormatLabel = (format: string) => {
    switch (format) {
      case "KNOCKOUT":
        return "Đấu loại trực tiếp";
      case "ROUND_ROBIN":
        return "Đấu vòng tròn";
      case "GROUP_STAGE":
        return "Chia bảng";
      default:
        return format;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPENING":
        return "Đang mở đăng ký";
      case "IN_PROGRESS":
        return "Đang diễn ra";
      case "FINISHED":
        return "Đã kết thúc";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const calculatedStandings = useMemo(() => {
    return calculateStandings(matches, teams);
  }, [matches, teams]);

  if (!selectedLeague) {
    return <LeagueManager onSelectLeague={handleSelectLeague} />;
  }

  useEffect(() => {
    if (viewMode === "ANNOUNCEMENTS") {
      getAdminLeagues().then(setLeagues).catch(console.error);
    }
  }, [viewMode]);

  return (
    <section className="space-y-6">
      {/* Detail Header */}
      <header className="rounded-2xl border border-white/15 bg-[#005E2E]/38 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => setSelectedLeague(null)}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            title="Quay lại danh sách giải đấu"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">{selectedLeague.name}</h2>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full px-2.5 py-0.5 font-semibold">
                {getStatusLabel(selectedLeague.status)}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/80 flex items-center gap-4">
              <span>Thể thức: <strong>{getFormatLabel(selectedLeague.format)}</strong></span>
              <span>•</span>
              <span>Số đội: <strong>{selectedLeague.numberOfTeams}</strong></span>
              {selectedLeague.prize && (
                <>
                  <span>•</span>
                  <span>Giải thưởng: <strong>{selectedLeague.prize}</strong></span>
                </>
              )}
            </p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-black/20 rounded-xl p-1 border border-white/10">
          <button
            onClick={() => setActiveTab("ANNOUNCEMENTS")}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "ANNOUNCEMENTS" ? "bg-emerald-600 text-white shadow" : "text-white/60 hover:text-white"}`}
          >
            <Trophy size={14} />
            Bảng tin
          </button>
          
          {matches.length > 0 && (
            <>
              {selectedLeague.format === "ROUND_ROBIN" && (
                <button
                  onClick={() => setActiveTab("STANDINGS")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "STANDINGS" ? "bg-emerald-600 text-white shadow" : "text-white/60 hover:text-white"}`}
                >
                  <Award size={14} />
                  Bảng xếp hạng
                </button>
              )}
              
              {selectedLeague.format === "KNOCKOUT" && (
                <button
                  onClick={() => setActiveTab("BRACKET")}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "BRACKET" ? "bg-emerald-600 text-white shadow" : "text-white/60 hover:text-white"}`}
                >
                  <Trophy size={14} />
                  Nhánh đấu
                </button>
              )}

              <button
                onClick={() => setActiveTab("SCHEDULE")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "SCHEDULE" ? "bg-emerald-600 text-white shadow" : "text-white/60 hover:text-white"}`}
              >
                <Calendar size={14} />
                Lịch thi đấu
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-white/70 bg-[#005E2E]/10 rounded-2xl border border-white/10">
          <Loader2 size={36} className="animate-spin text-emerald-400" />
          <p className="mt-4 text-sm">Đang tải dữ liệu giải đấu...</p>
        </div>
      ) : (
        /* Tab Contents */
        <div className="space-y-6">
          {activeTab === "ANNOUNCEMENTS" && (
            <div className="rounded-2xl border border-white/10 bg-[#005E2E]/10 p-6">
              <LeagueAnnouncementTab leagueId={selectedLeague.id} isAdmin={true} />
            </div>
          )}

          {activeTab === "STANDINGS" && matches.length > 0 && (
            <div className="space-y-4">
              <LeagueStanding standings={calculatedStandings} />
            </div>
          )}

          {activeTab === "BRACKET" && matches.length > 0 && (
            <div className="space-y-4">
              <TournamentBracket 
                matches={matches} 
                teams={teams} 
                isAdmin={true} 
                onUpdateResult={handleOpenResultModal} 
              />
            </div>
          )}

          {activeTab === "SCHEDULE" && matches.length > 0 && (
            <div className="space-y-4">
              <WeeklySchedule 
                matches={matches} 
                teams={teams} 
                isAdmin={true} 
                onUpdateResult={handleOpenResultModal} 
              />
            </div>
          )}

          {activeTab !== "ANNOUNCEMENTS" && matches.length === 0 && (
            /* Empty State / Schedule Generation Trigger */
            <div className="rounded-2xl border border-white/10 bg-[#005E2E]/10 p-8 text-center text-white/90 space-y-6">
              <div className="max-w-md mx-auto space-y-3">
                <Trophy size={48} className="mx-auto text-amber-400" />
                <h3 className="text-xl font-bold text-white">Chưa xếp lịch thi đấu</h3>
                <p className="text-sm text-white/70">
                  Giải đấu chưa được xếp lịch thi đấu tự động. Vui lòng duyệt ít nhất 2 đội tham gia trong mục "Đăng ký" của giải đấu, sau đó bấm nút bên dưới để tạo lịch thi đấu tự động.
                </p>
              </div>
              
              <div className="border border-white/10 rounded-xl bg-black/20 p-5 max-w-lg mx-auto">
                <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-1.5 justify-center">
                  <Users size={14} />
                  Các đội đã duyệt tham gia ({teams.length})
                </h4>
                {teams.length > 0 ? (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {teams.map(t => (
                      <span key={t.id} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-lg text-sm font-medium">
                        {t.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-rose-300">Chưa có đội bóng nào được duyệt tham gia.</p>
                )}
              </div>

              <button
                onClick={handleGenerateSchedule}
                disabled={generating || teams.length < 2}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                {generating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang xếp trận...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Xếp lịch thi đấu tự động
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Result Entry Modal */}
      {isResultModalOpen && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#005E2E] shadow-2xl my-8">
            <div className="border-b border-white/10 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                Cập nhật kết quả Trận {selectedMatch.id}
              </h3>
              <span className="text-xs bg-black/25 text-white/60 px-2 py-1 rounded">
                Vòng {selectedMatch.roundNumber}
              </span>
            </div>
            
            <form onSubmit={handleSubmitResult} className="p-6 space-y-6">
              {/* Score Input Row */}
              <div className="flex items-center justify-between gap-4 border border-white/10 rounded-xl bg-black/10 p-4">
                {/* Host Team */}
                <div className="flex-1 text-center space-y-2">
                  <span className="block text-sm font-bold text-white truncate max-w-[150px] mx-auto">
                    {selectedMatch.hostTeamName || "Đội nhà"}
                  </span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={homeScore}
                    onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 h-12 text-center text-xl font-bold rounded-lg border border-white/20 bg-black/40 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                
                <span className="text-2xl font-bold text-white/50">-</span>
                
                {/* Guest Team */}
                <div className="flex-1 text-center space-y-2">
                  <span className="block text-sm font-bold text-white truncate max-w-[150px] mx-auto">
                    {selectedMatch.guestTeamName || "Đội khách"}
                  </span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={awayScore}
                    onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 h-12 text-center text-xl font-bold rounded-lg border border-white/20 bg-black/40 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Player Stats Entry (Ghi bàn / Kiến tạo để test Thống kê cá nhân) */}
              <div className="border-t border-white/10 pt-4 space-y-4">
                <h4 className="text-sm font-bold text-white">Thống kê cầu thủ ghi bàn/kiến tạo (Để test BXH Vua phá lưới)</h4>
                
                {/* Add new player stat form */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-black/15 p-3 rounded-lg border border-white/5">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-white/50 font-bold mb-1">Đội bóng</label>
                    <select
                      value={newPlayerTeamId}
                      onChange={(e) => setNewPlayerTeamId(Number(e.target.value))}
                      className="w-full text-xs rounded border border-white/10 bg-black/30 text-white p-1.5 focus:outline-none"
                    >
                      <option value={selectedMatch.hostTeamId}>{selectedMatch.hostTeamName}</option>
                      {selectedMatch.guestTeamId && (
                        <option value={selectedMatch.guestTeamId}>{selectedMatch.guestTeamName}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-white/50 font-bold mb-1">ID Cầu thủ</label>
                    <input
                      type="text"
                      placeholder="VD: 5"
                      value={newPlayerId}
                      onChange={(e) => setNewPlayerId(e.target.value)}
                      className="w-full text-xs rounded border border-white/10 bg-black/30 text-white p-1.5 focus:outline-none placeholder-white/30"
                    />
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-[10px] text-white/50 font-bold mb-1">Bàn</label>
                      <input
                        type="number"
                        min="0"
                        value={newGoals}
                        onChange={(e) => setNewGoals(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full text-xs rounded border border-white/10 bg-black/30 text-white p-1.5 text-center focus:outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-white/50 font-bold mb-1">K.Tạo</label>
                      <input
                        type="number"
                        min="0"
                        value={newAssists}
                        onChange={(e) => setNewAssists(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full text-xs rounded border border-white/10 bg-black/30 text-white p-1.5 text-center focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-4 mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddPlayerStat}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded shadow transition"
                    >
                      Thêm thống kê
                    </button>
                  </div>
                </div>

                {/* List of currently added stats */}
                {playerStats.length > 0 ? (
                  <div className="overflow-x-auto rounded border border-white/10 max-h-40">
                    <table className="min-w-full text-xs divide-y divide-white/10 bg-black/10">
                      <thead>
                        <tr className="text-white/60 text-left">
                          <th className="px-3 py-2">Đội</th>
                          <th className="px-3 py-2">ID Cầu thủ</th>
                          <th className="px-3 py-2 text-center">Bàn thắng</th>
                          <th className="px-3 py-2 text-center">Kiến tạo</th>
                          <th className="px-3 py-2 text-right">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-white/95">
                        {playerStats.map((stat, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 truncate max-w-[100px]">
                              {stat.teamId === Number(selectedMatch.hostTeamId) 
                                ? selectedMatch.hostTeamName 
                                : selectedMatch.guestTeamName}
                            </td>
                            <td className="px-3 py-2 font-mono">{stat.playerId}</td>
                            <td className="px-3 py-2 text-center font-bold text-amber-300">{stat.goals}</td>
                            <td className="px-3 py-2 text-center text-blue-300">{stat.assists}</td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemovePlayerStat(idx)}
                                className="text-rose-400 hover:text-rose-300 font-bold"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-white/40 italic">Chưa nhập thống kê cá nhân nào. Các bàn thắng sẽ được tính chung cho đội bóng.</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsResultModalOpen(false)}
                  className="rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition"
                  disabled={submittingResult}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingResult}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition shadow flex items-center gap-1.5"
                >
                  {submittingResult && <Loader2 size={16} className="animate-spin" />}
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
