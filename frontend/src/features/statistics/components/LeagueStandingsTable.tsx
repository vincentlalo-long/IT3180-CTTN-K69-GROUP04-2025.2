import React, { useEffect, useState } from "react";
import { LeagueStanding } from "./LeagueStanding";
import { getLeagueStandings } from "../../matchmaking/api/league.api";
import type { TeamStanding } from "../types/statistics.types";
import { RefreshCw } from "lucide-react";
import { toast } from "../../../shared/utils/toast";

interface LeagueStandingsTableProps {
  leagueId: number;
}

export const LeagueStandingsTable: React.FC<LeagueStandingsTableProps> = ({ leagueId }) => {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchStandings = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getLeagueStandings(leagueId);
      setStandings(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu bảng xếp hạng");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStandings();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStandings(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [leagueId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-xl font-bold text-white">Bảng xếp hạng</h3>
        <button 
          onClick={() => fetchStandings(true)}
          disabled={refreshing}
          className="text-sm text-emerald-400 flex items-center gap-1 hover:text-emerald-300"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Cập nhật
        </button>
      </div>
      <LeagueStanding standings={standings} />
    </div>
  );
};
