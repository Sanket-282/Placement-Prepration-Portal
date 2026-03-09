import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Plus, Edit, Trash2, X, Building2 } from 'lucide-react';

const defaultCompanies = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Capgemini', 'Amazon', 'Google', 'Microsoft', 'Meta', 'Netflix'];

export default function AdminCompanyQuestions() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [filters, setFilters] = useState({ search: '' });
  const [formData, setFormData] = useState({ company: '', description: '', logo: '' });

  useEffect(() => { fetchCompanies(); }, [pagination.page, filters]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 20, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await adminAPI.getCompanyQuestions(params);
      setCompanies(res.data.companies);
      setPagination({ page: res.data.currentPage, totalPages: res.data.totalPages, total: res.data.total });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await adminAPI.updateCompany(editingCompany._id, formData);
      } else {
        await adminAPI.addCompany(formData);
      }
      setShowModal(false);
      setEditingCompany(null);
      fetchCompanies();
    } catch (e) { alert(e.response?.data?.message || 'Error saving company'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this company?')) {
      try {
        await adminAPI.deleteCompany(id);
        fetchCompanies();
      } catch (e) { alert('Error deleting company'); }
    }
  };

  const openEdit = (c) => {
    setEditingCompany(c);
    setFormData({ company: c.company, description: c.description || '', logo: c.logo || '' });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Company Questions</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage company-specific interview questions</p>
        </div>
        <button onClick={() => { setEditingCompany(null); setFormData({ company: '', description: '', logo: '' }); setShowModal(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <Plus size={18} /> Add Company
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <input type="text" placeholder="Search companies..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 animate-pulse"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div><div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div></div>)
        ) : companies.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No companies found. Add a company to get started.</p>
          </div>
        ) : (
          companies.map(c => (
            <div key={c._id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{c.company}</h3>
                    <p className="text-sm text-slate-500">{c.totalQuestions || 0} MCQs</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(c._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 line-clamp-2">{c.description || 'No description'}</p>
              <div className="flex gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{c.totalQuestions || 0}</p>
                  <p className="text-xs text-slate-500">Questions</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{c.codingProblems?.length || 0}</p>
                  <p className="text-xs text-slate-500">Coding</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{c.interviewQuestions?.length || 0}</p>
                  <p className="text-xs text-slate-500">Interview</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingCompany ? 'Edit Company' : 'Add Company'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <select value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" required>
                  <option value="">Select Company</option>
                  {defaultCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" rows={3} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{editingCompany ? 'Update' : 'Add'} Company</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

