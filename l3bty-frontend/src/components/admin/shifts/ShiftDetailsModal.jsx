import React from 'react';
import { Eye, Clock, DollarSign, Users, Calendar } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';

const ShiftsList = ({ shifts = [], loading, onViewDetails }) => {
  if (loading) {
    return (
      <div className="shifts-loading">
        <div className="spinner"></div>
        <p>جاري تحميل الشيفتات...</p>
      </div>
    );
  }

  if (!shifts.length) {
    return (
      <div className="shifts-empty">
        <Calendar size={48} />
        <h3>لا توجد شيفتات</h3>
        <p>لم يتم العثور على أي شيفتات</p>
      </div>
    );
  }

  return (
    <div className="shifts-list">
      {shifts.map((shift) => (
        <div key={shift.id} className="shift-card">
          <div className="shift-header">
            <div className="shift-number">
              <span>شيفت #{shift.shift_number || shift.id}</span>
            </div>
            <div className="shift-status">
              <span className={`status-badge ${shift.status}`}>
                {shift.status === 'open' ? 'مفتوح' : 'مغلق'}
              </span>
            </div>
          </div>

          <div className="shift-details">
            <div className="detail-row">
              <Users size={16} />
              <span className="label">المشرف:</span>
              <span className="value">{shift.employee_name || 'غير محدد'}</span>
            </div>
            <div className="detail-row">
              <Clock size={16} />
              <span className="label">البداية:</span>
              <span className="value">{formatDateTime(shift.start_time)}</span>
            </div>
            {shift.end_time && (
              <div className="detail-row">
                <Clock size={16} />
                <span className="label">النهاية:</span>
                <span className="value">{formatDateTime(shift.end_time)}</span>
              </div>
            )}
            <div className="detail-row">
              <DollarSign size={16} />
              <span className="label">الإيرادات:</span>
              <span className="value revenue">{formatCurrency(shift.total_revenue || 0)}</span>
            </div>
          </div>

          <div className="shift-footer">
            <button onClick={() => onViewDetails(shift)} className="view-details-btn">
              <Eye size={16} />
              عرض التفاصيل
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShiftsList;