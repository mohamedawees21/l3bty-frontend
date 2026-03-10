import React from 'react';
import { 
  User, Phone, Clock, DollarSign, Gamepad2, 
  Hash, Info, Calendar, X
} from 'lucide-react';
import { formatDateTime, formatCurrency } from '../../../utils/formatters';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

const RentalDetailsModal = ({ show, onClose, rental, items }) => {
  if (!show || !rental) return null;

  const rentalItems = items ? items.filter(item => item && item.rental_id === rental.id) : [];

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={`تفاصيل التأجير #${rental.rental_number || rental.id}`}
      size="medium"
      footer={
        <Button variant="secondary" onClick={onClose}>
          إغلاق
        </Button>
      }
    >
      <div className="rental-details">
        {/* معلومات العميل */}
        <div className="details-section">
          <h4>معلومات العميل</h4>
          <div className="details-grid">
            <div className="detail-item">
              <User size={16} />
              <span className="label">الاسم:</span>
              <span className="value">{rental.customer_name || 'غير محدد'}</span>
            </div>
            {rental.customer_phone && (
              <div className="detail-item">
                <Phone size={16} />
                <span className="label">الهاتف:</span>
                <span className="value">{rental.customer_phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* معلومات التأجير */}
        <div className="details-section">
          <h4>معلومات التأجير</h4>
          <div className="details-grid">
            <div className="detail-item">
              <Hash size={16} />
              <span className="label">رقم التأجير:</span>
              <span className="value">#{rental.rental_number || rental.id}</span>
            </div>
            <div className="detail-item">
              <Calendar size={16} />
              <span className="label">تاريخ البدء:</span>
              <span className="value">{formatDateTime(rental.start_time)}</span>
            </div>
            {rental.end_time && (
              <div className="detail-item">
                <Clock size={16} />
                <span className="label">تاريخ النهاية:</span>
                <span className="value">{formatDateTime(rental.end_time)}</span>
              </div>
            )}
            <div className="detail-item">
              <DollarSign size={16} />
              <span className="label">المبلغ الإجمالي:</span>
              <span className="value highlight">{formatCurrency(rental.final_amount || rental.total_amount || 0)}</span>
            </div>
            <div className="detail-item">
              <span className="label">الحالة:</span>
              <span className={`status-badge ${rental.status}`}>
                {rental.status === 'active' ? 'نشط' : 
                 rental.status === 'completed' ? 'مكتمل' : 
                 rental.status === 'cancelled' ? 'ملغي' : rental.status}
              </span>
            </div>
          </div>
        </div>

        {/* الألعاب */}
        <div className="details-section">
          <h4>الألعاب ({rentalItems.length})</h4>
          <div className="games-list">
            {rentalItems.map(item => (
              <div key={item.id} className="game-item">
                <div className="game-info">
                  <Gamepad2 size={14} />
                  <span className="game-name">{item.game_name}</span>
                  {item.child_name && (
                    <span className="child-name">({item.child_name})</span>
                  )}
                </div>
                <div className="game-details">
                  <span className={`badge ${item.duration_minutes === 10 ? 'badge-special' : ''}`}>
                    {item.duration_minutes === 10 ? '١٠ دقائق' : `${item.duration_minutes || 15} د`}
                  </span>
                  {item.quantity > 1 && (
                    <span className="badge">x{item.quantity}</span>
                  )}
                  <span className="game-price">{formatCurrency(item.total_price || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ملاحظات خاصة لـ 10 دقائق */}
        {rentalItems.some(item => item.duration_minutes === 10) && (
          <div className="alert alert-info">
            <Info size={14} />
            <span>ملاحظة: سعر ١٠ دقائق يساوي نفس سعر ١٥ دقيقة (عرض الموسم)</span>
          </div>
        )}

        {/* سبب الإلغاء إذا كان موجوداً */}
        {rental.cancellation_reason && (
          <div className="alert alert-warning">
            <Info size={14} />
            <span>سبب الإلغاء: {rental.cancellation_reason}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RentalDetailsModal;