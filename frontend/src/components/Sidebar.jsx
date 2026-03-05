import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Brain,
  Code,
  Building2,
  FileText,
  Trophy,
  Star,
  Bookmark,
  FileText as FileUser,
  User,
  Menu,
  X,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const userMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/aptitude', icon: Brain, label: 'Aptitude' },
    { path: '/programming', icon: Code, label: 'Programming' },
    { path: '/companies', icon: Building2, label: 'Companies' },
    { path: '/mock-tests', icon: FileText, label: 'Mock Tests' },
    { path: '/daily-challenge', icon: Trophy, label: 'Daily Challenge' },
    { path: '/leaderboard', icon: Star, label: 'Leaderboard' },
    { path: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { path: '/resume-builder', icon: FileUser, label: 'Resume Builder' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  const adminMenuItems = [
    { path: '/admin', icon: BarChart3, label: 'Admin Dashboard' },
    { path: '/admin/users', icon: User, label: 'Users' },
    { path: '/admin/questions', icon: Brain, label: 'Questions' },
    { path: '/admin/coding-questions', icon: Code, label: 'Coding' },
    { path: '/admin/analytics', icon: Settings, label: 'Analytics' }
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-white">Prep2Place</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {userMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${isActive(item.path) 
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Admin Section */}
          {user?.isAdmin && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Admin
              </h3>
              <div className="space-y-1">
                {adminMenuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${isActive(item.path) 
                        ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User Info & Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Score: {user?.score || 0}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

