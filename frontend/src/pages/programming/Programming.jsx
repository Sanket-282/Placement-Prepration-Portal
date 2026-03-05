import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { codingAPI } from '../../services/api';
import {
  Code,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Folder,
  FileCode
} from 'lucide-react';

const languages = [
  { id: 'javascript', name: 'JavaScript', extension: 'js', monaco: 'javascript' },
  { id: 'python', name: 'Python', extension: 'py', monaco: 'python' },
  { id: 'java', name: 'Java', extension: 'java', monaco: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp', monaco: 'cpp' },
  { id: 'sql', name: 'SQL', extension: 'sql', monaco: 'sql' }
];

const categories = [
  { id: 'exercises', name: 'Exercises', icon: Code, desc: 'Practice coding problems' },
  { id: 'technical-mcq', name: 'Technical MCQs', icon: BookOpen, desc: 'Programming questions' },
  { id: 'dsa', name: 'DSA Questions', icon: Folder, desc: 'Data structures & algorithms' },
  { id: 'interview', name: 'Interview Questions', icon: FileCode, desc: 'Common interview queries' }
];

const defaultCode = {
  javascript: `// Write your solution here
function solution(input) {
    // Your code here
    return input;
}

// Test your solution
console.log(solution([1, 2, 3]));`,
  python: `# Write your solution here
def solution(input):
    # Your code here
    return input

# Test your solution
print(solution([1, 2, 3]))`,
  java: `// Write your solution here
public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
  sql: `-- Write your SQL query here
SELECT * FROM table_name;`
};

const Programming = () => {
  const { type } = useParams();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (type) {
      fetchQuestions();
    }
  }, [type]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await codingAPI.getAll({ category: type, limit: 20 });
      if (response.data.success) {
        setQuestions(response.data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
    setCode(defaultCode[language] || '');
    setOutput('');
    setSubmitted(false);
    setResult(null);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (selectedQuestion?.starterCode?.[newLang]) {
      setCode(selectedQuestion.starterCode[newLang]);
    } else {
      setCode(defaultCode[newLang] || '');
    }
  };

  const handleRunCode = async () => {
    setRunning(true);
    setOutput('');
    try {
      const response = await codingAPI.runCode({
        sourceCode: code,
        language: language,
        stdin: ''
      });
      
      if (response.data.success) {
        setOutput(response.data.output || response.data.stderr || 'No output');
      }
    } catch (error) {
      setOutput(error.response?.data?.message || 'Error running code');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setRunning(true);
    setSubmitted(true);
    try {
      const response = await codingAPI.submitCode({
        codingQuestionId: selectedQuestion._id,
        sourceCode: code,
        language: language
      });
      
      if (response.data.success) {
        setResult(response.data.result);
        setOutput(response.data.output || '');
      }
    } catch (error) {
      setOutput(error.response?.data?.message || 'Error submitting code');
    } finally {
      setRunning(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30';
      case 'medium': return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30';
      case 'hard': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      default: return 'text-slate-500 bg-slate-100 dark:bg-slate-700';
    }
  };

  // If no type selected, show categories
  if (!type) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Programming Practice
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Choose a category to start coding
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/programming/${cat.id}`}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-green-500 text-white">
                  <cat.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {cat.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Code Editor Preview */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Integrated Code Editor
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Practice coding with our Monaco-based editor supporting JavaScript, Python, Java, C++, and SQL.
          </p>
          <div className="bg-slate-900 rounded-lg p-4">
            <pre className="text-green-400 text-sm font-mono">
{`function solution(arr) {
  // Your logic here
  return arr.reduce((a, b) => a + b, 0);
}

// Test
console.log(solution([1, 2, 3, 4, 5]));`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Question list or editor
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Questions List */}
      <div className="w-full lg:w-1/3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <Link
            to="/programming"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to categories</span>
          </Link>
          <h2 className="font-semibold text-slate-800 dark:text-white">
            {categories.find(c => c.id === type)?.name}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {questions.length} problems
          </p>
        </div>
        
        <div className="overflow-y-auto h-[calc(100%-100px)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {questions.map((q) => (
                <button
                  key={q._id}
                  onClick={() => handleSelectQuestion(q)}
                  className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                    selectedQuestion?._id === q._id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-slate-800 dark:text-white text-sm line-clamp-2">
                      {q.title}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(q.difficulty)}`}>
                      {q.difficulty}
                    </span>
                    <span className="text-xs text-slate-400">
                      {q.points} pts
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {!selectedQuestion ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Code className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                Select a problem
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Choose a problem from the list to start coding
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'description'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'submissions'
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Submissions
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {activeTab === 'description' ? (
                <>
                  {/* Problem Description */}
                  <div className="w-full lg:w-1/2 p-4 overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
                      {selectedQuestion.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                      {selectedQuestion.description}
                    </p>
                    
                    {selectedQuestion.examples?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-slate-800 dark:text-white mb-2">Examples</h4>
                        {selectedQuestion.examples.map((ex, i) => (
                          <div key={i} className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 mb-2 text-sm">
                            <p className="text-slate-600 dark:text-slate-300"><strong>Input:</strong> {ex.input}</p>
                            <p className="text-slate-600 dark:text-slate-300"><strong>Output:</strong> {ex.output}</p>
                            {ex.explanation && (
                              <p className="text-slate-500 mt-1"><strong>Explanation:</strong> {ex.explanation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedQuestion.constraints && (
                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-white mb-2">Constraints</h4>
                        <pre className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-300">
                          {selectedQuestion.constraints}
                        </pre>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full lg:w-1/2 p-4 overflow-y-auto">
                  <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                    View your past submissions here
                  </p>
                </div>
              )}

              {/* Code Editor */}
              <div className="flex-1 flex flex-col">
                {/* Language Selector */}
                <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-1.5 rounded-lg text-sm border-none outline-none"
                  >
                    {languages.map((lang) => (
                      <option key={lang.id} value={lang.id}>{lang.name}</option>
                    ))}
                  </select>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleRunCode}
                      disabled={running}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4" />
                      Run
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={running}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Submit
                    </button>
                  </div>
                </div>

                {/* Editor */}
                <div className="flex-1">
                  <Editor
                    height="100%"
                    language={languages.find(l => l.id === language)?.monaco}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on'
                    }}
                  />
                </div>

                {/* Output */}
                <div className="border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-700">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Output</span>
                    {result && (
                      <span className={`flex items-center gap-1 text-sm ${result.status === 'accepted' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {result.status === 'accepted' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        {result.status === 'accepted' ? 'Accepted' : 'Wrong Answer'}
                      </span>
                    )}
                  </div>
                  <div className="h-32 p-3 bg-slate-900 overflow-auto">
                    {running ? (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running...
                      </div>
                    ) : (
                      <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                        {output || 'Run your code to see output'}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Programming;

