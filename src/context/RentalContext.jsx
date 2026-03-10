import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useShift } from './ShiftContext';
import api from '../services/api';

const RentalContext = createContext();

export const useRentals = () => {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error('useRentals must be used within a RentalProvider');
  }
  return context;
};

export const RentalProvider = ({ children }) => {
  const { user } = useAuth();
  const { currentShift } = useShift();
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

  const isManager = user?.role === 'admin' || user?.role === 'branch_manager';

  // تحميل الألعاب
  const loadGames = useCallback(async () => {
    if (!user?.branch_id) return;
    
    setLoading(prev => ({ ...prev, games: true }));
    try {
      const response = await api.getGames({ branch_id: user.branch_id });
      if (response?.success) {
        setGames(response.data || []);
      }
    } catch (err) {
      console.error('خطأ في تحميل الألعاب:', err);
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, games: false }));
    }
  }, [user?.branch_id]);

  // تحميل التأجيرات النشطة
  const loadActiveRentals = useCallback(async () => {
    if (!currentShift?.id) {
      setActiveRentals([]);
      setRentalItems([]);
      return;
    }
    
    setLoading(prev => ({ ...prev, rentals: true }));
    try {
      const response = await api.getActiveRentals(currentShift.id);
      if (response?.success) {
        const rentals = response.data || [];
        setActiveRentals(rentals);
        
        const allItems = [];
        rentals.forEach(rental => {
          if (rental.items?.length) {
            allItems.push(...rental.items);
          }
        });
        setRentalItems(allItems);
      }
    } catch (err) {
      console.error('خطأ في تحميل التأجيرات النشطة:', err);
      setError(err.message);
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
      const response = await api.getCompletedRentals({ 
        shift_id: currentShift.id, 
        limit: 100,
        include_refunded: true
      });
      
      if (response?.success) {
        const rentals = response.data || [];
        setCompletedRentals(rentals);
        
        const allItems = [];
        rentals.forEach(rental => {
          if (rental.items?.length) {
            allItems.push(...rental.items);
          }
        });
        setCompletedItems(allItems);
      }
    } catch (err) {
      console.error('خطأ في تحميل التأجيرات المكتملة:', err);
      setError(err.message);
    } finally {
      setLoading(prev => ({ ...prev, completed: false }));
    }
  }, [currentShift?.id, isManager]);

  // إنشاء تأجير
  const createRental = useCallback(async (cartItems, customerInfo, paymentData) => {
    if (!currentShift) {
      return { success: false, error: '❌ لا يوجد شيفت نشط' };
    }

    setLoading(prev => ({ ...prev, processing: true }));
    try {
      const createdRentals = [];
      const createdItems = [];

      for (const item of cartItems) {
        const rentalData = {
          shift_id: currentShift.id,
          customer_name: customerInfo.name.trim(),
          customer_phone: customerInfo.phone || null,
          items: [{
            game_id: item.game_id,
            child_name: item.child_name || null,
            duration_minutes: item.rental_type === 'fixed' ? item.duration_minutes : null,
            quantity: item.quantity,
            rental_type: item.rental_type,
            price_per_15min: item.price_per_15min
          }]
        };

        const response = await api.createRental(rentalData);
        
        if (response?.success && response.data) {
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
      }
      
      return { success: false, error: 'فشل إنشاء التأجيرات' };
      
    } catch (err) {
      console.error('خطأ في إنشاء التأجير:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [currentShift]);

  return (
    <RentalContext.Provider value={{
      games,
      activeRentals,
      completedRentals,
      rentalItems,
      completedItems,
      loading,
      error,
      loadGames,
      loadActiveRentals,
      loadCompletedRentals,
      createRental
    }}>
      {children}
    </RentalContext.Provider>
  );
};