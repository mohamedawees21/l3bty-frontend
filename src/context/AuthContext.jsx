import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // تحميل بيانات المستخدم من localStorage عند البدء
  useEffect(() => {
    console.log('🔍 AuthContext: تحميل بيانات المستخدم...');
    
    const loadUser = () => {
      try {
        const token = authService.getToken();
        const userData = authService.getCurrentUser();
        
        console.log(`📊 حالة المصادقة: token=${token ? 'موجود' : 'غير موجود'}, user=${userData ? 'موجود' : 'غير موجود'}`);
        
        if (token && userData) {
          setUser(userData);
          setIsAuthenticated(true);
          console.log(`✅ مستخدم مسجل دخول: ${userData.name} (${userData.role})`);
        } else {
          console.log('⚠️ لا يوجد مستخدم مسجل دخول');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error(`❌ خطأ في تحميل بيانات المستخدم: ${error.message}`);
        setError(error.message);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔐 محاولة تسجيل دخول: ${email}`);
      
      const response = await authService.login(email, password);
      
      if (response.success) {
        const userData = response.data?.user || authService.getCurrentUser();
        
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log(`✅ تسجيل الدخول ناجح: ${userData?.name}`);
        return { success: true, user: userData };
      } else {
        setError(response.message || 'فشل تسجيل الدخول');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error(`🔥 خطأ في تسجيل الدخول: ${error.message}`);
      setError(error.message || 'تعذر الاتصال بالخادم');
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 تسجيل الخروج...');
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log(`✏️ تم تحديث بيانات المستخدم: ${userData.name}`);
  };

  // دالة محسنة للتحقق من الصلاحيات
  const checkPermission = (allowedRoles) => {
    if (!user) {
      console.log('🔐 لا يوجد مستخدم');
      return false;
    }
    
    // المدير له جميع الصلاحيات
    if (user.role === 'admin' || user.role === 'مدير') {
      console.log('✅ مستخدم مدير - لديه جميع الصلاحيات');
      return true;
    }
    
    // تحويل الأدوار العربية إلى إنجليزية للتوحيد
    const roleMap = {
      'مدير': 'admin',
      'مشرف': 'manager',
      'موظف': 'employee'
    };
    
    const normalizedUserRole = roleMap[user.role] || user.role;
    
    // إذا كانت allowedRoles مصفوفة
    if (Array.isArray(allowedRoles)) {
      const normalizedAllowedRoles = allowedRoles.map(role => roleMap[role] || role);
      return normalizedAllowedRoles.includes(normalizedUserRole);
    }
    
    // إذا كانت نصاً
    const normalizedRequiredRole = roleMap[allowedRoles] || allowedRoles;
    return normalizedUserRole === normalizedRequiredRole;
  };

  // دالة للحصول على الدور الموحد
  const getNormalizedRole = () => {
    if (!user) return null;
    
    const roleMap = {
      'مدير': 'admin',
      'مشرف': 'manager',
      'موظف': 'employee',
      'admin': 'admin',
      'manager': 'manager',
      'employee': 'employee'
    };
    
    return roleMap[user.role] || user.role;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    updateUser,
    checkPermission,
    getNormalizedRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;