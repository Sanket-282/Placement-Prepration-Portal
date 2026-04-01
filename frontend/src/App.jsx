import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PageLoader from './components/ui/PageLoader';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';
import AdminLayout from './components/admin/AdminLayout';

import AdminRoutes from './pages/admin/AdminRoutes';
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const VerifyOTP = lazy(() => import('./pages/auth/VerifyOTP'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Aptitude = lazy(() => import('./pages/aptitude/Aptitude'));
const Programming = lazy(() => import('./pages/programming/Programming'));
const ProgrammingTopic = lazy(() => import('./pages/programming/ProgrammingTopic'));
const ProgrammingDifficulty = lazy(() => import('./pages/programming/ProgrammingDifficulty'));
const ProgrammingQuestions = lazy(() => import('./pages/programming/ProgrammingQuestions'));
const ProgrammingSolve = lazy(() => import('./pages/programming/ProgrammingSolve'));
const Companies = lazy(() => import('./pages/companies/Companies'));
const MockTests = lazy(() => import('./pages/tests/MockTests'));
const TakeTest = lazy(() => import('./pages/tests/TakeTest'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const Profile = lazy(() => import('./pages/Profile'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));
const DailyChallenge = lazy(() => import('./pages/DailyChallenge'));


// 🔥 Role-Based Redirect Component
const RoleBasedRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader label="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.isAdmin
    ? <Navigate to="/admin" replace />
    : <Navigate to="/dashboard" replace />;
};

// Protected Route (User Only)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader label="Loading your workspace..." />;

  if (!user) return <Navigate to="/login" replace />;

  // 🚫 Prevent admin from accessing user dashboard
  if (user.isAdmin) return <Navigate to="/admin" replace />;

  return children;
};

// Admin Route
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader label="Loading admin workspace..." />;

  if (!user) return <Navigate to="/login" replace />;

  // 🚫 Prevent user from accessing admin
  if (!user.isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>

            {/* Public Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* User Routes */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/aptitude" element={<Aptitude />} />
              <Route path="/aptitude/:category" element={<Aptitude />} />
              <Route path="/aptitude/:category/:topic" element={<Aptitude />} />


              <Route path="/programming" element={<Programming />} />
              <Route path="/programming/:section" element={<ProgrammingTopic />} />
              <Route path="/programming/:section/:topic" element={<ProgrammingDifficulty />} />
              <Route path="/programming/:section/:topic/:difficulty" element={<ProgrammingQuestions />} />
              <Route path="/programming/:section/:topic/:difficulty/:questionId" element={<ProgrammingSolve />} />


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

            {/* Admin Routes */}

            <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route path="/admin/*" element={<AdminRoutes />} />
            </Route>


            {/* 🔥 FIXED DEFAULT ROUTE */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* Catch-all */}
            <Route path="*" element={<RoleBasedRedirect />} />

            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
