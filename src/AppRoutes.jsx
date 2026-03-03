// src/AppRoutes.jsx
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
import Rentals from './pages/employee/Rentals';
import ProtectedRoute from './components/ProtectedRoute';



const AppRoutes = () => {
const { user, profile, isAuthenticated, loading } = useAuth();
  // للتأكد من القيم (debugging)
  console.log('👤 Current user in AppRoutes:', user);
  console.log('👤 User role:', user?.role);
  console.log('👤 isAuthenticated:', isAuthenticated);
  
const getDefaultRoute = () => {
  if (!isAuthenticated || !user) {
    return '/login';
  }

  const role = user?.role; // 👈 استخدم user بدل profile

  const normalizedRole =
    role === 'مدير' ? 'admin' :
    role === 'مشرف' ? 'manager' :
    role === 'موظف' ? 'employee' :
    role;

  if (normalizedRole === 'admin') {
    return '/admin/dashboard';
  }

  if (
    normalizedRole === 'employee' ||
    normalizedRole === 'manager' ||
    normalizedRole === 'branch_manager'
  ) {
    return '/employee/rentals';
  }

  return '/login';
};
  
  return (
    <Routes>
      {/* صفحة تسجيل الدخول - متاحة للجميع */}
      <Route path="/login" element={<Login />} />
      
      {/* صفحة غير مصرح */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      
    <Route
  path="/"
  element={
    loading ? (
      <div className="loading-screen">جاري التحميل...</div>
    ) : (
      <Navigate to={getDefaultRoute()} replace />
    )
  }
/>
      
      {/* ✅ Routes للمدير */}
      <Route path="/admin/*" element={
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
      } />
      
      {/* ✅ Routes للموظف ومدير الفرع */}
      <Route path="/employee/*" element={
        <ProtectedRoute allowedRoles={['employee', 'manager', 'branch_manager', 'موظف', 'مشرف']}>
          <Layout>
            <Routes>
              <Route index element={<Navigate to="rentals" replace />} />
              <Route path="rentals" element={<Rentals />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* ✅ مسار خاص للـ admin للوصول لصفحة rentals (كبديل) */}
      <Route path="/rentals" element={
        <ProtectedRoute>
          {user?.role === 'admin' || user?.role === 'مدير' ? (
            <Layout>
              <RentalsManagement />
            </Layout>
          ) : (
            <Layout>
              <Rentals />
            </Layout>
          )}
        </ProtectedRoute>
      } />
      
      {/* صفحة شيفت غير نشط */}
      <Route path="/no-active-shift" element={
        <ProtectedRoute>
          <Layout>
            <div className="no-shift-page">
              <h2>⚠️ لا يوجد شيفت نشط</h2>
              <p>يجب بدء شيفت للوصول إلى صفحة التأجير</p>
              <button 
                onClick={() => window.location.href = getDefaultRoute()}
                className="btn-primary"
              >
                العودة للصفحة الرئيسية
              </button>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* صفحة غير موجودة */}
      <Route path="*" element={
        <ProtectedRoute>
          <div className="not-found-page">
            <h1>404 - الصفحة غير موجودة</h1>
            <button 
              onClick={() => window.location.href = getDefaultRoute()}
              className="btn-primary"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;