import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 جلب بروفايل المستخدم (بدون كسر لو مش موجود)
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // 🔥 مهم بدل single()

    if (error) {
      console.log('Profile error:', error.message);
      return null;
    }

    return data;
  };
  
useEffect(() => {
  let isMounted = true;

  const initAuth = async () => {
    try {
      const { data } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (data?.session?.user) {
        const currentUser = data.session.user;
        const userProfile = await fetchProfile(currentUser.id);

        setUser(currentUser);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }

    } catch (err) {
      console.error(err);
    } finally {
      if (isMounted) setLoading(false); // 🔥 تأكد إنها هنا
    }
  };

  initAuth();

  const { data: { subscription } } =
    supabase.auth.onAuthStateChange(() => {
      // 🔥 مهم جدًا
      setLoading(false);
    });

  return () => {
    isMounted = false;
    subscription.unsubscribe();
  };
}, []);
  // 🔐 تسجيل الدخول
  const login = async (email, password) => {
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return { success: false, error };
    }

    const userProfile = await fetchProfile(data.user.id);

    setUser(data.user);
    setProfile(userProfile);

    return { success: true };
  };

  // 🚪 تسجيل الخروج
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // 🎭 التحقق من الصلاحيات
  const checkPermission = (allowedRoles) => {
    if (!profile?.role) return false;

    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(profile.role);
    }

    return profile.role === allowedRoles;
  };

  const value = {
    user,
    profile,
    loading,
    error,
    login,
    logout,
    checkPermission,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};