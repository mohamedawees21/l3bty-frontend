import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity, Hash, User, Timer, Eye, Check, Undo2,
  Edit, X, Clock, DollarSign, Gamepad2, ChevronDown,
  ChevronUp, RefreshCw, Search, Loader2, AlertCircle
} from 'lucide-react';
import { formatCurrency, formatTime, calculateRemainingTime } from '../../utils/formatters';
import Button from '../ui/Button';

const ActiveRentalsTable = ({
  rentals = [],
  items = [],
  loading,
  onComplete,
  onCancel,
  onEarlyEnd,
  onModify,
  onViewDetails,
  currentShift,
  userRole,
  onRefresh,
  activeRentalsRef,
  onClose
}) => {
  const [timeNow, setTimeNow] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRentals, setExpandedRentals] = useState({});

  const isManager = userRole === 'admin' || userRole === 'branch_manager';

  // تحديث الوقت كل ثانية
  useEffect(() => {
    const interval = setInterval(() => setTimeNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ربط items بالتأجيرات
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

  // حساب الوقت المتبقي
  const getRemainingTime = useCallback((rental) => {
    if (rental.rental_type === 'open') return 'مفتوح';
    if (!rental.start_time) return '--:--';
    
    try {
      const startTime = new Date(rental.start_time);
      let duration = 15;
      
      if (rental.items && rental.items.length > 0) {
        duration = rental.items[0].duration_minutes || 15;
      } else {
        duration = rental.duration_minutes || 15;
      }
      
      const remaining = calculateRemainingTime(startTime, duration);
      
      if (remaining.total <= 0) return '00:00';
      
      return `${remaining.minutes.toString().padStart(2, '0')}:${remaining.seconds.toString().padStart(2, '0')}`;
    } catch {
      return '--:--';
    }
  }, []);

  // التحقق من انتهاء الوقت
  const isExpired = useCallback((rental) => {
    if (rental.rental_type !== 'fixed' || !rental.start_time) return false;
    
    try {
      const startTime = new Date(rental.start_time);
      let duration = 15;
      
      if (rental.items && rental.items.length > 0) {
        duration = rental.items[0].duration_minutes || 15;
      } else {
        duration = rental.duration_minutes || 15;
      }
      
      const endTime = new Date(startTime.getTime() + duration * 60000);
      return timeNow > endTime;
    } catch {
      return false;
    }
  }, [timeNow]);

  // حساب الدقائق المنقضية
  const getElapsedMinutes = useCallback((startTime) => {
    if (!startTime) return 0;
    try {
      return Math.floor((timeNow - new Date(startTime)) / (1000 * 60));
    } catch {
      return 0;
    }
  }, [timeNow]);

  // تصفية التأجيرات حسب البحث
  const filteredRentals = useMemo(() => {
    if (!rentalsWithItems.length) return [];
    
    return rentalsWithItems.filter(rental => {
      if (!searchTerm) return true;
      
      const term = searchTerm.toLowerCase();
      return (
        (rental.customer_name && rental.customer_name.toLowerCase().includes(term)) ||
        (rental.rental_number && rental.rental_number.toLowerCase().includes(term)) ||
        (rental.items && rental.items.some(item => 
          item.game_name && item.game_name.toLowerCase().includes(term)
        ))
      );
    });
  }, [rentalsWithItems, searchTerm]);

  // توسيع/طي التفاصيل
  const toggleExpand = (rentalId) => {
    setExpandedRentals(prev => ({
      ...prev,
      [rentalId]: !prev[rentalId]
    }));
  };

  if (!currentShift) return null;

  if (loading.rentals) {
    return (
      <div className="table-loading">
        <Loader2 size={32} className="spinner" />
        <p>جاري تحميل التأجيرات النشطة...</p>
      </div>
    );
  }

  if (!filteredRentals || filteredRentals.length === 0) {
    return (
      <div className="table-empty">
        <Activity size={48} />
        <h3>لا توجد تأجيرات نشطة</h3>
        <p>جميع التأجيرات مكتملة أو لا توجد تأجيرات حالياً</p>
        <div className="empty-actions">
          <Button variant="primary" size="small" onClick={onRefresh} icon={RefreshCw}>
            تحديث
          </Button>
          <Button variant="secondary" size="small" onClick={onClose} icon={X}>
            إغلاق
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="active-rentals-table" ref={activeRentalsRef}>
      {/* شريط البحث */}
      <div className="table-search-bar">
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="بحث بالعميل أو رقم التأجير أو اللعبة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <X size={14} />
            </button>
          )}
        </div>
        
        <div className="table-actions">
          <button onClick={onRefresh} className="refresh-btn" title="تحديث">
            <RefreshCw size={16} className={loading.rentals ? 'spinner' : ''} />
          </button>
          <button onClick={onClose} className="close-table-btn" title="إغلاق">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* قائمة التأجيرات */}
      <div className="table-body">
        {filteredRentals.map(rental => {
          const elapsedMinutes = getElapsedMinutes(rental.start_time);
          const canEarlyEnd = elapsedMinutes < 3;
          const hasMultipleItems = rental.items && rental.items.length > 1;
          const isExpanded = expandedRentals[rental.id];
          const expired = isExpired(rental);
          
          return (
            <div 
              key={rental.id} 
              className={`rental-group ${expired ? 'expired' : ''}`}
            >
              {/* رأس التأجير */}
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
                      <span className={expired ? 'expired' : ''}>
                        {getRemainingTime(rental)}
                      </span>
                    </>
                  ) : (
                    <span className="open-badge">وقت مفتوح</span>
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

                  <button
                    onClick={() => onViewDetails(rental)}
                    className="action-btn info"
                    title="عرض التفاصيل"
                  >
                    <Eye size={14} />
                  </button>

                  {rental.rental_type === 'open' && (
                    <button
                      onClick={() => onComplete(rental)}
                      className="action-btn success"
                      title="إنهاء التأجير"
                    >
                      <Check size={14} />
                    </button>
                  )}

                  {(isManager || userRole === 'employee') && canEarlyEnd && (
                    <button
                      onClick={() => onEarlyEnd(rental)}
                      className="action-btn early-end"
                      title="إنهاء مبكر (استرداد كامل)"
                    >
                      <Undo2 size={14} />
                    </button>
                  )}

                  {isManager && (
                    <>
                      <button
                        onClick={() => onModify(rental)}
                        className="action-btn primary"
                        title="تعديل"
                      >
                        <Edit size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* الألعاب */}
              <div className="rental-items">
                {rental.items && rental.items.slice(0, 1).map(item => (
                  <div key={item.id} className="rental-item">
                    <div className="item-game">
                      <Gamepad2 size={14} />
                      <span className="game-name">{item.game_name}</span>
                      {item.child_name && (
                        <span className="child-name">({item.child_name})</span>
                      )}
                    </div>
                    <div className="item-details">
                      <span className={`badge ${item.duration_minutes === 10 ? 'badge-special' : ''}`}>
                        {item.duration_minutes === 10 ? '١٠ د' : `${item.duration_minutes || 15} د`}
                      </span>
                      {item.quantity > 1 && (
                        <span className="badge">x{item.quantity}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* العناصر الإضافية (إذا كان موسع) */}
              {isExpanded && rental.items && rental.items.length > 1 && (
                <div className="rental-items-expanded">
                  {rental.items.slice(1).map(item => (
                    <div key={item.id} className="rental-item secondary">
                      <div className="item-game">
                        <Gamepad2 size={12} />
                        <span className="game-name">{item.game_name}</span>
                        {item.child_name && (
                          <span className="child-name">({item.child_name})</span>
                        )}
                      </div>
                      <div className="item-details">
                        <span className={`badge ${item.duration_minutes === 10 ? 'badge-special' : ''}`}>
                          {item.duration_minutes === 10 ? '١٠ د' : `${item.duration_minutes || 15} د`}
                        </span>
                        {item.quantity > 1 && (
                          <span className="badge">x{item.quantity}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ملخص للمدير */}
              {isManager && (
                <div className="rental-summary">
                  <div className="summary-item">
                    <DollarSign size={12} />
                    <span>الإجمالي: {formatCurrency(rental.total_amount || 0)}</span>
                  </div>
                  <div className="summary-item">
                    <Clock size={12} />
                    <span>البداية: {formatTime(rental.start_time)}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* عداد النتائج */}
      <div className="table-footer">
        <span>إجمالي التأجيرات النشطة: {filteredRentals.length}</span>
      </div>
    </div>
  );
};

export default ActiveRentalsTable;