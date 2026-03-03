import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 👈 استيراد useAuth
import './Login.css';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth(); // 👈 استخدام AuthContext

  // إذا كان المستخدم مسجل دخوله بالفعل، وجهه فوراً
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔄 مستخدم مسجل بالفعل، توجيه تلقائي:', user);
      redirectBasedOnRole(user);
    }
  }, [isAuthenticated, user]);

  const redirectBasedOnRole = (userData) => {
    const role = userData?.role;
    
    console.log('🎯 توجيه المستخدم حسب دوره:', role);
    
    if (role === 'admin' || role === 'مدير') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'branch_manager' || role === 'manager' || role === 'مشرف') {
      navigate('/employee/rentals', { replace: true });
    } else if (role === 'employee' || role === 'موظف') {
      navigate('/employee/rentals', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 محاولة تسجيل الدخول...');
      
      // 👈 استخدم login من AuthContext
      const result = await login(email, password);
      
      if (result.success) {
        console.log('✅ تم تسجيل الدخول بنجاح', result.data);
        
        // لا تقم بالتوجيه هنا - useEffect سيتولى ذلك بعد تحديث الـ Context
        // لكن نضيف تأخير بسيط للتأكد
        setTimeout(() => {
          if (result.data) {
            redirectBasedOnRole(result.data);
          }
        }, 100);
      } else {
        console.error('❌ فشل تسجيل الدخول:', result.error);
        setError(result.error || 'فشل تسجيل الدخول');
      }
    } catch (err) {
      console.error('🔥 خطأ غير متوقع:', err);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // مستخدمين تجريبيين
  const fillTestCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@l3bty.com');
      setPassword('admin123');
    } else if (role === 'manager') {
      setEmail('manager@l3bty.com');
      setPassword('123456');
    } else if (role === 'employee') {
      setEmail('employee@l3bty.com');
      setPassword('123456');
    }
  };

 return (
    <div className="login-page">
      <div className="glow-effect"></div>
      <div className="login-card">
        <div className="login-logo">
          <img src="/images/l3bty.png" alt="L3BTY" />
          <h1>L3BTY</h1>
          <p>نظام إدارة الألعاب</p>
        </div>

        {error && (
          <div className="error-message">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@l3bty.com"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>تذكرني</span>
            </label>
            <a href="#" className="forgot-password">نسيت كلمة المرور؟</a>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="spinner" width="20" height="20" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32">
                    <animate attributeName="stroke-dashoffset" dur="1.5s" values="32;0" repeatCount="indefinite" />
                  </circle>
                </svg>
                جاري تسجيل الدخول...
              </>
            ) : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="test-users">
          <p>مستخدمين تجريبيين</p>
          <div className="test-buttons">
            <button
              type="button"
              onClick={() => fillTestCredentials('admin')}
              className="test-button admin"
            >
              👑 مدير
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials('manager')}
              className="test-button manager"
            >
              👔 مدير فرع
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials('employee')}
              className="test-button employee"
            >
              👤 موظف
            </button>
          </div>
        </div>

        <div className="login-footer">
          © 2024 L3BTY - جميع الحقوق محفوظة
        </div>
      </div>
    </div>
  );
};

export default Login;