// src/context/RentalContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const RentalContext = createContext();

export const useRental = () => useContext(RentalContext);

export const RentalProvider = ({ children }) => {
  const { user } = useAuth();
  const [branchGames, setBranchGames] = useState([]);
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const loadBranchGames = async () => {
    if (!user?.branch_id) return;
    
    try {
      console.log(`🎮 جاري تحميل ألعاب الفرع ${user.branch_id}...`);
      
      // ⚡ **تعديل المسار: إزالة api المكرر**
      const response = await api.get(`/branches/${user.branch_id}/games`);
      // أو: await api.get(`/api/games?branch_id=${user.branch_id}`);
      
      if (response.success) {
        setBranchGames(response.data);
        setError(null);
      } else {
        setError(response.message || 'فشل في تحميل ألعاب الفرع');
        setBranchGames([]);
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل ألعاب الفرع:', error);
      setError('تعذر الاتصال بالخادم');
      setBranchGames([]);
    }
  };
  
  const loadBranchData = async () => {
    if (!user?.branch_id) return;
    
    try {
      console.log(`🏬 جاري تحميل بيانات الفرع ${user.branch_id}...`);
      
      // ⚡ **تعديل المسار: إزالة api المكرر**
      const response = await api.get(`/branches/${user.branch_id}`);
      
      if (response.success) {
        setBranch(response.data);
        setError(null);
      } else {
        setError(response.message || 'فشل في تحميل بيانات الفرع');
        setBranch(null);
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل بيانات الفرع:', error);
      setError('تعذر الاتصال بالخادم');
      setBranch(null);
    }
  };
  
  const refreshData = async () => {
    if (!user?.branch_id) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadBranchData(),
        loadBranchGames()
      ]);
    } catch (error) {
      console.error('❌ خطأ في تحديث البيانات:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.branch_id) {
      refreshData();
    }
  }, [user?.branch_id]);
  
  return (
    <RentalContext.Provider value={{
      branchGames,
      branch,
      loading,
      error,
      refreshData,
      loadBranchGames,
      loadBranchData
    }}>
      {children}
    </RentalContext.Provider>
  );
};