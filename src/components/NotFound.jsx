// src/components/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const { user } = useAuth();
  
  const getHomeLink = () => {
    if (!user) return '/login';
    return user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 🔥 رمز الخطأ */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-blue-600 opacity-10">404</div>
          <div className="text-5xl font-bold text-gray-800 mt-4">الصفحة غير موجودة</div>
        </div>
        
        {/* 🔥 رسالة الخطأ */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">عذراً، لم نتمكن من العثور على هذه الصفحة</h1>
          <p className="text-gray-600 mb-6">
            ربما تكون الصفحة التي تبحث عنها قد تم نقلها أو حذفها، 
            أو أن العنوان الذي أدخلته غير صحيح.
          </p>
          
          {/* 🔥 خيارات التنقل */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to={getHomeLink()} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
            >
              العودة للرئيسية
            </Link>
            
            <button 
              onClick={() => window.history.back()} 
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition duration-200"
            >
              الرجوع للخلف
            </button>
          </div>
        </div>
        
        {/* 🔥 نصائح إضافية */}
        <div className="text-sm text-gray-500">
          <p>إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الدعم الفني.</p>
          <p className="mt-2">رمز الخطأ: <span className="font-mono">404_NOT_FOUND</span></p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;