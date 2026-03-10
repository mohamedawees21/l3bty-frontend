import React, { useState, useMemo } from 'react';
import { 
  Undo2, X, CheckCircle, Info, Clock,
  DollarSign, Loader2
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

const EarlyEndModal = ({ show, onClose, rental, items, onConfirm }) => {
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

  // المبلغ المسترد (كامل)
  const refundAmount = useMemo(() => {
    return rental?.total_amount || 0;
  }, [rental]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(rental, {
        refund_amount: refundAmount,
        reason: reason || 'إنهاء مبكر (استرداد كامل)',
        elapsed_minutes: elapsedMinutes
      });
      onClose();
    } catch (error) {
      console.error('خطأ في الإنهاء المبكر:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show || !rental) return null;

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title="إنهاء مبكر للتأجير"
      size="medium"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button 
            variant="info" 
            onClick={handleConfirm} 
            loading={isSubmitting}
            icon={Undo2}
          >
            تأكيد الإنهاء المبكر والاسترداد
          </Button>
        </>
      }
    >
      <div className="early-end-modal">
        {/* تأكيد الاسترداد الكامل */}
        <div className="alert alert-success">
          <CheckCircle size={16} />
          <div className="alert-content">
            <strong>استرداد كامل المبلغ</strong>
            <p>سيتم استرداد كامل المبلغ المدفوع</p>
          </div>
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
          
          <div className="calc-row total">
            <span>المبلغ المسترد (كامل):</span>
            <span className="refund-amount">{formatCurrency(refundAmount)}</span>
          </div>
        </div>

        {/* سبب الإنهاء المبكر */}
        <div className="form-group">
          <label>سبب الإنهاء المبكر (اختياري):</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="أدخل سبب الإنهاء المبكر..."
            rows="3"
            className="form-control"
          />
        </div>
      </div>
    </Modal>
  );
};

export default EarlyEndModal;