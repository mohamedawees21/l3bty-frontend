import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import Rentals from './pages/employee/Rentals.jsx';
import ProtectedRoute from './components/ProtectedRoute';

// مكون التحميل
import Spinner from './components/ui/Spinner';

const AppRoutes = () => {
  const { user, isAuthenticated, loading } = useAuth();

  // للتأكد من القيم (debugging)
  console.log('👤 Current user in AppRoutes:', user);
  console.log('👤 User role:', user?.role);
  console.log('👤 isAuthenticated:', isAuthenticated);

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

    if (
      normalizedRole === 'employee' ||
      normalizedRole === 'branch_manager'
    ) {
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
    <Routes>
      {/* صفحة تسجيل الدخول - متاحة للجميع */}
      <Route path="/login" element={<Login />} />

      {/* صفحة غير مصرح */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* المسار الافتراضي */}
      <Route
        path="/"
        element={
          <Navigate to={getDefaultRoute()} replace />
        }
      />

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

      {/* Routes للموظف ومدير الفرع */}
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

      {/* مسار مباشر للتأجيرات (يدعم الأدوار المختلفة) */}
      <Route
        path="/rentals"
        element={
          <ProtectedRoute>
            {user?.role === 'admin' ? (
              <Layout>
                <RentalsManagement />
              </Layout>
            ) : (
              <Layout>
                <Rentals />
              </Layout>
            )}
          </ProtectedRoute>
        }
      />

      {/* صفحة 404 */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <div className="not-found-page">
              <div className="not-found-content">
                <h1>404</h1>
                <h2>الصفحة غير موجودة</h2>
                <p>عذراً، الصفحة التي تبحث عنها غير موجودة</p>
                <button
                  onClick={() => window.location.href = getDefaultRoute()}
                  className="btn-primary"
                >
                  العودة للصفحة الرئيسية
                </button>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;