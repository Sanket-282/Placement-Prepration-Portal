import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';
import AdminLayout from './components/admin/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import VerifyOTP from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import Aptitude from './pages/aptitude/Aptitude';
import Programming from './pages/programming/Programming';
import Companies from './pages/companies/Companies';
import MockTests from './pages/tests/MockTests';
import TakeTest from './pages/tests/TakeTest';
import Leaderboard from './pages/Leaderboard';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';
import ResumeBuilder from './pages/ResumeBuilder';
import DailyChallenge from './pages/DailyChallenge';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminCodingQuestions from './pages/admin/AdminCodingQuestions';
import AdminCompanyQuestions from './pages/admin/AdminCompanyQuestions';
import AdminMockTests from './pages/admin/AdminMockTests';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/aptitude" element={<Aptitude />} />
              <Route path="/aptitude/:category" element={<Aptitude />} />
              <Route path="/programming" element={<Programming />} />
              <Route path="/programming/:type" element={<Programming />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:name" element={<Companies />} />
              <Route path="/mock-tests" element={<MockTests />} />
              <Route path="/mock-tests/:id" element={<TakeTest />} />
              <Route path="/daily-challenge" element={<DailyChallenge />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin Routes - Separate Admin Layout */}
            <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/questions" element={<AdminQuestions />} />
              <Route path="/admin/coding-questions" element={<AdminCodingQuestions />} />
              <Route path="/admin/company-questions" element={<AdminCompanyQuestions />} />
              <Route path="/admin/mock-tests" element={<AdminMockTests />} />
              <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

