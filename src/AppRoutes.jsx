// src/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // ✅ لا تستورد BrowserRouter هنا
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';

// صفحات المدير
import AdminDashboard from './pages/admin/Dashboard';
import UsersManagement from './pages/admin/UsersManagement';
import BranchesManagement from './pages/admin/BranchesManagement';
import RentalsManagement from './pages/admin/RentalsManagement';
import RentalsRevenueAnalysis from './pages/admin/RentalsRevenueAnalysis';
import Settings from './pages/admin/Settings';
import GamesManagement from './pages/admin/GamesManagement';

// صفحات الموظف
import Rentals from './pages/employee/Rentals';
import ProtectedRoute from './components/ProtectedRoute';

// مكون التحميل
import Spinner from './components/ui/Spinner';

const AppRoutes = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // للتأكد من القيم
  console.log('👤 Current user in AppRoutes:', user);

  // دالة تحديد المسار الافتراضي حسب الدور
  const getDefaultRoute = () => {
    if (!isAuthenticated || !user) {
      return '/login';
    }

    const role = user?.role;

    // توحيد الأدوار
    const normalizedRole =
      role === 'مدير' ? 'admin' :
      role === 'مشرف' ? 'branch_manager' :
      role === 'موظف' ? 'employee' :
      role;

    if (normalizedRole === 'admin') {
      return '/admin/dashboard';
    }

    if (normalizedRole === 'employee' || normalizedRole === 'branch_manager') {
      return '/employee/rentals';
    }

    return '/login';
  };

  // إذا كان في حالة تحميل
  if (loading) {
    return (
      <div className="app-loading">
        <Spinner size="large" text="جاري تحميل التطبيق..." />
      </div>
    );
  }

  return (
    <Routes> {/* ✅ فقط Routes بدون BrowserRouter */}
      {/* صفحة تسجيل الدخول */}
      <Route path="/login" element={<Login />} />

      {/* صفحة غير مصرح */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* المسار الافتراضي */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

      {/* Routes للمدير */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="branches" element={<BranchesManagement />} />
                <Route path="games" element={<GamesManagement />} />
                <Route path="rentals" element={<RentalsManagement />} />
                <Route path="rentals/completed" element={<RentalsManagement showCompleted />} />
                <Route path="rentals/active" element={<RentalsManagement showActive />} />
                <Route path="revenue-analysis" element={<RentalsRevenueAnalysis />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Routes للموظف */}
      <Route
        path="/employee/*"
        element={
          <ProtectedRoute allowedRoles={['employee', 'branch_manager']}>
            <Layout>
              <Routes>
                <Route index element={<Navigate to="rentals" replace />} />
                <Route path="rentals" element={<Rentals />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* صفحة 404 */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <div className="not-found-page">
              <h1>404 - الصفحة غير موجودة</h1>
              <button onClick={() => window.location.href = getDefaultRoute()}>
                العودة للرئيسية
              </button>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;