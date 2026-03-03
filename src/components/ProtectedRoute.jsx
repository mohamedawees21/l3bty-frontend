import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // عرض شاشة التحميل
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '20px', color: '#666' }}>جاري التحميل...</p>
      </div>
    );
  }

  // إذا لم يكن المستخدم مصادقاً، وجه إلى صفحة تسجيل الدخول
  if (!isAuthenticated || !user) {
    console.log('🔒 غير مصرح، تحويل إلى login. المسار:', location.pathname);
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // تحقق من الصلاحيات
  const userRole = user?.role;
  console.log('🔑 دور المستخدم:', userRole);
  console.log('📋 الأدوار المسموحة:', allowedRoles);

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.log('⛔ لا يوجد صلاحية كافية');
    return <Navigate to="/unauthorized" replace />;
  }

  // كل شيء جيد، اعرض المحتوى
  return children;
};

export default ProtectedRoute;