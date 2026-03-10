import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { companiesAPI } from '../../services/api';
import {
  Building2,
  ChevronRight,
  Search,
  Code,
  BookOpen,
  MessageCircle,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Briefcase,
  GraduationCap,
  ArrowRight
} from 'lucide-react';

const companies = [
  { id: 'tcs', name: 'TCS', color: 'from-blue-600 to-blue-700', desc: 'Prepare for TCS selection process' },
  { id: 'infosys', name: 'Infosys', color: 'from-red-600 to-red-700', desc: 'Infosys interview preparation' },
  { id: 'wipro', name: 'Wipro', color: 'from-orange-500 to-orange-600', desc: 'Wipro placement questions' },
  { id: 'accenture', name: 'Accenture', color: 'from-purple-600 to-purple-700', desc: 'Accenture interview prep' },
  { id: 'capgemini', name: 'Capgemini', color: 'from-cyan-600 to-cyan-700', desc: 'Capgemini practice' },
  { id: 'amazon', name: 'Amazon', color: 'from-orange-400 to-orange-500', desc: 'Amazon leadership principles' },
  { id: 'google', name: 'Google', color: 'from-green-500 to-green-600', desc: 'Google interview questions' },
  { id: 'microsoft', name: 'Microsoft', color: 'from-blue-500 to-blue-600', desc: 'Microsoft preparation' }
];

const Companies = () => {
  const { name } = useParams();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('mcq');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (name) fetchCompanyData();
  }, [name]);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const response = await companiesAPI.getOne(name);
      if (response.data.success) setCompanyData(response.data.company);
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = companyData?.questions?.filter(q => {
    if (activeTab === 'mcq') return q.type === 'mcq';
    if (activeTab === 'coding') return q.type === 'coding';
    if (activeTab === 'interview') return q.type === 'interview';
    return true;
  }).filter(q => q.question.toLowerCase().includes(searchTerm.toLowerCase()));

  if (!name) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Company Preparation</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Prepare for interviews with company-specific questions</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search companies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input pl-12" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((company, index) => (
            <Link key={company.id} to={`/companies/${company.id}`} className="group card card-hover p-5" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${company.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-primary-500 transition-colors">{company.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{company.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const currentCompany = companies.find(c => c.id === name);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-slate-500 dark:text-slate-400">Loading company data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/companies" className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </Link>
        <div className="flex items-center gap-3">
          {currentCompany && (
            <div className={`p-3 rounded-xl bg-gradient-to-br ${currentCompany.color} shadow-lg`}>
              <Building2 className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">{currentCompany?.name} Interview Prep</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{companyData?.questions?.length || 0} questions available</p>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button onClick={() => setActiveTab('mcq')} className={`tab ${activeTab === 'mcq' ? 'active' : ''}`}>
          <BookOpen className="w-4 h-4 inline mr-2" /> MCQs ({companyData?.questions?.filter(q => q.type === 'mcq').length || 0})
        </button>
        <button onClick={() => setActiveTab('coding')} className={`tab ${activeTab === 'coding' ? 'active' : ''}`}>
          <Code className="w-4 h-4 inline mr-2" /> Coding ({companyData?.codingProblems?.length || 0})
        </button>
        <button onClick={() => setActiveTab('interview')} className={`tab ${activeTab === 'interview' ? 'active' : ''}`}>
          <MessageCircle className="w-4 h-4 inline mr-2" /> Interview ({companyData?.interviewQuestions?.length || 0})
        </button>
      </div>

      {activeTab === 'interview' ? (
        <div className="space-y-4">
          {companyData?.interviewQuestions?.map((q, index) => (
            <div key={index} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-800 dark:text-white flex-1">{q.question}</h3>
                {q.difficulty && (
                  <span className={`badge ${q.difficulty === 'easy' ? 'badge-success' : q.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'}`}>{q.difficulty}</span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                {q.category && <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {q.category}</span>}
                {q.frequency && <span>Frequency: {q.frequency}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions?.map((q, index) => (
            <div key={index} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-800 dark:text-white">{q.question}</h3>
                <span className={`badge ${q.difficulty === 'easy' ? 'badge-success' : q.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'}`}>{q.difficulty}</span>
              </div>
              {q.type === 'mcq' && q.options && (
                <div className="space-y-2 mt-4">
                  {q.options.map((option, i) => (
                    <div key={i} className={`p-3 rounded-xl border-2 transition-colors ${q.answer === i ? 'border-success-500 bg-success-50 dark:bg-success-900/20' : 'border-slate-200 dark:border-slate-600'}`}>
                      <div className="flex items-center gap-2">
                        {q.answer === i && <CheckCircle className="w-5 h-5 text-success-500" />}
                        <span className="text-slate-700 dark:text-slate-300"><span className="font-semibold">{String.fromCharCode(65 + i)}.</span> {option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(!filteredQuestions || filteredQuestions.length === 0) && (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No questions available</h3>
          <p className="text-slate-500 dark:text-slate-400"> any questions yet.This section doesn't have</p>
        </div>
      )}
    </div>
  );
};

export default Companies;

