import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, leaderboardAPI } from '../services/api';
import {
  Brain,
  Code,
  Building2,
  FileText,
  Trophy,
  Star,
  TrendingUp,
  Target,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, leaderboardRes] = await Promise.all([
        userAPI.getStats(),
        leaderboardAPI.getAll({ limit: 5 })
      ]);
      
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (leaderboardRes.data.success) {
        setLeaderboard(leaderboardRes.data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Score',
      value: user?.score || 0,
      icon: Star,
      color: 'from-amber-400 to-orange-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30'
    },
    {
      label: 'Questions Solved',
      value: user?.totalQuestionsSolved || 0,
      icon: Brain,
      color: 'from-blue-400 to-indigo-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      label: 'Coding Solved',
      value: user?.totalCodingSolved || 0,
      icon: Code,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      label: 'Tests Completed',
      value: user?.testsCompleted || 0,
      icon: FileText,
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    }
  ];

  const quickLinks = [
    { title: 'Aptitude Practice', desc: 'Quantitative, Logical & Verbal', icon: Brain, path: '/aptitude', color: 'bg-blue-500' },
    { title: 'Coding Exercises', desc: 'Practice programming problems', icon: Code, path: '/programming', color: 'bg-green-500' },
    { title: 'Company Prep', desc: 'Prepare for top companies', icon: Building2, path: '/companies', color: 'bg-purple-500' },
    { title: 'Mock Tests', desc: 'Test your knowledge', icon: FileText, path: '/mock-tests', color: 'bg-orange-500' },
    { title: 'Daily Challenge', desc: 'Earn extra points', icon: Trophy, path: '/daily-challenge', color: 'bg-amber-500' },
    { title: 'Leaderboard', desc: 'Compete with others', icon: Star, path: '/leaderboard', color: 'bg-pink-500' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-stagger">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-white/80">
          Ready to continue your placement preparation journey? Let's crush it today!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 bg-gradient-to-br ${stat.color} text-white rounded`} />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="group bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-lg ${link.color} text-white`}>
                  <link.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-primary-500 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {link.desc}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Leaderboard Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
              Top Performers
            </h2>
            <Link to="/leaderboard" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div key={entry._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${index === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                  ${index === 1 ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : ''}
                  ${index === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                  ${index > 2 ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' : ''}
                `}>
                  {entry.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 dark:text-white truncate">
                    {entry.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {entry.testsCompleted} tests completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-500">{entry.score}</p>
                  <p className="text-xs text-slate-500">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Your Progress
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-300">Aptitude Progress</span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">
                  {stats?.aptitude?.total || 0} questions
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((stats?.aptitude?.correct || 0) / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-300">Coding Progress</span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">
                  {stats?.coding?.total || 0} problems
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((stats?.coding?.accepted || 0) / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-300">Mock Tests</span>
                <span className="text-sm font-medium text-slate-800 dark:text-white">
                  {stats?.mockTests?.total || 0} tests
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((stats?.mockTests?.passed || 0) / 10) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

