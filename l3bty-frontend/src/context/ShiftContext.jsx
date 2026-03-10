import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ShiftContext = createContext();

export const useShift = () => {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error('useShift must be used within a ShiftProvider');
  }
  return context;
};

export const ShiftProvider = ({ children }) => {
  const { user } = useAuth();
  const [currentShift, setCurrentShift] = useState(null);
  const [shiftStats, setShiftStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // تحميل الشيفت الحالي
  const loadCurrentShift = useCallback(async () => {
    if (!user?.branch_id) return;
    
    setLoading(true);
    try {
      const response = await api.getCurrentShift();
      if (response?.success && response.data) {
        setCurrentShift(response.data);
        setShiftStats(response.data);
      } else {
        setCurrentShift(null);
        setShiftStats(null);
      }
    } catch (err) {
      console.error('خطأ في تحميل الشيفت:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.branch_id]);

  // بدء شيفت جديد
  const startShift = useCallback(async (openingCash = 0) => {
    if (!user?.branch_id) {
      setError('لا يوجد فرع محدد');
      return false;
    }

    setLoading(true);
    try {
      const response = await api.startShift(openingCash);
      if (response?.success && response.data) {
        setCurrentShift(response.data);
        setShiftStats(response.data);
        return true;
      } else {
        setError(response?.message || 'فشل بدء الشيفت');
        return false;
      }
    } catch (err) {
      console.error('خطأ في بدء الشيفت:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.branch_id]);

  // إنهاء الشيفت
  const endShift = useCallback(async (closingCash = 0, notes = '') => {
    if (!currentShift?.id) {
      setError('لا يوجد شيفت نشط');
      return false;
    }

    setLoading(true);
    try {
      const response = await api.endShift(currentShift.id, {
        closing_cash: closingCash,
        notes
      });
      
      if (response?.success) {
        setCurrentShift(null);
        setShiftStats(null);
        return true;
      } else {
        setError(response?.message || 'فشل إنهاء الشيفت');
        return false;
      }
    } catch (err) {
      console.error('خطأ في إنهاء الشيفت:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentShift]);

  return (
    <ShiftContext.Provider value={{
      currentShift,
      shiftStats,
      loading,
      error,
      loadCurrentShift,
      startShift,
      endShift
    }}>
      {children}
    </ShiftContext.Provider>
  );
};