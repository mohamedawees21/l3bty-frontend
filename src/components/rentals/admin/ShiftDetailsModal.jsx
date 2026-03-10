import React from 'react';
import { 
  X, User, Clock, DollarSign, Calendar, 
  Hash, Download, Printer, Loader2 
} from 'lucide-react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import { formatDateTime, formatCurrency } from '../../../utils/formatters';

const ShiftDetailsModal = ({ show, onClose, shift, loading }) => {
  if (!show || !shift) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>تقرير الشيفت #${shift.shift_number || shift.id}</title>
          <style>
            body { font-family: 'Cairo', Arial; padding: 20px; }
            .report { max-width: 800px; margin: auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }
            .row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { color: #666; }
            .value { font-weight: bold; }
            .total { font-size: 18px; color: #2ecc71; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f0f0f0; padding: 10px; text-align: right; }
            td { padding: 8px; border-bottom: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="report">
            <div class="header">
              <h1>تقرير الشيفت</h1>
              <h2>شيفت #${shift.shift_number || shift.id}</h2>
            </div>
            
            <div class="section">
              <h3>معلومات الشيفت</h3>
              <div class="row">
                <span class="label">المشرف:</span>
                <span class="value">${shift.employee_name || 'غير محدد'}</span>
              </div>
              <div class="row">
                <span class="label">تاريخ البدء:</span>
                <span class="value">${formatDateTime(shift.start_time)}</span>
              </div>
              ${shift.end_time ? `
                <div class="row">
                  <span class="label">تاريخ النهاية:</span>
                  <span class="value">${formatDateTime(shift.end_time)}</span>
                </div>
              ` : ''}
              <div class="row">
                <span class="label">المدة:</span>
                <span class="value">${shift.duration || '0'} دقيقة</span>
              </div>
            </div>

            <div class="section">
              <h3>الإحصائيات</h3>
              <div class="row">
                <span class="label">إجمالي الإيرادات:</span>
                <span class="value total">${formatCurrency(shift.total_revenue || 0)}</span>
              </div>
              <div class="row">
                <span class="label">عدد التأجيرات:</span>
                <span class="value">${shift.rentals_count || 0}</span>
              </div>
              <div class="row">
                <span class="label">نقدي:</span>
                <span class="value">${formatCurrency(shift.cash_amount || 0)}</span>
              </div>
              <div class="row">
                <span class="label">بطاقة:</span>
                <span class="value">${formatCurrency(shift.card_amount || 0)}</span>
              </div>
              <div class="row">
                <span class="label">محفظة:</span>
                <span class="value">${formatCurrency(shift.wallet_amount || 0)}</span>
              </div>
            </div>

            ${shift.notes ? `
              <div class="section">
                <h3>ملاحظات</h3>
                <p>${shift.notes}</p>
              </div>
            ` : ''}

            <div class="footer">
              <p>تم إنشاء التقرير في: ${new Date().toLocaleString('ar-EG')}</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title={`تفاصيل الشيفت #${shift.shift_number || shift.id}`}
      size="medium"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} icon={X}>
            إغلاق
          </Button>
          <Button variant="primary" onClick={handlePrint} icon={Printer}>
            طباعة التقرير
          </Button>
          <Button variant="success" onClick={handlePrint} icon={Download}>
            تحميل PDF
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="modal-loading">
          <Loader2 size={32} className="spinner" />
          <p>جاري تحميل التفاصيل...</p>
        </div>
      ) : (
        <div className="shift-details-modal">
          <div className="details-section">
            <h4>معلومات الشيفت</h4>
            <div className="details-grid">
              <div className="detail-item">
                <User size={16} />
                <span className="label">المشرف:</span>
                <span className="value">{shift.employee_name || 'غير محدد'}</span>
              </div>
              <div className="detail-item">
                <Calendar size={16} />
                <span className="label">تاريخ البدء:</span>
                <span className="value">{formatDateTime(shift.start_time)}</span>
              </div>
              {shift.end_time && (
                <div className="detail-item">
                  <Clock size={16} />
                  <span className="label">تاريخ النهاية:</span>
                  <span className="value">{formatDateTime(shift.end_time)}</span>
                </div>
              )}
              <div className="detail-item">
                <Hash size={16} />
                <span className="label">رقم الشيفت:</span>
                <span className="value">#{shift.shift_number || shift.id}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h4>الإحصائيات</h4>
            <div className="stats-grid">
              <div className="stat-card">
                <DollarSign size={20} className="stat-icon revenue" />
                <div className="stat-info">
                  <span className="stat-label">الإيرادات</span>
                  <span className="stat-value">{formatCurrency(shift.total_revenue || 0)}</span>
                </div>
              </div>
              <div className="stat-card">
                <span className="stat-icon">📊</span>
                <div className="stat-info">
                  <span className="stat-label">عدد التأجيرات</span>
                  <span className="stat-value">{shift.rentals_count || 0}</span>
                </div>
              </div>
            </div>

            <div className="payment-breakdown">
              <h5>تفاصيل الدفع</h5>
              <div className="breakdown-row">
                <span>نقدي:</span>
                <span>{formatCurrency(shift.cash_amount || 0)}</span>
              </div>
              <div className="breakdown-row">
                <span>بطاقة:</span>
                <span>{formatCurrency(shift.card_amount || 0)}</span>
              </div>
              <div className="breakdown-row">
                <span>محفظة:</span>
                <span>{formatCurrency(shift.wallet_amount || 0)}</span>
              </div>
            </div>
          </div>

          {shift.notes && (
            <div className="details-section">
              <h4>ملاحظات</h4>
              <p className="notes-text">{shift.notes}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ShiftDetailsModal;