import { useState, useEffect } from 'react';
import { leaderboardAPI } from '../services/api';
import { Trophy, Medal, User, Star, Loader2 } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter]);

  const fetchLeaderboard = async () => {
    try {
      const response = timeFilter === 'weekly'
        ? await leaderboardAPI.getWeekly()
        : await leaderboardAPI.getAll({ limit: 50 });
      
      if (response.data.success) {
        setLeaderboard(response.data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="font-bold text-slate-500">{rank}</span>;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800';
    if (rank === 2) return 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800';
    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Leaderboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Top performers in our placement preparation community
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTimeFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeFilter === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => setTimeFilter('weekly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            timeFilter === 'weekly'
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          This Week
        </button>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Second Place */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center order-1">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-2xl font-bold text-slate-600 dark:text-slate-200">
              {leaderboard[1]?.name?.charAt(0)}
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
              {leaderboard[1]?.name}
            </h3>
            <p className="text-amber-400 font-bold text-xl mb-1">#2</p>
            <p className="text-primary-500 font-semibold">{leaderboard[1]?.score} pts</p>
          </div>

          {/* First Place */}
          <div className="bg-gradient-to-b from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-xl p-6 border-2 border-amber-300 dark:border-amber-600 text-center order-2 transform scale-105">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-amber-300 to-yellow-400 flex items-center justify-center text-3xl font-bold text-white">
              {leaderboard[0]?.name?.charAt(0)}
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1">
              {leaderboard[0]?.name}
            </h3>
            <p className="text-amber-500 font-bold text-2xl mb-1">#1</p>
            <p className="text-primary-500 font-bold text-lg">{leaderboard[0]?.score} pts</p>
          </div>

          {/* Third Place */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 text-center order-3">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 dark:from-orange-700 dark:to-orange-600 flex items-center justify-center text-2xl font-bold text-orange-700 dark:text-orange-200">
              {leaderboard[2]?.name?.charAt(0)}
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
              {leaderboard[2]?.name}
            </h3>
            <p className="text-orange-400 font-bold text-xl mb-1">#3</p>
            <p className="text-primary-500 font-semibold">{leaderboard[2]?.score} pts</p>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tests Completed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {leaderboard.slice(3).map((entry, index) => (
                <tr key={entry._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(index + 4)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {entry.name?.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800 dark:text-white">
                        {entry.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary-500" />
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {entry.score}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                    {entry.testsCompleted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
            No users yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Be the first to top the leaderboard!
          </p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

