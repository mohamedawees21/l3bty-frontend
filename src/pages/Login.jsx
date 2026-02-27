import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated, loading: authLoading, error: authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('📊 حالة المصادقة:', isAuthenticated);
    
    if (isAuthenticated) {
      console.log('✅ المستخدم مسجل دخول، توجيه إلى الصفحة المناسبة...');
      
      // الحصول على دور المستخدم
      const user = JSON.parse(localStorage.getItem('user'));
      const role = user?.role;
      
      console.log('🎭 دور المستخدم:', role);
      
      // توجيه بناءً على الدور - مع دعم العربية والإنجليزية
      if (role === 'admin' || role === 'مدير') {
        navigate('/admin/dashboard');
      } else if (role === 'manager' || role === 'مشرف' || role === 'branch_manager') {
        navigate('/manager/dashboard');
      } else if (role === 'employee' || role === 'موظف') {
        navigate('/employee/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('البريد الإلكتروني وكلمة المرور مطلوبان');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log(`🔐 محاولة تسجيل دخول: ${email}`);
      
      const result = await login(email, password);
      
      if (result.success) {
        console.log('✅ تسجيل الدخول ناجح من صفحة Login');
        
        // ✅ التحقق من التخزين فوراً
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        console.log('🔑 التوكن بعد التخزين:', token ? '✅ موجود' : '❌ غير موجود');
        console.log('👤 المستخدم بعد التخزين:', user ? '✅ موجود' : '❌ غير موجود');
        
        // التوجيه سيتم في useEffect بناءً على isAuthenticated
      } else {
        setError(result.message || 'فشل تسجيل الدخول');
      }
    } catch (error) {
      console.error('🔥 خطأ في تسجيل الدخول:', error);
      setError('تعذر الاتصال بالخادم. تأكد من تشغيل الخادم على المنفذ 5000');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = (type = 'admin') => {
    const credentials = {
      admin: { email: 'admin@l3bty.com', password: '123456' },
      manager: { email: 'manager@l3bty.com', password: '123456' },
      employee: { email: 'employee@l3bty.com', password: '123456' }
    };
    
    const cred = credentials[type];
    setEmail(cred.email);
    setPassword(cred.password);
    
    // ✅ تسجيل الدخول التلقائي بعد تعبئة البيانات
    setTimeout(() => handleLogin(new Event('submit')), 100);
  };

  // ✅ إضافة أزرار اختبار سريعة للتطوير فقط
  const showTestButtons = process.env.NODE_ENV === 'development';

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>
            <img
              src="/images/l3bty.png"
              alt="L3BTY Store Logo"
              className="logo-icon"
            />
            L3BTY Store
          </h1>
          <p className="login-subtitle">نظام إدارة تأجير الألعاب</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {(error || authError) && (
            <div className="alert alert-error">
              <span className="alert-icon">⚠️</span>
              {error || authError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="أدخل بريدك الإلكتروني"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">كلمة المرور</label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="form-input"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-login"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </div>

          {/* ✅ أزرار اختبار سريعة - تظهر فقط في بيئة التطوير */}
          {showTestButtons && (
            <div className="test-login-buttons">
              <p className="test-label">حسابات تجريبية:</p>
              <div className="test-buttons">
                <button 
                  type="button" 
                  className="test-btn admin"
                  onClick={() => handleTestLogin('admin')}
                >
                  مدير
                </button>
                <button 
                  type="button" 
                  className="test-btn manager"
                  onClick={() => handleTestLogin('manager')}
                >
                  مشرف
                </button>
                <button 
                  type="button" 
                  className="test-btn employee"
                  onClick={() => handleTestLogin('employee')}
                >
                  موظف
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="login-footer">
          <p>جميع الحقوق محفوظة © 2024 L3BTY Store</p>
        </div>
      </div>
    </div>
  );
};

export default Login;