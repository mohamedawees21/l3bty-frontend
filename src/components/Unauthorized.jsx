// src/components/Unauthorized.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();
  const location = useLocation();
  const state = location.state || {};
  
  const getRequiredRoleText = () => {
    if (state.requiredRole) {
      return state.requiredRole === 'admin' ? 'المشرفين' : 'المسؤولين';
    }
    if (state.allowedRoles) {
      return state.allowedRoles.map(r => 
        r === 'admin' ? 'المشرف' : 
        r === 'branch_manager' ? 'مدير الفرع' : 
        'الموظف'
      ).join(' أو ');
    }
    return 'المستخدمين المصرح لهم';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 🔥 رمز التحذير */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-red-600 opacity-10">403</div>
          <div className="text-5xl font-bold text-gray-800 mt-4">غير مصرح بالدخول</div>
        </div>
        
        {/* 🔥 رسالة التحذير */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">عفواً، ليس لديك صلاحية الوصول</h1>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">
              هذه الصفحة خاصة بـ <span className="font-bold">{getRequiredRoleText()}</span>
            </p>
            <p className="text-red-600 text-sm mt-2">
              دورك الحالي: <span className="font-bold">
                {user?.role === 'admin' ? 'مشرف' : 
                 user?.role === 'branch_manager' ? 'مدير فرع' : 
                 'موظف'}
              </span>
            </p>
          </div>
          
          {/* 🔥 خيارات التنقل */}
          <div className="flex flex-col gap-4">
            <Link 
              to={user?.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
            >
              العودة للوحة التحكم
            </Link>
            
            {user?.role === 'employee' && (
              <Link 
                to="/employee/shift/start" 
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
              >
                بدء شيفت جديد
              </Link>
            )}
            
            {user?.role === 'admin' && (
              <Link 
                to="/admin/users" 
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
              >
                إدارة المستخدمين
              </Link>
            )}
          </div>
        </div>
        
        {/* 🔥 معلومات إضافية */}
        <div className="text-sm text-gray-500">
          <p>إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع المشرف.</p>
          <p className="mt-2">رمز الخطأ: <span className="font-mono">UNAUTHORIZED_ACCESS</span></p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;