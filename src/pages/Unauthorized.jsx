import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Home, LogIn } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-container">
        <div className="icon-container">
          <Shield size={64} color="#e74c3c" />
          <AlertTriangle size={32} color="#f39c12" className="alert-icon" />
        </div>
        
        <h1>403 - غير مصرح بالدخول</h1>
        
        <p>عذراً، ليس لديك الصلاحية للوصول إلى هذه الصفحة</p>
        
        <div className="access-details">
          <p>إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع مدير النظام</p>
        </div>

        <div className="actions">
          <button 
            onClick={() => navigate('/')} 
            className="btn-primary"
          >
            <Home size={18} />
            العودة للصفحة الرئيسية
          </button>
          
          <button 
            onClick={() => navigate('/login')} 
            className="btn-secondary"
          >
            <LogIn size={18} />
            تسجيل الدخول مرة أخرى
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;