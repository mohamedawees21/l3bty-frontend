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
import API_BASE_URL from "../services/api";

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

// ==================== مكون الصور مع الملفات المحلية ====================
const GameImage = ({ src, alt, className, size = 'medium' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
const getLocalImage = (gameName) => {
  const imageMap = {
    'Car': '/images/Car.jpg',
    'Driftcar': '/images/Driftcar.jpg',
    'harley': '/images/harley.jpg',
    'Hoverboard': '/images/Hoverboard.jpg',
    'I3bty': '/images/I3bty.png',
    'Motor': '/images/Motor.jpg',
    'motorcycle': '/images/motorcycle.jpg',
    'Ninebot': '/images/Ninebot.jpg',
    'pingpong': '/images/pingpong.jpg',
    'playstation': '/images/playstation.jpg',
    'Scooter': '/images/Scooter.jpg',
    'Segway': '/images/Segway.jpg',
    'Simulator': '/images/Simulator.jpg',
    'Skate': '/images/Skate.jpg',
    'Trampoline': '/images/Trampoline.jpg',
    'VR': '/images/VR.jpg',
    'waterslide': '/images/waterslide.jpg',
    'wheel': '/images/wheel.jpg',
    'default': '/images/playstation.jpg'
  };

  if (!gameName) return imageMap.default;
  
  const gameNameLower = gameName.toLowerCase();
  const matchedKey = Object.keys(imageMap).find(key => 
    key !== 'default' && gameNameLower.includes(key.toLowerCase())
  );

  return matchedKey ? imageMap[matchedKey] : imageMap.default;
};

  const imageSrc = src || getLocalImage(alt);

  return (
    <div className={`game-image-container ${className} ${imageLoaded ? 'loaded' : 'loading'}`}>
      {!imageLoaded && (
        <div className="image-placeholder">
          <ImageIcon size={size === 'large' ? 48 : 24} />
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`game-image ${imageLoaded ? 'visible' : 'hidden'}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
};

// ==================== مكون شريط حالة الشيفت مع حساب الإيرادات ====================
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

  const isManager = userRole === 'admin' || userRole === 'manager' || userRole === 'مدير';

const calculateRevenue = useMemo(() => {
  let total = 0;
  
  // Revenue from completed rentals (excluding refunded)
  completedRentals.forEach(rental => {
    if (rental.status === 'completed' && !rental.is_refunded) {
      total += parseFloat(rental.final_amount || rental.total_amount || 0);
    }
  });
  
  // Revenue from active fixed-time rentals (prepaid)
  activeRentals.forEach(rental => {
    if (rental.rental_type === 'fixed' && rental.payment_status === 'paid') {
      total += parseFloat(rental.total_amount || 0);
    }
  });
  
  return total;
}, [activeRentals, completedRentals]);

  // إحصائيات محدثة
  const enhancedStats = {
    ...shiftStats,
    total_revenue: calculateRevenue,
    active_rentals: activeRentals.length,
    completed_rentals: completedRentals.length,
    total_rentals: activeRentals.length + completedRentals.length
  };

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

      {showStats && isManager && (
        <div className="shift-stats-expanded">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <DollarSign size={20} className="stat-icon" />
                <h4>الإيرادات</h4>
              </div>
              <div className="stat-value">{formatCurrency(calculateRevenue)}</div>
              <div className="stat-detail">
                <span>من التأجيرات المكتملة: {formatCurrency(
                  completedRentals
                    .filter(r => r.status === 'completed' && !r.is_refunded)
                    .reduce((sum, r) => sum + parseFloat(r.final_amount || r.total_amount || 0), 0)
                )}</span>
                <br />
                <span>من التأجيرات النشطة: {formatCurrency(
                  activeRentals
                    .filter(r => r.rental_type === 'fixed' && r.payment_status === 'paid')
                    .reduce((sum, r) => sum + parseFloat(r.total_amount || 0), 0)
                )}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <Clock size={20} className="stat-icon" />
                <h4>وقت التشغيل</h4>
              </div>
              <div className="stat-value">
                {Math.floor((new Date() - new Date(currentShift.start_time)) / (1000 * 60 * 60))} ساعة
              </div>
              <div className="stat-detail">
                <span>منذ: {formatTimeAgo(currentShift.start_time)}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <Users size={20} className="stat-icon" />
                <h4>العملاء</h4>
              </div>
              <div className="stat-value">
                {new Set([
                  ...activeRentals.map(r => r.customer_name),
                  ...completedRentals.map(r => r.customer_name)
                ]).size}
              </div>
              <div className="stat-detail">
                <span>عملاء جدد في هذا الشيفت</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تأكيد إنهاء الشيفت */}
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

              <div className="shift-summary-card">
                <h4>ملخص الشيفت</h4>
                <div className="summary-rows">
                  <div className="summary-row">
                    <span>التأجيرات النشطة:</span>
                    <strong>{activeRentals.length}</strong>
                  </div>
                  <div className="summary-row">
                    <span>التأجيرات المكتملة:</span>
                    <strong>{completedRentals.length}</strong>
                  </div>
                  <div className="summary-row">
                    <span>إجمالي الإيراد:</span>
                    <strong className="amount">{formatCurrency(calculateRevenue)}</strong>
                  </div>
                </div>
              </div>

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

// ==================== مكون بطاقة اللعبة مع الصورة ====================
const GameCard = ({ game, onAddToCart, isAvailable }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`game-card ${!isAvailable ? 'unavailable' : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => isAvailable && onAddToCart(game)}
      data-category={game.category}
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
        {game.category && (
          <span className="game-category-badge">{game.category}</span>
        )}
        {game.current_rentals > 0 && (
          <span className="game-rentals-badge">
            <Users size={12} />
            {game.current_rentals}
          </span>
        )}
        {game.is_new && (
          <span className="image-badge new">جديد</span>
        )}
        {game.is_popular && (
          <span className="image-badge popular">الأكثر طلباً</span>
        )}
      </div>

      <div className="game-card-content">
        <h4 className="game-title">{game.name}</h4>
        
        <div className="game-price">
          <DollarSign size={14} />
          <span className="price-value">{formatCurrency(game.price_per_15min)}</span>
          <span className="price-unit">/ 15 د</span>
        </div>

        {game.description && (
          <p className="game-description">{game.description}</p>
        )}

        <div className="game-features">
          {game.max_players && (
            <span className="feature">
              <Users size={12} />
              {game.max_players} لاعب
            </span>
          )}
          {game.min_age && (
            <span className="feature">
              <Star size={12} />
              {game.min_age}+
            </span>
          )}
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
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);

  const isEmployee = userRole === 'employee' || userRole === 'موظف';

  // تصفية الألعاب حسب الفرع والحالة
  const branchGames = useMemo(() => {
    if (!games?.length || !branchId) return [];
    return games.filter(game => 
      game && 
      game.branch_id === branchId && 
      game.is_active
    );
  }, [games, branchId]);

  // استخراج الفئات المتاحة
  const categories = useMemo(() => {
    if (!branchGames.length) return [{ value: 'all', label: 'جميع الألعاب', count: 0 }];
    const catMap = new Map();
    branchGames.forEach(game => {
      const cat = game.category || 'أخرى';
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });
    return [
      { value: 'all', label: 'جميع الألعاب', count: branchGames.length },
      ...Array.from(catMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([value, count]) => ({ value, label: value, count }))
    ];
  }, [branchGames]);

  // تصفية وترتيب الألعاب
  const filteredGames = useMemo(() => {
    if (!branchGames.length) return [];

    let filtered = branchGames.filter(game => {
      if (selectedCategory !== 'all' && game.category !== selectedCategory) {
        return false;
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          game.name?.toLowerCase().includes(term) ||
          game.category?.toLowerCase().includes(term) ||
          game.description?.toLowerCase().includes(term)
        );
      }

      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.price_per_15min || 0) - (b.price_per_15min || 0);
        case 'price-desc':
          return (b.price_per_15min || 0) - (a.price_per_15min || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [branchGames, searchTerm, selectedCategory, sortBy]);

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
            <span className="games-count">({branchGames.length})</span>
          </h3>
        </div>
        
        <div className="header-actions">
          <button 
            className={`btn-icon ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            title="خيارات البحث"
          >
            <Filter size={18} />
          </button>
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

      <div className={`games-filters ${showFilters ? 'expanded' : ''}`}>
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

        <div className="filter-group">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label} ({cat.count})
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="name">ترتيب أبجدي</option>
            <option value="price">السعر: من الأقل للأعلى</option>
            <option value="price-desc">السعر: من الأعلى للأقل</option>
          </select>
        </div>
      </div>

      {branchGames.length === 0 ? (
        <div className="games-empty">
          <Gamepad2 size={64} />
          <h4>لا توجد ألعاب متاحة</h4>
          <p>يبدو أنه لا توجد ألعاب مسجلة في هذا الفرع</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="games-empty">
          <Search size={64} />
<p>
  لا توجد نتائج لـ {"\""}{searchTerm}{"\""}
</p>          <button 
            className="btn btn-outline"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
          >
            <RefreshCw size={16} />
            إعادة تعيين البحث
          </button>
        </div>
      ) : (
        <>
          <h4 className="games-subtitle">
            <CheckCircle size={16} className="available-icon" />
            الألعاب المتاحة ({availableGames.length})
          </h4>
          <div className={`games-${viewMode}`}>
            {availableGames.map(game => (
              <GameCard
                key={game.id}
                game={game}
                onAddToCart={onAddToCart}
                isAvailable={game.status !== 'maintenance'}
              />
            ))}
          </div>
        </>
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

  const isEmployee = userRole === 'employee' || userRole === 'موظف';
  const isManager = userRole === 'admin' || userRole === 'manager' || userRole === 'مدير';

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

        <div className="shift-info">
          <Zap size={14} />
          <span>سيتم ربط التأجير بالشيفت الحالي #{currentShift?.shift_number || currentShift?.id}</span>
        </div>
      </div>
    </div>
  );
};

// ==================== مكون التأجيرات المكتملة (للمدير فقط) ====================
const CompletedRentals = ({
  rentals,
  items,
  loading,
  currentShift,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedRental, setExpandedRental] = useState(null);

  const isManager = userRole === 'admin' || userRole === 'manager' || userRole === 'مدير';


  const rentalsWithItems = useMemo(() => {
    return rentals.map(rental => ({
      ...rental,
      items: items.filter(item => item.rental_id === rental.id)
    }));
  }, [rentals, items]);

  const filteredRentals = useMemo(() => {
    if (!rentalsWithItems.length) return [];
    
    return rentalsWithItems.filter(rental => {
      if (filterType !== 'all' && rental.rental_type !== filterType) {
        return false;
      }

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
  }, [rentalsWithItems, searchTerm, filterType]);

  if (!isManager) {
  return null;
}

  if (loading.rentals) {
    return (
      <div className="completed-rentals-section">
        <div className="section-header">
          <h3>
            <History size={24} />
            التأجيرات المكتملة
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
    <div className="completed-rentals-section">
      <div className="section-header">
        <div className="header-title">
          <History size={24} />
          <h3>
            التأجيرات المكتملة
            <span className="section-count">({filteredRentals.length})</span>
          </h3>
        </div>

        <div className="section-filters">
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

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select small"
          >
            <option value="all">الكل</option>
            {RENTAL_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredRentals.length === 0 ? (
        <div className="empty-state">
          <Archive size={48} />
          <p>لا توجد تأجيرات مكتملة</p>
        </div>
      ) : (
        <div className="rentals-grid">
          {filteredRentals.map(rental => (
            <div 
              key={rental.id} 
              className={`rental-card completed ${expandedRental === rental.id ? 'expanded' : ''}`}
              onClick={() => setExpandedRental(expandedRental === rental.id ? null : rental.id)}
            >
              <div className="rental-card-header">
                <div className="rental-number">
                  <Hash size={14} />
                  <span>{rental.rental_number}</span>
                </div>
                <span className={`rental-type-badge ${rental.rental_type}`}>
                  {RENTAL_TYPES.find(t => t.value === rental.rental_type)?.label}
                </span>
                {rental.is_refunded && (
                  <span className="refunded-badge">مسترد</span>
                )}
              </div>

              <div className="rental-customer">
                <User size={16} />
                <span className="customer-name">{rental.customer_name}</span>
              </div>

              <div className="rental-items-preview">
                {rental.items?.slice(0, 2).map(item => (
                  <div key={item.id} className="rental-item-preview">
                    <Gamepad2 size={12} />
                    <span>{item.game_name}</span>
                    {item.quantity > 1 && <span className="item-quantity">x{item.quantity}</span>}
                  </div>
                ))}
                {rental.items?.length > 2 && (
                  <span className="more-items">+{rental.items.length - 2}</span>
                )}
              </div>

              <div className="rental-time-info">
                <Clock size={14} />
                <span>البداية: {formatTime(rental.start_time)}</span>
                {rental.end_time && (
                  <>
                    <span className="separator">→</span>
                    <span>{formatTime(rental.end_time)}</span>
                  </>
                )}
              </div>

              <div className="rental-duration">
                <Hourglass size={14} />
                <span>المدة: {rental.total_duration || calculateDuration(rental.start_time, rental.end_time)} دقيقة</span>
              </div>

              {!rental.is_refunded && (
                <div className="rental-amount">
                  <DollarSign size={14} />
                  <span>{formatCurrency(rental.final_amount || rental.total_amount || 0)}</span>
                </div>
              )}

              {expandedRental === rental.id && (
                <div className="rental-expanded-details">
                  <div className="expanded-items">
                    <h5>تفاصيل التأجير:</h5>
                    {rental.items?.map(item => (
                      <div key={item.id} className="expanded-item">
                        <div className="item-info">
                          <Gamepad2 size={14} />
                          <span className="item-name">{item.game_name}</span>
                          {item.child_name && (
                            <span className="child-name">- {item.child_name}</span>
                          )}
                        </div>
                        <div className="item-details">
                          <span className="item-duration">{item.duration_minutes} د</span>
                          {item.quantity > 1 && (
                            <span className="item-quantity">x{item.quantity}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {isManager && (
                    <div className="expanded-payment">
                      <h5>معلومات الدفع:</h5>
                      <div className="payment-details">
                        <div className="detail-row">
                          <span>المبلغ:</span>
                          <span>{formatCurrency(rental.total_amount || 0)}</span>
                        </div>
                        {rental.final_amount && (
                          <div className="detail-row">
                            <span>المبلغ النهائي:</span>
                            <span>{formatCurrency(rental.final_amount)}</span>
                          </div>
                        )}
                        <div className="detail-row">
                          <span>طريقة الدفع:</span>
                          <span>{rental.payment_method || 'نقدي'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== مكون نافذة تغيير اللعبة ====================
const ChangeGameModal = ({
  show,
  onClose,
  rental,
  items,
  games,
  onChangeGame,
  userRole
}) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedDiff, setCalculatedDiff] = useState(null);

  const rentalItems = useMemo(() => {
    return items.filter(item => item.rental_id === rental?.id);
  }, [rental, items]);

  const currentGame = rentalItems[0];

  const availableGames = useMemo(() => {
    if (!games?.length) return [];
    return games.filter(game => 
      game.is_active && 
      game.status !== 'maintenance' &&
      game.id !== currentGame?.game_id
    );
  }, [games, currentGame]);

  const filteredGames = useMemo(() => {
    if (!availableGames.length) return [];
    if (!searchTerm) return availableGames;
    
    const term = searchTerm.toLowerCase();
    return availableGames.filter(g =>
      g.name?.toLowerCase().includes(term) ||
      g.category?.toLowerCase().includes(term)
    );
  }, [availableGames, searchTerm]);

const calculateDifference = useCallback((newGame) => {
  if (!currentGame || !newGame) return null;
  
  const elapsedMinutes = calculateDuration(rental?.start_time);
  const usedUnits = Math.ceil(elapsedMinutes / 15);
  
  const oldPrice = currentGame.price_per_15min || 0;
  const newPrice = newGame.price_per_15min || 0;
  
  const oldTotal = oldPrice * usedUnits;
  const newTotal = newPrice * usedUnits;
  const difference = newTotal - oldTotal;
  
  return {
    elapsedMinutes,
    usedUnits,
    oldPrice,
    newPrice,
    oldTotal,
    newTotal,
    difference,
    refund: difference < 0,
    extra: difference > 0
  };
}, [currentGame, rental]);

  useEffect(() => {
    if (selectedGame) {
      setCalculatedDiff(calculateDifference(selectedGame));
    } else {
      setCalculatedDiff(null);
    }
  }, [selectedGame, calculateDifference]);

  const handleConfirm = async () => {
    if (!selectedGame || !calculatedDiff) return;
    
    setIsSubmitting(true);
    try {
      await onChangeGame(rental, currentGame.game_id, selectedGame.id, calculatedDiff);
      onClose();
    } catch (error) {
      console.error('خطأ في تغيير اللعبة:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show || !rental || !currentGame) return null;

  return (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <div className="header-icon info">
            <ArrowLeftRight size={24} />
          </div>
          <h3>تغيير اللعبة</h3>
          <button onClick={onClose} className="modal-close" disabled={isSubmitting}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="current-game-info">
            <h4>اللعبة الحالية</h4>
            <div className="game-info-card">
              <GameImage src={currentGame.image_url} alt={currentGame.game_name} size="small" />
              <div className="game-info-details">
                <span className="game-name">{currentGame.game_name}</span>
                <span className="game-price">{formatCurrency(currentGame.price_per_15min)} / 15 د</span>
                <span className="game-time">بدأت منذ: {formatTimeAgo(rental.start_time)}</span>
              </div>
            </div>
          </div>

          <div className="new-game-selection">
            <h4>اختر اللعبة الجديدة</h4>
            
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="ابحث عن لعبة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="games-list compact">
              {filteredGames.length === 0 ? (
                <div className="empty-state">
                  <Gamepad2 size={32} />
                  <p>لا توجد ألعاب متاحة</p>
                </div>
              ) : (
                filteredGames.map(game => (
                  <div
                    key={game.id}
                    className={`game-select-item ${selectedGame?.id === game.id ? 'selected' : ''}`}
                    onClick={() => setSelectedGame(game)}
                  >
                    <GameImage src={game.image_url} alt={game.name} size="small" />
                    <div className="game-select-info">
                      <h4>{game.name}</h4>
                      <div className="game-price">
                        {formatCurrency(game.price_per_15min)} / 15 د
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {calculatedDiff && (
            <div className="difference-calculation">
              <h4>حساب الفرق</h4>
              <div className="calculation-details">
                <div className="calc-row">
                  <span>الوقت المنقضي:</span>
                  <span>{calculatedDiff.elapsedMinutes} دقيقة</span>
                </div>
                <div className="calc-row">
                  <span>عدد الوحدات (15 د):</span>
                  <span>{calculatedDiff.usedUnits} وحدة</span>
                </div>
                <div className="calc-row">
                  <span>سعر الوحدة الحالي:</span>
                  <span>{formatCurrency(calculatedDiff.oldPrice)}</span>
                </div>
                <div className="calc-row">
                  <span>سعر الوحدة الجديد:</span>
                  <span>{formatCurrency(calculatedDiff.newPrice)}</span>
                </div>
                <div className="calc-row total">
                  <span>المبلغ المحسوب للعبة الحالية:</span>
                  <span>{formatCurrency(calculatedDiff.oldTotal)}</span>
                </div>
                <div className="calc-row total">
                  <span>المبلغ المحسوب للعبة الجديدة:</span>
                  <span>{formatCurrency(calculatedDiff.newTotal)}</span>
                </div>
                <div className={`calc-row difference ${calculatedDiff.refund ? 'refund' : 'extra'}`}>
                  <span>{calculatedDiff.refund ? 'مبلغ مسترد:' : 'مبلغ إضافي:'}</span>
                  <span>{formatCurrency(Math.abs(calculatedDiff.difference))}</span>
                </div>
              </div>
            </div>
          )}
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
            className="btn btn-primary"
            disabled={!selectedGame || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="spinner" size={16} />
                جاري التغيير...
              </>
            ) : (
              <>
                <Check size={16} />
                تأكيد التغيير
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== مكون نافذة إلغاء واسترداد ====================
const CancelAndRefundModal = ({
  show,
  onClose,
  rental,
  items,
  onConfirm,
  userRole
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);
  const [reason, setReason] = useState('');

  const rentalItems = useMemo(() => {
    return items.filter(item => item.rental_id === rental?.id);
  }, [rental, items]);

const calculateRefund = useCallback(() => {
  if (!rental?.start_time) return 0;
  
  const elapsedMinutes = calculateDuration(rental.start_time);
  
  // If less than 3 minutes elapsed, full refund
  if (elapsedMinutes < 3) {
    return rental.total_amount || 0;
  }
  
  // If more than 3 minutes, deduct 15 minutes
  const fifteenMinPrice = rentalItems.reduce((total, item) => {
    return total + ((item.price_per_15min || 50) * (item.quantity || 1));
  }, 0);
  
  return Math.max(0, (rental.total_amount || 0) - fifteenMinPrice);
}, [rental, rentalItems]);

  useEffect(() => {
    setRefundAmount(calculateRefund());
  }, [calculateRefund]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(rental, {
        refund_amount: refundAmount,
        reason: reason || 'إلغاء خلال 3 دقائق'
      });
      onClose();
    } catch (error) {
      console.error('خطأ في إلغاء التأجير:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const elapsedMinutes = rental?.start_time ? calculateDuration(rental.start_time) : 0;
  const isWithin3Minutes = elapsedMinutes < 3;

  if (!show || !rental) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="header-icon warning">
            <Undo2 size={24} />
          </div>
          <h3>إلغاء التأجير واسترداد المبلغ</h3>
          <button onClick={onClose} className="modal-close" disabled={isSubmitting}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="alert alert-info">
            <Info size={16} />
            <div className="alert-content">
              <strong>معلومات التأجير</strong>
              <p>رقم: {rental.rental_number} - العميل: {rental.customer_name}</p>
            </div>
          </div>

          <div className="time-info">
            <Clock size={20} />
            <div className="time-details">
              <span>وقت البدء: {formatDateTime(rental.start_time)}</span>
              <span>الوقت المنقضي: {elapsedMinutes} دقيقة</span>
              {isWithin3Minutes ? (
                <span className="badge success">ضمن فترة الاسترداد الكامل (أقل من 3 دقائق)</span>
              ) : (
                <span className="badge warning">تم تجاوز فترة الاسترداد الكامل</span>
              )}
            </div>
          </div>

          <div className="refund-calculation">
            <h4>تفاصيل الاسترداد</h4>
            
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

            {!isWithin3Minutes && (
              <p className="note">
                <Info size={12} />
                تم تجاوز 3 دقائق، تم خصم قيمة أول 15 دقيقة
              </p>
            )}
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
                تأكيد الإلغاء والاسترداد
              </>
            )}
          </button>
        </div>
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
  onChangeGame,
  currentShift,
  userRole
}) => {
  const [timeNow, setTimeNow] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedRental, setExpandedRental] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChangeGameModal, setShowChangeGameModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);

  const isEmployee = userRole === 'employee' || userRole === 'موظف';
  const isManager = userRole === 'admin' || userRole === 'manager' || userRole === 'مدير';

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
      if (filterType !== 'all' && rental.rental_type !== filterType) {
        return false;
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          rental.customer_name?.toLowerCase().includes(term) ||
          rental.customer_phone?.includes(term) ||
          rental.rental_number?.toLowerCase().includes(term) ||
          rental.items?.some(item => item.game_name?.toLowerCase().includes(term))
        );
      }

      return true;
    });
  }, [rentalsWithItems, searchTerm, filterType]);

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

          <div className="section-filters">
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

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select small"
            >
              <option value="all">الكل</option>
              {RENTAL_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
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
              const canCancel = elapsedMinutes < 3; // يمكن الإلغاء خلال 3 دقائق فقط
              const mainItem = rental.items?.[0];
              
              return (
                <div 
                  key={rental.id} 
                  className={`rental-card ${isExpired(rental) ? 'expired' : ''} ${rental.rental_type} ${expandedRental === rental.id ? 'expanded' : ''}`}
                  onClick={() => setExpandedRental(expandedRental === rental.id ? null : rental.id)}
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

                  <div className="rental-duration-info">
                    <Clock size={14} />
                    <span>المدة: {rental.rental_type === 'fixed' ? `${rental.total_duration || 15} د` : 'مفتوح'}</span>
                    {rental.rental_type === 'fixed' && (
                      <span className="elapsed-time">({elapsedMinutes} د مضت)</span>
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

                  {expandedRental === rental.id && (
                    <div className="rental-expanded-details">
                      <div className="expanded-items">
                        <h5>جميع الألعاب:</h5>
                        {rental.items?.map(item => (
                          <div key={item.id} className="expanded-item">
                            <div className="item-info">
                              <Gamepad2 size={14} />
                              <span className="item-name">{item.game_name}</span>
                              {item.child_name && (
                                <span className="child-name">- {item.child_name}</span>
                              )}
                            </div>
                            <div className="item-details">
                              {item.rental_type === 'fixed' && (
                                <span className="item-duration">{item.duration_minutes} د</span>
                              )}
                              {item.quantity > 1 && (
                                <span className="item-quantity">x{item.quantity}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rental-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(rental);
                      }}
                      className="btn-action info"
                      title="تفاصيل"
                    >
                      <Eye size={16} />
                    </button>

                    {rental.rental_type === 'open' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onComplete(rental);
                        }}
                        className="btn-action success"
                        title="إنهاء التأجير"
                      >
                        <Check size={16} />
                      </button>
                    )}

                   {isManager && (
  <>
    <button
      onClick={(e) => {
        e.stopPropagation();
        setSelectedRental(rental);
        setShowChangeGameModal(true);
      }}
      className="btn-action primary"
      title="تغيير اللعبة"
    >
      <RotateIcon size={16} />
    </button>

    <button
      onClick={(e) => {
        e.stopPropagation();
        if (canCancel) {
          setSelectedRental(rental);
          setShowCancelModal(true);
        } else {
          alert('لا يمكن إلغاء التأجير بعد مرور 3 دقائق');
        }
      }}
      className={`btn-action ${canCancel ? 'warning' : 'disabled'}`}
      title={canCancel ? 'إلغاء واسترداد' : 'لا يمكن الإلغاء (تجاوز 3 دقائق)'}
      disabled={!canCancel}
    >
      <Undo2 size={16} />
    </button>
  </>
)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* نافذة إلغاء واسترداد */}
      <CancelAndRefundModal
        show={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedRental(null);
        }}
        rental={selectedRental}
        items={items}
        onConfirm={onCancel}
        userRole={userRole}
      />

      {/* نافذة تغيير اللعبة */}
      <ChangeGameModal
        show={showChangeGameModal}
        onClose={() => {
          setShowChangeGameModal(false);
          setSelectedRental(null);
        }}
        rental={selectedRental}
        items={items}
        games={items}
        onChangeGame={onChangeGame}
        userRole={userRole}
      />
    </>
  );
};

// ==================== مكون إضافة لعبة للسلة مع الصور ====================
const AddGameModal = ({
  show,
  onClose,
  games,
  onAddGame
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGame, setSelectedGame] = useState(null);

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

          {selectedGame ? (
            <div className="game-quick-add">
              <div className="selected-game-preview">
                <GameImage src={selectedGame.image_url} alt={selectedGame.name} size="small" />
                <div className="selected-game-info">
                  <h4>{selectedGame.name}</h4>
                  <div className="selected-game-price">
                    {formatCurrency(selectedGame.price_per_15min)} / 15 دقيقة
                  </div>
                </div>
              </div>
              <div className="quick-add-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    onAddGame(selectedGame);
                    setSelectedGame(null);
                  }}
                >
                  <Plus size={16} />
                  إضافة للسلة
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setSelectedGame(null)}
                >
                  رجوع
                </button>
              </div>
            </div>
          ) : (
            <div className="games-list">
              {filteredGames.length === 0 ? (
                <div className="empty-state">
                  {availableGames.length === 0 ? (
                    <>
                      <Gamepad2 size={48} />
                      <p>لا توجد ألعاب متاحة</p>
                    </>
                  ) : (
                    <>
                      <Search size={48} />
                      <p>
                        لا توجد نتائج لـ {"\""}{searchTerm}{"\""}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                filteredGames.map(game => (
                  <div
                    key={game.id}
                    className="game-select-item"
                    onClick={() => setSelectedGame(game)}
                  >
                    <GameImage src={game.image_url} alt={game.name} size="small" />
                    <div className="game-select-info">
                      <h4>{game.name}</h4>
                      {game.category && (
                        <span className="game-category">{game.category}</span>
                      )}
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
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== مكون تفاصيل التأجير ====================
const RentalDetailsModal = ({
  show,
  onClose,
  rental,
  items,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState('info');

  const isEmployee = userRole === 'employee' || userRole === 'موظف';
  const isManager = userRole === 'admin' || userRole === 'manager' || userRole === 'مدير';

  if (!show || !rental) return null;

  const rentalItems = items.filter(item => item.rental_id === rental.id);

  return (
    <div className="modal-overlay">
      <div className="modal modal-xlarge">
        <div className="modal-header">
          <h3>
            <Eye size={24} />
            تفاصيل التأجير #{rental.rental_number}
          </h3>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <Info size={16} />
            المعلومات الأساسية
          </button>
          <button 
            className={`tab-btn ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => setActiveTab('games')}
          >
            <Gamepad2 size={16} />
            الألعاب
          </button>
          {isManager && (
            <button 
              className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              <DollarSign size={16} />
              معلومات الدفع
            </button>
          )}
        </div>
        
        <div className="modal-body">
          {activeTab === 'info' && (
            <div className="details-section">
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">رقم التأجير:</span>
                  <span className="detail-value highlight">{rental.rental_number}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">العميل:</span>
                  <span className="detail-value">{rental.customer_name}</span>
                </div>
                {rental.customer_phone && rental.customer_phone !== '00000000000' && (
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
                {rental.end_time && (
                  <div className="detail-item">
                    <span className="detail-label">وقت الانتهاء:</span>
                    <span className="detail-value">{formatDateTime(rental.end_time)}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">بواسطة:</span>
                  <span className="detail-value">{rental.employee_name || rental.user_name}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'games' && (
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
                      <div className="item-detail">
                        <User size={12} />
                        <span>الطفل: {item.child_name || 'غير محدد'}</span>
                      </div>
                      <div className="item-detail">
                        <Clock size={12} />
                        <span>المدة: {item.duration_minutes || 0} دقيقة</span>
                      </div>
                      <div className="item-detail">
                        <Package size={12} />
                        <span>الكمية: {item.quantity || 1}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payment' && isManager && (
            <div className="details-section">
              <h4>معلومات الدفع</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">المبلغ الإجمالي:</span>
                  <span className="detail-value highlight">{formatCurrency(rental.total_amount || 0)}</span>
                </div>
                {rental.final_amount && (
                  <div className="detail-item">
                    <span className="detail-label">المبلغ النهائي:</span>
                    <span className="detail-value">{formatCurrency(rental.final_amount)}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">طريقة الدفع:</span>
                  <span className="detail-value">{rental.payment_method || 'نقدي'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">حالة الدفع:</span>
                  <span className={`payment-status-badge ${rental.payment_status}`}>
                    {rental.payment_status === 'paid' ? 'مدفوع' : 'معلق'}
                  </span>
                </div>
                {rental.is_refunded && (
                  <div className="detail-item">
                    <span className="detail-label">حالة الاسترداد:</span>
                    <span className="refunded-badge">مسترد</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            إغلاق
          </button>
          <button className="btn btn-outline">
            <Printer size={16} />
            طباعة
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== مكون إنهاء تأجير مفتوح ====================
const CompleteOpenRentalModal = ({
  show,
  onClose,
  rental,
  items,
  onConfirm,
  userRole
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isManager = userRole === 'admin' || userRole === 'manager' || userRole === 'مدير';

  const rentalItems = useMemo(() => {
    return items.filter(item => item.rental_id === rental?.id);
  }, [rental, items]);

  const calculateDuration = useCallback(() => {
    if (!rental?.start_time) return 0;
    return Math.max(15, calculateDuration(rental.start_time, new Date()));
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
              <span>وقت البدء:</span>
              <span>{formatDateTime(rental.start_time)}</span>
            </div>
            <div className="summary-row highlight">
              <span>المدة المنقضية:</span>
              <span>{duration} دقيقة</span>
            </div>
          </div>

          <div className="items-summary">
            <h4>الألعاب</h4>
            {rentalItems.map(item => (
              <div key={item.id} className="summary-row">
                <span>
                  <Gamepad2 size={14} />
                  {item.game_name} 
                  {item.child_name && ` (${item.child_name})`} 
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

// ==================== المكون الرئيسي ====================
const Rentals = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState({
    games: false,
    rentals: false,
    completed: false,
    shift: false,
    processing: false
  });
  
  const [games, setGames] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [shiftStats, setShiftStats] = useState(null);
  const [activeRentals, setActiveRentals] = useState([]);
  const [completedRentals, setCompletedRentals] = useState([]);
  const [rentalItems, setRentalItems] = useState([]);
  
  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [showRentalDetailsModal, setShowRentalDetailsModal] = useState(false);
  const [showCompleteOpenModal, setShowCompleteOpenModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const userRole = user?.role || 'employee';
  const isEmployee = userRole === 'employee' || userRole === 'موظف';
  const isManager = userRole === 'admin' || userRole === 'manager' || userRole === 'مدير';

  // تحميل الألعاب مع الصور
  const loadGames = useCallback(async () => {
    if (!user?.branch_id) return;
    
    setLoading(prev => ({ ...prev, games: true }));
    try {
      const response = await api.get('/games', {
        params: { 
          branch_id: user.branch_id,
          include_images: true 
        }
      });
      
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
      const response = await api.get('/shifts/current');
      
      if (response.success && response.data) {
        const shift = response.data;
        if (shift.employee_id === user?.id || isManager) {
          setCurrentShift(shift);
        } else {
          setCurrentShift(null);
        }
      } else {
        setCurrentShift(null);
      }
    } catch (error) {
      console.error('خطأ في تحميل الشيفت:', error);
    } finally {
      setLoading(prev => ({ ...prev, shift: false }));
    }
  }, [user?.id, isManager]);

  // تحميل التأجيرات المكتملة (للمدير فقط)
  const loadCompletedRentals = useCallback(async () => {
    if (!currentShift?.id || !isManager) return;
    
    setLoading(prev => ({ ...prev, completed: true }));
    try {
      const response = await api.get('/rentals/completed', {
        params: { shift_id: currentShift.id, limit: 100 }
      });
      
      if (response?.success) {
        setCompletedRentals(response.data || []);
        console.log(`📊 تم تحميل ${response.data?.length || 0} تأجير مكتمل`);
      }
    } catch (error) {
      console.error('خطأ في تحميل التأجيرات المكتملة:', error);
    } finally {
      setLoading(prev => ({ ...prev, completed: false }));
    }
  }, [currentShift?.id, isManager]);

// تحميل التأجيرات النشطة
const loadActiveRentals = useCallback(async () => {
  if (!currentShift?.id) {
    console.log('⏳ لا يوجد شيفت نشط، تخطي تحميل التأجيرات');
    setActiveRentals([]);
    setRentalItems([]);
    return;
  }
  
  setLoading(prev => ({ ...prev, rentals: true }));
  
  try {
    const token = localStorage.getItem('token');
    const cleanToken = token?.startsWith('Bearer ') ? token.substring(7) : token;
    
    console.log(`🔍 جلب التأجيرات النشطة للشيفت: ${currentShift.id}`);
    
const response = await fetch(
  `${API_BASE_URL}/api/rentals/active?shift_id=${currentShift.id}`,
  {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      "Content-Type": "application/json",
    },
  }
);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('📥 استجابة التأجيرات:', result);
    
    if (result.success) {
      const rentals = result.data || [];
      console.log(`📊 تم العثور على ${rentals.length} تأجير نشط`);
      
      setActiveRentals(rentals);
      
      // جمع العناصر
      const allItems = [];
      rentals.forEach(rental => {
        if (rental.items && rental.items.length > 0) {
          allItems.push(...rental.items);
        }
      });
      
      setRentalItems(allItems);
      console.log(`📦 إجمالي العناصر: ${allItems.length}`);
    } else {
      setActiveRentals([]);
      setRentalItems([]);
    }
    
  } catch (error) {
    console.error('🔥 خطأ في تحميل التأجيرات:', error);
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
      const response = await api.post('/shifts/start', {
        opening_cash: 0
      });

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
      const response = await api.put(`/shifts/${currentShift.id}/end`, {
        closing_cash: closingCash || 0,
        notes
      });

      if (response.success) {
        setCurrentShift(null);
        setActiveRentals([]);
        setCompletedRentals([]);
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

  const handleUpdateCartItem = useCallback((itemId, updates) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  }, []);

  const handleRemoveCartItem = useCallback((itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

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
    const token = localStorage.getItem('token');
    
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

    console.log('📦 إرسال بيانات التأجير:', rentalData);

 const response = await fetch(
  `${API_BASE_URL}/api/rentals`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(rentalData)
  }
);

    const responseText = await response.text();
    console.log('📥 استجابة خام:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ الرد مش JSON:', responseText);
      setError('الخادم أرجع رد غير متوقع');
      return;
    }

    console.log('📥 نتيجة:', result);

    if (result.success) {
      setSuccess(`✅ تم إنشاء التأجير للعميل ${customerInfo.name} بنجاح`);
      handleClearCart();
      await loadActiveRentals();
    } else {
      setError(`❌ ${result.message}`);
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error);
    setError('فشل الاتصال بالخادم: ' + error.message);
  } finally {
    setLoading(prev => ({ ...prev, processing: false }));
  }
}, [currentShift, cartItems, customerInfo, handleClearCart, loadActiveRentals]);

  // إنهاء تأجير مفتوح
  const handleCompleteOpenRental = useCallback(async (rental, data) => {
    if (!rental) return;

    setLoading(prev => ({ ...prev, processing: true }));
    try {
      const response = await api.post(`/rentals/${rental.id}/complete-open`, {
        payment_method: data.payment_method,
        actual_minutes: data.actual_minutes,
        final_amount: data.final_amount
      });

      if (response.success) {
        setSuccess(`✅ تم إنهاء التأجير ${rental.rental_number} بنجاح`);
        await loadActiveRentals();
        await loadCompletedRentals();
      } else {
        setError(`❌ فشل إنهاء التأجير: ${response.message}`);
      }
    } catch (error) {
      console.error('خطأ في إنهاء التأجير:', error);
      setError('حدث خطأ في إنهاء التأجير');
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [loadActiveRentals, loadCompletedRentals]);

  // إلغاء تأجير (مع استرداد)
  const handleCancelRental = useCallback(async (rental, data) => {
    if (!isManager) {
      setError('❌ ليس لديك صلاحية إلغاء التأجيرات');
      return;
    }

    setLoading(prev => ({ ...prev, processing: true }));
    try {
      const response = await api.post(`/rentals/${rental.id}/cancel`, {
        reason: data.reason,
        refund_amount: data.refund_amount,
        is_refunded: true
      });

      if (response.success) {
        setSuccess(`✅ تم إلغاء التأجير ${rental.rental_number} واسترداد ${formatCurrency(data.refund_amount)}`);
        await loadActiveRentals();
        await loadCompletedRentals();
      } else {
        setError(`❌ فشل إلغاء التأجير: ${response.message}`);
      }
    } catch (error) {
      console.error('خطأ في إلغاء التأجير:', error);
      setError('حدث خطأ في إلغاء التأجير');
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [isManager, loadActiveRentals, loadCompletedRentals]);

  // تغيير اللعبة
  const handleChangeGame = useCallback(async (rental, oldGameId, newGameId, diff) => {
    if (!isManager) {
      setError('❌ ليس لديك صلاحية تغيير الألعاب');
      return;
    }

    setLoading(prev => ({ ...prev, processing: true }));
    try {
      const response = await api.post(`/rentals/${rental.id}/change-game`, {
        old_game_id: oldGameId,
        new_game_id: newGameId,
        difference: diff.difference,
        refund: diff.refund
      });

      if (response.success) {
        const diffText = diff.refund 
          ? `استرداد ${formatCurrency(Math.abs(diff.difference))}`
          : `إضافة ${formatCurrency(diff.difference)}`;
        
        setSuccess(`✅ تم تغيير اللعبة بنجاح (${diffText})`);
        await loadActiveRentals();
        await loadCompletedRentals();
      } else {
        setError(`❌ فشل تغيير اللعبة: ${response.message}`);
      }
    } catch (error) {
      console.error('خطأ في تغيير اللعبة:', error);
      setError('حدث خطأ في تغيير اللعبة');
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [isManager, loadActiveRentals, loadCompletedRentals]);

  // Effects
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  useEffect(() => {
    if (currentShift?.id) {
      loadActiveRentals();
      loadCompletedRentals();
    }
  }, [currentShift?.id, loadActiveRentals, loadCompletedRentals]);

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
        completedRentals={completedRentals}
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
              setSelectedRental(rental);
              setShowCompleteOpenModal(true);
            }}
            onCancel={handleCancelRental}
            onChangeGame={handleChangeGame}
            onViewDetails={(rental) => {
              setSelectedRental(rental);
              setShowRentalDetailsModal(true);
            }}
            currentShift={currentShift}
            userRole={userRole}
          />

          {/* جدول التأجيرات المكتملة - يظهر للمدير فقط */}
          {isManager && (
            <CompletedRentals
              rentals={completedRentals}
              items={rentalItems}
              loading={loading}
              currentShift={currentShift}
              userRole={userRole}
            />
          )}
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
        userRole={userRole}
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
        userRole={userRole}
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