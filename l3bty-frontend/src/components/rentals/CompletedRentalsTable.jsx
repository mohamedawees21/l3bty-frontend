import React, { useState, useMemo } from 'react';
import {
  History, Hash, User, DollarSign, Eye, Trash2,
  X, Clock, Gamepad2, ChevronDown, ChevronUp,
  RefreshCw, Search, Loader2, AlertCircle, Undo2
} from 'lucide-react';
import { formatCurrency, formatTime } from '../../utils/formatters';
import Button from '../ui/Button';

const CompletedRentalsTable = ({
  rentals = [],
  items = [],
  loading,
  onViewDetails,
  onDeleteRental,
  currentShift,
  onRefresh,
  onClose,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [expandedRentals, setExpandedRentals] = useState({});

  const isManager = userRole === 'admin' || userRole === 'branch_manager';
  const itemsPerPage = 10;

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

  // تقسيم الصفحات
  const paginatedRentals = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredRentals.slice(start, start + itemsPerPage);
  }, [filteredRentals, page]);

  const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);

  // توسيع/طي التفاصيل
  const toggleExpand = (rentalId) => {
    setExpandedRentals(prev => ({
      ...prev,
      [rentalId]: !prev[rentalId]
    }));
  };

  if (!currentShift) return null;

  if (loading.completed) {
    return (
      <div className="table-loading">
        <Loader2 size={32} className="spinner" />
        <p>جاري تحميل التأجيرات المكتملة...</p>
      </div>
    );
  }

  if (!filteredRentals || filteredRentals.length === 0) {
    return (
      <div className="table-empty">
        <History size={48} />
        <h3>لا توجد تأجيرات مكتملة</h3>
        <p>لم يتم إكمال أي تأجير بعد</p>
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
    <div className="completed-rentals-table">
      {/* شريط البحث */}
      <div className="table-search-bar">
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="بحث بالعميل أو رقم التأجير أو اللعبة..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
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
            <RefreshCw size={16} className={loading.completed ? 'spinner' : ''} />
          </button>
          <button onClick={onClose} className="close-table-btn" title="إغلاق">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* قائمة التأجيرات */}
      <div className="table-body">
        {paginatedRentals.map(rental => {
          const hasMultipleItems = rental.items && rental.items.length > 1;
          const isExpanded = expandedRentals[rental.id];
          
          return (
            <div 
              key={rental.id} 
              className={`rental-group completed ${rental.is_refunded ? 'refunded' : ''}`}
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

                  {rental.is_refunded && (
                    <div className="refund-badge" title="تأجير مسترد">
                      <Undo2 size={12} />
                      <span>مسترد</span>
                    </div>
                  )}
                </div>

                <div className="rental-amount">
                  <DollarSign size={14} />
                  <span>{formatCurrency(rental.final_amount || rental.total_amount || 0)}</span>
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

                  {isManager && (
                    <button
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف التأجير #${rental.rental_number || rental.id}؟`)) {
                          onDeleteRental(rental);
                        }
                      }}
                      className="action-btn danger"
                      title="حذف التأجير"
                    >
                      <Trash2 size={14} />
                    </button>
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

              {/* معلومات الوقت */}
              <div className="rental-time-info">
                <Clock size={12} />
                <span>البداية: {formatTime(rental.start_time)}</span>
                {rental.end_time && (
                  <>
                    <span> - </span>
                    <span>النهاية: {formatTime(rental.end_time)}</span>
                  </>
                )}
              </div>

              {/* سبب الإلغاء */}
              {rental.cancellation_reason && (
                <div className="cancellation-reason">
                  <AlertCircle size={12} />
                  <span>سبب الإلغاء: {rental.cancellation_reason}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* pagination */}
      {totalPages > 1 && (
        <div className="table-pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="pagination-btn"
          >
            السابق
          </button>
          
          <span className="pagination-info">
            صفحة {page} من {totalPages}
          </span>
          
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="pagination-btn"
          >
            التالي
          </button>
        </div>
      )}

      {/* عداد النتائج */}
      <div className="table-footer">
        <span>إجمالي التأجيرات المكتملة: {filteredRentals.length}</span>
      </div>
    </div>
  );
};

export default CompletedRentalsTable;