import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Search, Plus, Edit, Trash2, Upload, X } from 'lucide-react';

const categories = ['aptitude', 'programming', 'reasoning', 'verbal'];
const subcategories = {
  aptitude: ['quantitative', 'data-interpretation'],
  reasoning: ['logical-reasoning', 'non-verbal-reasoning'],
  verbal: ['verbal-ability', 'verbal-reasoning'],
  programming: ['technical-mcq', 'dsa', 'interview']
};
const difficulties = ['easy', 'medium', 'hard'];

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filters, setFilters] = useState({ category: '', difficulty: '', search: '' });
  const [formData, setFormData] = useState({
    category: 'aptitude',
    subcategory: 'quantitative',
    question: '',
    options: ['', '', '', ''],
    answer: 0,
    difficulty: 'medium',
    explanation: ''
  });

  useEffect(() => { fetchQuestions(); }, [pagination.page, filters]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 20, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await adminAPI.getQuestions(params);
      setQuestions(res.data.questions);
      setPagination({ page: res.data.currentPage, totalPages: res.data.totalPages, total: res.data.total });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await adminAPI.updateQuestion(editingQuestion._id, formData);
      } else {
        await adminAPI.addQuestion(formData);
      }
      setShowModal(false);
      setEditingQuestion(null);
      resetForm();
      fetchQuestions();
    } catch (e) { alert(e.response?.data?.message || 'Error saving question'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this question?')) {
      try {
        await adminAPI.deleteQuestion(id);
        fetchQuestions();
      } catch (e) { alert('Error deleting question'); }
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        await adminAPI.bulkAddQuestions({ questions: data });
        alert('Questions uploaded successfully!');
        fetchQuestions();
      } catch (e) { alert('Error uploading questions. Check JSON format.'); }
    };
    reader.readAsText(file);
  };

  const resetForm = () => {
    setFormData({
      category: 'aptitude',
      subcategory: 'quantitative',
      question: '',
      options: ['', '', '', ''],
      answer: 0,
      difficulty: 'medium',
      explanation: ''
    });
  };

  const openEdit = (q) => {
    setEditingQuestion(q);
    setFormData({
      category: q.category,
      subcategory: q.subcategory,
      question: q.question,
      options: q.options,
      answer: q.answer,
      difficulty: q.difficulty,
      explanation: q.explanation || ''
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Question Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage aptitude and reasoning questions</p>
        </div>
        <div className="flex gap-2">
          <label className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-2">
            <Upload size={18} /> Bulk Upload
            <input type="file" accept=".json" onChange={handleBulkUpload} className="hidden" />
          </label>
          <button onClick={() => { resetForm(); setEditingQuestion(null); setShowModal(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
            <Plus size={18} /> Add Question
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4">
          <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
            <option value="">All Difficulties</option>
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <div className="flex-1 min-w-[200px]">
            <input type="text" placeholder="Search questions..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Subcategory</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Difficulty</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mx-auto"></div></td></tr>
              ) : questions.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No questions found</td></tr>
              ) : (
                questions.map(q => (
                  <tr key={q._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 max-w-md">
                      <p className="text-sm text-slate-800 dark:text-slate-100 truncate">{q.question}</p>
                    </td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">{q.category}</span></td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{q.subcategory}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${q.difficulty === 'easy' ? 'bg-green-100 text-green-800' : q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{q.difficulty}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(q._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-center gap-2">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button key={i} onClick={() => setPagination({ ...pagination, page: i + 1 })} className={`w-8 h-8 rounded ${pagination.page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: subcategories[e.target.value]?.[0] || '' })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" required>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subcategory</label>
                  <select value={formData.subcategory} onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                    {(subcategories[formData.category] || []).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Question</label>
                <textarea value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" rows={3} required />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Options</label>
                {formData.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="answer" checked={formData.answer === i} onChange={() => setFormData({ ...formData, answer: i })} />
                    <input type="text" value={opt} onChange={(e) => { const opts = [...formData.options]; opts[i] = e.target.value; setFormData({ ...formData, options: opts }); }} placeholder={`Option ${i + 1}`} className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" required />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                    {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Explanation (Optional)</label>
                <textarea value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" rows={2} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editingQuestion ? 'Update' : 'Add'} Question</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

