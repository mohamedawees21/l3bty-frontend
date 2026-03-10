import React, { useState, useMemo } from 'react';
import { 
  CheckCircle, X, DollarSign, Clock, User,
  CreditCard, Wallet, Star, Loader2
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import { PAYMENT_METHODS } from '../../../utils/constants';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

const CompleteOpenModal = ({ show, onClose, rental, items, onConfirm }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // الحصول على items التأجير
  const rentalItems = useMemo(() => {
    if (!items || !rental) return [];
    return items.filter(item => item && item.rental_id === rental.id);
  }, [rental, items]);

  // حساب المدة المنقضية
  const calculateDuration = useMemo(() => {
    if (!rental?.start_time) return 15;
    try {
      return Math.max(15, Math.floor((new Date() - new Date(rental.start_time)) / (1000 * 60)));
    } catch {
      return 15;
    }
  }, [rental]);

  // حساب الإجمالي
  const calculateTotal = useMemo(() => {
    const minutes = calculateDuration;
    return rentalItems.reduce((total, item) => {
      const units = Math.ceil(minutes / 15);
      return total + ((item.price_per_15min || 50) * units * (item.quantity || 1));
    }, 0);
  }, [rentalItems, calculateDuration]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(rental, {
        payment_method: paymentMethod,
        final_amount: calculateTotal,
        actual_minutes: calculateDuration
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
    <Modal
      isOpen={show}
      onClose={onClose}
      title="إنهاء التأجير المفتوح"
      size="medium"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button 
            variant="success" 
            onClick={handleConfirm} 
            loading={isSubmitting}
            icon={CheckCircle}
          >
            تأكيد الإنهاء
          </Button>
        </>
      }
    >
      <div className="complete-open-modal">
        {/* ملخص التأجير */}
        <div className="summary-card">
          <div className="summary-row">
            <User size={16} />
            <span className="label">العميل:</span>
            <span className="value">{rental.customer_name}</span>
          </div>
          <div className="summary-row">
            <Clock size={16} />
            <span className="label">المدة:</span>
            <span className="value">{calculateDuration} دقيقة</span>
          </div>
        </div>

        {/* تفاصيل الألعاب */}
        <div className="items-summary">
          <h4>الألعاب</h4>
          {rentalItems.map(item => (
            <div key={item.id} className="item-row">
              <div className="item-info">
                <span className="item-name">{item.game_name}</span>
                {item.quantity > 1 && <span className="badge">x{item.quantity}</span>}
              </div>
              <span className="item-price">
                {formatCurrency((item.price_per_15min || 50) * Math.ceil(calculateDuration / 15) * (item.quantity || 1))}
              </span>
            </div>
          ))}
        </div>

        {/* الإجمالي */}
        <div className="total-section">
          <div className="total-row">
            <span>الإجمالي:</span>
            <span className="total-amount">{formatCurrency(calculateTotal)}</span>
          </div>
        </div>

        {/* طريقة الدفع */}
        <div className="payment-section">
          <h4>طريقة الدفع</h4>
          <div className="payment-methods">
            {PAYMENT_METHODS.map(method => {
              const Icon = method.icon === 'DollarSign' ? DollarSign :
                          method.icon === 'CreditCard' ? CreditCard :
                          method.icon === 'Wallet' ? Wallet : Star;
              return (
                <button
                  key={method.value}
                  className={`payment-method ${paymentMethod === method.value ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(method.value)}
                >
                  <Icon size={18} />
                  <span>{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CompleteOpenModal;