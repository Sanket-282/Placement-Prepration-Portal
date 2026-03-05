import { Menu, Sun, Moon, Bell, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Header = ({ toggleSidebar }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            className="bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 w-64"
          />
          <span className="text-xs text-slate-400 border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5">⌘K</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-slate-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative">
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Score */}
        <div className="hidden sm:flex items-center gap-2 ml-2 px-3 py-1.5 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg">
          <span className="text-xs text-white/80">Score</span>
          <span className="text-sm font-bold text-white">{user?.score || 0}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

