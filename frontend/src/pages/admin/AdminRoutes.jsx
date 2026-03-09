import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Admin Layout
import AdminLayout from '../components/admin/AdminLayout';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminQuestions from '../pages/admin/AdminQuestions';
import AdminCodingQuestions from '../pages/admin/AdminCodingQuestions';
import AdminCompanyQuestions from '../pages/admin/AdminCompanyQuestions';
import AdminMockTests from '../pages/admin/AdminMockTests';
import AdminLeaderboard from '../pages/admin/AdminLeaderboard';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminSettings from '../pages/admin/AdminSettings';

// Protected Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || (!user.isAdmin && user.role !== 'admin' && user.role !== 'superadmin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="coding-questions" element={<AdminCodingQuestions />} />
        <Route path="company-questions" element={<AdminCompanyQuestions />} />
        <Route path="mock-tests" element={<AdminMockTests />} />
        <Route path="leaderboard" element={<AdminLeaderboard />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}

