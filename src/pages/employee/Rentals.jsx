// src/pages/employee/Rentals.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Gamepad2, Clock, User, Phone, ShoppingCart, DollarSign, 
  CheckCircle, XCircle, Eye, Plus, Minus, Trash2, Calendar,
  Printer, Download, RefreshCw, AlertCircle, Check, X,
  Building, Zap, Lock, Unlock, Loader2, Filter, Search,
  ChevronRight, MapPin, Mail, Users, Package, RotateCcw, Calculator,
  Play, Pause, StopCircle, AlertTriangle,
  Info, LogOut, Save, Edit, CreditCard, Wallet, Hash, Timer,
  Award, BarChart, TrendingUp, Activity, Gift, Star, Smile,
  Coffee, Sun, Moon, Watch, Hourglass, Coffee as CoffeeIcon,
  Image as ImageIcon, Upload, Camera, Grid, List, Settings,
  Shield, UserCog, Ban, Key, Bell, Globe, Layers, RefreshCw as RefreshIcon,
  ArrowLeftRight, Undo2, RotateCcw as RotateIcon, History, Archive
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Rentals.css';

// ==================== ثوابت النظام ====================
const PAYMENT_METHODS = [
  { value: 'cash', label: '💵 نقدي', icon: DollarSign },
  { value: 'card', label: '💳 بطاقة', icon: CreditCard },
  { value: 'wallet', label: '📱 محفظة', icon: Wallet },
  { value: 'points', label: '⭐ نقاط', icon: Star }
];

const RENTAL_TYPES = [
  { value: 'fixed', label: '⏰ وقت ثابت', color: '#3498db' },
  { value: 'open', label: '🔓 وقت مفتوح', color: '#f39c12' }
];

// ==================== دوال المساعدة العامة ====================
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') return '0 ج.م';
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
};

const formatDateTime = (dateString) => {
  if (!dateString) return '--/--/---- --:--';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--/--/---- --:--';
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '--/--/---- --:--';
  }
};

const formatTime = (dateString) => {
  if (!dateString) return '--:--';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '--:--';
  }
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const start = new Date(dateString);
  const now = new Date();
  const minutes = Math.floor((now - start) / (1000 * 60));
  
  if (minutes < 1) return 'الآن';
  if (minutes === 1) return 'منذ دقيقة';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return 'منذ ساعة';
  if (hours < 24) return `منذ ${hours} ساعة`;
  
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
};

const calculateDuration = (startTime, endTime = new Date()) => {
  if (!startTime) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  return Math.max(0, Math.round((end - start) / (1000 * 60)));
};

