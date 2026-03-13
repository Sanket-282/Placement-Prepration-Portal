import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { aptitudeTopics, aptitudeCategories } from '../../data/aptitudeConfig';
import { 
  Search, Plus, Edit, Trash2, Upload, X, Filter, BookOpen, TrendingUp,
  Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

const difficulties = ['easy', 'medium', 'hard'];

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filters, setFilters] = useState({ 
    category: '', 
    topic: '', 
    difficulty: '', 
    search: ''
  });
  const [topicOptions, setTopicOptions] = useState([]);
  const [formData, setFormData] = useState({
    category: 'quantitative',
    subcategory: 'quantitative',
    topic: '',
    question: '',
    options: ['', '', '', ''],
    answer: 0,
    difficulty: 'medium',
    explanation: ''
  });
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Update topic options for FILTERS
  useEffect(() => {
    if (filters.category && aptitudeTopics[filters.category]) {
      setTopicOptions(aptitudeTopics[filters.category]);
    } else {
      setTopicOptions([]);
    }
  }, [filters.category]);

  // Update topic options for FORM (Modal)
  useEffect(() => {
    if (formData.category && aptitudeTopics[formData.category]) {
      setTopicOptions(aptitudeTopics[formData.category]);
    } else {
      setTopicOptions([]);
    }
  }, [formData.category]);

  // Fetch questions
  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters, limit: 20, page: 1 };
      const response = await adminAPI.getQuestions(params);
      setQuestions(response.data.questions || []);
    } catch (e) {
      console.error('Error fetching questions:', e);
      setError(e.response?.data?.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, subcategory: formData.category }; // Fix validation
      if (editingQuestion) {
        await adminAPI.updateQuestion(editingQuestion._id, data);
        showNotification('success', 'Question updated successfully!');
      } else {
        await adminAPI.addQuestion(data);
        showNotification('success', 'Question added successfully!');
      }
      setShowModal(false);
      setEditingQuestion(null);
      resetForm();
      fetchQuestions();
    } catch (e) {
      showNotification('error', e.response?.data?.message || 'Error saving question');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this question?')) {
      try {
        await adminAPI.deleteQuestion(id);
        showNotification('success', 'Question deleted!');
        fetchQuestions();
      } catch (e) {
        showNotification('error', 'Error deleting question');
      }
    }
  };

  const openEdit = (q) => {
    setEditingQuestion(q);
    setFormData({
      category: q.category || 'quantitative',
      topic: q.topic || '',
      question: q.question || '',
      options: q.options || ['', '', '', ''],
      answer: q.answer || 0,
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      category: 'quantitative',
      topic: '',
      question: '',
      options: ['', '', '', ''],
      answer: 0,
      difficulty: 'medium',
      explanation: ''
    });
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800 dark:bg-green-900/50',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50',
      hard: 'bg-red-100 text-red-800 dark:bg-red-900/50'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/50';
  };

  // Responsive Modal (Zoom + Screen Proof)
  const Modal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-slate-200 dark:border-slate-700 animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 p-8 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm z-10 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h2>
          </div>
          <button 
            onClick={() => setShowModal(false)} 
            className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Row 1: Category + Topic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">
                Category <span className="text-red-500">*</span>
              </label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-white dark:bg-slate-700 text-lg"
                required
              >
                <option value="">Select Category</option>
                {aptitudeCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">
                Topic <span className="text-red-500">*</span>
              </label>
              <select 
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                disabled={!formData.category || topicOptions.length === 0}
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-white dark:bg-slate-700 text-lg disabled:bg-slate-100 dark:disabled:bg-slate-800"
                required
              >
                <option value="">Select Topic</option>
                {topicOptions.map((topic) => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Question */}
          <div>
            <label className="block text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              rows="4"
              placeholder="Enter the aptitude question here..."
              className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-white dark:bg-slate-700 text-lg resize-vertical min-h-[120px]"
              required
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-xl font-bold text-slate-700 dark:text-slate-200 mb-6">
              Options (Select correct answer)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.options.map((option, index) => (
                <div key={index} className="group relative">
                  <input
                    type="radio"
                    id={`option-${index}`}
                    checked={formData.answer === index}
                    onChange={() => setFormData({ ...formData, answer: index })}
                    className="absolute left-4 top-4 w-6 h-6 accent-indigo-600 peer"
                  />
                  <label 
                    htmlFor={`option-${index}`}
                    className="block p-5 pl-16 border-2 rounded-xl cursor-pointer transition-all group-hover:border-indigo-400 peer-checked:bg-indigo-50 peer-checked:border-indigo-500 peer-checked:shadow-md hover:shadow-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:peer-checked:bg-indigo-900/30"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-xl">{String.fromCharCode(65 + index)}.</span>
                    </div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="w-full p-0 border-none bg-transparent focus:ring-0 text-lg font-medium outline-none"
                      required
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">
              Difficulty Level
            </label>
            <div className="flex gap-4">
              {difficulties.map((diff) => (
                <label key={diff} className="flex items-center gap-2 cursor-pointer p-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors">
                  <input
                    type="radio"
                    value={diff}
                    checked={formData.difficulty === diff}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-5 h-5 accent-indigo-600"
                  />
                  <span className="capitalize font-semibold">{diff}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">
              Explanation (Optional)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              rows="3"
              placeholder="Detailed solution or explanation..."
              className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-white dark:bg-slate-700 text-lg resize-vertical"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-8 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-1 px-8 py-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition-colors text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all text-lg"
            >
              {editingQuestion ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (showModal) return <Modal />;

  // Main page content...
  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Aptitude Questions
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mt-3">
              Complete management system with responsive design
            </p>
          </div>
          <button 
            onClick={() => {
              resetForm();
              setEditingQuestion(null);
              setShowModal(true);
            }}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all text-lg flex items-center gap-3 whitespace-nowrap"
          >
            <Plus className="w-6 h-6" />
            Add New Question
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-xl mb-12 border border-slate-200/50 dark:border-slate-700/50">
        <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3">
          <Filter className="w-8 h-8" />
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div>
            <label className="block text-lg font-semibold mb-3 text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select 
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, topic: '' })}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-white dark:bg-slate-700"
            >
              <option value="">All Categories</option>
              {aptitudeCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-semibold mb-3 text-slate-700 dark:text-slate-300">
              Topic
            </label>
            <select 
              value={filters.topic}
              onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
              disabled={!filters.category}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-white dark:bg-slate-700 disabled:bg-slate-100 dark:disabled:bg-slate-800"
            >
              <option value="">All Topics</option>
              {topicOptions.map((topic) => (
                <option key={topic.id} value={topic.id}>{topic.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-semibold mb-3 text-slate-700 dark:text-slate-300">
              Difficulty
            </label>
            <select 
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-white dark:bg-slate-700"
            >
              <option value="">All Levels</option>
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-lg font-semibold mb-3 text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search
            </label>
            <input 
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search questions..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 bg-white dark:bg-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700">
                <th className="p-4 text-left font-bold text-slate-800 dark:text-slate-200 w-64">Question</th>
                <th className="p-4 text-left font-bold text-slate-800 dark:text-slate-200 w-32">Category</th>
                <th className="p-4 text-left font-bold text-slate-800 dark:text-slate-200 w-32">Topic</th>
                <th className="p-4 text-left font-bold text-slate-800 dark:text-slate-200 w-24">Difficulty</th>
                <th className="p-4 text-left font-bold text-slate-800 dark:text-slate-200 w-32">Created</th>
                <th className="p-4 text-right font-bold text-slate-800 dark:text-slate-200 w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-600" />
                  </td>
                </tr>
              )}
              {!loading && questions.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500">
                    No questions found
                  </td>
                </tr>
              )}
             {questions.map((q) => (
  <tr
    key={q._id}
    className="border-b hover:bg-slate-50 dark:hover:bg-slate-700"
  >
    <td className="p-4">
      <div className="truncate" title={q.question}>
        {q.question}
      </div>
    </td>

    <td className="p-4">
      {q.category || "N/A"}
    </td>

    <td className="p-4">
      {q.topic || "N/A"}
    </td>

    <td className="p-4">
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(
          q.difficulty
        )}`}
      >
        {q.difficulty}
      </span>
    </td>

    <td className="p-4">
      {new Date(q.createdAt).toLocaleDateString()}
    </td>

    <td className="p-4 text-right space-x-2">
      <button
        onClick={() => openEdit(q)}
        className="p-2 text-blue-600 hover:text-blue-800"
      >
        <Edit size={18} />
      </button>

      <button
        onClick={() => handleDelete(q._id)}
        className="p-2 text-red-600 hover:text-red-800"
      >
        <Trash2 size={18} />
      </button>
    </td>
  </tr>
))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notifications */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl animate-slide-in-right ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

