import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';

export const useShift = (branchId) => {
  const [currentShift, setCurrentShift] = useState(null);
  const [shiftStats, setShiftStats] = useState(null);
  const [loading, setLoading] = useState({
    shift: false,
    start: false,
    end: false
  });
  const [error, setError] = useState(null);

  // تحميل الشيفت الحالي
  const loadCurrentShift = useCallback(async () => {
    setLoading(prev => ({ ...prev, shift: true }));
    setError(null);
    
    try {
      console.log('🔄 جاري تحميل الشيفت الحالي');
      const response = await api.getCurrentShift();
      
      if (response && response.success && response.data) {
        setCurrentShift(response.data);
        setShiftStats(response.data);
        console.log('✅ تم تحميل الشيفت:', response.data);
      } else {
        setCurrentShift(null);
        setShiftStats(null);
      }
    } catch (err) {
      console.error('❌ خطأ في تحميل الشيفت:', err);
      setError(ERROR_MESSAGES.NETWORK_ERROR);
      setCurrentShift(null);
      setShiftStats(null);
    } finally {
      setLoading(prev => ({ ...prev, shift: false }));
    }
  }, []);

  // بدء شيفت جديد
  const startShift = useCallback(async (openingCash = 0) => {
    if (!branchId) {
      setError('لا يوجد فرع محدد');
      return false;
    }

    setLoading(prev => ({ ...prev, start: true }));
    setError(null);
    
    try {
      console.log('🔄 بدء شيفت جديد للفرع:', branchId);
      const response = await api.startShift(openingCash);
      
      if (response && response.success && response.data) {
        setCurrentShift(response.data);
        setShiftStats(response.data);
        console.log('✅ تم بدء الشيفت بنجاح:', response.data);
        return true;
      } else {
        setError(response?.message || ERROR_MESSAGES.NETWORK_ERROR);
        return false;
      }
    } catch (err) {
      console.error('❌ خطأ في بدء الشيفت:', err);
      setError(err.message || ERROR_MESSAGES.NETWORK_ERROR);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, start: false }));
    }
  }, [branchId]);

  // إنهاء الشيفت
  const endShift = useCallback(async (closingCash = 0, notes = '') => {
    if (!currentShift?.id) {
      setError('لا يوجد شيفت نشط');
      return false;
    }

    setLoading(prev => ({ ...prev, end: true }));
    setError(null);
    
    try {
      console.log('🔄 إنهاء الشيفت:', currentShift.id);
      const response = await api.endShift(currentShift.id, {
        closing_cash: closingCash,
        notes
      });
      
      if (response && response.success) {
        setCurrentShift(null);
        setShiftStats(null);
        console.log('✅ تم إنهاء الشيفت بنجاح');
        return true;
      } else {
        setError(response?.message || ERROR_MESSAGES.NETWORK_ERROR);
        return false;
      }
    } catch (err) {
      console.error('❌ خطأ في إنهاء الشيفت:', err);
      setError(err.message || ERROR_MESSAGES.NETWORK_ERROR);
      return false;
    } finally {
      setLoading(prev => ({ ...prev, end: false }));
    }
  }, [currentShift]);

  // تحميل الشيفت عند تغيير الفرع
  useEffect(() => {
    if (branchId) {
      loadCurrentShift();
    }
  }, [branchId, loadCurrentShift]);

  return {
    currentShift,
    shiftStats,
    loading,
    error,
    startShift,
    endShift,
    loadCurrentShift,
    refreshShift: loadCurrentShift
  };
};