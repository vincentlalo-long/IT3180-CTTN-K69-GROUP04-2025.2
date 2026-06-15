import React from 'react';
import type { TeamStanding } from '../types/statistics.types';

interface LeagueStandingProps {
  standings: TeamStanding[];
}

export const LeagueStanding: React.FC<LeagueStandingProps> = ({ standings }) => {
  return (
    <div className="w-full bg-[#0C5E2A] rounded-lg shadow overflow-hidden border border-white/10">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Bảng Xếp Hạng</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-white/70">
          <thead className="text-xs text-white/60 uppercase bg-white/5">
            <tr>
              <th scope="col" className="px-6 py-3 w-16 text-center">#</th>
              <th scope="col" className="px-6 py-3">Đội Bóng</th>
              <th scope="col" className="px-4 py-3 text-center" title="Số trận đã đá">Trận</th>
              <th scope="col" className="px-4 py-3 text-center" title="Thắng">T</th>
              <th scope="col" className="px-4 py-3 text-center" title="Hòa">H</th>
              <th scope="col" className="px-4 py-3 text-center" title="Thua">B</th>
              <th scope="col" className="px-4 py-3 text-center" title="Bàn Thắng">BT</th>
              <th scope="col" className="px-4 py-3 text-center" title="Bàn Thua">BB</th>
              <th scope="col" className="px-4 py-3 text-center" title="Hiệu số">HS</th>
              <th scope="col" className="px-6 py-3 text-center text-emerald-400 font-bold">Điểm</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => (
              <tr 
                key={team.teamId} 
                className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                  index < 3 ? 'bg-emerald-500/5' : ''
                }`}
              >
                <td className="px-6 py-4 font-medium text-white text-center">
                  {index + 1}
                </td>
                <td className="px-6 py-4 font-medium text-white">
                  {team.teamName}
                </td>
                <td className="px-4 py-4 text-center">{team.played}</td>
                <td className="px-4 py-4 text-center">{team.won}</td>
                <td className="px-4 py-4 text-center">{team.drawn}</td>
                <td className="px-4 py-4 text-center">{team.lost}</td>
                <td className="px-4 py-4 text-center">{team.goalsFor}</td>
                <td className="px-4 py-4 text-center">{team.goalsAgainst}</td>
                <td className="px-4 py-4 text-center">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</td>
                <td className="px-6 py-4 text-center font-bold text-emerald-400">
                  {team.points}
                </td>
              </tr>
            ))}
            {standings.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-white/50">
                  Chưa có dữ liệu bảng xếp hạng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
