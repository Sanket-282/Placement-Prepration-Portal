import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

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
import Leaderboard from './pages/Leaderboard';
import ResumeBuilder from './pages/ResumeBuilder';

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
              <Route path="/mock-tests/:id" element={<MockTests />} />
              <Route path="/daily-challenge" element={<MockTests />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/bookmarks" element={<Dashboard />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/profile" element={<Dashboard />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute><MainLayout /></AdminRoute>}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/users" element={<Dashboard />} />
              <Route path="/admin/questions" element={<Dashboard />} />
              <Route path="/admin/coding-questions" element={<Dashboard />} />
              <Route path="/admin/analytics" element={<Dashboard />} />
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

