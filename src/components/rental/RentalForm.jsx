import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  FaUser, 
  FaClock, 
  FaMoneyBillWave, 
  FaCalculator,
  FaSave,
  FaTimes
} from 'react-icons/fa';

const RentalForm = ({ game, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [childName, setChildName] = useState('');
  const [duration, setDuration] = useState(15);
  const [customDuration, setCustomDuration] = useState('');
  const [price, setPrice] = useState(0);
  
  const durations = [
    { value: 15, label: '١٥ دقيقة' },
    { value: 30, label: '٣٠ دقيقة' },
    { value: 45, label: '٤٥ دقيقة' },
    { value: 60, label: 'ساعة واحدة' },
    { value: 90, label: 'ساعة ونصف' },
    { value: 120, label: 'ساعتين' }
  ];

  // حساب السعر
  useEffect(() => {
    const selectedDuration = customDuration ? parseInt(customDuration) : duration;
    const pricePerMinute = game.price_per_15min / 15;
    const total = pricePerMinute * selectedDuration;
    setPrice(Math.round(total));
  }, [duration, customDuration, game.price_per_15min]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!childName.trim()) {
      toast.error('يرجى إدخال اسم الطفل');
      return;
    }

    const selectedDuration = customDuration ? parseInt(customDuration) : duration;
    
    if (selectedDuration < 15) {
      toast.error('أقل مدة للتأجير هي 15 دقيقة');
      return;
    }

    const rentalData = {
      game_id: game.id,
      child_name: childName,
      duration: selectedDuration,
      total_price: price,
      employee_id: user.id,
      branch_id: user.branch_id,
      start_time: new Date().toISOString(),
      estimated_end_time: new Date(Date.now() + selectedDuration * 60000).toISOString()
    };

    onSubmit(rentalData);
  };

  const handleQuickSelect = (minutes) => {
    setDuration(minutes);
    setCustomDuration('');
  };

  return (
    <div className="rental-form-container">
      <form onSubmit={handleSubmit}>
        {/* معلومات اللعبة */}
        <div className="game-summary">
          <h3><FaCalculator /> تفاصيل اللعبة</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span>اللعبة:</span>
              <strong>{game.name}</strong>
            </div>
            <div className="summary-item">
              <span>الكود:</span>
              <strong>{game.code}</strong>
            </div>
            <div className="summary-item">
  <span>سعر 15 دقيقة:</span>
  <strong className="price">{game.price_per_15min} جنيه</strong>  // تغيير هنا
</div>
            <div className="summary-item">
              <span>المتاح:</span>
              <strong>{game.quantity} وحدة</strong>
            </div>
          </div>
        </div>

        {/* معلومات الطفل */}
        <div className="form-section">
          <h3><FaUser /> معلومات الطفل</h3>
          <div className="form-group">
            <label>اسم الطفل *</label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="أدخل اسم الطفل كاملاً"
              required
              autoFocus
            />
            <small>سيتم استخدام الاسم في الفاتورة</small>
          </div>
        </div>

        {/* اختيار المدة */}
        <div className="form-section">
          <h3><FaClock /> اختيار المدة</h3>
          
          <div className="duration-presets">
            {durations.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`duration-preset ${duration === value && !customDuration ? 'active' : ''}`}
                onClick={() => handleQuickSelect(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="custom-duration">
            <label>مدة مخصصة (دقيقة)</label>
            <div className="custom-input-group">
              <input
                type="number"
                min="15"
                max="300"
                step="15"
                value={customDuration}
                onChange={(e) => {
                  setCustomDuration(e.target.value);
                  setDuration(15);
                }}
                placeholder="أدخل المدة بالدقائق"
              />
              <span className="input-suffix">دقيقة</span>
            </div>
            <small>يجب أن تكون المدة من مضاعفات 15 دقيقة</small>
          </div>
        </div>

        {/* ملخص السعر */}
        <div className="price-summary">
          <h3><FaMoneyBillWave /> ملخص الفاتورة</h3>
          <div className="price-details">
            <div className="price-row">
              <span>المدة المحددة:</span>
              <span>{customDuration || duration} دقيقة</span>
            </div>
            <div className="price-row">
              <span>سعر 15 دقيقة:</span>
              <span>{game.price_per_15min} ريال</span>
            </div>
            <div className="price-row">
              <span>عدد وحدات السعر:</span>
              <span>{((customDuration || duration) / 15).toFixed(1)} وحدة</span>
            </div>
  <div className="price-row total">
  <span>المبلغ الإجمالي:</span>
  <span className="total-price">{price} جنيه</span>  // تغيير هنا
</div>
          </div>
        </div>

        {/* معلومات الموظف */}
        <div className="employee-info">
          <div className="info-row">
            <span>الموظف:</span>
            <strong>{user?.name}</strong>
          </div>
          <div className="info-row">
            <span>الفرع:</span>
            <strong>{user?.branch?.name}</strong>
          </div>
          <div className="info-row">
            <span>التاريخ والوقت:</span>
            <strong>{new Date().toLocaleString('ar-SA')}</strong>
          </div>
        </div>

        {/* أزرار الإجراء */}
        <div className="form-actions">
          <button type="submit" className="btn-submit">
            <FaSave /> بدء التأجير
          </button>
          <button type="button" className="btn-cancel" onClick={onCancel}>
            <FaTimes /> إلغاء
          </button>
        </div>

        <div className="form-note">
          <p>⚠️ ملاحظة: يمكن إلغاء التأجير خلال أول 3 دقائق فقط</p>
          <p>⏰ سيتم تنبيهك قبل انتهاء الوقت بـ 5 دقائق</p>
        </div>
      </form>
    </div>
  );
};

export default RentalForm;