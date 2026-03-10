import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './ui/Spinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // إذا كان في حالة تحميل
  if (loading) {
    return (
      <div className="protected-route-loading">
        <Spinner size="medium" text="جاري التحقق من الصلاحية..." />
      </div>
    );
  }

  // إذا لم يكن مسجل دخول
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // تحويل الأدوار العربية إلى إنجليزية
  const normalizedRole =
    user.role === 'مدير' ? 'admin' :
    user.role === 'مشرف' ? 'branch_manager' :
    user.role === 'موظف' ? 'employee' :
    user.role;

  // إذا كان هناك أدوار محددة مطلوبة
  if (allowedRoles.length > 0 && !allowedRoles.includes(normalizedRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // إذا كان كل شيء تمام
  return children;
};

export default ProtectedRoute;