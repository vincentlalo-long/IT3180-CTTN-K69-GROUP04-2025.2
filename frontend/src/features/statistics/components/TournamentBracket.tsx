import React, { useMemo } from 'react';
import type { TournamentTeam } from '../types/statistics.types';
import type { MatchResponse } from '../../matchmaking/types/matchmaking.types';

interface TournamentBracketProps {
  matches: MatchResponse[];
  teams: TournamentTeam[];
  isAdmin?: boolean;
  onUpdateResult?: (matchId: number) => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ 
  matches, 
  teams,
  isAdmin = false,
  onUpdateResult,
}) => {
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

  const matchesByRound = useMemo(() => {
    const map = new Map<number, MatchResponse[]>();
    rounds.forEach(r => {
      // Sort matches to ensure consistent top-to-bottom rendering
      const roundMatches = matches.filter(m => m.roundNumber === r).sort((a, b) => a.id - b.id);
      map.set(r, roundMatches);
    });
    return map;
  }, [matches, rounds]);

  const getTeamName = (id: number | null | undefined) => {
    if (!id) return 'Nghỉ (BYE)';
    return teamMap.get(id) || 'Đội chưa xác định';
  };

  // Determine the minimum height based on the number of matches in the first round 
  // to ensure each match card has enough vertical space.
  const maxMatches = matchesByRound.get(rounds[0])?.length || 1;
  const minHeight = maxMatches * 110; 

  return (
    <div className="w-full bg-[#0C5E2A] rounded-lg shadow overflow-x-auto p-6 border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-6">Nhánh Đấu (Knockout)</h3>
      
      <div 
        className="flex flex-row min-w-max pb-4"
        style={{ minHeight: `${minHeight}px` }}
      >
        {rounds.map((roundNumber, roundIndex) => {
          const roundMatches = matchesByRound.get(roundNumber) || [];
          const isLastRound = roundIndex === rounds.length - 1;

          return (
            <div key={roundNumber} className="flex flex-col w-64 flex-shrink-0">
              {/* Round Header */}
              <div className="h-10 flex items-center justify-center font-bold text-white/70 uppercase mb-2">
                {isLastRound ? 'Chung Kết' : `Vòng ${roundNumber}`}
              </div>
              
              {/* Matches Tree Container */}
              <div className="flex flex-col flex-1 relative">
                {roundMatches.map((match, matchIndex) => (
                  <div key={match.id} className="flex-1 flex flex-col justify-center px-4 relative">
                    
                    {/* Match Card */}
                    <div className="w-full bg-white/5 border border-white/10 rounded-lg shadow-sm overflow-hidden z-10">
                      <div className="flex justify-between items-center px-3 py-1.5 border-b border-white/10 bg-white/5">
                        <span className="text-[11px] text-white/50 font-medium">Trận {match.id}</span>
                        <div className="flex items-center gap-1.5">
                          {match.status === 'COMPLETED' && <span className="text-[11px] text-emerald-400 font-bold">FT</span>}
                          {isAdmin && match.hostTeamId !== null && (
                            <button
                              onClick={() => onUpdateResult?.(match.id)}
                              className="text-[10px] text-emerald-400 hover:underline font-bold"
                            >
                              Nhập KQ
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col text-sm">
                        <div className={`flex justify-between px-3 py-2 border-b border-white/10 ${match.status === 'COMPLETED' && match.homeScore! > match.awayScore! ? 'font-bold text-emerald-400' : 'text-white/70'}`}>
                          <span className="truncate pr-2">{getTeamName(match.hostTeamId)}</span>
                          <span>{match.homeScore ?? '-'}</span>
                        </div>
                        <div className={`flex justify-between px-3 py-2 ${match.status === 'COMPLETED' && match.awayScore! > match.homeScore! ? 'font-bold text-emerald-400' : 'text-white/70'}`}>
                          <span className="truncate pr-2">{getTeamName(match.guestTeamId)}</span>
                          <span>{match.awayScore ?? '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Connectors (Horizontal out + Vertical) */}
                    {!isLastRound && (
                      <div className="z-0">
                        {/* Horizontal out from card to column edge */}
                        <div className="absolute top-1/2 right-0 w-4 h-[2px] bg-white/20 transform -translate-y-1/2"></div>
                        
                        {/* Vertical line (Even match draws down, Odd match draws up) */}
                        {matchIndex % 2 === 0 && (
                          <div className="absolute top-1/2 right-0 w-[2px] h-[50%] bg-white/20"></div>
                        )}
                        {matchIndex % 2 === 1 && (
                          <div className="absolute bottom-1/2 right-0 w-[2px] h-[50%] bg-white/20"></div>
                        )}
                      </div>
                    )}
                    
                    {/* Left Connector (Horizontal in from previous round) */}
                    {roundIndex > 0 && (
                      <div className="z-0 absolute top-1/2 left-0 w-4 h-[2px] bg-white/20 transform -translate-y-1/2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
