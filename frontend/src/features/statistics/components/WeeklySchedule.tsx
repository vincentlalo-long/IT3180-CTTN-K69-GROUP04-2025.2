import React, { useMemo, useState } from 'react';
import type { TournamentTeam } from '../types/statistics.types';
import type { MatchResponse } from '../../matchmaking/types/matchmaking.types';

interface WeeklyScheduleProps {
  matches: MatchResponse[];
  teams: TournamentTeam[];
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ matches, teams }) => {
  const [selectedRound, setSelectedRound] = useState<number>(1);

  const teamMap = useMemo(() => {
    const map = new Map<number, string>();
    teams.forEach(t => map.set(t.id, t.name));
    return map;
  }, [teams]);

  const rounds = useMemo(() => {
    const r = new Set<number>();
    matches.forEach(m => {
      if (m.roundNumber) r.add(m.roundNumber);
    });
    return Array.from(r).sort((a, b) => a - b);
  }, [matches]);

  // Handle case where selected round might not exist after data fetch
  React.useEffect(() => {
    if (rounds.length > 0 && !rounds.includes(selectedRound)) {
      setSelectedRound(rounds[0]);
    }
  }, [rounds, selectedRound]);

  const matchesForRound = useMemo(() => {
    return matches.filter(m => m.roundNumber === selectedRound);
  }, [matches, selectedRound]);

  const getTeamName = (id: number | null | undefined) => {
    if (!id) return 'Nghỉ (BYE)';
    return teamMap.get(id) || 'Đội chưa xác định';
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lịch Thi Đấu</h3>
        {rounds.length > 0 && (
          <select 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            value={selectedRound}
            onChange={(e) => setSelectedRound(Number(e.target.value))}
          >
            {rounds.map(r => (
              <option key={r} value={r}>Vòng {r}</option>
            ))}
          </select>
        )}
      </div>

      <div className="p-6 space-y-4">
        {matchesForRound.length === 0 ? (
          <p className="text-center text-gray-500">Chưa có lịch thi đấu cho vòng này.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchesForRound.map(match => (
              <div key={match.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col justify-center items-center relative overflow-hidden">
                {match.status === 'COMPLETED' && (
                   <span className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-bl-lg">
                     Đã kết thúc
                   </span>
                )}
                {/* We map 'SCHEDULED' or other statuses to 'upcoming/in progress' as appropriate based on time. For now, checking if matchTime is valid could indicate it's upcoming */}
                
                <div className="text-sm text-gray-500 mb-2">Trận {match.id}</div>
                
                <div className="flex w-full justify-between items-center">
                  <div className="flex-1 text-right font-semibold text-gray-900 dark:text-white truncate pr-4">
                    {getTeamName(match.hostTeamId)}
                  </div>
                  
                  <div className="flex-shrink-0 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xl font-bold min-w-[80px] text-center">
                    {match.status === 'COMPLETED' 
                      ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}` 
                      : 'VS'}
                  </div>
                  
                  <div className="flex-1 text-left font-semibold text-gray-900 dark:text-white truncate pl-4">
                    {getTeamName(match.guestTeamId)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
