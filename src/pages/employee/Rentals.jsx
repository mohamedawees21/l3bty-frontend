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
  ArrowLeftRight, Undo2, RotateCcw as RotateIcon, History, Archive,
  Table, ClipboardList, ChevronDown, ChevronUp, Maximize2, Minimize2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Rentals.css';

// ==================== ثوابت النظام ====================
const PAYMENT_METHODS = [
  { value: 'cash', label: '💵 نقدي', icon: DollarSign },
  { value: 'card', label: '💳 بطاقة', icon: CreditCard },
  { value: 'wallet', label: '📱 محفظة', icon: Wallet }
];

const RENTAL_TYPES = [
  { value: 'fixed', label: '⏰ وقت ثابت', color: '#3498db' },
  { value: 'open', label: '🔓 وقت مفتوح', color: '#f39c12' }
];

const GAME_CATEGORIES = [
  { id: 'all', label: 'الكل', icon: Grid },
  { id: 'playstation', label: 'بلايستيشن', icon: Gamepad2 },
  { id: 'vr', label: 'واقع افتراضي', icon: Eye },
  { id: 'scooter', label: 'سكوتر', icon: Zap },
  { id: 'bike', label: 'دراجات', icon: Activity },
  { id: 'table', label: 'ألعاب طاولة', icon: Table }
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

// ==================== مكون صورة اللعبة ====================
const GameImage = ({ src, alt, className, size = 'medium', onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageMap = {
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
          return value;
        }
      }
    }

    return '/images/playstation.jpg';
  }, []);

  const currentSrc = useMemo(() => getImagePath(alt, src), [alt, src, getImagePath]);

  const sizeClasses = {
    small: 'image-small',
    medium: 'image-medium',
    large: 'image-large'
  };

  return (
    <div 
      className={`game-image-container ${sizeClasses[size]} ${className || ''} ${imageLoaded ? 'loaded' : 'loading'}`}
      onClick={onClick}
    >
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
          key={currentSrc}
          src={currentSrc}
          alt={alt || 'صورة اللعبة'}
          className={`game-image ${imageLoaded ? 'visible' : 'hidden'}`}
          onLoad={() => {
            setImageLoaded(true);
            setImageError(false);
          }}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
        />
      )}
    </div>
  );
};

