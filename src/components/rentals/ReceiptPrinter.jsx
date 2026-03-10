import React from 'react';
import { Printer, Download, X } from 'lucide-react';
import { formatDateTime, formatCurrency, generateReceiptNumber } from '../../utils/formatters';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const ReceiptPrinter = ({ rental, onClose, isOpen, branchName = 'الفرع الرئيسي' }) => {
  if (!rental) return null;

  const receiptNumber = generateReceiptNumber(rental);

  // طباعة الفاتورة
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>فاتورة تأجير #${receiptNumber}</title>
          <style>
            body { font-family: 'Cairo', Arial; padding: 20px; margin: 0; }
            .receipt { max-width: 300px; margin: auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h2 { margin: 0; color: #333; }
            .header p { margin: 5px 0; color: #666; }
            .divider { border-top: 1px dashed #ccc; margin: 15px 0; }
            .details { margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: right; border-bottom: 1px solid #ddd; padding: 5px; }
            td { padding: 5px; }
            .total { font-size: 18px; font-weight: bold; color: #2ecc71; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
            .footer p { margin: 2px 0; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>🎮 ألعاب X</h2>
              <p>${branchName}</p>
              <p>رقم الفاتورة: ${receiptNumber}</p>
            </div>
            
            <div class="divider"></div>
            
            <div class="details">
              <div class="detail-row">
                <span>العميل:</span>
                <strong>${rental.customer_name || 'غير محدد'}</strong>
              </div>
              <div class="detail-row">
                <span>الهاتف:</span>
                <span>${rental.customer_phone || 'غير محدد'}</span>
              </div>
              <div class="detail-row">
                <span>التاريخ:</span>
                <span>${formatDateTime(rental.start_time)}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <table>
              <thead>
                <tr>
                  <th>اللعبة</th>
                  <th>المدة</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                </tr>
              </thead>
              <tbody>
                ${rental.items?.map(item => `
                  <tr>
                    <td>${item.game_name}</td>
                    <td>${item.duration_minutes || 15} د</td>
                    <td>${item.quantity || 1}</td>
                    <td>${formatCurrency(item.total_price || 0)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="divider"></div>
            
            <div class="detail-row">
              <span>المجموع:</span>
              <span class="total">${formatCurrency(rental.total_amount || 0)}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="footer">
              <p>📞 01012345678</p>
              <p>fb.com/gamesx</p>
              <p>شكراً لاستخدامك خدماتنا</p>
            </div>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // تحميل الفاتورة PDF
  const handleDownload = () => {
    // يمكن إضافة وظيفة تحميل PDF هنا
    alert('جاري تجهيز الفاتورة للتحميل...');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`فاتورة تأجير #${receiptNumber}`}
      size="small"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} icon={X}>
            إغلاق
          </Button>
          <Button variant="primary" onClick={handleDownload} icon={Download}>
            تحميل
          </Button>
          <Button variant="success" onClick={handlePrint} icon={Printer}>
            طباعة
          </Button>
        </>
      }
    >
      <div className="receipt-preview">
        <div className="receipt-header">
          <h2>🎮 ألعاب X</h2>
          <p>{branchName}</p>
          <p className="receipt-number">{receiptNumber}</p>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-details">
          <div className="detail-row">
            <span>العميل:</span>
            <strong>{rental.customer_name || 'غير محدد'}</strong>
          </div>
          {rental.customer_phone && (
            <div className="detail-row">
              <span>الهاتف:</span>
              <span>{rental.customer_phone}</span>
            </div>
          )}
          <div className="detail-row">
            <span>التاريخ:</span>
            <span>{formatDateTime(rental.start_time)}</span>
          </div>
        </div>

        <div className="receipt-divider"></div>

        <table className="receipt-items">
          <thead>
            <tr>
              <th>اللعبة</th>
              <th>المدة</th>
              <th>الكمية</th>
              <th>السعر</th>
            </tr>
          </thead>
          <tbody>
            {rental.items?.map(item => (
              <tr key={item.id}>
                <td>{item.game_name}</td>
                <td>{item.duration_minutes || 15} د</td>
                <td>{item.quantity || 1}</td>
                <td>{formatCurrency(item.total_price || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="receipt-divider"></div>

        <div className="receipt-total">
          <span>الإجمالي:</span>
          <span className="total-amount">{formatCurrency(rental.total_amount || 0)}</span>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-footer">
          <p>📞 01012345678</p>
          <p>fb.com/gamesx</p>
          <p>شكراً لاستخدامك خدماتنا</p>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptPrinter;