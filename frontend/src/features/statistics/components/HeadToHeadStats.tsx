import React, { useState, useEffect } from "react";
import { getLeagueStandings } from "../../matchmaking/api/league.api";
import type { TeamStanding } from "../types/statistics.types";
import { RefreshCw, Swords } from "lucide-react";

interface HeadToHeadStatsProps {
  leagueId: number;
}

// Mock interface for H2H Match since API doesn't exist yet
interface MockH2HMatch {
  id: number;
  date: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
}

export const HeadToHeadStats: React.FC<HeadToHeadStatsProps> = ({ leagueId }) => {
  const [teams, setTeams] = useState<TeamStanding[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  
  const [team1Id, setTeam1Id] = useState<number | "">("");
  const [team2Id, setTeam2Id] = useState<number | "">("");
  
  const [h2hMatches, setH2hMatches] = useState<MockH2HMatch[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const standings = await getLeagueStandings(leagueId);
        setTeams(standings);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingTeams(false);
      }
    };
    fetchTeams();
  }, [leagueId]);

  useEffect(() => {
    if (team1Id !== "" && team2Id !== "" && team1Id !== team2Id) {
      // TODO: Replace with real API call when backend is ready
      const team1 = teams.find(t => t.teamId === Number(team1Id));
      const team2 = teams.find(t => t.teamId === Number(team2Id));
      
      if (team1 && team2) {
        setH2hMatches([
          {
            id: 1,
            date: new Date().toLocaleDateString(),
            homeTeamName: team1.teamName,
            awayTeamName: team2.teamName,
            homeScore: Math.floor(Math.random() * 4),
            awayScore: Math.floor(Math.random() * 4),
          }
        ]);
      }
    } else {
      setH2hMatches([]);
    }
  }, [team1Id, team2Id, teams]);

  if (loadingTeams) {
    return (
      <div className="flex justify-center py-10">
        <RefreshCw className="animate-spin text-emerald-500" size={24} />
      </div>
    );
  }

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Swords className="text-emerald-500" /> Thống kê đối đầu
      </h3>

      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center">
        <select 
          className="bg-black/40 border border-white/20 text-white rounded-lg px-4 py-2 w-full md:w-1/3"
          value={team1Id}
          onChange={(e) => setTeam1Id(e.target.value === "" ? "" : Number(e.target.value))}
        >
          <option value="">-- Chọn đội 1 --</option>
          {teams.map(team => (
            <option key={team.teamId} value={team.teamId} disabled={team.teamId === team2Id}>
              {team.teamName}
            </option>
          ))}
        </select>
        
        <div className="font-bold text-xl text-white/50">VS</div>

        <select 
          className="bg-black/40 border border-white/20 text-white rounded-lg px-4 py-2 w-full md:w-1/3"
          value={team2Id}
          onChange={(e) => setTeam2Id(e.target.value === "" ? "" : Number(e.target.value))}
        >
          <option value="">-- Chọn đội 2 --</option>
          {teams.map(team => (
            <option key={team.teamId} value={team.teamId} disabled={team.teamId === team1Id}>
              {team.teamName}
            </option>
          ))}
        </select>
      </div>

      {team1Id && team2Id ? (
        <div className="space-y-4">
          <h4 className="text-white font-semibold mb-4">Lịch sử đối đầu</h4>
          {h2hMatches.length === 0 ? (
            <p className="text-white/50 text-center py-4">Hai đội chưa từng gặp nhau</p>
          ) : (
            h2hMatches.map(match => (
              <div key={match.id} className="bg-black/20 p-4 rounded-xl flex items-center justify-between">
                <div className="text-white font-medium flex-1 text-right">{match.homeTeamName}</div>
                <div className="px-6 flex flex-col items-center">
                  <div className="bg-emerald-600/20 border border-emerald-500/30 px-3 py-1 rounded-lg text-emerald-400 font-bold text-lg">
                    {match.homeScore} - {match.awayScore}
                  </div>
                  <span className="text-xs text-white/40 mt-1">{match.date}</span>
                </div>
                <div className="text-white font-medium flex-1 text-left">{match.awayTeamName}</div>
              </div>
            ))
          )}
        </div>
      ) : (
        <p className="text-white/30 text-center py-8">Vui lòng chọn 2 đội để xem lịch sử đối đầu</p>
      )}
    </div>
  );
};
