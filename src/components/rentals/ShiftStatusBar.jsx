import React, { useState, useMemo } from 'react';
import { 
  Lock, Unlock, Zap, Clock, DollarSign, Activity, 
  History, Hash, AlertTriangle, X, Loader2, Info, Wallet
} from 'lucide-react';
import { formatDateTime, formatCurrency } from '../../utils/formatters';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

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

  const isManager = userRole === 'admin' || userRole === 'branch_manager';

  // حساب الإيرادات
  const calculateRevenue = useMemo(() => {
    let total = 0;
    if (completedRentals && Array.isArray(completedRentals)) {
      completedRentals
        .filter(rental => rental && rental.status === 'completed' && !rental.is_refunded)
        .forEach(rental => {
          const amount = rental.final_amount || rental.total_amount || 0;
          total += parseFloat(amount);
        });
    }
    return total;
  }, [completedRentals]);

  if (loading.shift) {
    return (
      <div className="shift-status-bar loading">
        <div className="loading-animation">
          <Loader2 size={24} className="spinner" />
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
        <Button
          onClick={onStartShift}
          variant="success"
          size="medium"
          icon={Unlock}
          loading={loading.start}
        >
          فتح شيفت جديد
        </Button>
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
          {isManager && (
            <div className="shift-stat">
              <DollarSign size={16} className="stat-icon revenue" />
              <div className="shift-stat-content">
                <span className="shift-stat-label">الإيراد</span>
                <span className="shift-stat-value">{formatCurrency(calculateRevenue)}</span>
              </div>
            </div>
          )}
          <div className="shift-stat">
            <Activity size={16} className="stat-icon active" />
            <div className="shift-stat-content">
              <span className="shift-stat-label">نشط</span>
              <span className="shift-stat-value">{activeRentals?.length || 0}</span>
            </div>
          </div>
          {isManager && (
            <div className="shift-stat">
              <History size={16} className="stat-icon completed" />
              <div className="shift-stat-content">
                <span className="shift-stat-label">مكتمل</span>
                <span className="shift-stat-value">{completedRentals?.length || 0}</span>
              </div>
            </div>
          )}
        </div>

        <div className="shift-actions">
          <Button
            onClick={() => setShowEndShiftConfirm(true)}
            variant="warning"
            size="small"
            icon={Lock}
            loading={loading.end}
          >
            {isManager ? 'تقفيل شيفت كامل' : 'إنهاء الشيفت'}
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showEndShiftConfirm}
        onClose={() => setShowEndShiftConfirm(false)}
        title={isManager ? 'تقفيل شيفت كامل' : 'إنهاء الشيفت'}
        size="medium"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowEndShiftConfirm(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="warning"
              onClick={() => {
                onEndShift(closingCash, notes);
                setShowEndShiftConfirm(false);
              }}
              loading={loading.end}
              icon={Lock}
            >
              {isManager ? 'تأكيد تقفيل الشيفت' : 'تأكيد إنهاء الشيفت'}
            </Button>
          </>
        }
      >
        <div className="modal-body">
          <div className="alert alert-warning">
            <AlertTriangle size={16} />
            <div className="alert-content">
              <strong>هل أنت متأكد من {isManager ? 'تقفيل' : 'إنهاء'} الشيفت الحالي؟</strong>
            </div>
          </div>

          {activeRentals?.length > 0 && (
            <div className="alert alert-danger">
              <AlertCircle size={16} />
              <div className="alert-content">
                <strong>يوجد {activeRentals.length} تأجير نشط</strong>
                <p>سيتم إغلاقها تلقائياً عند إنهاء الشيفت</p>
              </div>
            </div>
          )}

          {isManager && (
            <>
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
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ShiftStatusBar;