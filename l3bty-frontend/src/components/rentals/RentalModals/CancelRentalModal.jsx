import React, { useState, useMemo } from 'react';
import { 
  Undo2, X, AlertTriangle, Info, Clock,
  DollarSign, Loader2
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

const CancelRentalModal = ({ show, onClose, rental, items, onConfirm }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('');

  // الحصول على items التأجير
  const rentalItems = useMemo(() => {
    if (!items || !rental) return [];
    return items.filter(item => item && item.rental_id === rental.id);
  }, [rental, items]);

  // حساب المدة المنقضية
  const elapsedMinutes = useMemo(() => {
    if (!rental?.start_time) return 0;
    try {
      return Math.floor((new Date() - new Date(rental.start_time)) / (1000 * 60));
    } catch {
      return 0;
    }
  }, [rental]);

  // حساب المبلغ المسترد
  const calculateRefund = useMemo(() => {
    if (!rental) return 0;
    
    const totalAmount = rental.total_amount || 0;
    
    // إذا مر أقل من 3 دقائق، استرداد كامل
    if (elapsedMinutes < 3) {
      return totalAmount;
    }
    
    // خصم أول 15 دقيقة
    const fifteenMinPrice = rentalItems.reduce((total, item) => {
      return total + ((item.price_per_15min || 50) * (item.quantity || 1));
    }, 0);
    
    return Math.max(0, totalAmount - fifteenMinPrice);
  }, [rental, rentalItems, elapsedMinutes]);

  const isWithin3Minutes = elapsedMinutes < 3;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(rental, {
        refund_amount: calculateRefund,
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
    <Modal
      isOpen={show}
      onClose={onClose}
      title="إلغاء التأجير"
      size="medium"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button 
            variant="warning" 
            onClick={handleConfirm} 
            loading={isSubmitting}
            icon={Undo2}
          >
            تأكيد الإلغاء
          </Button>
        </>
      }
    >
      <div className="cancel-rental-modal">
        {/* تحذير */}
        <div className={`alert ${isWithin3Minutes ? 'alert-success' : 'alert-warning'}`}>
          {isWithin3Minutes ? (
            <>
              <CheckCircle size={16} />
              <div className="alert-content">
                <strong>استرداد كامل المبلغ</strong>
                <p>لم يمر أكثر من 3 دقائق على بدء التأجير</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle size={16} />
              <div className="alert-content">
                <strong>استرداد جزئي</strong>
                <p>سيتم خصم قيمة أول 15 دقيقة</p>
              </div>
            </>
          )}
        </div>

        {/* معلومات العميل */}
        <div className="info-card">
          <Info size={16} />
          <div className="info-content">
            <strong>العميل: {rental.customer_name}</strong>
            <p>رقم التأجير: {rental.rental_number || rental.id}</p>
          </div>
        </div>

        {/* حساب المبلغ المسترد */}
        <div className="refund-calculation">
          <h4>تفاصيل المبلغ المسترد</h4>
          
          <div className="calc-row">
            <span>الوقت المنقضي:</span>
            <span>{elapsedMinutes} دقيقة</span>
          </div>
          
          <div className="calc-row">
            <span>المبلغ المدفوع:</span>
            <span>{formatCurrency(rental.total_amount || 0)}</span>
          </div>
          
          {!isWithin3Minutes && (
            <div className="calc-row deduction">
              <span>خصم أول 15 دقيقة:</span>
              <span>- {formatCurrency((rental.total_amount || 0) - calculateRefund)}</span>
            </div>
          )}
          
          <div className="calc-row total">
            <span>المبلغ المسترد:</span>
            <span className="refund-amount">{formatCurrency(calculateRefund)}</span>
          </div>
        </div>

        {/* سبب الإلغاء */}
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
    </Modal>
  );
};

export default CancelRentalModal;