// ==================== دوال تنسيق البيانات ====================

/**
 * تنسيق المبلغ بالعملة المحلية
 * @param {number} amount - المبلغ
 * @returns {string} المبلغ المنسق
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') return '٠ ج.م';
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * تنسيق التاريخ والوقت
 * @param {string} dateString - نص التاريخ
 * @returns {string} التاريخ المنسق
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '--/--/---- --:--';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--/--/---- --:--';
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '--/--/---- --:--';
  }
};

/**
 * تنسيق الوقت فقط
 * @param {string} dateString - نص التاريخ
 * @returns {string} الوقت المنسق
 */
export const formatTime = (dateString) => {
  if (!dateString) return '--:--';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '--:--';
  }
};

/**
 * تنسيق المدة بالدقائق
 * @param {number} minutes - عدد الدقائق
 * @returns {string} المدة المنسقة
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '٠ دقيقة';
  
  if (minutes < 60) {
    return `${minutes} دقيقة`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ساعة`;
  }
  
  return `${hours} ساعة و ${remainingMinutes} دقيقة`;
};

/**
 * تنسيق رقم الهاتف
 * @param {string} phone - رقم الهاتف
 * @returns {string} رقم الهاتف المنسق
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // تنظيف الرقم من أي رموز غير رقمية
  const cleaned = phone.replace(/\D/g, '');
  
  // تنسيق الرقم المصري
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
};

/**
 * حساب إجمالي عنصر في السلة
 * @param {Object} item - عنصر السلة
 * @returns {number} الإجمالي
 */
export const calculateItemTotal = (item) => {
  if (!item) return 0;
  if (item.rental_type === 'open') return 0;
  
  const duration = item.duration_minutes || 15;
  const units = Math.ceil(duration / 15);
  return (item.price_per_15min || 0) * units * (item.quantity || 1);
};

/**
 * حساب إجمالي السلة
 * @param {Array} items - عناصر السلة
 * @returns {number} الإجمالي
 */
export const calculateCartTotal = (items) => {
  if (!items || !items.length) return 0;
  return items.reduce((total, item) => total + calculateItemTotal(item), 0);
};

/**
 * حساب الوقت المتبقي
 * @param {string} startTime - وقت البدء
 * @param {number} duration - المدة بالدقائق
 * @returns {Object} الوقت المتبقي
 */
export const calculateRemainingTime = (startTime, duration = 15) => {
  if (!startTime) return { minutes: 0, seconds: 0, total: 0 };
  
  try {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);
    const now = new Date();
    
    const remainingMs = end - now;
    
    if (remainingMs <= 0) {
      return { minutes: 0, seconds: 0, total: 0 };
    }
    
    const remainingMinutes = Math.floor(remainingMs / 60000);
    const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
    
    return {
      minutes: remainingMinutes,
      seconds: remainingSeconds,
      total: remainingMs
    };
  } catch {
    return { minutes: 0, seconds: 0, total: 0 };
  }
};

/**
 * تنسيق الوقت المتبقي
 * @param {number} minutes - الدقائق
 * @param {number} seconds - الثواني
 * @returns {string} الوقت المتبقي المنسق
 */
export const formatRemainingTime = (minutes, seconds) => {
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * التحقق من انتهاء الوقت
 * @param {string} startTime - وقت البدء
 * @param {number} duration - المدة بالدقائق
 * @returns {boolean} هل انتهى الوقت؟
 */
export const isTimeExpired = (startTime, duration = 15) => {
  if (!startTime) return false;
  
  try {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);
    return new Date() > end;
  } catch {
    return false;
  }
};

/**
 * حساب الدقائق المنقضية
 * @param {string} startTime - وقت البدء
 * @returns {number} الدقائق المنقضية
 */
export const getElapsedMinutes = (startTime) => {
  if (!startTime) return 0;
  
  try {
    return Math.floor((new Date() - new Date(startTime)) / (1000 * 60));
  } catch {
    return 0;
  }
};

/**
 * تنسيق اسم العميل
 * @param {string} name - اسم العميل
 * @returns {string} الاسم المنسق
 */
export const formatCustomerName = (name) => {
  if (!name) return 'عميل';
  
  // قص الاسم إذا كان طويلاً
  if (name.length > 20) {
    return `${name.substring(0, 20)}...`;
  }
  
  return name;
};

/**
 * إنشاء رقم فاتورة
 * @param {Object} rental - بيانات التأجير
 * @returns {string} رقم الفاتورة
 */
export const generateReceiptNumber = (rental) => {
  if (!rental) return 'N/A';
  
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `INV-${year}${month}${day}-${rental.id || '0000'}`;
};