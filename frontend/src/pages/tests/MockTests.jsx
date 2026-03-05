import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockTestsAPI } from '../../services/api';
import {
  FileText,
  Clock,
  ChevronRight,
  Loader2,
  Search,
  Calendar,
  Users
} from 'lucide-react';

const MockTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await mockTestsAPI.getAll();
      if (response.data.success) {
        setTests(response.data.mockTests);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30';
      case 'medium': return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30';
      case 'hard': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      default: return 'text-slate-500 bg-slate-100 dark:bg-slate-700';
    }
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
          Mock Tests
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Practice with real-world placement test simulations
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary-500"
        >
          <option value="all">All Categories</option>
          <option value="placement">Placement</option>
          <option value="campus">Campus</option>
          <option value="company-specific">Company Specific</option>
        </select>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test) => (
          <div
            key={test._id}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-lg ${
                test.company === 'TCS' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' :
                test.company === 'Infosys' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' :
                test.company === 'Wipro' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' :
                'bg-purple-100 dark:bg-purple-900/30 text-purple-500'
              }`}>
                <FileText className="w-6 h-6" />
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                {test.difficulty}
              </span>
            </div>

            <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
              {test.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
              {test.description || `Prepare for ${test.company} placement test`}
            </p>

            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{test.duration} min</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{test.totalQuestions} Q</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{test.attempts || 0}</span>
              </div>
            </div>

            <Link
              to={`/mock-tests/${test._id}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
            >
              Start Test
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
            No tests found
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default MockTests;

