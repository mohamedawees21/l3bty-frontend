import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Gamepad2, Activity, History, RefreshCw, X,
  ShoppingCart, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useShift } from '../../hooks/useShift';
import { useRentals } from '../../hooks/useRentals';

// استيراد المكونات
import ShiftStatusBar from './ShiftStatusBar';
import GamesGrid from './GamesGrid';
import EnhancedCart from './EnhancedCart';
import ActiveRentalsTable from './ActiveRentalsTable';
import CompletedRentalsTable from './CompletedRentalsTable';
import QuickStats from './QuickStats';
import GamesDropdown from './GamesDropdown';
import ReceiptPrinter from './ReceiptPrinter';

// استيراد المودالات
import RentalDetailsModal from './RentalModals/RentalDetailsModal';
import CancelRentalModal from './RentalModals/CancelRentalModal';
import CompleteOpenModal from './RentalModals/CompleteOpenModal';
import EarlyEndModal from './RentalModals/EarlyEndModal';
import ModifyRentalModal from './RentalModals/ModifyRentalModal';

// استيراد المكونات العامة
import Toast from '../ui/Toast';
import Spinner from '../ui/Spinner';

// استيراد الثوابت والدوال المساعدة
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../utils/constants';

const Rentals = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'employee';
  const isManager = userRole === 'admin' || userRole === 'branch_manager';

  // الهوكس المخصصة
  const {
    currentShift,
    shiftStats,
    loading: shiftLoading,
    startShift,
    endShift
  } = useShift(user?.branch_id);

  const {
    games,
    activeRentals,
    completedRentals,
    rentalItems,
    completedItems,
    loading: rentalsLoading,
    loadGames,
    loadActiveRentals,
    loadCompletedRentals,
    createRental,
    completeOpenRental,
    cancelRental,
    earlyEndRental,
    modifyRental,
    deleteRental,
    refreshRentals
  } = useRentals(currentShift, isManager);

  // حالة واجهة المستخدم
  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [showGamesDropdown, setShowGamesDropdown] = useState(false);
  const [showActiveTable, setShowActiveTable] = useState(true);
  const [showCompletedTable, setShowCompletedTable] = useState(false);
  const [cartCollapsed, setCartCollapsed] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [modalState, setModalState] = useState({
    details: false,
    completeOpen: false,
    cancel: false,
    earlyEnd: false,
    modify: false
  });

  // حالة التنبيهات
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // المراجع
  const activeRentalsRef = useRef(null);
  const gamesGridRef = useRef(null);

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    if (user?.branch_id) {
      loadGames(user.branch_id);
    }
  }, [user?.branch_id, loadGames]);

  // تحميل التأجيرات عند تغيير الشيفت
  useEffect(() => {
    if (currentShift?.id) {
      loadActiveRentals();
      if (isManager) {
        loadCompletedRentals();
      }
    }
  }, [currentShift?.id, loadActiveRentals, loadCompletedRentals, isManager]);

  // تحديث دوري للتأجيرات النشطة
  useEffect(() => {
    if (!currentShift?.id) return;
    
    const interval = setInterval(() => {
      loadActiveRentals();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [currentShift?.id, loadActiveRentals]);

  // ========== دوال إدارة السلة ==========
  const handleAddToCart = useCallback((game) => {
    if (!currentShift && userRole === 'employee') {
      setToast({ show: true, type: 'error', message: ERROR_MESSAGES.NO_SHIFT });
      return;
    }

    const newItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      game_id: game.id,
      game_name: game.name,
      game_image: game.image_url,
      price_per_15min: game.price_per_15min || 0,
      rental_type: 'fixed',
      duration_minutes: 15,
      quantity: 1,
      child_name: ''
    };

    setCartItems(prev => [...prev, newItem]);
    setShowGamesDropdown(false);
    setToast({ show: true, type: 'success', message: SUCCESS_MESSAGES.GAME_ADDED });
  }, [currentShift, userRole]);

  const handleUpdateCartItem = useCallback((itemId, updates) => {
    setCartItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, ...updates } : item)
    );
  }, []);

  const handleRemoveCartItem = useCallback((itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setCustomerInfo({ name: '', phone: '' });
  }, []);

  // ========== دوال إنشاء التأجير ==========
  const handleCreateRental = useCallback(async (paymentData) => {
    if (!currentShift) {
      setToast({ show: true, type: 'error', message: ERROR_MESSAGES.NO_SHIFT });
      return;
    }

    if (cartItems.length === 0) {
      setToast({ show: true, type: 'error', message: ERROR_MESSAGES.CART_EMPTY });
      return;
    }

    if (!customerInfo.name?.trim()) {
      setToast({ show: true, type: 'error', message: ERROR_MESSAGES.CUSTOMER_NAME_REQUIRED });
      return;
    }

    const result = await createRental(cartItems, customerInfo, paymentData);

    if (result.success) {
      setToast({
        show: true,
        type: 'success',
        message: `✅ تم إنشاء ${result.count} تأجير للعميل ${customerInfo.name}`
      });
      handleClearCart();

      // عرض الفاتورة لأول تأجير
      if (result.rentals && result.rentals.length > 0) {
        setSelectedRental(result.rentals[0]);
        setShowReceipt(true);
      }
    } else {
      setToast({ show: true, type: 'error', message: result.error });
    }
  }, [currentShift, cartItems, customerInfo, createRental, handleClearCart]);

  // ========== إدارة المودالات ==========
  const openModal = useCallback((modalName, rental) => {
    setSelectedRental(rental);
    setModalState(prev => ({ ...prev, [modalName]: true }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setModalState(prev => ({ ...prev, [modalName]: false }));
    setSelectedRental(null);
  }, []);

  // ========== حساب الإحصائيات السريعة ==========
  const quickStats = useMemo(() => ({
    activeCount: activeRentals?.length || 0,
    completedCount: completedRentals?.length || 0,
    totalRevenue: completedRentals?.reduce((sum, r) => 
      sum + (r.final_amount || r.total_amount || 0), 0) || 0,
    itemsInCart: cartItems.length
  }), [activeRentals, completedRentals, cartItems]);

  // ========== إخفاء التوست ==========
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, type: '', message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const isLoading = shiftLoading.shift || rentalsLoading.games;

  return (
    <div className="rentals-page" dir="rtl">
      {/* شريط حالة الشيفت */}
      <ShiftStatusBar
        currentShift={currentShift}
        shiftStats={shiftStats}
        onStartShift={startShift}
        onEndShift={endShift}
        loading={shiftLoading}
        userRole={userRole}
        activeRentals={activeRentals}
        completedRentals={completedRentals}
      />

      {/* رأس الصفحة */}
      <div className="page-header">
        <div className="header-title">
          <h1>
            <Gamepad2 size={24} />
            صفحة التأجير
          </h1>
          <div className="branch-info">
            <span className="branch-name">{user?.branch_name || 'الفرع الرئيسي'}</span>
          </div>
        </div>

        <div className="header-actions">
          <button
            className={`action-btn ${showActiveTable ? 'active' : ''}`}
            onClick={() => setShowActiveTable(!showActiveTable)}
          >
            <Activity size={18} />
            <span>نشط ({activeRentals?.length || 0})</span>
          </button>

          {isManager && (
            <button
              className={`action-btn ${showCompletedTable ? 'active' : ''}`}
              onClick={() => {
                setShowCompletedTable(!showCompletedTable);
                if (!showCompletedTable) loadCompletedRentals();
              }}
            >
              <History size={18} />
              <span>مكتمل ({completedRentals?.length || 0})</span>
            </button>
          )}

          <button
            className="action-btn refresh"
            onClick={refreshRentals}
            disabled={rentalsLoading.rentals || rentalsLoading.completed}
          >
            <RefreshCw size={18} className={rentalsLoading.rentals ? 'spinner' : ''} />
          </button>

          <button
            className="action-btn cart-toggle"
            onClick={() => setCartCollapsed(!cartCollapsed)}
          >
            {cartCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            <ShoppingCart size={18} />
            {cartItems.length > 0 && <span className="cart-badge">{cartItems.length}</span>}
          </button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="main-content">
        {/* السلة الجانبية */}
        <div className={`cart-sidebar ${cartCollapsed ? 'collapsed' : ''}`}>
          <EnhancedCart
            items={cartItems}
            onUpdateItem={handleUpdateCartItem}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            customerInfo={customerInfo}
            onCustomerInfoChange={(field, value) =>
              setCustomerInfo(prev => ({ ...prev, [field]: value }))
            }
            onSubmit={handleCreateRental}
            isSubmitting={rentalsLoading.processing}
            onAddGame={() => setShowGamesDropdown(true)}
            currentShift={currentShift}
            userRole={userRole}
            onClose={() => setCartCollapsed(true)}
          />
        </div>

        {/* شبكة الألعاب */}
        <div className={`games-section ${cartCollapsed ? 'expanded' : ''}`}>
          <GamesGrid
            games={games}
            branchId={user?.branch_id}
            onAddToCart={handleAddToCart}
            loading={rentalsLoading.games}
            currentShift={currentShift}
            userRole={userRole}
            onOpenDropdown={() => setShowGamesDropdown(true)}
            ref={gamesGridRef}
          />
        </div>
      </div>

      {/* الإحصائيات السريعة */}
      <QuickStats stats={quickStats} />

      {/* الجداول */}
      <div className="tables-container">
        {showActiveTable && (
          <div className="table-wrapper active-rentals">
            <div className="table-header">
              <h3>
                <Activity size={18} />
                التأجيرات النشطة
                <span className="count">{activeRentals?.length || 0}</span>
              </h3>
            </div>
            <ActiveRentalsTable
              rentals={activeRentals}
              items={rentalItems}
              loading={rentalsLoading}
              onComplete={(rental) => openModal('completeOpen', rental)}
              onCancel={(rental) => openModal('cancel', rental)}
              onEarlyEnd={(rental) => openModal('earlyEnd', rental)}
              onModify={(rental) => openModal('modify', rental)}
              onViewDetails={(rental) => openModal('details', rental)}
              currentShift={currentShift}
              userRole={userRole}
              onRefresh={loadActiveRentals}
              activeRentalsRef={activeRentalsRef}
              onClose={() => setShowActiveTable(false)}
            />
          </div>
        )}

        {showCompletedTable && isManager && (
          <div className="table-wrapper completed-rentals">
            <div className="table-header">
              <h3>
                <History size={18} />
                التأجيرات المكتملة
                <span className="count">{completedRentals?.length || 0}</span>
              </h3>
            </div>
            <CompletedRentalsTable
              rentals={completedRentals}
              items={completedItems}
              loading={rentalsLoading}
              onViewDetails={(rental) => openModal('details', rental)}
              onDeleteRental={deleteRental}
              currentShift={currentShift}
              onRefresh={loadCompletedRentals}
              onClose={() => setShowCompletedTable(false)}
              userRole={userRole}
            />
          </div>
        )}
      </div>

      {/* القائمة المنبثقة للألعاب */}
      <GamesDropdown
        games={games}
        onSelectGame={handleAddToCart}
        onClose={() => setShowGamesDropdown(false)}
        isOpen={showGamesDropdown}
        currentShift={currentShift}
        userRole={userRole}
        branchId={user?.branch_id}
      />

      {/* فاتورة التأجير */}
      <ReceiptPrinter
        rental={selectedRental}
        onClose={() => setShowReceipt(false)}
        isOpen={showReceipt}
        branchName={user?.branch_name}
      />

      {/* المودالات */}
      <RentalDetailsModal
        show={modalState.details}
        onClose={() => closeModal('details')}
        rental={selectedRental}
        items={[...rentalItems, ...completedItems]}
      />

      <CompleteOpenModal
        show={modalState.completeOpen}
        onClose={() => closeModal('completeOpen')}
        rental={selectedRental}
        items={rentalItems}
        onConfirm={completeOpenRental}
      />

      <CancelRentalModal
        show={modalState.cancel}
        onClose={() => closeModal('cancel')}
        rental={selectedRental}
        items={rentalItems}
        onConfirm={cancelRental}
      />

      <EarlyEndModal
        show={modalState.earlyEnd}
        onClose={() => closeModal('earlyEnd')}
        rental={selectedRental}
        items={rentalItems}
        onConfirm={earlyEndRental}
      />

      <ModifyRentalModal
        show={modalState.modify}
        onClose={() => closeModal('modify')}
        rental={selectedRental}
        items={rentalItems}
        games={games}
        onConfirm={modifyRental}
      />

      {/* التنبيهات */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ show: false, type: '', message: '' })}
        />
      )}

      {/* شاشة التحميل */}
      {isLoading && <Spinner fullScreen />}
    </div>
  );
};

export default Rentals;