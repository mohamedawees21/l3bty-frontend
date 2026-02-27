// أدوار النظام
export const ROLES = {
  ADMIN: 'ADMIN',
  BRANCH_MANAGER: 'BRANCH_MANAGER',
  EMPLOYEE: 'EMPLOYEE'
};

// صلاحيات النظام
export const PERMISSIONS = {
  // إدارة الفروع
  VIEW_BRANCHES: 'VIEW_BRANCHES',
  MANAGE_BRANCHES: 'MANAGE_BRANCHES',
  TOGGLE_BRANCH_STATUS: 'TOGGLE_BRANCH_STATUS',
  
  // إدارة الموظفين
  VIEW_EMPLOYEES: 'VIEW_EMPLOYEES',
  MANAGE_EMPLOYEES: 'MANAGE_EMPLOYEES',
  TOGGLE_EMPLOYEE_STATUS: 'TOGGLE_EMPLOYEE_STATUS',
  
  // إدارة الألعاب
  VIEW_GAMES: 'VIEW_GAMES',
  MANAGE_GAMES: 'MANAGE_GAMES',
  UPDATE_GAME_PRICES: 'UPDATE_GAME_PRICES',
  
  // إدارة التأجير
  START_RENTAL: 'START_RENTAL',
  CANCEL_RENTAL: 'CANCEL_RENTAL',
  EXTEND_RENTAL: 'EXTEND_RENTAL',
  COMPLETE_RENTAL: 'COMPLETE_RENTAL',
  VIEW_ALL_RENTALS: 'VIEW_ALL_RENTALS',
  
  // التقارير
  VIEW_REPORTS: 'VIEW_REPORTS',
  EXPORT_DATA: 'EXPORT_DATA',
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  
  // النظام
  VIEW_ACTIVITY_LOGS: 'VIEW_ACTIVITY_LOGS',
  MANAGE_SETTINGS: 'MANAGE_SETTINGS',
  BACKUP_SYSTEM: 'BACKUP_SYSTEM'
};

// تعيين الصلاحيات للأدوار
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  
  [ROLES.BRANCH_MANAGER]: [
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_GAMES,
    PERMISSIONS.START_RENTAL,
    PERMISSIONS.CANCEL_RENTAL,
    PERMISSIONS.EXTEND_RENTAL,
    PERMISSIONS.COMPLETE_RENTAL,
    PERMISSIONS.VIEW_ALL_RENTALS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_DATA
  ],
  
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.START_RENTAL,
    PERMISSIONS.CANCEL_RENTAL,
    PERMISSIONS.EXTEND_RENTAL,
    PERMISSIONS.COMPLETE_RENTAL
  ]
};

// حالات التأجير
export const RENTAL_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
  PENDING: 'PENDING'
};

// حالات الفرع
export const BRANCH_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE'
};

// حالات الموظف
export const EMPLOYEE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  ON_LEAVE: 'ON_LEAVE'
};

// أنواع النشاطات
export const ACTIVITY_TYPES = {
  RENTAL_STARTED: 'RENTAL_STARTED',
  RENTAL_CANCELED: 'RENTAL_CANCELED',
  RENTAL_COMPLETED: 'RENTAL_COMPLETED',
  RENTAL_EXTENDED: 'RENTAL_EXTENDED',
  EMPLOYEE_CREATED: 'EMPLOYEE_CREATED',
  EMPLOYEE_UPDATED: 'EMPLOYEE_UPDATED',
  BRANCH_CREATED: 'BRANCH_CREATED',
  BRANCH_UPDATED: 'BRANCH_UPDATED',
  GAME_ADDED: 'GAME_ADDED',
  GAME_UPDATED: 'GAME_UPDATED',
  PRICE_UPDATED: 'PRICE_UPDATED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT'
};

// خيارات المدة
export const DURATION_OPTIONS = [
  { value: 15, label: '15 دقيقة', priceMultiplier: 1 },
  { value: 30, label: '30 دقيقة', priceMultiplier: 2 },
  { value: 45, label: '45 دقيقة', priceMultiplier: 3 },
  { value: 60, label: 'ساعة', priceMultiplier: 4 },
  { value: 120, label: 'ساعتين', priceMultiplier: 8 },
  { value: 180, label: '3 ساعات', priceMultiplier: 12 },
  { value: 240, label: '4 ساعات', priceMultiplier: 16 }
];