// ==================== مكون شريط حالة الشيفت (للموظف فقط - بدون إيرادات) ====================
const EmployeeShiftStatusBar = ({
  currentShift,
  onStartShift,
  onEndShift,
  loading,
  activeRentals = []
}) => {
  const [showEndShiftConfirm, setShowEndShiftConfirm] = useState(false);

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
      <div className="shift-status-bar open employee-bar">
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

        <div className="shift-stats employee-stats">
          <div className="shift-stat">
            <Activity size={16} className="stat-icon active" />
            <div className="shift-stat-content">
              <span className="shift-stat-label">تأجيرات نشطة</span>
              <span className="shift-stat-value">{activeRentals?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="shift-actions">
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
          <div className="modal modal-end-shift employee-modal">
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
              
              {activeRentals?.length > 0 && (
                <div className="alert alert-warning">
                  <AlertCircle size={16} />
                  <div className="alert-content">
                    <strong>يوجد {activeRentals.length} تأجير نشط</strong>
                    <p>سيتم إغلاقها تلقائياً عند إنهاء الشيفت</p>
                  </div>
                </div>
              )}

              <p className="note-text">
                ملاحظة: هذا الإجراء سينهي شيفتك الشخصية فقط
              </p>
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
                  onEndShift();
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

// ==================== مكون قائمة الألعاب المنبثقة ====================
const GamesDropdown = ({ 
  games, 
  onSelectGame, 
  onClose, 
  isOpen,
  currentShift,
  branchId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const dropdownRef = useRef(null);

  // تصفية الألعاب حسب الفرع
  const branchGames = useMemo(() => {
    if (!games?.length || !branchId) return [];
    return games.filter(game => 
      game && 
      game.branch_id === branchId && 
      game.is_active !== false
    );
  }, [games, branchId]);

  // تصفية الألعاب حسب البحث والتصنيف
  const filteredGames = useMemo(() => {
    if (!branchGames.length) return [];
    
    return branchGames.filter(game => {
      const matchesSearch = !searchTerm || 
        game.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        game.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        game.type?.toLowerCase() === selectedCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [branchGames, searchTerm, selectedCategory]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const canAddGames = currentShift;

  const handleGameClick = (game) => {
    if (!canAddGames) {
      alert('يجب فتح شيفت أولاً لإضافة ألعاب');
      return;
    }
    onSelectGame(game);
  };

  return (
    <div className="games-dropdown-overlay">
      <div className="games-dropdown-container" ref={dropdownRef}>
        <div className="dropdown-header">
          <div className="header-title">
            <Gamepad2 size={20} />
            <h3>اختر لعبة</h3>
          </div>
          <div className="header-actions">
            <button 
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="عرض شبكي"
            >
              <Grid size={16} />
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="عرض قائمة"
            >
              <List size={16} />
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="dropdown-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="ابحث عن لعبة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="dropdown-categories">
          {GAME_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {!canAddGames ? (
          <div className="dropdown-disabled">
            <Lock size={32} />
            <p>يجب فتح شيفت أولاً لإضافة ألعاب</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="dropdown-empty">
            <Package size={32} />
            <p>لا توجد ألعاب متاحة</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="btn btn-link">
                مسح البحث
              </button>
            )}
          </div>
        ) : (
          <div className={`dropdown-games ${viewMode}`}>
            {filteredGames.map(game => (
              <div
                key={game.id}
                className={`game-item ${viewMode}`}
                onClick={() => handleGameClick(game)}
              >
                <GameImage 
                  src={game.image_url}
                  alt={game.name}
                  size={viewMode === 'grid' ? 'medium' : 'small'}
                />
                <div className="game-item-info">
                  <span className="game-name">{game.name}</span>
                  <span className="game-price">{formatCurrency(game.price_per_15min)}</span>
                </div>
                <button className="add-game-btn">
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="dropdown-footer">
          <span>إجمالي الألعاب: {filteredGames.length}</span>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== مكون بطاقة اللعبة المبسطة ====================
const SimpleGameCard = ({ game, onAddToCart, currentShift }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!currentShift) {
      alert('❌ يجب فتح شيفت أولاً');
      return;
    }
    onAddToCart(game);
  };

  return (
    <div 
      className={`simple-game-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="simple-game-image">
        <GameImage 
          src={game.image_url}
          alt={game.name}
          size="small"
        />
      </div>
      <div className="simple-game-info">
        <span className="simple-game-name">{game.name}</span>
        <span className="simple-game-price">{formatCurrency(game.price_per_15min)}</span>
      </div>
      <button className="simple-add-btn">
        <Plus size={14} />
      </button>
    </div>
  );
};

// ==================== مكون قائمة الألعاب المبسطة ====================
const SimpleGamesList = ({ 
  games, 
  branchId, 
  onAddToCart, 
  loading,
  currentShift,
  onOpenDropdown
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const branchGames = useMemo(() => {
    if (!games?.length || !branchId) return [];
    return games.filter(game => 
      game && 
      game.branch_id === branchId && 
      game.is_active !== false
    );
  }, [games, branchId]);

  const filteredGames = useMemo(() => {
    if (!branchGames.length) return [];
    let filtered = branchGames;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(g => g.name?.toLowerCase().includes(term));
    }
    
    return filtered;
  }, [branchGames, searchTerm]);

  const displayedGames = useMemo(() => {
    return isExpanded ? filteredGames : filteredGames.slice(0, 6);
  }, [filteredGames, isExpanded]);

  if (loading.games) {
    return (
      <div className="simple-games-section">
        <div className="simple-games-header">
          <h3>الألعاب المتاحة</h3>
        </div>
        <div className="simple-games-loading">
          <Loader2 className="spinner" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="simple-games-section">
      <div className="simple-games-header">
        <div className="header-title">
          <h3>الألعاب المتاحة</h3>
          <span className="games-count">{branchGames.length}</span>
        </div>
        <div className="header-actions">
          <div className="simple-search">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="ابحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="browse-all-btn"
            onClick={onOpenDropdown}
            title="عرض الكل"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      <div className="simple-games-list">
        {displayedGames.length === 0 ? (
          <div className="simple-games-empty">
            <Package size={24} />
            <p>لا توجد ألعاب</p>
          </div>
        ) : (
          displayedGames.map(game => (
            <SimpleGameCard
              key={game.id}
              game={game}
              onAddToCart={onAddToCart}
              currentShift={currentShift}
            />
          ))
        )}
      </div>

      {filteredGames.length > 6 && (
        <button 
          className="expand-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>عرض أقل <ChevronUp size={14} /></>
          ) : (
            <>عرض الكل ({filteredGames.length}) <ChevronDown size={14} /></>
          )}
        </button>
      )}
    </div>
  );
};

// ==================== مكون سلة التأجير المبسطة (بدون إيرادات) ====================
const SimpleCart = ({
  items,
  onUpdateItem,
  onRemoveItem,
  onClearCart,
  customerInfo,
  onCustomerInfoChange,
  onSubmit,
  isSubmitting,
  onAddGame,
  currentShift
}) => {
  const calculateItemTotal = useCallback((item) => {
    if (item.rental_type === 'open') return 0;
    const units = Math.ceil((item.duration_minutes || 15) / 15);
    return (item.price_per_15min || 0) * units * (item.quantity || 1);
  }, []);

  const calculateTotal = useCallback(() => {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
  }, [items, calculateItemTotal]);

  const isCartValid = useCallback(() => {
    return items.length > 0 && customerInfo.name?.trim() && currentShift;
  }, [items.length, customerInfo.name, currentShift]);

  const handleSubmit = () => {
    onSubmit();
  };

  if (!currentShift) {
    return (
      <div className="enhanced-cart disabled simple-cart">
        <div className="cart-header">
          <ShoppingCart size={18} />
          <h3>السلة</h3>
        </div>
        <div className="cart-disabled">
          <Lock size={24} />
          <p>الشيفت مغلق</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-cart simple-cart">
      <div className="cart-header">
        <div className="cart-title">
          <ShoppingCart size={18} />
          <h3>السلة</h3>
          {items.length > 0 && <span className="cart-count">{items.length}</span>}
        </div>
        {items.length > 0 && (
          <button onClick={onClearCart} className="cart-clear" title="تفريغ السلة">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="cart-empty-state">
          <ShoppingCart size={32} />
          <p>السلة فارغة</p>
          <button onClick={onAddGame} className="btn btn-primary btn-sm">
            <Plus size={14} /> إضافة لعبة
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items-list">
            {items.map((item) => (
              <div key={item.id} className="cart-item-simple">
                <div className="cart-item-header">
                  <span className="item-name">{item.game_name}</span>
                  <button onClick={() => onRemoveItem(item.id)} className="item-remove">
                    <X size={12} />
                  </button>
                </div>
                
                <div className="cart-item-controls">
                  <select
                    value={item.rental_type}
                    onChange={(e) => onUpdateItem(item.id, { rental_type: e.target.value })}
                    className="control-select"
                  >
                    {RENTAL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>

                  {item.rental_type === 'fixed' && (
                    <select
                      value={item.duration_minutes || 15}
                      onChange={(e) => onUpdateItem(item.id, { duration_minutes: parseInt(e.target.value) })}
                      className="control-select"
                    >
                      <option value="15">15 د</option>
                      <option value="30">30 د</option>
                      <option value="45">45 د</option>
                      <option value="60">60 د</option>
                      <option value="90">90 د</option>
                      <option value="120">120 د</option>
                    </select>
                  )}

                  <div className="quantity-control">
                    <button
                      onClick={() => onUpdateItem(item.id, { quantity: Math.max(1, (item.quantity || 1) - 1) })}
                      className="quantity-btn"
                    >
                      <Minus size={10} />
                    </button>
                    <span>{item.quantity || 1}</span>
                    <button
                      onClick={() => onUpdateItem(item.id, { quantity: (item.quantity || 1) + 1 })}
                      className="quantity-btn"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>

                {item.rental_type === 'fixed' && (
                  <div className="cart-item-total">
                    <span>المجموع:</span>
                    <span className="item-price">{formatCurrency(calculateItemTotal(item))}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="cart-customer-info">
            <input
              type="text"
              placeholder="اسم العميل *"
              value={customerInfo.name || ''}
              onChange={(e) => onCustomerInfoChange('name', e.target.value)}
              className="customer-input"
            />
            <input
              type="tel"
              placeholder="رقم الهاتف"
              value={customerInfo.phone || ''}
              onChange={(e) => onCustomerInfoChange('phone', e.target.value.replace(/\D/g, '').slice(0, 11))}
              className="customer-input"
              maxLength={11}
            />
          </div>

          <div className="cart-summary simple-summary">
            <div className="summary-row">
              <span>الإجمالي:</span>
              <span className="summary-total">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="btn btn-primary btn-block"
            disabled={isSubmitting || !isCartValid()}
          >
            {isSubmitting ? (
              <><Loader2 className="spinner" size={14} /> جاري...</>
            ) : (
              <>تأكيد التأجير</>
            )}
          </button>
        </>
      )}
    </div>
  );
};

// ==================== مكون جدول التأجيرات النشطة المبسط ====================
const SimpleActiveRentalsTable = ({ 
  rentals, 
  items,
  loading, 
  onComplete,
  onRefresh
}) => {
  const [timeNow, setTimeNow] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRentals, setExpandedRentals] = useState({});

  useEffect(() => {
    const interval = setInterval(() => setTimeNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const rentalsWithItems = useMemo(() => {
    if (!rentals || !items) return [];
    
    const itemsMap = {};
    items.forEach(item => {
      if (item && item.rental_id) {
        if (!itemsMap[item.rental_id]) {
          itemsMap[item.rental_id] = [];
        }
        itemsMap[item.rental_id].push(item);
      }
    });

    return rentals.map(rental => ({
      ...rental,
      items: itemsMap[rental.id] || []
    }));
  }, [rentals, items]);

  const calculateRemainingTime = useCallback((rental) => {
    if (rental.rental_type === 'open') return 'مفتوح';
    if (!rental.start_time) return '--:--';
    
    try {
      const startTime = new Date(rental.start_time);
      const duration = rental.total_duration || 15;
      const endTime = new Date(startTime.getTime() + duration * 60000);
      const remainingMs = endTime - timeNow;
      
      if (remainingMs <= 0) return '00:00';
      
      const remainingMinutes = Math.floor(remainingMs / 60000);
      const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
      return `${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } catch {
      return '--:--';
    }
  }, [timeNow]);

  const isExpired = useCallback((rental) => {
    if (rental.rental_type !== 'fixed' || !rental.start_time) return false;
    try {
      const startTime = new Date(rental.start_time);
      const duration = rental.total_duration || 15;
      const endTime = new Date(startTime.getTime() + duration * 60000);
      return timeNow > endTime;
    } catch {
      return false;
    }
  }, [timeNow]);

  const filteredRentals = useMemo(() => {
    if (!rentalsWithItems.length) return [];
    return rentalsWithItems.filter(rental => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (rental.customer_name && rental.customer_name.toLowerCase().includes(term)) ||
        (rental.rental_number && rental.rental_number.toLowerCase().includes(term)) ||
        (rental.items && rental.items.some(item => item.game_name && item.game_name.toLowerCase().includes(term)))
      );
    });
  }, [rentalsWithItems, searchTerm]);

  const toggleExpand = (rentalId) => {
    setExpandedRentals(prev => ({
      ...prev,
      [rentalId]: !prev[rentalId]
    }));
  };

  if (loading.rentals) {
    return <div className="table-loading"><Loader2 className="spinner" size={24} /></div>;
  }

  if (!filteredRentals || filteredRentals.length === 0) {
    return (
      <div className="table-empty">
        <Activity size={32} />
        <p>لا توجد تأجيرات نشطة</p>
        <button onClick={onRefresh} className="btn btn-primary btn-sm">
          <RefreshCw size={14} /> تحديث
        </button>
      </div>
    );
  }

  return (
    <div className="active-rentals-table simple-table">
      <div className="table-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="بحث بالعميل أو رقم التأجير أو اللعبة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="table-search"
          />
          <button onClick={onRefresh} className="refresh-btn" title="تحديث">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      <div className="table-body">
        {filteredRentals.map(rental => {
          const hasMultipleItems = rental.items && rental.items.length > 1;
          const isExpanded = expandedRentals[rental.id];
          
          return (
            <div key={rental.id} className={`rental-group ${isExpired(rental) ? 'expired' : ''}`}>
              <div className="rental-header">
                <div className="rental-info">
                  <div className="rental-badge">
                    <Hash size={12} />
                    <span>#{rental.rental_number || rental.id}</span>
                  </div>
                  <div className="rental-customer">
                    <User size={14} />
                    <span>{rental.customer_name || 'بدون اسم'}</span>
                  </div>
                </div>
                
                <div className="rental-time">
                  {rental.rental_type === 'fixed' ? (
                    <>
                      <Timer size={14} />
                      <span className={isExpired(rental) ? 'expired' : ''}>
                        {calculateRemainingTime(rental)}
                      </span>
                    </>
                  ) : (
                    <span className="open-badge">مفتوح</span>
                  )}
                </div>

                <div className="rental-actions">
                  {hasMultipleItems && (
                    <button 
                      onClick={() => toggleExpand(rental.id)} 
                      className="action-btn expand"
                      title={isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  )}
                  {rental.rental_type === 'open' && (
                    <button 
                      onClick={() => onComplete(rental)} 
                      className="action-btn success" 
                      title="إنهاء"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="rental-items">
                {rental.items && rental.items.slice(0, 1).map(item => (
                  <div key={item.id} className="rental-item">
                    <div className="item-game">
                      <Gamepad2 size={14} />
                      <span className="game-name">{item.game_name}</span>
                    </div>
                    <div className="item-details">
                      {item.quantity > 1 && <span className="badge">x{item.quantity}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {isExpanded && rental.items && rental.items.length > 1 && (
                <div className="rental-items-expanded">
                  {rental.items.slice(1).map(item => (
                    <div key={item.id} className="rental-item secondary">
                      <div className="item-game">
                        <Gamepad2 size={12} />
                        <span className="game-name">{item.game_name}</span>
                      </div>
                      <div className="item-details">
                        {item.quantity > 1 && <span className="badge">x{item.quantity}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== مكون نافذة تفاصيل التأجير المبسطة ====================
const SimpleRentalDetailsModal = ({ show, onClose, rental, items }) => {
  if (!show || !rental) return null;

  const rentalItems = items ? items.filter(item => item && item.rental_id === rental.id) : [];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>تفاصيل التأجير #{rental.rental_number || rental.id}</h3>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="details-grid">
            <div className="detail-row">
              <span className="label">العميل:</span>
              <span className="value">{rental.customer_name || 'غير محدد'}</span>
            </div>
            {rental.customer_phone && (
              <div className="detail-row">
                <span className="label">الهاتف:</span>
                <span className="value">{rental.customer_phone}</span>
              </div>
            )}
            <div className="detail-row">
              <span className="label">البداية:</span>
              <span className="value">{rental.start_time ? formatDateTime(rental.start_time) : '--'}</span>
            </div>
          </div>

          <h4>الألعاب ({rentalItems.length})</h4>
          <div className="items-list">
            {rentalItems.map(item => (
              <div key={item.id} className="item-row">
                <Gamepad2 size={14} />
                <span className="game-name">{item.game_name}</span>
                {item.quantity > 1 && <span className="badge">x{item.quantity}</span>}
              </div>
            ))}
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

// ==================== مكون إنهاء تأجير مفتوح مبسط ====================
const SimpleCompleteOpenModal = ({ show, onClose, rental, items, onConfirm }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateDuration = useCallback(() => {
    if (!rental?.start_time) return 15;
    try {
      return Math.max(15, Math.floor((new Date() - new Date(rental.start_time)) / (1000 * 60)));
    } catch {
      return 15;
    }
  }, [rental]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(rental);
      onClose();
    } catch (error) {
      console.error('خطأ في إنهاء التأجير:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show || !rental) return null;

  const duration = calculateDuration();

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="header-icon success">
            <CheckCircle size={24} />
          </div>
          <h3>إنهاء التأجير المفتوح</h3>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
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

          <p className="confirm-text">هل أنت متأكد من إنهاء هذا التأجير المفتوح؟</p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            إلغاء
          </button>
          <button onClick={handleConfirm} className="btn btn-success" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="spinner" size={16} /> : 'تأكيد الإنهاء'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== المكون الرئيسي للموظف ====================
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
  const [activeRentals, setActiveRentals] = useState([]);
  const [rentalItems, setRentalItems] = useState([]);
  
  const [cartItems, setCartItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  
  const [showGamesDropdown, setShowGamesDropdown] = useState(false);
  const [showRentalDetailsModal, setShowRentalDetailsModal] = useState(false);
  const [showCompleteOpenModal, setShowCompleteOpenModal] = useState(false);
  const [showActiveTable, setShowActiveTable] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const userRole = user?.role || 'employee';

  // تحميل الألعاب
  const loadGames = useCallback(async () => {
    if (!user?.branch_id) return;
    setLoading(prev => ({ ...prev, games: true }));
    try {
      const response = await api.getGames({ branch_id: user.branch_id });
      if (response && response.success) {
        setGames(response.data || []);
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error('خطأ في تحميل الألعاب:', error);
      setGames([]);
    } finally {
      setLoading(prev => ({ ...prev, games: false }));
    }
  }, [user?.branch_id]);

  // تحميل الشيفت الحالي
  const loadCurrentShift = useCallback(async () => {
    setLoading(prev => ({ ...prev, shift: true }));
    try {
      const response = await api.getCurrentShift();
      if (response && response.success && response.data) {
        setCurrentShift(response.data);
      } else {
        setCurrentShift(null);
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
      if (response && response.success) {
        const rentals = response.data || [];
        setActiveRentals(rentals);
        
        const allItems = [];
        if (rentals && rentals.length > 0) {
          rentals.forEach(rental => {
            if (rental.items && rental.items.length > 0) {
              allItems.push(...rental.items);
            }
          });
        }
        setRentalItems(allItems);
      } else {
        setActiveRentals([]);
        setRentalItems([]);
      }
    } catch (error) {
      console.error('خطأ في تحميل التأجيرات النشطة:', error);
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

  // تحديث التأجيرات
  const refreshRentals = useCallback(() => {
    if (currentShift?.id) {
      loadActiveRentals();
    }
  }, [currentShift?.id, loadActiveRentals]);

  useEffect(() => {
    if (currentShift?.id) {
      loadActiveRentals();
    }
  }, [currentShift?.id, refreshTrigger, loadActiveRentals]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  useEffect(() => {
    if (!currentShift?.id) return;
    const interval = setInterval(() => {
      loadActiveRentals();
    }, 30000);
    return () => clearInterval(interval);
  }, [currentShift?.id, loadActiveRentals]);

  // بدء الشيفت
  const handleStartShift = useCallback(async () => {
    if (!user?.branch_id) {
      setError('لا يوجد فرع محدد للمستخدم');
      return;
    }

    setLoading(prev => ({ ...prev, processing: true }));
    try {
      const response = await api.startShift(0);
      if (response && response.success) {
        setCurrentShift(response.data);
        setSuccess('✅ تم فتح الشيفت بنجاح');
        await refreshAllData();
      } else {
        setError('❌ فشل فتح الشيفت');
      }
    } catch (error) {
      console.error('خطأ في فتح الشيفت:', error);
      setError('حدث خطأ في فتح الشيفت');
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [user?.branch_id, refreshAllData]);

  // إنهاء الشيفت (للموظف فقط)
  const handleEndShift = useCallback(async () => {
    if (!currentShift) return;
    setLoading(prev => ({ ...prev, processing: true }));
    try {
      const response = await api.endShift(currentShift.id, {
        closing_cash: 0,
        notes: 'إنهاء شيفت الموظف'
      });
      
      if (response && response.success) {
        setCurrentShift(null);
        setActiveRentals([]);
        setRentalItems([]);
        setSuccess('✅ تم إنهاء الشيفت بنجاح');
      } else {
        setError('❌ فشل إنهاء الشيفت');
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
    if (!currentShift && userRole === 'employee') {
      setError('❌ يجب فتح شيفت أولاً');
      return;
    }

    if (!game || !game.id) {
      setError('❌ بيانات اللعبة غير صالحة');
      return;
    }

    const newItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      game_id: game.id,
      game_name: game.name || 'لعبة',
      price_per_15min: game.price_per_15min || 0,
      rental_type: 'fixed',
      duration_minutes: 15,
      quantity: 1
    };

    setCartItems(prev => [...prev, newItem]);
    setShowGamesDropdown(false);
    setSuccess(`✅ تم إضافة ${game.name || 'اللعبة'} إلى السلة`);
  }, [currentShift, userRole]);

  const handleUpdateCartItem = useCallback((itemId, updates) => {
    setCartItems(prev =>
      prev.map(item => item.id === itemId ? { ...item, ...updates } : item)
    );
  }, []);

  const handleRemoveCartItem = useCallback((itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    setSuccess('✅ تم حذف العنصر من السلة');
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setCustomerInfo({ name: '', phone: '' });
  }, []);

  // إنشاء تأجير جديد
  const handleCreateRental = useCallback(async () => {
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
      const createdRentals = [];
      const createdItems = [];

      for (const item of cartItems) {
        const rentalData = {
          shift_id: currentShift.id,
          customer_name: customerInfo.name.trim(),
          customer_phone: customerInfo.phone || null,
          items: [{
            game_id: item.game_id,
            child_name: null,
            duration_minutes: item.rental_type === 'fixed' ? item.duration_minutes : null,
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
        
        setSuccess(`✅ تم إنشاء ${createdRentals.length} تأجير للعميل ${customerInfo.name}`);
        
        handleClearCart();
      } else {
        setError('❌ فشل إنشاء التأجيرات');
      }
      
    } catch (error) {
      console.error('خطأ في إنشاء التأجير:', error);
      setError('فشل إنشاء التأجير: ' + (error.message || 'خطأ غير معروف'));
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [currentShift, cartItems, customerInfo, handleClearCart]);

  // إنهاء تأجير مفتوح
  const handleCompleteOpenRental = useCallback(async (rental) => {
    if (!rental) return;
    setLoading(prev => ({ ...prev, processing: true }));
    try {
      const response = await api.completeOpenTime(rental.id);
      if (response && response.success) {
        setSuccess(`✅ تم إنهاء التأجير ${rental.rental_number} بنجاح`);
        await loadActiveRentals();
      } else {
        setError('❌ فشل إنهاء التأجير');
      }
    } catch (error) {
      console.error('خطأ في إنهاء التأجير:', error);
      setError('حدث خطأ في إنهاء التأجير');
    } finally {
      setLoading(prev => ({ ...prev, processing: false }));
    }
  }, [loadActiveRentals]);

  // التحقق من انتهاء التأجيرات الثابتة
  useEffect(() => {
    const checkExpiredRentals = async () => {
      if (!activeRentals || !activeRentals.length) return;

      const expiredRentals = activeRentals.filter(rental => {
        if (rental.rental_type !== 'fixed' || !rental.start_time) return false;
        try {
          const startTime = new Date(rental.start_time);
          const duration = rental.total_duration || 15;
          const endTime = new Date(startTime.getTime() + duration * 60000);
          return new Date() > endTime;
        } catch {
          return false;
        }
      });

      if (expiredRentals.length > 0) {
        for (const rental of expiredRentals) {
          try {
            await api.completeFixedTime(rental.id);
          } catch (error) {
            console.error(`خطأ في إنهاء التأجير ${rental.id}:`, error);
          }
        }
        await loadActiveRentals();
      }
    };

    const interval = setInterval(checkExpiredRentals, 5000);
    return () => clearInterval(interval);
  }, [activeRentals, loadActiveRentals]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    setSuccess('✅ تم تحديث البيانات');
  }, []);

  return (
    <div className="rentals-page employee-page">
      <EmployeeShiftStatusBar
        currentShift={currentShift}
        onStartShift={handleStartShift}
        onEndShift={handleEndShift}
        loading={loading.processing}
        activeRentals={activeRentals}
      />

      <div className="page-header">
        <h1>صفحة التأجير</h1>
        <div className="header-buttons">
          <button 
            className={`header-btn ${showActiveTable ? 'active' : ''}`}
            onClick={() => setShowActiveTable(!showActiveTable)}
          >
            <Activity size={18} />
            <span>التأجيرات النشطة ({activeRentals?.length || 0})</span>
          </button>
          <button 
            className="header-btn refresh-btn"
            onClick={handleRefresh}
            title="تحديث"
            disabled={loading.rentals}
          >
            <RefreshCw size={18} className={loading.rentals ? 'spinner' : ''} />
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="games-cart-container">
          <SimpleGamesList
            games={games}
            branchId={user?.branch_id}
            onAddToCart={handleAddToCart}
            loading={loading}
            currentShift={currentShift}
            onOpenDropdown={() => setShowGamesDropdown(true)}
          />

          <SimpleCart
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
            onAddGame={() => setShowGamesDropdown(true)}
            currentShift={currentShift}
          />
        </div>

        {showActiveTable && (
          <div className="tables-section">
            <h2>
              <Activity size={20} />
              التأجيرات النشطة
            </h2>
            <SimpleActiveRentalsTable
              rentals={activeRentals}
              items={rentalItems}
              loading={loading}
              onComplete={(rental) => {
                if (rental.rental_type === 'open') {
                  setSelectedRental(rental);
                  setShowCompleteOpenModal(true);
                }
              }}
              onRefresh={loadActiveRentals}
            />
          </div>
        )}
      </div>

      <GamesDropdown
        games={games}
        onSelectGame={handleAddToCart}
        onClose={() => setShowGamesDropdown(false)}
        isOpen={showGamesDropdown}
        currentShift={currentShift}
        branchId={user?.branch_id}
      />

      <SimpleRentalDetailsModal
        show={showRentalDetailsModal}
        onClose={() => {
          setShowRentalDetailsModal(false);
          setSelectedRental(null);
        }}
        rental={selectedRental}
        items={rentalItems}
      />

      <SimpleCompleteOpenModal
        show={showCompleteOpenModal}
        onClose={() => {
          setShowCompleteOpenModal(false);
          setSelectedRental(null);
        }}
        rental={selectedRental}
        items={rentalItems}
        onConfirm={handleCompleteOpenRental}
      />

      {error && (
        <div className="toast error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {success && (
        <div className="toast success">
          <CheckCircle size={18} />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {loading.processing && (
        <div className="global-loading">
          <Loader2 className="spinner" size={24} />
        </div>
      )}
    </div>
  );
};

export default Rentals;