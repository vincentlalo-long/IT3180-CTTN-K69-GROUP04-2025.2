import React, { useEffect, useState, useCallback } from "react";
import { useAuthContext } from "../../auth/hooks/useAuthContext";
import { leagueRegistrationApi } from "../api/leagueRegistrationApi";
import { generateLeagueSchedule } from "../api/league.api";
import type { LeagueRegistration, RegistrationStatus } from "../types/league.types";
import { getMyTeam } from "../../team/api/teamApi";
import type { Team } from "../../team/types/team.types";
import { Users, RefreshCw } from "lucide-react";

interface LeagueRegistrationProps {
  leagueId: number;
  isManager: boolean;
  leagueStatus: string;
  onStatusChange?: () => void;
}

export const LeagueRegistrationComponent: React.FC<LeagueRegistrationProps> = ({
  leagueId,
  isManager,
  leagueStatus,
  onStatusChange,
}) => {
  const { user } = useAuthContext();
  const [registrations, setRegistrations] = useState<LeagueRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const fetchData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);
      
      const isPlayer = user?.role?.toUpperCase().includes("PLAYER");
      const [regs, team] = await Promise.all([
        leagueRegistrationApi.getRegistrationsByLeague(leagueId),
        isPlayer ? getMyTeam() : Promise.resolve(null),
      ]);
      setRegistrations(regs);
      setMyTeam(team);
    } catch (error) {
      console.error("Failed to fetch registrations", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [leagueId, user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (
    registrationId: number,
    status: RegistrationStatus,
  ) => {
    try {
      await leagueRegistrationApi.updateRegistrationStatus(registrationId, status);
      await fetchData(true);
    } catch {
      alert("Failed to update status");
    }
  };

  const handleRegister = async () => {
    if (!myTeam || !myTeam.id) {
      alert("Bạn cần có đội bóng để đăng ký tham gia");
      return;
    }
    if (myTeam.status !== "APPROVED") {
      alert("Đội bóng của bạn cần được phê duyệt trước khi đăng ký giải đấu");
      return;
    }
    try {
      await leagueRegistrationApi.registerTeam(leagueId, Number(myTeam.id));
      await fetchData(true);
      alert("Gửi yêu cầu đăng ký thành công!");
    } catch {
      alert("Lỗi khi đăng ký tham gia giải đấu");
    }
  };

  const handleFinalize = async () => {
    const approvedCount = registrations.filter(r => r.status === "APPROVED").length;
    if (approvedCount < 2) {
      alert("Cần ít nhất 2 đội đã được duyệt để chốt danh sách.");
      return;
    }
    
    if (!window.confirm(`Bạn có chắc chắn muốn chốt danh sách đội? ${approvedCount} đội sẽ tham gia giải đấu. Tất cả yêu cầu đang chờ sẽ bị từ chối và giải đấu sẽ bắt đầu.`)) return;
    
    setIsFinalizing(true);
    try {
      await leagueRegistrationApi.finalizeRegistration(leagueId);
      try {
        await generateLeagueSchedule(leagueId);
        alert("Chốt danh sách đội và tự động xếp lịch thi đấu thành công! Giải đấu đã bắt đầu.");
      } catch (err) {
        console.error("Lỗi khi tự động xếp lịch thi đấu", err);
        alert("Chốt danh sách đội thành công! Tuy nhiên xảy ra lỗi khi tự động xếp lịch thi đấu (có thể giải đã được xếp lịch trước đó).");
      }
      if (onStatusChange) onStatusChange();
    } catch {
      alert("Lỗi khi chốt danh sách đội.");
    } finally {
      setIsFinalizing(false);
    }
  };

  if (loading) return <div className="p-4 text-center text-white">Đang tải danh sách đăng ký...</div>;

  const userRegistration = registrations.find(
    (r) => myTeam && r.teamId === Number(myTeam.id),
  );

  const approvedRegistrations = registrations.filter(r => r.status === "APPROVED");
  const isPlayer = user?.role?.toUpperCase().includes("PLAYER");

  return (
    <div className="mt-6 p-6 border border-white/10 rounded-xl bg-black/20 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-emerald-400" />
            Danh sách đội đăng ký ({approvedRegistrations.length})
          </h3>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
            title="Làm mới danh sách"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
        
        {isManager && leagueStatus === "OPENING" && (
          <button
            onClick={handleFinalize}
            disabled={isFinalizing || approvedRegistrations.length < 2}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-600"
          >
            {isFinalizing ? "Đang xử lý..." : "Chốt danh sách đội"}
          </button>
        )}
      </div>

      {isManager ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead>
              <tr className="text-white/70">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Đội bóng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Đội trưởng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/90">
              {registrations.map((reg) => (
                <tr key={reg.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{reg.teamName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reg.captainName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        reg.status === "APPROVED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                          : reg.status === "REJECTED"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                      }`}
                    >
                      {reg.status === "APPROVED" ? "Đã duyệt" : reg.status === "REJECTED" ? "Từ chối" : "Chờ duyệt"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {reg.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(reg.id, "APPROVED")}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(reg.id, "REJECTED")}
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 transition"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-white/50">
                    Chưa có đội nào đăng ký.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col items-center py-6 border border-white/5 rounded-xl bg-white/5 shadow-inner">
            {userRegistration ? (
              <div className="text-center">
                <p className="mb-4 text-white/80">
                  Đội bóng <span className="font-bold text-white">{userRegistration.teamName}</span> của bạn đã gửi yêu cầu.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-white/60 text-sm">Trạng thái:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      userRegistration.status === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                        : userRegistration.status === "REJECTED"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                    }`}
                  >
                    {userRegistration.status === "APPROVED" ? "Đã duyệt" : userRegistration.status === "REJECTED" ? "Từ chối" : "Đang chờ duyệt"}
                  </span>
                </div>
              </div>
            ) : (
              isPlayer &&
              myTeam && (
                <button 
                  onClick={handleRegister} 
                  className="rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-500 cursor-pointer active:scale-95"
                >
                  Đăng ký ngay
                </button>
              )
            )}
            {!myTeam && isPlayer && (
              <div className="text-center space-y-3">
                <p className="text-amber-400 text-sm bg-amber-400/10 px-4 py-2 rounded-lg border border-amber-400/20">
                  Bạn cần tham gia hoặc tạo đội để đăng ký tham gia giải đấu.
                </p>
                <button
                  onClick={() => fetchData(true)}
                  className="text-xs text-white/40 hover:text-white underline underline-offset-4 flex items-center gap-1 mx-auto cursor-pointer"
                >
                  <RefreshCw size={10} className={refreshing ? "animate-spin" : ""} />
                  Tôi đã có đội, làm mới dữ liệu
                </button>
              </div>
            )}
          </div>

          {/* Approved Teams Grid */}
          <div className="border-t border-white/10 pt-6">
            <h4 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Các đội đã tham gia giải ({approvedRegistrations.length})
            </h4>
            {approvedRegistrations.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {approvedRegistrations.map((reg) => (
                  <div 
                    key={reg.id} 
                    className="flex flex-col justify-center rounded-xl bg-white/5 border border-white/10 p-4 transition duration-200 hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-md"
                  >
                    <span className="text-sm font-bold text-white">{reg.teamName}</span>
                    <span className="text-xs text-white/60 mt-1">Đội trưởng: {reg.captainName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-white/40 text-sm bg-white/2 rounded-lg border border-dashed border-white/10">
                Chưa có đội nào được duyệt tham gia giải đấu.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
