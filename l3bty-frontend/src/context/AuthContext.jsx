import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 جلب بروفايل المستخدم من API الخاص بنا
  const fetchProfile = async (userId) => {
    try {
      // استخدم API الخاص بنا بدلاً من Supabase مباشرة
      const response = await api.get(`/users/${userId}`);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.log('Profile error:', error);
      return null;
    }
  };

  // تهيئة المصادقة من التوكن المخزن
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        setLoading(true);
        
        // تحقق من وجود توكن في التخزين المحلي
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          try {
            // تحقق من صحة التوكن مع الخادم
            const verifyResponse = await api.verifyToken();
            
            if (verifyResponse.success && isMounted) {
              const userData = JSON.parse(savedUser);
              setUser(userData);
              
              // جلب بروفايل محدث
              const userProfile = await fetchProfile(userData.id);
              if (userProfile) {
                setProfile(userProfile);
              } else {
                setProfile(userData);
              }
            } else {
              // توكن غير صالح - نظف التخزين
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setProfile(null);
            }
          } catch (error) {
            console.error('خطأ في التحقق من التوكن:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setProfile(null);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('خطأ في تهيئة المصادقة:', err);
        setUser(null);
        setProfile(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // 🔐 تسجيل الدخول - استخدام API الخاص بنا
const login = async (email, password) => {
  setError(null);
  setLoading(true); // 👈 أضف هذا

  try {
    const response = await api.login(email, password);
    
    if (response.success) {
      const userData = response.data?.user || response.user;
      
      if (userData) {
        setUser(userData);
        setProfile(userData);
        return { success: true, data: userData };
      }
    }
    
    setError(response.message || 'فشل تسجيل الدخول');
    return { success: false, error: response.message };
  } catch (error) {
    setError(error.message);
    return { success: false, error: error.message };
  } finally {
    setLoading(false); // 👈 وأضف هذا
  }
};

  // 🚪 تسجيل الخروج
  const logout = async () => {
    setLoading(true);
    try {
      await api.logout(false); // false لمنع إعادة التوجيه التلقائي
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    } finally {
      // نظف الحالة محلياً حتى لو فشل الاتصال بالخادم
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  // 🎭 التحقق من الصلاحيات
  const checkPermission = (allowedRoles) => {
    const currentUser = user || profile;
    if (!currentUser?.role) return false;

    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(currentUser.role);
    }

    return currentUser.role === allowedRoles;
  };

  const value = {
    user: user || profile, // استخدم أي منهما متاح
    profile: profile || user,
    loading,
    error,
    login,
    logout,
    checkPermission,
    isAuthenticated: !!(user || profile) && !!localStorage.getItem('token'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};