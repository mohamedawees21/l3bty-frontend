import React, { useState, useEffect } from 'react';
import { 
  FaClock, 
  FaUser, 
  FaGamepad, 
  FaMoneyBillWave,
  FaTimes,
  FaPlus,
  FaStop,
  FaExclamationTriangle
} from 'react-icons/fa';

const ActiveRentalsTable = ({ rentals, onCancel, onExtend }) => {
  const [timers, setTimers] = useState({});

  // تحديث التايمر كل ثانية
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers = {};
      rentals.forEach(rental => {
        const endTime = new Date(rental.end_time).getTime();
        const now = Date.now();
        const remaining = endTime - now;
        
        newTimers[rental.id] = {
          remaining: Math.max(0, Math.floor(remaining / 1000)),
          isExpired: remaining <= 0,
          isNearEnd: remaining > 0 && remaining <= 5 * 60 * 1000, // 5 دقائق
          canCancel: remaining >= (rental.duration * 60 * 1000) - (3 * 60 * 1000) // أول 3 دقائق
        };
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [rentals]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (timer) => {
    if (timer.isExpired) return 'expired';
    if (timer.isNearEnd) return 'warning';
    return 'normal';
  };

  const getStatusText = (timer) => {
    if (timer.isExpired) return 'انتهى';
    if (timer.isNearEnd) return 'شبه منتهي';
    return 'نشط';
  };

  return (
    <div className="active-rentals-table">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th><FaGamepad /> اللعبة</th>
              <th><FaUser /> الطفل</th>
              <th><FaClock /> الوقت المتبقي</th>
              <th>الحالة</th>
              <th><FaMoneyBillWave /> المبلغ</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental, index) => {
              const timer = timers[rental.id] || { remaining: 0 };
              
              return (
                <tr key={rental.id} className={`rental-row ${getTimerColor(timer)}`}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="game-cell">
                      <div className="game-icon-small">
                        <FaGamepad />
                      </div>
                      <div>
                        <strong>{rental.game_name}</strong>
                        <small>{rental.game_code}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{rental.child_name}</strong>
                    <div className="employee-note">
                      <small>بواسطة: {rental.employee_name}</small>
                    </div>
                  </td>
                  <td>
                    <div className="timer-cell">
                      <div className="timer-display">
                        {formatTime(timer.remaining)}
                      </div>
                      <div className="timer-info">
                        <small>
                          بدأ: {new Date(rental.start_time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getTimerColor(timer)}`}>
                      {getStatusText(timer)}
                      {timer.isNearEnd && <FaExclamationTriangle />}
                    </span>
                  </td>
                  <td>
                    <div className="price-cell">
                      <span className="price-amount">{rental.total_price} ريال</span>
                      <small>{rental.duration} دقيقة</small>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {!timer.isExpired && timer.canCancel && (
                        <button 
                          className="btn-cancel-small"
                          onClick={() => onCancel(rental.id, 'طلب العميل')}
                          title="إلغاء (3 دقائق فقط)"
                        >
                          <FaTimes />
                        </button>
                      )}
                      
                      {!timer.isExpired && timer.isNearEnd && (
                        <button 
                          className="btn-extend-small"
                          onClick={() => onExtend(rental.id)}
                          title="تمديد 15 دقيقة"
                        >
                          <FaPlus />
                        </button>
                      )}
                      
                      {timer.isExpired && (
                        <button 
                          className="btn-complete-small"
                          onClick={() => console.log('إنهاء', rental.id)}
                          title="إنهاء التأجير"
                        >
                          <FaStop />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ملخص التأجيرات */}
      <div className="rentals-summary">
        <div className="summary-item">
          <span>عدد التأجيرات:</span>
          <strong>{rentals.length}</strong>
        </div>
        <div className="summary-item">
          <span>الإيرادات الإجمالية:</span>
          <strong className="price-total">
            {rentals.reduce((sum, rental) => sum + rental.total_price, 0)} ريال
          </strong>
        </div>
        <div className="summary-item">
          <span>متوسط المدة:</span>
          <strong>
            {rentals.length > 0 
              ? Math.round(rentals.reduce((sum, rental) => sum + rental.duration, 0) / rentals.length)
              : 0} دقيقة
          </strong>
        </div>
        <div className="summary-item">
          <span>التأجيرات النشطة:</span>
          <strong>{rentals.filter(r => !timers[r.id]?.isExpired).length}</strong>
        </div>
      </div>
    </div>
  );
};

export default ActiveRentalsTable;