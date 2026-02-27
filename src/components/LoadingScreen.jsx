// src/components/LoadingScreen.jsx
import React from 'react';

const LoadingScreen = ({ message = 'جاري التحميل...', fullScreen = true }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : 'py-20'}`}>
      <div className="relative">
        {/* 🔥 مؤشر تحميل متحرك */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        
        {/* 🔥 نقطة متحركة */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="animate-ping h-4 w-4 rounded-full bg-blue-500 opacity-75"></div>
        </div>
      </div>
      
      {/* 🔥 رسالة التحمل */}
      <div className="mt-6 text-center">
        <p className="text-lg text-gray-700 font-semibold">{message}</p>
        
        {/* 🔥 نقاط متحركة */}
        <div className="flex justify-center mt-2 space-x-1">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="animate-bounce h-2 w-2 bg-blue-500 rounded-full"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* 🔥 نصائح أثناء التحميل */}
      <div className="mt-8 text-center text-gray-500 text-sm max-w-md">
        <p>💡 النصائح السريعة:</p>
        <ul className="mt-2 space-y-1">
          <li>• استخدم Ctrl+F للبحث السريع</li>
          <li>• اضغط F5 لتحديث الصفحة</li>
          <li>• تحقق من اتصال الإنترنت</li>
        </ul>
      </div>
    </div>
  );
};

export default LoadingScreen;