const GameImage = ({ src, alt, className, size = 'medium' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');

  // قائمة الصور المتاحة مع مساراتها الصحيحة
  const imageMap = {
    // الأسماء العربية
    'سيارة': '/images/Car.jpg',
    'سيارات': '/images/Car.jpg',
    'كار': '/images/Car.jpg',
    'درفت': '/images/Driftcar.jpg',
    'دريفت': '/images/Driftcar.jpg',
    'درفت كار': '/images/Driftcar.jpg',
    'هارلي': '/images/harley.jpg',
    'هارلي ديفيدسون': '/images/harley.jpg',
    'هوفر بورد': '/images/Hoverboard.jpg',
    'هوفر': '/images/Hoverboard.jpg',
    'hoverboard': '/images/Hoverboard.jpg',
    'لعبتي': '/images/I3bty.png',
    'لعبتى': '/images/I3bty.png',
    'l3bty': '/images/I3bty.png',
    'موتور': '/images/Motor.jpg',
    'موتوسيكل': '/images/motorcycle.jpg',
    'motorcycle': '/images/motorcycle.jpg',
    'نينبوت': '/images/Ninebot.jpg',
    'ninebot': '/images/Ninebot.jpg',
    'بينج بونج': '/images/pingpong.jpg',
    'بينغ بونغ': '/images/pingpong.jpg',
    'تنس طاولة': '/images/pingpong.jpg',
    'pingpong': '/images/pingpong.jpg',
    'بلايستيشن': '/images/playstation.jpg',
    'playstation': '/images/playstation.jpg',
    'ps': '/images/playstation.jpg',
    'ps4': '/images/playstation.jpg',
    'ps5': '/images/playstation.jpg',
    'سكوتر': '/images/Scooter.jpg',
    'scooter': '/images/Scooter.jpg',
    'سيغوي': '/images/Segway.jpg',
    'segway': '/images/Segway.jpg',
    'سيميوليتور': '/images/Simulator.jpg',
    'محاكي': '/images/Simulator.jpg',
    'simulator': '/images/Simulator.jpg',
    'سكيت': '/images/Skate.jpg',
    'skate': '/images/Skate.jpg',
    'ترامبولين': '/images/Trampoline.jpg',
    'trampoline': '/images/Trampoline.jpg',
    'vr': '/images/VR.jpg',
    'واقع افتراضي': '/images/VR.jpg',
    'ووتر سلايد': '/images/waterslide.jpg',
    'waterslide': '/images/waterslide.jpg',
    'زحليقة': '/images/waterslide.jpg',
    'عجلة': '/images/wheel.jpg',
    'wheel': '/images/wheel.jpg',
    'دراجة': '/images/wheel.jpg'
  };

const getImagePath = useCallback((gameName, imageUrl) => {
  // لو فيه صورة من API كاملة
  if (imageUrl) {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    if (imageUrl.includes('.')) {
      return `/images/${imageUrl}`;
    }
  }

  if (gameName) {
    const gameNameLower = gameName.toLowerCase();

    for (const [key, value] of Object.entries(imageMap)) {
      if (gameNameLower.includes(key.toLowerCase())) {
        return value; // 👈 بدون دومين
      }
    }
  }

  return '/images/playstation.jpg';
}, []);

  // تحديث مصدر الصورة عند تغير البيانات
  useEffect(() => {
    const path = getImagePath(alt, src);
    setCurrentSrc(path);
    console.log('🖼️ تحميل صورة:', { 
      gameName: alt, 
      originalSrc: src, 
      finalPath: path 
    });
  }, [src, alt, getImagePath]);

 

  return (
    <div className={`game-image-container ${className} ${imageLoaded ? 'loaded' : 'loading'}`}>
      {!imageLoaded && !imageError && (
        <div className="image-placeholder">
          <ImageIcon size={size === 'large' ? 48 : 24} />
        </div>
      )}
      
      {imageError ? (
        <div className="image-error">
          <ImageIcon size={size === 'large' ? 32 : 16} />
          <span>{alt || 'لا توجد صورة'}</span>
        </div>
      ) : (
        <img
          key={currentSrc} // مهم لإعادة التحميل عند تغير المصدر
          src={currentSrc}
          alt={alt || 'صورة اللعبة'}
          className={`game-image ${imageLoaded ? 'visible' : 'hidden'}`}
          onLoad={() => {
            console.log('✅ تم تحميل الصورة بنجاح:', currentSrc);
            setImageLoaded(true);
            setImageError(false);
          }}
        />
      )}
    </div>
  );
};

// ==================== مكون شريط حالة الشيفت ====================
const ShiftStatusBar = ({
  currentShift,
  shiftStats,
  onStartShift,
  onEndShift,
  loading,
  userRole,
  activeRentals = [],
  completedRentals = []
}) => {
  const [showEndShiftConfirm, setShowEndShiftConfirm] = useState(false);
  const [closingCash, setClosingCash] = useState('');
  const [notes, setNotes] = useState('');
  const [showStats, setShowStats] = useState(false);

  const isManager = userRole === 'admin' || userRole === 'branch_manager';

  const calculateRevenue = useMemo(() => {
    let total = 0;
    
    completedRentals.forEach(rental => {
      if (rental.status === 'completed' && !rental.is_refunded) {
        total += parseFloat(rental.final_amount || rental.total_amount || 0);
      }
    });
    
    activeRentals.forEach(rental => {
      if (rental.rental_type === 'fixed' && rental.payment_status === 'paid') {
        total += parseFloat(rental.total_amount || 0);
      }
    });
    
    return total;
  }, [activeRentals, completedRentals]);

  if (loading) {
    return (
      <div className="shift-status-bar loading">
        <div className="loading-animation">
          <Loader2 className="spinner" size={24} />
          <span>جاري تحميل بيانات الشيفت...</span>
        </div>
      </div>
    );
  }

  if (!currentShift) {
    return (
      <div className="shift-status-bar closed">
        <div className="shift-status-info">
          <div className="status-icon">
            <Lock size={20} />
          </div>
          <div className="status-text">
            <span className="status-title">لا يوجد شيفت نشط</span>
            <span className="status-subtitle">يجب فتح شيفت لبدء العمل</span>
          </div>
        </div>
        <button 
          onClick={onStartShift}
          className="btn btn-success btn-glow"
          disabled={loading}
        >
          <Unlock size={16} />
          فتح شيفت جديد
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="shift-status-bar open">
        <div className="shift-status-info">
          <div className="status-icon pulse">
            <Zap size={20} />
          </div>
          <div className="shift-details">
            <div className="shift-number-badge">
              <Hash size={12} />
              <span>شيفت #{currentShift.shift_number || currentShift.id}</span>
            </div>
            <div className="shift-time">
              <Clock size={12} />
              <span>البداية: {formatDateTime(currentShift.start_time)}</span>
            </div>
          </div>
        </div>

        <div className="shift-stats">
          <div className="shift-stat" onClick={() => setShowStats(!showStats)}>
            <DollarSign size={16} className="stat-icon revenue" />
            <div className="shift-stat-content">
              <span className="shift-stat-label">الإيراد</span>
              <span className="shift-stat-value">{formatCurrency(calculateRevenue)}</span>
            </div>
          </div>

          <div className="shift-stat">
            <Activity size={16} className="stat-icon active" />
            <div className="shift-stat-content">
              <span className="shift-stat-label">نشط</span>
              <span className="shift-stat-value">{activeRentals.length}</span>
            </div>
          </div>

          <div className="shift-stat">
            <History size={16} className="stat-icon completed" />
            <div className="shift-stat-content">
              <span className="shift-stat-label">مكتمل</span>
              <span className="shift-stat-value">{completedRentals.length}</span>
            </div>
          </div>
        </div>

        <div className="shift-actions">
          {isManager && (
            <button 
              onClick={() => setShowStats(!showStats)}
              className="btn btn-outline btn-sm"
              title="عرض الإحصائيات الكاملة"
            >
              <BarChart size={16} />
            </button>
          )}
          <button 
            onClick={() => setShowEndShiftConfirm(true)}
            className="btn btn-warning btn-sm btn-glow"
            disabled={loading}
          >
            <Lock size={16} />
            إنهاء الشيفت
          </button>
        </div>
      </div>

      {showEndShiftConfirm && (
        <div className="modal-overlay">
          <div className="modal modal-end-shift">
            <div className="modal-header">
              <div className="header-icon warning">
                <AlertTriangle size={24} />
              </div>
              <h3>إنهاء الشيفت</h3>
              <button onClick={() => setShowEndShiftConfirm(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <p className="confirmation-text">هل أنت متأكد من إنهاء الشيفت الحالي؟</p>
              
              {activeRentals.length > 0 && (
                <div className="alert alert-warning">
                  <AlertCircle size={16} />
                  <div className="alert-content">
                    <strong>يوجد {activeRentals.length} تأجير نشط</strong>
                    <p>سيتم إغلاقها تلقائياً عند إنهاء الشيفت</p>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>
                  <Wallet size={16} />
                  خزنة الإغلاق (اختياري):
                </label>
                <input
                  type="number"
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                  placeholder="المبلغ الموجود في الخزنة"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>
                  <Info size={16} />
                  ملاحظات:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات عن الشيفت..."
                  rows="3"
                  className="form-control"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                onClick={() => setShowEndShiftConfirm(false)}
                className="btn btn-secondary"
              >
                إلغاء
              </button>
              <button 
                onClick={() => {
                  onEndShift(closingCash, notes);
                  setShowEndShiftConfirm(false);
                }}
                className="btn btn-warning"
                disabled={loading}
              >
                {loading ? <Loader2 className="spinner" size={16} /> : <Lock size={16} />}
                تأكيد إنهاء الشيفت
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ==================== مكون بطاقة اللعبة ====================
const GameCard = ({ game, onAddToCart, isAvailable }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`game-card ${!isAvailable ? 'unavailable' : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => isAvailable && onAddToCart(game)}
    >
      <div className="game-card-image">
        <GameImage 
          src={game.image_url}
          alt={game.name}
          size="medium"
        />
        {!isAvailable && (
          <div className="game-status-badge unavailable">
            <Lock size={16} />
            <span>غير متاحة</span>
          </div>
        )}
      </div>

      <div className="game-card-content">
        <h4 className="game-title">{game.name}</h4>
        
        <div className="game-price">
          <DollarSign size={14} />
          <span className="price-value">{formatCurrency(game.price_per_15min)}</span>
          <span className="price-unit">/ 15 د</span>
        </div>

        <button 
          className={`add-to-cart-btn ${isHovered ? 'visible' : ''}`}
          disabled={!isAvailable}
        >
          <Plus size={16} />
          إضافة للسلة
        </button>
      </div>
    </div>
  );
};

// ==================== مكون شبكة الألعاب ====================
const GamesGrid = ({ 
  games, 
  branchId, 
  onAddToCart, 
  loading,
  currentShift,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const isEmployee = userRole === 'employee';

  const branchGames = useMemo(() => {
    if (!games?.length || !branchId) return [];
    return games.filter(game => 
      game && 
      game.branch_id === branchId && 
      game.is_active
    );
  }, [games, branchId]);

  const categories = useMemo(() => {
    if (!branchGames.length) return [{ value: 'all', label: 'جميع الألعاب' }];
    const cats = [...new Set(branchGames.map(g => g.category).filter(Boolean))];
    return [
      { value: 'all', label: 'جميع الألعاب' },
      ...cats.map(cat => ({ value: cat, label: cat }))
    ];
  }, [branchGames]);

  const filteredGames = useMemo(() => {
    if (!branchGames.length) return [];

    let filtered = branchGames;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(g => g.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(g =>
        g.name?.toLowerCase().includes(term) ||
        g.category?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [branchGames, searchTerm, selectedCategory]);

  const availableGames = useMemo(() => 
    filteredGames.filter(game => game.status !== 'maintenance'),
    [filteredGames]
  );

  if (!currentShift && isEmployee) {
    return (
      <div className="games-section disabled">
        <div className="games-header">
          <h3>
            <Gamepad2 size={24} />
            الألعاب المتاحة
          </h3>
        </div>
        <div className="games-disabled-message">
          <Lock size={48} />
          <p>يجب فتح شيفت أولاً لعرض الألعاب</p>
        </div>
      </div>
    );
  }

  if (loading.games) {
    return (
      <div className="games-section">
        <div className="games-header">
          <h3>
            <Gamepad2 size={24} />
            الألعاب المتاحة
          </h3>
        </div>
        <div className="games-loading">
          <Loader2 className="spinner" size={48} />
          <p>جاري تحميل الألعاب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="games-section">
      <div className="games-header">
        <div className="header-title">
          <Gamepad2 size={24} />
          <h3>
            الألعاب المتاحة
            <span className="games-count">({availableGames.length})</span>
          </h3>
        </div>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="عرض شبكي"
            >
              <Grid size={18} />
            </button>
            <button 
              className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="عرض قائمة"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="games-filters">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="ابحث عن لعبة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {availableGames.length === 0 ? (
        <div className="games-empty">
          <Gamepad2 size={64} />
          <p>لا توجد ألعاب متاحة</p>
        </div>
      ) : (
        <div className={`games-${viewMode}`}>
          {availableGames.map(game => (
            <GameCard
              key={game.id}
              game={game}
              onAddToCart={onAddToCart}
              isAvailable={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== مكون سلة التأجير ====================
const RentalCart = ({
  items,
  onUpdateItem,
  onRemoveItem,
  onClearCart,
  customerInfo,
  onCustomerInfoChange,
  onSubmit,
  isSubmitting,
  games,
  onAddGame,
  currentShift,
  userRole
}) => {
  const [showSummary, setShowSummary] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  const isEmployee = userRole === 'employee';
  const isManager = userRole === 'admin' || userRole === 'branch_manager';

  const calculateItemTotal = useCallback((item) => {
    if (item.rental_type === 'open') return 0;
    const units = Math.ceil((item.duration_minutes || 15) / 15);
    return (item.price_per_15min || 0) * units * (item.quantity || 1);
  }, []);

  const calculateSubtotal = useCallback(() => {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
  }, [items, calculateItemTotal]);

  const calculateTotal = useCallback(() => {
    const subtotal = calculateSubtotal();
    const discountAmount = subtotal * (discount / 100);
    return subtotal - discountAmount;
  }, [calculateSubtotal, discount]);

  const isCartValid = useCallback(() => {
    return items.length > 0 && customerInfo.name?.trim() && currentShift;
  }, [items.length, customerInfo.name, currentShift]);

  if (!currentShift && isEmployee) {
    return (
      <div className="cart-empty">
        <Lock size={48} />
        <h3>الشيفت مغلق</h3>
        <p>يجب فتح شيفت أولاً لبدء التأجير</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <ShoppingCart size={48} />
        <h3>السلة فارغة</h3>
        <p>اختر ألعاباً من القائمة لإضافتها إلى السلة</p>
        <button
          onClick={onAddGame}
          className="btn btn-primary btn-lg"
        >
          <Plus size={18} />
          إضافة لعبة
        </button>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <div className="header-title">
          <ShoppingCart size={20} />
          <h3>
            سلة التأجير
            <span className="cart-count">{items.length}</span>
          </h3>
        </div>
        <div className="header-actions">
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="btn-icon"
            title="عرض الملخص"
          >
            <BarChart size={16} />
          </button>
          <button
            onClick={onClearCart}
            className="btn-icon danger"
            disabled={isSubmitting}
            title="تفريغ السلة"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="cart-items">
        {items.map((item, index) => (
          <div key={item.id || index} className="cart-item">
            <div className="cart-item-header">
              <div className="item-info">
                <Gamepad2 size={14} />
                <span className="item-name">{item.game_name}</span>
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="btn-remove"
                disabled={isSubmitting}
              >
                <X size={14} />
              </button>
            </div>

            <div className="cart-item-details">
              <div className="detail-row">
                <div className="detail-field">
                  <label>النوع:</label>
                  <select
                    value={item.rental_type}
                    onChange={(e) => onUpdateItem(item.id, { rental_type: e.target.value })}
                    disabled={isSubmitting}
                    className="select-small"
                  >
                    {RENTAL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {item.rental_type === 'fixed' && (
                  <div className="detail-field">
                    <label>المدة:</label>
                    <select
                      value={item.duration_minutes || 15}
                      onChange={(e) => onUpdateItem(item.id, { duration_minutes: parseInt(e.target.value) })}
                      disabled={isSubmitting}
                      className="select-small"
                    >
                      <option value="15">15 دقيقة</option>
                      <option value="30">30 دقيقة</option>
                      <option value="45">45 دقيقة</option>
                      <option value="60">60 دقيقة</option>
                      <option value="90">90 دقيقة</option>
                      <option value="120">120 دقيقة</option>
                    </select>
                  </div>
                )}

                <div className="detail-field">
                  <label>الكمية:</label>
                  <div className="quantity-control">
                    <button
                      onClick={() => onUpdateItem(item.id, { quantity: Math.max(1, (item.quantity || 1) - 1) })}
                      className="quantity-btn"
                      disabled={isSubmitting || (item.quantity || 1) <= 1}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="quantity-value">{item.quantity || 1}</span>
                    <button
                      onClick={() => onUpdateItem(item.id, { quantity: (item.quantity || 1) + 1 })}
                      className="quantity-btn"
                      disabled={isSubmitting}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="detail-field full-width">
                <label>
                  <User size={12} />
                  اسم الطفل (اختياري):
                </label>
                <input
                  type="text"
                  value={item.child_name || ''}
                  onChange={(e) => onUpdateItem(item.id, { child_name: e.target.value })}
                  placeholder="اسم الطفل"
                  disabled={isSubmitting}
                  className="input-small"
                />
              </div>
            </div>

            {item.rental_type === 'fixed' && (
              <div className="cart-item-total">
                <span>المجموع:</span>
                <span className="amount">{formatCurrency(calculateItemTotal(item))}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <button
          onClick={onAddGame}
          className="btn btn-outline btn-block"
          disabled={isSubmitting}
        >
          <Plus size={16} />
          إضافة لعبة أخرى
        </button>

        {showSummary && (
          <div className="cart-summary">
            <h4>ملخص السلة</h4>
            <div className="summary-row">
              <span>المجموع الفرعي:</span>
              <span>{formatCurrency(calculateSubtotal())}</span>
            </div>
            
            {isManager && (
              <div className="summary-row">
                <span>الخصم (%):</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  min="0"
                  max="100"
                  className="discount-input"
                />
              </div>
            )}

            <div className="summary-row total">
              <span>الإجمالي:</span>
              <span className="total-amount">{formatCurrency(calculateTotal())}</span>
            </div>

            {isManager && (
              <div className="summary-row">
                <span>طريقة الدفع:</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="payment-select"
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="summary-row">
              <span>ملاحظات:</span>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات..."
                className="notes-input"
              />
            </div>
          </div>
        )}

        <div className="cart-customer">
          <h4>معلومات العميل</h4>
          <div className="customer-fields">
            <div className="form-group">
              <User size={16} className="field-icon" />
              <input
                type="text"
                placeholder="اسم العميل *"
                value={customerInfo.name || ''}
                onChange={(e) => onCustomerInfoChange('name', e.target.value)}
                disabled={isSubmitting}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <Phone size={16} className="field-icon" />
              <input
                type="tel"
                placeholder="رقم الهاتف"
                value={customerInfo.phone || ''}
                onChange={(e) => onCustomerInfoChange('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                disabled={isSubmitting}
                className="form-control"
                maxLength={11}
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => onSubmit({
            payment_method: paymentMethod,
            discount,
            notes,
            total_amount: calculateTotal()
          })}
          className="btn btn-primary btn-block btn-large"
          disabled={isSubmitting || !isCartValid()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="spinner" size={18} />
              جاري إنشاء التأجير...
            </>
          ) : (
            <>
              <Check size={18} />
              تأكيد التأجير ({formatCurrency(calculateTotal())})
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ==================== مكون التأجيرات النشطة ====================
const ActiveRentals = ({ 
  rentals, 
  items,
  loading, 
  onComplete,
  onCancel,
  onViewDetails,
  currentShift,
  userRole
}) => {
  const [timeNow, setTimeNow] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRental, setExpandedRental] = useState(null);

  const isEmployee = userRole === 'employee';
  const isManager = userRole === 'admin' || userRole === 'branch_manager';

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeNow(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const rentalsWithItems = useMemo(() => {
    return rentals.map(rental => ({
      ...rental,
      items: items.filter(item => item.rental_id === rental.id)
    }));
  }, [rentals, items]);

  const calculateRemainingTime = useCallback((rental) => {
    if (rental.rental_type === 'open') return 'مفتوح';
    if (!rental.start_time) return '--:--';
    
    const startTime = new Date(rental.start_time);
    const duration = rental.total_duration || 15;
    const endTime = new Date(startTime.getTime() + duration * 60000);
    const remainingMs = endTime - timeNow;
    
    if (remainingMs <= 0) return '00:00';
    
    const remainingMinutes = Math.floor(remainingMs / 60000);
    const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
    return `${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, [timeNow]);

  const calculateProgress = useCallback((rental) => {
    if (rental.rental_type !== 'fixed' || !rental.start_time) return 100;
    
    const startTime = new Date(rental.start_time);
    const duration = rental.total_duration || 15;
    const endTime = new Date(startTime.getTime() + duration * 60000);
    const totalMs = duration * 60000;
    const remainingMs = endTime - timeNow;
    
    if (remainingMs <= 0) return 0;
    
    const percentage = (remainingMs / totalMs) * 100;
    return Math.max(0, Math.min(100, percentage));
  }, [timeNow]);

  const isExpired = useCallback((rental) => {
    if (rental.rental_type !== 'fixed' || !rental.start_time) return false;
    
    const startTime = new Date(rental.start_time);
    const duration = rental.total_duration || 15;
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    return timeNow > endTime;
  }, [timeNow]);

  const getElapsedMinutes = useCallback((startTime) => {
    if (!startTime) return 0;
    return Math.floor((timeNow - new Date(startTime)) / (1000 * 60));
  }, [timeNow]);

  const filteredRentals = useMemo(() => {
    if (!rentalsWithItems.length) return [];
    
    return rentalsWithItems.filter(rental => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          rental.customer_name?.toLowerCase().includes(term) ||
          rental.rental_number?.toLowerCase().includes(term) ||
          rental.items?.some(item => item.game_name?.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [rentalsWithItems, searchTerm]);

  if (!currentShift && isEmployee) {
    return null;
  }

  if (loading.rentals) {
    return (
      <div className="active-rentals-section">
        <div className="section-header">
          <h3>
            <Activity size={24} />
            التأجيرات النشطة
          </h3>
        </div>
        <div className="loading-state">
          <Loader2 className="spinner" size={32} />
          <p>جاري تحميل التأجيرات...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="active-rentals-section">
        <div className="section-header">
          <div className="header-title">
            <Activity size={24} />
            <h3>
              التأجيرات النشطة
              <span className="section-count">({filteredRentals.length})</span>
            </h3>
          </div>

          <div className="search-wrapper small">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input small"
            />
          </div>
        </div>

        {filteredRentals.length === 0 ? (
          <div className="empty-state">
            <Activity size={48} />
            <p>لا توجد تأجيرات نشطة</p>
          </div>
        ) : (
          <div className="rentals-grid">
            {filteredRentals.map(rental => {
              const elapsedMinutes = getElapsedMinutes(rental.start_time);
              const canCancel = elapsedMinutes < 3;
              const mainItem = rental.items?.[0];
              
              return (
                <div 
                  key={rental.id} 
                  className={`rental-card ${isExpired(rental) ? 'expired' : ''} ${rental.rental_type}`}
                >
                  <div className="rental-card-header">
                    <div className="rental-number">
                      <Hash size={14} />
                      <span>{rental.rental_number}</span>
                    </div>
                    <span className={`rental-type-badge ${rental.rental_type}`}>
                      {RENTAL_TYPES.find(t => t.value === rental.rental_type)?.label}
                    </span>
                  </div>

                  <div className="rental-customer">
                    <User size={16} />
                    <span className="customer-name">{rental.customer_name}</span>
                  </div>

                  <div className="rental-game-info">
                    <Gamepad2 size={16} />
                    <span className="game-name">{mainItem?.game_name || 'لعبة'}</span>
                    {mainItem?.quantity > 1 && (
                      <span className="game-quantity">x{mainItem.quantity}</span>
                    )}
                  </div>

                  {rental.rental_type === 'fixed' && (
                    <div className="rental-progress">
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${isExpired(rental) ? 'expired' : ''}`}
                          style={{ width: `${calculateProgress(rental)}%` }}
                        ></div>
                      </div>
                      <div className="remaining-time">
                        <Hourglass size={12} />
                        <span>المتبقي: {calculateRemainingTime(rental)}</span>
                      </div>
                    </div>
                  )}

                  <div className="rental-actions">
                    <button
                      onClick={() => onViewDetails(rental)}
                      className="btn-action info"
                      title="تفاصيل"
                    >
                      <Eye size={16} />
                    </button>

                    {rental.rental_type === 'open' && (
                      <button
                        onClick={() => onComplete(rental)}
                        className="btn-action success"
                        title="إنهاء التأجير"
                      >
                        <Check size={16} />
                      </button>
                    )}

                    {isManager && canCancel && (
                      <button
                        onClick={() => onCancel(rental)}
                        className="btn-action warning"
                        title="إلغاء واسترداد"
                      >
                        <Undo2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

// ==================== مكون نافذة إضافة لعبة ====================
const AddGameModal = ({ show, onClose, games, onAddGame }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const availableGames = useMemo(() => {
    if (!games?.length) return [];
    return games.filter(game => game.is_active && game.status !== 'maintenance');
  }, [games]);

  const categories = useMemo(() => {
    if (!availableGames.length) return [{ value: 'all', label: 'الكل' }];
    const cats = [...new Set(availableGames.map(g => g.category).filter(Boolean))];
    return [
      { value: 'all', label: 'الكل' },
      ...cats.map(cat => ({ value: cat, label: cat }))
    ];
  }, [availableGames]);

  const filteredGames = useMemo(() => {
    if (!availableGames.length) return [];
    
    let filtered = availableGames;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(g => g.category === selectedCategory);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(g =>
        g.name?.toLowerCase().includes(term) ||
        g.category?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [availableGames, searchTerm, selectedCategory]);

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h3>
            <Gamepad2 size={24} />
            إضافة لعبة للسلة
          </h3>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="modal-filters">
            <div className="search-wrapper large">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="ابحث عن لعبة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input large"
                autoFocus
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="games-list">
            {filteredGames.length === 0 ? (
              <div className="empty-state">
                <Search size={48} />
                <p>لا توجد نتائج</p>
              </div>
            ) : (
              filteredGames.map(game => (
                <div
                  key={game.id}
                  className="game-select-item"
                  onClick={() => {
                    onAddGame(game);
                    onClose();
                  }}
                >
                  <GameImage src={game.image_url} alt={game.name} size="small" />
                  <div className="game-select-info">
                    <h4>{game.name}</h4>
                    <div className="game-price">
                      {formatCurrency(game.price_per_15min)} / 15 دقيقة
                    </div>
                  </div>
                  <button className="add-btn">
                    <Plus size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== مكون تفاصيل التأجير ====================
const RentalDetailsModal = ({ show, onClose, rental, items }) => {
  if (!show || !rental) return null;

  const rentalItems = items.filter(item => item.rental_id === rental.id);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>
            <Eye size={24} />
            تفاصيل التأجير #{rental.rental_number}
          </h3>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="details-section">
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">العميل:</span>
                <span className="detail-value">{rental.customer_name}</span>
              </div>
              {rental.customer_phone && (
                <div className="detail-item">
                  <span className="detail-label">الهاتف:</span>
                  <span className="detail-value">{rental.customer_phone}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-label">النوع:</span>
                <span className={`rental-type-badge ${rental.rental_type}`}>
                  {RENTAL_TYPES.find(t => t.value === rental.rental_type)?.label}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">وقت البدء:</span>
                <span className="detail-value">{formatDateTime(rental.start_time)}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h4>الألعاب ({rentalItems.length})</h4>
            <div className="items-grid">
              {rentalItems.map(item => (
                <div key={item.id} className="item-card">
                  <div className="item-card-header">
                    <Gamepad2 size={16} />
                    <span className="item-name">{item.game_name}</span>
                  </div>
                  <div className="item-card-details">
                    {item.child_name && (
                      <div className="item-detail">
                        <User size={12} />
                        <span>{item.child_name}</span>
                      </div>
                    )}
                    {item.rental_type === 'fixed' && (
                      <div className="item-detail">
                        <Clock size={12} />
                        <span>{item.duration_minutes} دقيقة</span>
                      </div>
                    )}
                    {item.quantity > 1 && (
                      <div className="item-detail">
                        <Package size={12} />
                        <span>x{item.quantity}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== مكون إنهاء تأجير مفتوح ====================
const CompleteOpenRentalModal = ({ show, onClose, rental, items, onConfirm }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rentalItems = useMemo(() => {
    return items.filter(item => item.rental_id === rental?.id);
  }, [rental, items]);

  const calculateDuration = useCallback(() => {
    if (!rental?.start_time) return 0;
    return Math.max(15, Math.floor((new Date() - new Date(rental.start_time)) / (1000 * 60)));
  }, [rental]);

  const calculateTotal = useCallback(() => {
    const minutes = calculateDuration();
    return rentalItems.reduce((total, item) => {
      const units = Math.ceil(minutes / 15);
      return total + ((item.price_per_15min || 50) * units * (item.quantity || 1));
    }, 0);
  }, [rentalItems, calculateDuration]);

  const duration = calculateDuration();
  const totalAmount = calculateTotal();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(rental, {
        payment_method: paymentMethod,
        final_amount: totalAmount,
        actual_minutes: duration
      });
      onClose();
    } catch (error) {
      console.error('خطأ في إنهاء التأجير:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show || !rental) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="header-icon success">
            <CheckCircle size={24} />
          </div>
          <h3>إنهاء التأجير المفتوح</h3>
          <button onClick={onClose} className="modal-close" disabled={isSubmitting}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="summary-card">
            <div className="summary-row">
              <span>العميل:</span>
              <span className="summary-value">{rental.customer_name}</span>
            </div>
            <div className="summary-row">
              <span>المدة:</span>
              <span>{duration} دقيقة</span>
            </div>
          </div>

          <div className="items-summary">
            <h4>الألعاب</h4>
            {rentalItems.map(item => (
              <div key={item.id} className="summary-row">
                <span>
                  {item.game_name} {item.child_name && `(${item.child_name})`}
                  {item.quantity > 1 && ` x${item.quantity}`}
                </span>
                <span>{formatCurrency((item.price_per_15min || 50) * Math.ceil(duration / 15) * (item.quantity || 1))}</span>
              </div>
            ))}
          </div>

          <div className="total-section">
            <div className="summary-row total">
              <span>الإجمالي:</span>
              <span className="total-amount">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="form-group">
            <label>طريقة الدفع:</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={isSubmitting}
              className="form-control"
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            className="btn btn-success"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="spinner" size={16} />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Check size={16} />
                تأكيد الإنهاء
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== مكون إلغاء واسترداد ====================
const CancelRentalModal = ({ show, onClose, rental, items, onConfirm }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('');

  const rentalItems = useMemo(() => {
    return items.filter(item => item.rental_id === rental?.id);
  }, [rental, items]);

  const calculateRefund = useCallback(() => {
    if (!rental?.start_time) return 0;
    
    const elapsedMinutes = Math.floor((new Date() - new Date(rental.start_time)) / (1000 * 60));
    
    if (elapsedMinutes < 3) {
      return rental.total_amount || 0;
    }
    
    const fifteenMinPrice = rentalItems.reduce((total, item) => {
      return total + ((item.price_per_15min || 50) * (item.quantity || 1));
    }, 0);
    
    return Math.max(0, (rental.total_amount || 0) - fifteenMinPrice);
  }, [rental, rentalItems]);

  const refundAmount = calculateRefund();
  const elapsedMinutes = rental?.start_time ? Math.floor((new Date() - new Date(rental.start_time)) / (1000 * 60)) : 0;
  const isWithin3Minutes = elapsedMinutes < 3;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(rental, {
        refund_amount: refundAmount,
        reason: reason || 'إلغاء التأجير'
      });
      onClose();
    } catch (error) {
      console.error('خطأ في إلغاء التأجير:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show || !rental) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="header-icon warning">
            <Undo2 size={24} />
          </div>
          <h3>إلغاء التأجير</h3>
          <button onClick={onClose} className="modal-close" disabled={isSubmitting}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="alert alert-info">
            <Info size={16} />
            <div className="alert-content">
              <strong>العميل: {rental.customer_name}</strong>
              <p>رقم التأجير: {rental.rental_number}</p>
            </div>
          </div>

          <div className="refund-calculation">
            <h4>تفاصيل الاسترداد</h4>
            
            <div className="calc-row">
              <span>الوقت المنقضي:</span>
              <span>{elapsedMinutes} دقيقة</span>
            </div>
            
            <div className="calc-row">
              <span>المبلغ المدفوع:</span>
              <span>{formatCurrency(rental.total_amount || 0)}</span>
            </div>
            
            {!isWithin3Minutes && (
              <div className="calc-row">
                <span>خصم 15 دقيقة:</span>
                <span>- {formatCurrency((rental.total_amount || 0) - refundAmount)}</span>
              </div>
            )}
            
            <div className="calc-row total highlight">
              <span>المبلغ المسترد:</span>
              <span>{formatCurrency(refundAmount)}</span>
            </div>
          </div>

          <div className="form-group">
            <label>سبب الإلغاء (اختياري):</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="أدخل سبب الإلغاء..."
              rows="3"
              className="form-control"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            className="btn btn-warning"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="spinner" size={16} />
                جاري الإلغاء...
              </>
            ) : (
              <>
                <Undo2 size={16} />
                تأكيد الإلغاء
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== المكون الرئيسي ====================
const Rentals = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState({
    games: false,
    rentals: false,
    shift: false,
    processing: false
  });
  
  const [games, setGames] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [shiftStats, setShiftStats] = useState(null);
  const [activeRentals, setActiveRentals] = useState([]);
  const [rentalItems, setRentalItems] = useState([]);
  
  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [showRentalDetailsModal, setShowRentalDetailsModal] = useState(false);
  const [showCompleteOpenModal, setShowCompleteOpenModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const userRole = user?.role || 'employee';
  const isEmployee = userRole === 'employee';
  const isManager = userRole === 'admin' || userRole === 'branch_manager';

  // تحميل الألعاب
  const loadGames = useCallback(async () => {
    if (!user?.branch_id) return;
    
    setLoading(prev => ({ ...prev, games: true }));
    try {
      const response = await api.getGames({ branch_id: user.branch_id });
      
      if (response.success) {
        setGames(response.data || []);
      }
    } catch (error) {
      console.error('خطأ في تحميل الألعاب:', error);
      setError('فشل تحميل الألعاب');
    } finally {
      setLoading(prev => ({ ...prev, games: false }));
    }
  }, [user?.branch_id]);

  // تحميل الشيفت الحالي
  const loadCurrentShift = useCallback(async () => {
    setLoading(prev => ({ ...prev, shift: true }));
    try {
      const response = await api.getCurrentShift();
      
      if (response.success && response.data) {
        setCurrentShift(response.data);
        setShiftStats(response.data);
      } else {
        setCurrentShift(null);
        setShiftStats(null);
      }
    } catch (error) {
      console.error('خطأ في تحميل الشيفت:', error);
      setCurrentShift(null);
    } finally {
      setLoading(prev => ({ ...prev, shift: false }));
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
      const response = await api.getActiveRentals(currentShift.id);
      
      if (response.success) {
        const rentals = response.data || [];
        setActiveRentals(rentals);
        
        const allItems = [];
        rentals.forEach(rental => {
          if (rental.items && rental.items.length > 0) {
            allItems.push(...rental.items);
          }
        });
        setRentalItems(allItems);
      } else {
        setActiveRentals([]);
        setRentalItems([]);
      }
    } catch (error) {
      console.error('خطأ في تحميل التأجيرات:', error);
      setActiveRentals([]);
      setRentalItems([]);
    } finally {
      setLoading(prev => ({ ...prev, rentals: false }));
    }
  }, [currentShift?.id]);

  // تحديث جميع البيانات
  const refreshAllData = useCallback(async () => {
    await loadCurrentShift();
    await loadGames();
  }, [loadCurrentShift, loadGames]);

  // بدء الشيفت
  const handleStartShift = useCallback(async () => {
    if (!user?.branch_id) {
      setError('لا يوجد فرع محدد للمستخدم');
      return;
    }

    setLoading(prev => ({ ...prev, processing: true }));
    try {
      const response = await api.startShift(0);

      if (response.success) {
        setCurrentShift(response.data);
        setSuccess('✅ تم فتح الشيفت بنجاح');
        await refreshAllData();
      } else {
        setError(`❌ فشل فتح الشيفت: ${response.message}`);
      }
    } catch (error) {
      console.error('خطأ في فتح الشيفت:', error);
      setError('حدث خطأ في فتح الشيفت');
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [user?.branch_id, refreshAllData]);

  // إنهاء الشيفت
  const handleEndShift = useCallback(async (closingCash, notes) => {
    if (!currentShift) return;

    setLoading(prev => ({ ...prev, processing: true }));
    try {
      const response = await api.endShift(currentShift.id, {
        closing_cash: closingCash || 0,
        notes
      });

      if (response.success) {
        setCurrentShift(null);
        setActiveRentals([]);
        setRentalItems([]);
        setSuccess('✅ تم إنهاء الشيفت بنجاح');
      } else {
        setError(`❌ فشل إنهاء الشيفت: ${response.message}`);
      }
    } catch (error) {
      console.error('خطأ في إنهاء الشيفت:', error);
      setError('حدث خطأ في إنهاء الشيفت');
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [currentShift]);

  // إضافة لعبة للسلة
  const handleAddToCart = useCallback((game) => {
    if (!currentShift && isEmployee) {
      setError('❌ يجب فتح شيفت أولاً');
      return;
    }

    setCartItems(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        game_id: game.id,
        game_name: game.name,
        price_per_15min: game.price_per_15min,
        rental_type: 'fixed',
        duration_minutes: 15,
        quantity: 1,
        child_name: ''
      }
    ]);

    setShowAddGameModal(false);
  }, [currentShift, isEmployee]);

  // تحديث عنصر في السلة
  const handleUpdateCartItem = useCallback((itemId, updates) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  }, []);

  // حذف عنصر من السلة
  const handleRemoveCartItem = useCallback((itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // تفريغ السلة
  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setCustomerInfo({ name: '', phone: '' });
  }, []);

  // إنشاء تأجير جديد
  const handleCreateRental = useCallback(async (data) => {
    if (!currentShift) {
      setError('❌ لا يوجد شيفت نشط');
      return;
    }

    if (cartItems.length === 0) {
      setError('❌ السلة فارغة');
      return;
    }

    if (!customerInfo.name?.trim()) {
      setError('❌ اسم العميل مطلوب');
      return;
    }

    setLoading(prev => ({ ...prev, processing: true }));
    
    try {
      const rentalData = {
        customer_name: customerInfo.name.trim(),
        customer_phone: customerInfo.phone || null,
        items: cartItems.map(item => ({
          game_id: item.game_id,
          child_name: item.child_name || null,
          duration_minutes: item.rental_type === 'fixed' ? item.duration_minutes : null,
          quantity: item.quantity,
          rental_type: item.rental_type
        }))
      };

      const response = await api.createRental(rentalData);

      if (response.success) {
        setSuccess(`✅ تم إنشاء التأجير للعميل ${customerInfo.name} بنجاح`);
        handleClearCart();
        await loadActiveRentals();
      } else {
        setError(`❌ ${response.message}`);
      }
    } catch (error) {
      console.error('خطأ في إنشاء التأجير:', error);
      setError('فشل إنشاء التأجير: ' + (error.message || 'خطأ غير معروف'));
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [currentShift, cartItems, customerInfo, handleClearCart, loadActiveRentals]);

  // إنهاء تأجير مفتوح
  const handleCompleteOpenRental = useCallback(async (rental, data) => {
    if (!rental) return;

    setLoading(prev => ({ ...prev, processing: true }));
    try {
      const response = await api.completeOpenTime(rental.id, {
        payment_method: data.payment_method,
        actual_minutes: data.actual_minutes,
        final_amount: data.final_amount
      });

      if (response.success) {
        setSuccess(`✅ تم إنهاء التأجير ${rental.rental_number} بنجاح`);
        await loadActiveRentals();
      } else {
        setError(`❌ فشل إنهاء التأجير: ${response.message}`);
      }
    } catch (error) {
      console.error('خطأ في إنهاء التأجير:', error);
      setError('حدث خطأ في إنهاء التأجير');
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [loadActiveRentals]);

  // إلغاء تأجير
  const handleCancelRental = useCallback(async (rental, data) => {
    if (!isManager) {
      setError('❌ ليس لديك صلاحية إلغاء التأجيرات');
      return;
    }

    setLoading(prev => ({ ...prev, processing: true }));
    try {
      const response = await api.cancelRental(rental.id, data.reason);

      if (response.success) {
        setSuccess(`✅ تم إلغاء التأجير ${rental.rental_number} واسترداد ${formatCurrency(data.refund_amount)}`);
        await loadActiveRentals();
      } else {
        setError(`❌ فشل إلغاء التأجير: ${response.message}`);
      }
    } catch (error) {
      console.error('خطأ في إلغاء التأجير:', error);
      setError('حدث خطأ في إلغاء التأجير');
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [isManager, loadActiveRentals]);

  // Effects
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  useEffect(() => {
    if (currentShift?.id) {
      loadActiveRentals();
    }
  }, [currentShift?.id, loadActiveRentals]);

  useEffect(() => {
    if (!currentShift?.id) return;

    const interval = setInterval(() => {
      loadActiveRentals();
    }, 30000);

    return () => clearInterval(interval);
  }, [currentShift?.id, loadActiveRentals]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="rentals-page">
      <ShiftStatusBar
        currentShift={currentShift}
        shiftStats={shiftStats}
        onStartShift={handleStartShift}
        onEndShift={handleEndShift}
        loading={loading.processing}
        userRole={userRole}
        activeRentals={activeRentals}
        completedRentals={[]}
      />

      <div className="rentals-content">
        <div className="main-panel">
          <GamesGrid
            games={games}
            branchId={user?.branch_id}
            onAddToCart={handleAddToCart}
            loading={loading}
            currentShift={currentShift}
            userRole={userRole}
          />

          <ActiveRentals
            rentals={activeRentals}
            items={rentalItems}
            games={games}
            loading={loading}
            onComplete={(rental) => {
              if (rental.rental_type === 'open') {
                setSelectedRental(rental);
                setShowCompleteOpenModal(true);
              }
            }}
            onCancel={(rental) => {
              setSelectedRental(rental);
              setShowCancelModal(true);
            }}
            onViewDetails={(rental) => {
              setSelectedRental(rental);
              setShowRentalDetailsModal(true);
            }}
            currentShift={currentShift}
            userRole={userRole}
          />
        </div>

        <div className="cart-panel">
          <RentalCart
            items={cartItems}
            onUpdateItem={handleUpdateCartItem}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            customerInfo={customerInfo}
            onCustomerInfoChange={(field, value) => 
              setCustomerInfo(prev => ({ ...prev, [field]: value }))
            }
            onSubmit={handleCreateRental}
            isSubmitting={loading.processing}
            games={games}
            onAddGame={() => setShowAddGameModal(true)}
            currentShift={currentShift}
            userRole={userRole}
          />
        </div>
      </div>

      <AddGameModal
        show={showAddGameModal}
        onClose={() => setShowAddGameModal(false)}
        games={games}
        onAddGame={handleAddToCart}
      />

      <RentalDetailsModal
        show={showRentalDetailsModal}
        onClose={() => {
          setShowRentalDetailsModal(false);
          setSelectedRental(null);
        }}
        rental={selectedRental}
        items={rentalItems}
      />

      <CompleteOpenRentalModal
        show={showCompleteOpenModal}
        onClose={() => {
          setShowCompleteOpenModal(false);
          setSelectedRental(null);
        }}
        rental={selectedRental}
        items={rentalItems}
        onConfirm={handleCompleteOpenRental}
      />

      <CancelRentalModal
        show={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedRental(null);
        }}
        rental={selectedRental}
        items={rentalItems}
        onConfirm={handleCancelRental}
      />

      {error && (
        <div className="toast error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="toast success">
          <CheckCircle size={20} />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {loading.processing && (
        <div className="global-loading">
          <Loader2 className="spinner" size={32} />
        </div>
      )}
    </div>
  );
};

export default Rentals;