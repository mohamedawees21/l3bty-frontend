import { useState, useCallback } from 'react';
import api from '../services/api';
import { ERROR_MESSAGES } from '../utils/constants';
import { calculateItemTotal } from '../utils/formatters';

export const useRentals = (currentShift, isManager) => {
  const [games, setGames] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [completedRentals, setCompletedRentals] = useState([]);
  const [rentalItems, setRentalItems] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);
  const [loading, setLoading] = useState({
    games: false,
    rentals: false,
    completed: false,
    processing: false
  });
  const [error, setError] = useState(null);

  // تحميل الألعاب
  const loadGames = useCallback(async (branchId) => {
    if (!branchId) return;
    
    setLoading(prev => ({ ...prev, games: true }));
    setError(null);
    
    try {
      console.log('🔄 جاري تحميل الألعاب للفرع:', branchId);
      const response = await api.getGames({ branch_id: branchId });
      
      if (response && response.success) {
        setGames(response.data || []);
        console.log('✅ تم تحميل', response.data?.length, 'لعبة');
      } else {
        setGames([]);
        setError('فشل تحميل الألعاب');
      }
    } catch (err) {
      console.error('❌ خطأ في تحميل الألعاب:', err);
      setGames([]);
      setError(err.message || ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(prev => ({ ...prev, games: false }));
    }
  }, []);

  // تحميل التأجيرات النشطة
  const loadActiveRentals = useCallback(async () => {
    if (!currentShift?.id) {
      setActiveRentals([]);
      setRentalItems([]);
      return;
    }
    
    setLoading(prev => ({ ...prev, rentals: true }));
    
    try {
      console.log('🔄 جاري تحميل التأجيرات النشطة للشيفت:', currentShift.id);
      const response = await api.getActiveRentals(currentShift.id);
      
      if (response && response.success) {
        const rentals = response.data || [];
        
        // معالجة التأجيرات للتأكد من وجود items
        const processedRentals = rentals.map(rental => ({
          ...rental,
          items: rental.items || []
        }));
        
        setActiveRentals(processedRentals);
        
        // جمع كل items التأجيرات النشطة
        const allItems = [];
        processedRentals.forEach(rental => {
          if (rental.items && rental.items.length) {
            allItems.push(...rental.items);
          }
        });
        setRentalItems(allItems);
        
        console.log('✅ تم تحميل:', {
          rentals: processedRentals.length,
          items: allItems.length
        });
      } else {
        setActiveRentals([]);
        setRentalItems([]);
      }
    } catch (err) {
      console.error('❌ خطأ في تحميل التأجيرات النشطة:', err);
      setActiveRentals([]);
      setRentalItems([]);
    } finally {
      setLoading(prev => ({ ...prev, rentals: false }));
    }
  }, [currentShift?.id]);

  // تحميل التأجيرات المكتملة
  const loadCompletedRentals = useCallback(async () => {
    if (!isManager || !currentShift?.id) {
      setCompletedRentals([]);
      setCompletedItems([]);
      return;
    }
    
    setLoading(prev => ({ ...prev, completed: true }));
    
    try {
      console.log('🔄 جاري تحميل التأجيرات المكتملة للشيفت:', currentShift.id);
      const response = await api.getCompletedRentals({ 
        shift_id: currentShift.id, 
        limit: 100,
        include_refunded: true
      });
      
      if (response && response.success) {
        const rentals = response.data || [];
        setCompletedRentals(rentals);
        
        // جمع كل items التأجيرات المكتملة
        const allItems = [];
        rentals.forEach(rental => {
          if (rental.items && rental.items.length) {
            allItems.push(...rental.items);
          }
        });
        setCompletedItems(allItems);
        
        console.log('✅ تم تحميل:', {
          rentals: rentals.length,
          items: allItems.length
        });
      } else {
        setCompletedRentals([]);
        setCompletedItems([]);
      }
    } catch (err) {
      console.error('❌ خطأ في تحميل التأجيرات المكتملة:', err);
      setCompletedRentals([]);
      setCompletedItems([]);
    } finally {
      setLoading(prev => ({ ...prev, completed: false }));
    }
  }, [currentShift?.id, isManager]);

  // إنشاء تأجير جديد
  const createRental = useCallback(async (cartItems, customerInfo, paymentData) => {
    if (!currentShift) {
      return { success: false, error: ERROR_MESSAGES.NO_SHIFT };
    }

    setLoading(prev => ({ ...prev, processing: true }));
    
    try {
      const createdRentals = [];
      const createdItems = [];

      for (const item of cartItems) {
        const itemDuration = item.rental_type === 'fixed' ? (item.duration_minutes || 15) : null;
        
        const rentalData = {
          shift_id: currentShift.id,
          customer_name: customerInfo.name.trim(),
          customer_phone: customerInfo.phone || null,
          items: [{
            game_id: item.game_id,
            child_name: item.child_name || null,
            duration_minutes: itemDuration,
            quantity: item.quantity,
            rental_type: item.rental_type,
            price_per_15min: item.price_per_15min
          }]
        };

        const response = await api.createRental(rentalData);
        
        if (response && response.success && response.data) {
          createdRentals.push(response.data);
          if (response.data.items) {
            createdItems.push(...response.data.items);
          }
        } else {
          throw new Error(response?.message || 'فشل إنشاء التأجير');
        }
      }

      if (createdRentals.length > 0) {
        setActiveRentals(prev => [...prev, ...createdRentals]);
        setRentalItems(prev => [...prev, ...createdItems]);
        
        return {
          success: true,
          rentals: createdRentals,
          items: createdItems,
          count: createdRentals.length
        };
      } else {
        return { success: false, error: 'فشل إنشاء التأجيرات' };
      }
      
    } catch (err) {
      console.error('❌ خطأ في إنشاء التأجير:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [currentShift]);

  // إنهاء تأجير مفتوح
  const completeOpenRental = useCallback(async (rental, data) => {
    if (!rental) return { success: false, error: 'لا يوجد تأجير' };
    
    setLoading(prev => ({ ...prev, processing: true }));
    
    try {
      const response = await api.completeOpenTime(rental.id, {
        payment_method: data.payment_method,
        actual_minutes: data.actual_minutes,
        final_amount: data.final_amount
      });

      if (response && response.success) {
        await loadActiveRentals();
        if (isManager) await loadCompletedRentals();
        return { success: true };
      } else {
        return { success: false, error: response?.message };
      }
    } catch (err) {
      console.error('❌ خطأ في إنهاء التأجير:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [loadActiveRentals, loadCompletedRentals, isManager]);

  // إلغاء تأجير
  const cancelRental = useCallback(async (rental, data) => {
    if (!rental) return { success: false, error: 'لا يوجد تأجير' };
    
    setLoading(prev => ({ ...prev, processing: true }));
    
    try {
      const response = await api.cancelRental(rental.id, data.reason);

      if (response && response.success) {
        await loadActiveRentals();
        if (isManager) await loadCompletedRentals();
        return { success: true };
      } else {
        return { success: false, error: response?.message };
      }
    } catch (err) {
      console.error('❌ خطأ في إلغاء التأجير:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [loadActiveRentals, loadCompletedRentals, isManager]);

  // إنهاء مبكر (استرداد كامل)
  const earlyEndRental = useCallback(async (rental, data) => {
    if (!rental) return { success: false, error: 'لا يوجد تأجير' };
    
    setLoading(prev => ({ ...prev, processing: true }));
    
    try {
      const response = await api.earlyEndRental(rental.id, {
        reason: data.reason,
        refund_amount: data.refund_amount,
        elapsed_minutes: data.elapsed_minutes
      });

      if (response && response.success) {
        await loadActiveRentals();
        if (isManager) await loadCompletedRentals();
        return { success: true };
      } else {
        return { success: false, error: response?.message };
      }
    } catch (err) {
      console.error('❌ خطأ في الإنهاء المبكر:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [loadActiveRentals, loadCompletedRentals, isManager]);

  // تعديل تأجير
  const modifyRental = useCallback(async (rental, data) => {
    if (!rental) return { success: false, error: 'لا يوجد تأجير' };
    
    setLoading(prev => ({ ...prev, processing: true }));
    
    try {
      const response = await api.modifyRental(rental.id, {
        old_game_id: data.old_game_id,
        new_game_id: data.new_game_id,
        price_difference: data.price_difference
      });

      if (response && response.success) {
        await loadActiveRentals();
        return { success: true };
      } else {
        return { success: false, error: response?.message };
      }
    } catch (err) {
      console.error('❌ خطأ في تعديل التأجير:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [loadActiveRentals]);

  // حذف تأجير
  const deleteRental = useCallback(async (rental) => {
    if (!rental) return { success: false, error: 'لا يوجد تأجير' };
    
    setLoading(prev => ({ ...prev, processing: true }));
    
    try {
      const response = await api.deleteRental(rental.id);

      if (response && response.success) {
        await loadCompletedRentals();
        return { success: true };
      } else {
        return { success: false, error: response?.message };
      }
    } catch (err) {
      console.error('❌ خطأ في حذف التأجير:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [loadCompletedRentals]);

  // تحديث جميع البيانات
  const refreshRentals = useCallback(() => {
    loadActiveRentals();
    if (isManager) loadCompletedRentals();
  }, [loadActiveRentals, loadCompletedRentals, isManager]);

  return {
    // البيانات
    games,
    activeRentals,
    completedRentals,
    rentalItems,
    completedItems,
    loading,
    error,
    
    // دوال التحميل
    loadGames,
    loadActiveRentals,
    loadCompletedRentals,
    refreshRentals,
    
    // دوال العمليات
    createRental,
    completeOpenRental,
    cancelRental,
    earlyEndRental,
    modifyRental,
    deleteRental
  };
};