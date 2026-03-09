import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Plus, Edit, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminMockTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', company: 'General', category: 'placement',
    duration: 60, isActive: true, sections: [{ name: 'Aptitude', timeLimit: 30, questions: [], marks: 30 }]
  });

  useEffect(() => { fetchTests(); }, [pagination.page]);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getMockTests({ page: pagination.page, limit: 20 });
      setTests(res.data.tests);
      setPagination({ page: res.data.currentPage, totalPages: res.data.totalPages, total: res.data.total });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTest) {
        await adminAPI.updateMockTest(editingTest._id, formData);
      } else {
        await adminAPI.addMockTest(formData);
      }
      setShowModal(false);
      setEditingTest(null);
      fetchTests();
    } catch (e) { alert(e.response?.data?.message || 'Error saving test'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this mock test?')) {
      try {
        await adminAPI.deleteMockTest(id);
        fetchTests();
      } catch (e) { alert('Error deleting test'); }
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleMockTest(id);
      fetchTests();
    } catch (e) { alert('Error toggling test'); }
  };

  const openEdit = (test) => {
    setEditingTest(test);
    setFormData({
      title: test.title, description: test.description || '', company: test.company || 'General',
      category: test.category || 'placement', duration: test.duration || 60, isActive: test.isActive,
      sections: test.sections || []
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mock Tests</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage placement mock tests</p>
        </div>
        <button onClick={() => { setEditingTest(null); setFormData({ title: '', description: '', company: 'General', category: 'placement', duration: 60, isActive: true, sections: [{ name: 'Aptitude', timeLimit: 30, questions: [], marks: 30 }] }); setShowModal(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <Plus size={18} /> Create Test
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Questions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mx-auto"></div></td></tr>
              ) : tests.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500">No mock tests found</td></tr>
              ) : (
                tests.map(test => (
                  <tr key={test._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4"><p className="font-medium text-slate-800 dark:text-slate-100">{test.title}</p></td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{test.company}</span></td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{test.duration} min</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{test.totalQuestions || 0}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggle(test._id)} className={`flex items-center gap-1 ${test.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                        {test.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        <span className="text-xs">{test.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(test)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(test._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingTest ? 'Edit Test' : 'Create New Test'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Test Title</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Company</label><input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" /></div>
                <div><label className="block text-sm font-medium mb-1">Duration (min)</label><input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" required /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" rows={3} /></div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="rounded" />
                <label htmlFor="isActive" className="text-sm">Active</label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editingTest ? 'Update' : 'Create'} Test</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

