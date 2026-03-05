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
  CheckCircle
} from 'lucide-react';

const companies = [
  { id: 'tcs', name: 'TCS', color: 'bg-blue-600', icon: Building2 },
  { id: 'infosys', name: 'Infosys', color: 'bg-red-600', icon: Building2 },
  { id: 'wipro', name: 'Wipro', color: 'bg-orange-500', icon: Building2 },
  { id: 'accenture', name: 'Accenture', color: 'bg-purple-600', icon: Building2 },
  { id: 'capgemini', name: 'Capgemini', color: 'bg-cyan-600', icon: Building2 },
  { id: 'amazon', name: 'Amazon', color: 'bg-orange-400', icon: Building2 },
  { id: 'google', name: 'Google', color: 'bg-green-500', icon: Building2 },
  { id: 'microsoft', name: 'Microsoft', color: 'bg-blue-500', icon: Building2 }
];

const Companies = () => {
  const { name } = useParams();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('mcq');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (name) {
      fetchCompanyData();
    }
  }, [name]);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const response = await companiesAPI.getOne(name);
      if (response.data.success) {
        setCompanyData(response.data.company);
      }
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
  }).filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!name) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Company Specific Preparation
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Prepare for interviews with company-specific questions
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {companies
            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((company) => (
              <Link
                key={company.id}
                to={`/companies/${company.id}`}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${company.color} text-white`}>
                    <company.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                      {company.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Prepare for {company.name}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
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
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/companies"
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </Link>
        <div className="flex items-center gap-3">
          {currentCompany && (
            <div className={`p-2.5 rounded-lg ${currentCompany.color} text-white`}>
              <currentCompany.icon className="w-6 h-6" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              {currentCompany?.name} Interview Questions
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {companyData?.questions?.length || 0} questions available
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('mcq')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'mcq'
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          MCQs ({companyData?.questions?.filter(q => q.type === 'mcq').length || 0})
        </button>
        <button
          onClick={() => setActiveTab('coding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'coding'
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Code className="w-4 h-4" />
          Coding ({companyData?.codingProblems?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('interview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'interview'
              ? 'bg-primary-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Interview ({companyData?.interviewQuestions?.length || 0})
        </button>
      </div>

      {activeTab === 'interview' ? (
        <div className="space-y-4">
          {companyData?.interviewQuestions?.map((q, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  {q.question}
                </h3>
                {q.difficulty && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    q.difficulty === 'easy' ? 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' :
                    q.difficulty === 'medium' ? 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' :
                    'text-red-500 bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {q.difficulty}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                {q.category && <span>{q.category}</span>}
                {q.frequency && <span>Frequency: {q.frequency}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions?.map((q, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  {q.question}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  q.difficulty === 'easy' ? 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' :
                  q.difficulty === 'medium' ? 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' :
                  'text-red-500 bg-red-100 dark:bg-red-900/30'
                }`}>
                  {q.difficulty}
                </span>
              </div>
              
              {q.type === 'mcq' && q.options && (
                <div className="space-y-2 mt-4">
                  {q.options.map((option, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${
                        q.answer === i
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {q.answer === i && (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        )}
                        <span className="text-slate-700 dark:text-slate-300">
                          {String.fromCharCode(65 + i)}. {option}
                        </span>
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
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
            No questions available
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            This section doesn't have any questions yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default Companies;