// ألوان الحالة
export const STATUS_COLORS = {
  [RENTAL_STATUS.ACTIVE]: '#28a745',
  [RENTAL_STATUS.COMPLETED]: '#17a2b8',
  [RENTAL_STATUS.CANCELED]: '#dc3545',
  [RENTAL_STATUS.PENDING]: '#ffc107',
  
  [BRANCH_STATUS.ACTIVE]: '#28a745',
  [BRANCH_STATUS.INACTIVE]: '#6c757d',
  [BRANCH_STATUS.MAINTENANCE]: '#fd7e14',
  
  [EMPLOYEE_STATUS.ACTIVE]: '#28a745',
  [EMPLOYEE_STATUS.INACTIVE]: '#dc3545',
  [EMPLOYEE_STATUS.SUSPENDED]: '#ffc107',
  [EMPLOYEE_STATUS.ON_LEAVE]: '#17a2b8'
};

// رسائل الأخطاء
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'تعذر الاتصال بالسيرفر. تحقق من اتصالك بالإنترنت.',
  UNAUTHORIZED: 'غير مصرح. يرجى تسجيل الدخول.',
  FORBIDDEN: 'ليس لديك صلاحية للقيام بهذا الإجراء.',
  NOT_FOUND: 'المورد المطلوب غير موجود.',
  VALIDATION_ERROR: 'البيانات المدخلة غير صالحة.',
  SERVER_ERROR: 'حدث خطأ في السيرفر. يرجى المحاولة لاحقاً.',
  TIMEOUT_ERROR: 'انتهت مهلة الطلب. تحقق من سرعة الاتصال.',
  BRANCH_INACTIVE: 'الفرع غير نشط حالياً.',
  EMPLOYEE_INACTIVE: 'حساب الموظف غير نشط.',
  GAME_UNAVAILABLE: 'اللعبة غير متاحة حالياً.',
  CANNOT_CANCEL: 'لا يمكن إلغاء التأجير بعد مرور 3 دقائق.',
  INSUFFICIENT_UNITS: 'لا توجد وحدات كافية من هذه اللعبة.'
};

// رسائل النجاح
export const SUCCESS_MESSAGES = {
  RENTAL_STARTED: 'تم بدء التأجير بنجاح.',
  RENTAL_CANCELED: 'تم إلغاء التأجير بنجاح.',
  RENTAL_COMPLETED: 'تم إنهاء التأجير بنجاح.',
  RENTAL_EXTENDED: 'تم تمديد التأجير بنجاح.',
  EMPLOYEE_CREATED: 'تم إنشاء الموظف بنجاح.',
  EMPLOYEE_UPDATED: 'تم تحديث بيانات الموظف.',
  BRANCH_CREATED: 'تم إنشاء الفرع بنجاح.',
  BRANCH_UPDATED: 'تم تحديث بيانات الفرع.',
  GAME_ADDED: 'تمت إضافة اللعبة بنجاح.',
  GAME_UPDATED: 'تم تحديث بيانات اللعبة.',
  PRICE_UPDATED: 'تم تحديث الأسعار بنجاح.',
  LOGIN_SUCCESS: 'تم تسجيل الدخول بنجاح.',
  LOGOUT_SUCCESS: 'تم تسجيل الخروج بنجاح.',
  DATA_EXPORTED: 'تم تصدير البيانات بنجاح.',
  SETTINGS_SAVED: 'تم حفظ الإعدادات بنجاح.'
};

// إعدادات النظام
export const SYSTEM_SETTINGS = {
  CANCELLATION_WINDOW: 180, // 3 دقائق بالثواني
  EXPIRY_WARNING: 300, // 5 دقائق بالثواني
  DEFAULT_RENTAL_DURATION: 30, // 30 دقيقة
  MAX_RENTAL_DURATION: 480, // 8 ساعات
  MIN_RENTAL_DURATION: 15, // 15 دقيقة
  AUTO_REFRESH_INTERVAL: 30000, // 30 ثانية
  SESSION_TIMEOUT: 3600000, // ساعة واحدة
  MAX_UPLOAD_SIZE: 5242880, // 5MB
  PAGINATION_LIMIT: 50,
  CACHE_DURATION: 300000 // 5 دقائق
};

// الأنواع المتاحة
export const GAME_CATEGORIES = [
  'أركيد',
  'سباقات',
  'أكشن',
  'رياضة',
  'أطفال',
  'عائلي',
  'واقع افتراضي',
  'تحدي',
  'تعليمي',
  'آخر'
];

// الفئات العمرية
export const AGE_GROUPS = [
  { min: 3, max: 6, label: '3-6 سنوات' },
  { min: 7, max: 12, label: '7-12 سنة' },
  { min: 13, max: 16, label: '13-16 سنة' },
  { min: 17, max: 99, label: '17+ سنة' }
];

// أيام الأسبوع
export const WEEK_DAYS = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

// أشهر السنة
export const MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر'
];