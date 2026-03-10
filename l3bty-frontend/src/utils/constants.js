// ==================== ثوابت النظام ====================

// طرق الدفع المتاحة
export const PAYMENT_METHODS = [
  { value: 'cash', label: '💵 نقدي', icon: 'DollarSign' },
  { value: 'card', label: '💳 بطاقة', icon: 'CreditCard' },
  { value: 'wallet', label: '📱 محفظة', icon: 'Wallet' },
  { value: 'points', label: '⭐ نقاط', icon: 'Star' }
];

// أنواع التأجير
export const RENTAL_TYPES = [
  { value: 'fixed', label: '⏰ وقت ثابت', color: '#3498db' },
  { value: 'open', label: '🔓 وقت مفتوح', color: '#f39c12' }
];

// تصنيفات الألعاب
export const GAME_CATEGORIES = [
  { id: 'all', label: 'الكل', icon: 'Grid' },
  { id: 'playstation', label: 'بلايستيشن', icon: 'Gamepad2' },
  { id: 'vr', label: 'واقع افتراضي', icon: 'Eye' },
  { id: 'scooter', label: 'سكوتر', icon: 'Zap' },
  { id: 'bike', label: 'دراجات', icon: 'Activity' },
  { id: 'table', label: 'ألعاب طاولة', icon: 'Table' }
];

// خيارات مدة التأجير
export const DURATION_OPTIONS = [
  { value: 10, label: '١٠ دقائق' },
  { value: 15, label: '١٥ دقيقة' },
  { value: 30, label: '٣٠ دقيقة' },
  { value: 45, label: '٤٥ دقيقة' },
  { value: 60, label: 'ساعة' },
  { value: 90, label: 'ساعة ونصف' },
  { value: 120, label: 'ساعتين' }
];

// حالات التأجير
export const RENTAL_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// أدوار المستخدمين
export const USER_ROLES = {
  ADMIN: 'admin',
  BRANCH_MANAGER: 'branch_manager',
  EMPLOYEE: 'employee'
};

// ألوان النظام
export const COLORS = {
  primary: '#3498db',
  success: '#2ecc71',
  warning: '#f39c12',
  danger: '#e74c3c',
  info: '#3498db',
  dark: '#2c3e50',
  light: '#ecf0f1',
  gray: '#95a5a6'
};

// رسائل الخطأ
export const ERROR_MESSAGES = {
  NO_SHIFT: '❌ يجب فتح شيفت أولاً',
  NO_GAMES: 'لا توجد ألعاب متاحة',
  CART_EMPTY: '❌ السلة فارغة',
  CUSTOMER_NAME_REQUIRED: '❌ اسم العميل مطلوب',
  NO_PERMISSION: '❌ ليس لديك صلاحية للقيام بهذه العملية',
  NETWORK_ERROR: 'خطأ في الاتصال بالخادم'
};

// رسائل النجاح
export const SUCCESS_MESSAGES = {
  SHIFT_STARTED: '✅ تم فتح الشيفت بنجاح',
  SHIFT_ENDED: '✅ تم إنهاء الشيفت بنجاح',
  RENTAL_CREATED: '✅ تم إنشاء التأجير بنجاح',
  RENTAL_COMPLETED: '✅ تم إنهاء التأجير بنجاح',
  RENTAL_CANCELLED: '✅ تم إلغاء التأجير بنجاح',
  RENTAL_MODIFIED: '✅ تم تعديل التأجير بنجاح',
  GAME_ADDED: '✅ تم إضافة اللعبة إلى السلة'
};

// خريطة الصور الافتراضية للألعاب
export const DEFAULT_GAME_IMAGES = {
  'سيارة': '/images/Car.jpg',
  'سيارات': '/images/Car.jpg',
  'كار': '/images/Car.jpg',
  'درفت': '/images/Driftcar.jpg',
  'دريفت': '/images/Driftcar.jpg',
  'هارلي': '/images/harley.jpg',
  'هوفر بورد': '/images/Hoverboard.jpg',
  'هوفر': '/images/Hoverboard.jpg',
  'لعبتي': '/images/I3bty.png',
  'موتور': '/images/Motor.jpg',
  'موتوسيكل': '/images/motorcycle.jpg',
  'نينبوت': '/images/Ninebot.jpg',
  'بينج بونج': '/images/pingpong.jpg',
  'تنس طاولة': '/images/pingpong.jpg',
  'بلايستيشن': '/images/playstation.jpg',
  'ps': '/images/playstation.jpg',
  'سكوتر': '/images/Scooter.jpg',
  'سيغوي': '/images/Segway.jpg',
  'سيميوليتور': '/images/Simulator.jpg',
  'محاكي': '/images/Simulator.jpg',
  'سكيت': '/images/Skate.jpg',
  'ترامبولين': '/images/Trampoline.jpg',
  'vr': '/images/VR.jpg',
  'واقع افتراضي': '/images/VR.jpg',
  'ووتر سلايد': '/images/waterslide.jpg',
  'زحليقة': '/images/waterslide.jpg',
  'عجلة': '/images/wheel.jpg',
  'دراجة': '/images/wheel.jpg'
};