import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { questionsAPI, userAPI } from '../../services/api';
import { 
  Brain, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Bookmark, 
  BookmarkCheck,
  Loader2,
  ArrowLeft
} from 'lucide-react';

const categories = [
  { id: 'quantitative', name: 'Quantitative Aptitude', icon: Brain, color: 'bg-blue-500' },
  { id: 'data-interpretation', name: 'Data Interpretation', icon: Brain, color: 'bg-green-500' },
  { id: 'logical-reasoning', name: 'Logical Reasoning', icon: Brain, color: 'bg-purple-500' },
  { id: 'verbal-reasoning', name: 'Verbal Reasoning', icon: Brain, color: 'bg-orange-500' },
  { id: 'non-verbal-reasoning', name: 'Non-Verbal Reasoning', icon: Brain, color: 'bg-pink-500' },
  { id: 'verbal-ability', name: 'Verbal Ability', icon: Brain, color: 'bg-cyan-500' }
];

const Aptitude = () => {
  const { category } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [showCategory, setShowCategory] = useState(!category);

  useEffect(() => {
    if (category) {
      fetchQuestions();
    }
  }, [category]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await questionsAPI.getAll({ 
        subcategory: category,
        limit: 20 
      });
      if (response.data.success) {
        setQuestions(response.data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async () => {
    if (selectedAnswer === null) return;

    setLoading(true);
    try {
      const response = await questionsAPI.submitAnswer(questions[currentQuestion]._id, {
        answer: selectedAnswer
      });
      
      if (response.data.success) {
        setResult(response.data);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setSubmitted(false);
      setResult(null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(null);
      setSubmitted(false);
      setResult(null);
    }
  };

  const handleBookmark = async () => {
    try {
      await userAPI.addBookmark({
        questionId: questions[currentQuestion]._id,
        questionType: 'aptitude'
      });
    } catch (error) {
      console.error('Error adding bookmark:', error);
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

  if (showCategory || !category) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Aptitude Practice
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Choose a category to start practicing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/aptitude/${cat.id}`}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${cat.color} text-white`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Practice questions
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

  if (loading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
          No questions available
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          This category doesn't have any questions yet.
        </p>
        <Link
          to="/aptitude"
          className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to categories
        </Link>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/aptitude"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              {categories.find(c => c.id === category)?.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
        </div>
        <button
          onClick={handleBookmark}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Bookmark className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex items-start justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
        </div>

        <h2 className="text-lg font-medium text-slate-800 dark:text-white mb-6">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !submitted && setSelectedAnswer(index)}
              disabled={submitted}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                submitted
                  ? index === question.answer
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : index === selectedAnswer
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-slate-200 dark:border-slate-600'
                  : selectedAnswer === index
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-slate-200 dark:border-slate-600 hover:border-primary-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-300">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-slate-700 dark:text-slate-200">{option}</span>
                {submitted && index === question.answer && (
                  <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
                )}
                {submitted && index === selectedAnswer && index !== question.answer && (
                  <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Explanation */}
        {submitted && result?.explanation && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Explanation</h4>
            <p className="text-sm text-blue-700 dark:text-blue-400">{result.explanation}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        {!submitted ? (
          <button
            onClick={handleAnswer}
            disabled={selectedAnswer === null || loading}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Answer'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={currentQuestion === questions.length - 1}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            Next Question
          </button>
        )}
      </div>

      {/* Result Summary */}
      {submitted && (
        <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500">{result?.isCorrect ? 'Correct!' : 'Incorrect'}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                +{result?.score} points
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aptitude;

