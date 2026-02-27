// src/components/RoleBasedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // التحويل إلى الصفحة المناسبة حسب الدور
    switch(user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'branch_manager':
      case 'employee':
        return <Navigate to="/employee/rentals" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default RoleBasedRoute;