import React from 'react';
import type { TeamStanding } from '../types/statistics.types';

interface LeagueStandingProps {
  standings: TeamStanding[];
}

export const LeagueStanding: React.FC<LeagueStandingProps> = ({ standings }) => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bảng Xếp Hạng</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
              <th scope="col" className="px-6 py-3 text-center text-blue-600 font-bold">Điểm</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, index) => (
              <tr 
                key={team.teamId} 
                className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                  index < 3 ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                }`}
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-center">
                  {index + 1}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {team.teamName}
                </td>
                <td className="px-4 py-4 text-center">{team.played}</td>
                <td className="px-4 py-4 text-center">{team.won}</td>
                <td className="px-4 py-4 text-center">{team.drawn}</td>
                <td className="px-4 py-4 text-center">{team.lost}</td>
                <td className="px-4 py-4 text-center">{team.goalsFor}</td>
                <td className="px-4 py-4 text-center">{team.goalsAgainst}</td>
                <td className="px-4 py-4 text-center">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</td>
                <td className="px-6 py-4 text-center font-bold text-blue-600 dark:text-blue-400">
                  {team.points}
                </td>
              </tr>
            ))}
            {standings.length === 0 && (
              <tr>
                <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
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
