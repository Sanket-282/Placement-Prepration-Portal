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
  ArrowLeft,
  Target,
  Zap,
  Clock,
  Award,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const categories = [
  { id: 'quantitative', name: 'Quantitative Aptitude', icon: Brain, gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/25' },
  { id: 'data-interpretation', name: 'Data Interpretation', icon: Target, gradient: 'from-green-500 to-emerald-500', shadow: 'shadow-green-500/25' },
  { id: 'logical-reasoning', name: 'Logical Reasoning', icon: Zap, gradient: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/25' },
  { id: 'verbal-reasoning', name: 'Verbal Reasoning', icon: Award, gradient: 'from-orange-500 to-amber-500', shadow: 'shadow-orange-500/25' },
  { id: 'non-verbal-reasoning', name: 'Non-Verbal Reasoning', icon: Sparkles, gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/25' },
  { id: 'verbal-ability', name: 'Verbal Ability', icon: Brain, gradient: 'from-cyan-500 to-blue-500', shadow: 'shadow-cyan-500/25' }
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
      case 'easy': return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' };
      case 'medium': return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' };
      case 'hard': return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' };
      default: return { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-500' };
    }
  };

  if (showCategory || !category) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Aptitude Practice
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Choose a category to start practicing
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, index) => (
            <Link
              key={cat.id}
              to={`/aptitude/${cat.id}`}
              className="group card card-hover p-5"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${cat.gradient} ${cat.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  <cat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-primary-500 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Practice questions
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
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
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-slate-500 dark:text-slate-400">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Brain className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          No questions available
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          This category doesn't have any questions yet.
        </p>
        <Link
          to="/aptitude"
          className="btn btn-primary"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to categories
        </Link>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const difficultyStyle = getDifficultyColor(question.difficulty);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/aptitude"
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleBookmark}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bookmark className="w-5 h-5 text-slate-400 hover:text-primary-500" />
          </button>
          <div className={`px-4 py-2 rounded-xl ${difficultyStyle.bg}`}>
            <span className={`text-sm font-semibold ${difficultyStyle.text} flex items-center gap-2`}>
              <span className={`w-2 h-2 rounded-full ${difficultyStyle.dot}`}></span>
              {question.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="card p-6 md:p-8">
        <h2 className="text-lg md:text-xl font-medium text-slate-800 dark:text-white mb-8 leading-relaxed">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !submitted && setSelectedAnswer(index)}
              disabled={submitted}
              className={`quiz-option w-full ${submitted ? (
                index === question.answer ? 'correct' : 
                index === selectedAnswer ? 'incorrect' : ''
              ) : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                  submitted && index === question.answer ? 'bg-success-500 text-white' :
                  submitted && index === selectedAnswer ? 'bg-danger-500 text-white' :
                  selectedAnswer === index ? 'bg-primary-500 text-white' :
                  'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="flex-1 text-left text-slate-700 dark:text-slate-200">{option}</span>
                {submitted && index === question.answer && (
                  <CheckCircle className="w-6 h-6 text-success-500" />
                )}
                {submitted && index === selectedAnswer && index !== question.answer && (
                  <XCircle className="w-6 h-6 text-danger-500" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Explanation */}
        {submitted && result?.explanation && (
          <div className="mt-6 p-5 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
            <h4 className="font-semibold text-primary-800 dark:text-primary-300 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Explanation
            </h4>
            <p className="text-sm text-primary-700 dark:text-primary-400">{result.explanation}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="btn btn-secondary"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>

        {!submitted ? (
          <button
            onClick={handleAnswer}
            disabled={selectedAnswer === null || loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Answer
                <Zap className="w-5 h-5" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={currentQuestion === questions.length - 1}
            className="btn btn-primary"
          >
            Next Question
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Result Summary */}
      {submitted && (
        <div className="card p-6">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
                result?.isCorrect ? 'bg-success-100 dark:bg-success-900/30' : 'bg-danger-100 dark:bg-danger-900/30'
              }`}>
                {result?.isCorrect ? (
                  <CheckCircle className="w-8 h-8 text-success-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-danger-500" />
                )}
              </div>
              <p className={`text-2xl font-bold ${result?.isCorrect ? 'text-success-500' : 'text-danger-500'}`}>
                {result?.isCorrect ? 'Correct!' : 'Incorrect'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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

