import { RENTAL_STATUS, STATUS_COLORS } from './constants';

/**
 * تنسيق التاريخ باللغة العربية
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Riyadh'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleDateString('ar-SA', options);
};

/**
 * تنسيق الوقت
 */
export const formatTime = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Riyadh'
  });
};

/**
 * حساب المدة بين تاريخين
 */
export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return { minutes: 0, formatted: '0 دقيقة' };
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) {
    return { minutes: diffMins, formatted: `${diffMins} دقيقة` };
  }
  
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  
  return {
    minutes: diffMins,
    formatted: `${hours} ساعة ${minutes > 0 ? `${minutes} دقيقة` : ''}`.trim()
  };
};

/**
 * تنسيق المبلغ المالي
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0.00 ريال';
  
  return new Intl.NumberFormat('ar-SA', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount) + ' ريال';
};

/**
 * اختصار النص
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

/**
 * التحقق من صحة البريد الإلكتروني
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * التحقق من صحة رقم الهاتف السعودي
 */
export const isValidSaudiPhone = (phone) => {
  const re = /^(05)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/;
  return re.test(phone);
};

/**
 * إنشاء معرف فريد
 */
export const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

/**
 * حساب العمر من تاريخ الميلاد
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * تصفية الكائن وإزالة القيم الفارغة
 */
export const cleanObject = (obj) => {
  const cleaned = {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  });
  
  return cleaned;
};

/**
 * تجميع البيانات حسب المفتاح
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * ترتيب الكائن حسب المفتاح
 */
export const sortByKey = (array, key, ascending = true) => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) return ascending ? -1 : 1;
    if (aValue > bValue) return ascending ? 1 : -1;
    return 0;
  });
};

/**
 * تحويل الوقت من ثواني إلى نص مقروء
 */
export const secondsToTime = (seconds) => {
  if (!seconds && seconds !== 0) return '0:00';
  
  const absSeconds = Math.abs(seconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  const sign = seconds < 0 ? '+' : '';
  
  return `${sign}${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * الحصول على لون الحالة
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || '#6c757d';
};

/**
 * الحصول على نص الحالة
 */
export const getStatusText = (status) => {
  const statusMap = {
    [RENTAL_STATUS.ACTIVE]: 'نشط',
    [RENTAL_STATUS.COMPLETED]: 'مكتمل',
    [RENTAL_STATUS.CANCELED]: 'ملغي',
    [RENTAL_STATUS.PENDING]: 'قيد الانتظار'
  };
  
  return statusMap[status] || 'غير معروف';
};

/**
 * حساب النسبة المئوية
 */
export const calculatePercentage = (part, total) => {
  if (!total || total === 0) return 0;
  return Math.round((part / total) * 100);
};

/**
 * إنشاء صفيف الصفحات للتجزئة
 */
export const generatePagination = (currentPage, totalPages, maxPages = 5) => {
  const pages = [];
  const half = Math.floor(maxPages / 2);
  
  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxPages - 1);
  
  if (end - start < maxPages - 1) {
    start = Math.max(1, end - maxPages + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
};

/**
 * تحميل الصورة
 */
export const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * نسخ النص إلى الحافظة
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * تحويل البيانات إلى FormData
 */
export const toFormData = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach(item => {
        formData.append(`${key}[]`, item);
      });
    } else if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });
  
  return formData;
};