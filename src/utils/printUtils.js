// src/utils/printUtils.js
export const printReceipt = (rentalData) => {
  const printWindow = window.open('', '_blank');
  
  const receiptHTML = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>إيصال تأجير</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .receipt { width: 300px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; }
        .info { margin: 15px 0; }
        .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h2>🎮 نظام تأجير الألعاب</h2>
          <p>${new Date().toLocaleString('ar-SA')}</p>
        </div>
        
        <div class="info">
          <p><strong>اللعبة:</strong> ${rentalData.game}</p>
          <p><strong>اسم الطفل:</strong> ${rentalData.child}</p>
          <p><strong>الموظف:</strong> ${rentalData.employee}</p>
          <p><strong>المدة:</strong> ${rentalData.duration} دقيقة</p>
          <p><strong>وقت البدء:</strong> ${rentalData.startTime}</p>
        </div>
        
        <div class="total">
          <p>المبلغ: ${rentalData.price} ريال</p>
        </div>
        
        <div class="footer">
          <p>شكراً لزيارتكم 🎉</p>
          <p>للاستفسار: 0555555555</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
  printWindow.print();
};