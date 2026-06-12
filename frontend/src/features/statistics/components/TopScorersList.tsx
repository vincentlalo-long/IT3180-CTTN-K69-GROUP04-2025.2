import React, { useEffect, useState } from "react";
import { getTopScorers, getTopAssists } from "../../matchmaking/api/league.api";
import type { TopPlayerStatDto } from "../types/statistics.types";
import { RefreshCw, UserCircle } from "lucide-react";

interface TopScorersListProps {
  leagueId: number;
}

export const TopScorersList: React.FC<TopScorersListProps> = ({ leagueId }) => {
  const [activeTab, setActiveTab] = useState<"scorers" | "assists">("scorers");
  const [data, setData] = useState<TopPlayerStatDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "scorers") {
          const res = await getTopScorers(leagueId);
          setData(res);
        } else {
          const res = await getTopAssists(leagueId);
          setData(res);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [leagueId, activeTab]);

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-6">
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
            activeTab === "scorers"
              ? "bg-emerald-600 text-white"
              : "bg-white/10 text-white/60 hover:text-white"
          }`}
          onClick={() => setActiveTab("scorers")}
        >
          Top Ghi Bàn
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
            activeTab === "assists"
              ? "bg-emerald-600 text-white"
              : "bg-white/10 text-white/60 hover:text-white"
          }`}
          onClick={() => setActiveTab("assists")}
        >
          Top Kiến Tạo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <RefreshCw className="animate-spin text-emerald-500" size={24} />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-10 text-white/50">
          Chưa có dữ liệu thống kê
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((player, index) => (
            <div key={player.playerId} className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white/50">
                    <UserCircle size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{player.playerName}</h4>
                    <p className="text-white/50 text-xs">{player.teamName}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-amber-400">
                  {player.totalValue}
                </span>
                <span className="text-xs text-white/50 ml-1">
                  {activeTab === "scorers" ? "bàn" : "kiến tạo"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
