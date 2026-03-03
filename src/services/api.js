import axios from 'axios';

// ==================== إعدادات البيئة ====================
// استخدم الخادم المحلي في development و Vercel في production
const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://l3btybackend.vercel.app"
    : "http://localhost:5000";

console.log('🌐 عنوان API:', API_URL);
console.log('🔧 البيئة:', process.env.NODE_ENV);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'ar'
  },
  withCredentials: true
});

// ==================== Interceptors ====================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    
    // إزالة أي Origin header قد يسبب مشكلة
    delete config.headers.Origin;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        tokenExists: !!token
      });
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    // معالجة خطأ 401 (توكن منتهي)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject({
      success: false,
      status: error.response?.status || 0,
      message: error.response?.data?.message || error.message || 'حدث خطأ',
      data: error.response?.data
    });
  }
);

// ==================== دوال إدارة التوكن ====================
api.setToken = (token) => {
  if (token) {
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    api.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
    localStorage.setItem('token', cleanToken);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

api.checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  return {
    isAuthenticated: !!token,
    token: token,
    user: user ? JSON.parse(user) : null
  };
};

api.getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('❌ خطأ في جلب المستخدم الحالي:', error);
    return null;
  }
};

// ==================== AUTH ENDPOINTS ====================
api.login = async (email, password) => {
  try {
    console.log('🔐 محاولة تسجيل دخول:', email);
    
    const response = await api.post('/auth/login', { email, password });
    
    if (response.success && response.token) {
      api.setToken(response.token);
      
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('lastLogin', new Date().toISOString());
      }
      
      return {
        success: true,
        data: response
      };
    }
    
    return {
      success: false,
      message: response.message || 'فشل تسجيل الدخول'
    };
  } catch (error) {
    console.error('❌ خطأ في تسجيل الدخول:', error);
    
    if (error.code === 'ECONNABORTED') {
      return { success: false, message: 'انتهت المهلة. تأكد من تشغيل الخادم' };
    }
    
    if (error.status === 401) {
      return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }
    
    return { success: false, message: 'تعذر الاتصال بالخادم' };
  }
};

api.logout = async (redirect = true) => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.log('⚠️ لا يمكن الاتصال بالخادم للتسجيل الخروج');
  } finally {
    api.setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('lastLogin');
    localStorage.removeItem('current_shift');
    
    if (redirect) {
      window.location.href = '/login';
    }
  }
};

api.getProfile = async () => {
  try {
    return await api.get('/auth/profile');
  } catch (error) {
    return { success: false, message: 'تعذر تحميل الملف الشخصي' };
  }
};

api.verifyToken = async () => {
  try {
    return await api.get('/auth/verify');
  } catch (error) {
    return { success: false, message: 'توكن غير صالح' };
  }
};

// ==================== BRANCHES ENDPOINTS ====================
api.getBranches = async (params = {}) => {
  try {
    const response = await api.get('/branches', { params });
    return {
      success: true,
      data: response.data || [],
      count: response.count || 0
    };
  } catch (error) {
    console.error('❌ خطأ في جلب الفروع:', error);
    return { success: false, data: [] };
  }
};

api.getBranch = async (branchId) => {
  try {
    const response = await api.get(`/branches/${branchId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ خطأ في جلب فرع ${branchId}:`, error.message);
    return {
      success: true,
      data: {
        id: branchId,
        name: `فرع ${branchId}`,
        location: 'القاهرة',
        city: 'القاهرة',
        contact_phone: '01000000000',
        opening_time: '09:00:00',
        closing_time: '22:00:00',
        is_active: true
      },
      fromCache: true
    };
  }
};

api.createBranch = async (branchData) => {
  try {
    return await api.post('/branches', branchData);
  } catch (error) {
    console.error('❌ خطأ في إنشاء الفرع:', error);
    return { success: false, message: error.message || 'تعذر إنشاء الفرع' };
  }
};

api.updateBranch = async (id, branchData) => {
  try {
    return await api.put(`/branches/${id}`, branchData);
  } catch (error) {
    console.error('❌ خطأ في تحديث الفرع:', error);
    return { success: false, message: error.message || 'تعذر تحديث الفرع' };
  }
};

api.deleteBranch = async (id, permanent = false) => {
  try {
    return await api.delete(`/branches/${id}?permanent=${permanent}`);
  } catch (error) {
    console.error('❌ خطأ في حذف الفرع:', error);
    return { success: false, message: error.message || 'تعذر حذف الفرع' };
  }
};

api.getBranchGames = async (branchId) => {
  try {
    const response = await api.get(`/branches/${branchId}/games`);
    return {
      success: true,
      data: response.data || [],
      stats: response.stats || {}
    };
  } catch (error) {
    console.error('❌ خطأ في جلب ألعاب الفرع:', error);
    return { success: false, data: [] };
  }
};

// ==================== GAMES ENDPOINTS ====================
api.getGames = async (params = {}) => {
  try {
    const response = await api.get('/games', { params, timeout: 15000 });
    
    if (response.success) {
      return {
        success: true,
        data: response.data || [],
        stats: response.stats || {},
        message: response.message || 'تم تحميل الألعاب بنجاح'
      };
    }
    return { success: false, data: [] };
  } catch (error) {
    console.error('❌ خطأ في getGames:', error);
    return { success: false, data: [] };
  }
};

api.getAvailableGames = async (params = {}) => {
  try {
    const response = await api.get('/games/available', { params });
    return {
      success: true,
      data: response.data || [],
      count: response.count || 0
    };
  } catch (error) {
    console.error('❌ خطأ في جلب الألعاب المتاحة:', error);
    return { success: false, data: [] };
  }
};

api.getGameById = async (id) => {
  try {
    return await api.get(`/games/${id}`);
  } catch (error) {
    console.error(`❌ خطأ في جلب لعبة ${id}:`, error);
    return { success: false, message: 'تعذر تحميل اللعبة' };
  }
};

api.createGame = async (gameData) => {
  try {
    return await api.post('/games', gameData);
  } catch (error) {
    console.error('❌ خطأ في إنشاء اللعبة:', error);
    return { success: false, message: error.message || 'تعذر إنشاء اللعبة' };
  }
};

api.updateGame = async (id, gameData) => {
  try {
    return await api.put(`/games/${id}`, gameData);
  } catch (error) {
    console.error('❌ خطأ في تحديث اللعبة:', error);
    return { success: false, message: error.message || 'تعذر تحديث اللعبة' };
  }
};

api.deleteGame = async (id, permanent = false) => {
  try {
    return await api.delete(`/games/${id}?permanent=${permanent}`);
  } catch (error) {
    console.error('❌ خطأ في حذف اللعبة:', error);
    return { success: false, message: error.message || 'تعذر حذف اللعبة' };
  }
};

// ==================== SHIFTS ENDPOINTS ====================
api.getCurrentShift = async () => {
  try {
    const response = await api.get('/shifts/current');
    return {
      success: true,
      data: response.data,
      exists: !!response.data
    };
  } catch (error) {
    console.error('❌ خطأ في جلب الشيفت الحالي:', error.message);
    return { success: true, data: null, exists: false };
  }
};

api.startShift = async (openingCash = 0) => {
  try {
    console.log('🔄 بدء شيفت جديد...');
    const response = await api.post('/shifts/start', { opening_cash: openingCash });
    
    if (response && response.success && response.data) {
      localStorage.setItem('current_shift', JSON.stringify(response.data));
    }
    return response;
  } catch (error) {
    console.error('🔥 خطأ في startShift:', error);
    return { success: false, message: 'حدث خطأ في بدء الشيفت' };
  }
};

api.endShift = async (shiftId, closingData = {}) => {
  try {
    console.log(`🏁 إنهاء الشيفت ${shiftId}...`);
    const response = await api.put(`/shifts/${shiftId}/end`, {
      closing_cash: closingData.closing_cash,
      notes: closingData.notes || 'تم إنهاء الشيفت'
    });
    
    if (response.success) {
      localStorage.removeItem('current_shift');
    }
    return response;
  } catch (error) {
    console.error('❌ خطأ في إنهاء الشيفت:', error);
    return { success: false, message: error.message || 'تعذر إنهاء الشيفت' };
  }
};

api.getShiftDetails = async (shiftId) => {
  try {
    const response = await api.get(`/shifts/${shiftId}/details`);
    return {
      success: true,
      data: response.data || {},
      stats: response.stats || {}
    };
  } catch (error) {
    console.error('❌ خطأ في جلب تفاصيل الشيفت:', error);
    return { success: false, data: null };
  }
};

api.getAllActiveShifts = async () => {
  try {
    const response = await api.get('/shifts/active-all-branches');
    return {
      success: true,
      data: response.data || [],
      count: response.count || 0
    };
  } catch (error) {
    console.error('❌ خطأ في جلب جميع الشيفتات النشطة:', error);
    return { success: false, data: [] };
  }
};

api.getShiftStats = async (shiftId) => {
  try {
    const response = await api.get(`/shifts/${shiftId}/stats`);
    return {
      success: true,
      data: response.data || {}
    };
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات الشيفت:', error);
    return { success: false, data: null };
  }
};

api.getShifts = async (params = {}) => {
  try {
    const response = await api.get('/shifts', { params });
    return {
      success: true,
      data: response.data || [],
      count: response.count || 0
    };
  } catch (error) {
    console.error('❌ خطأ في جلب الشيفتات:', error);
    return { success: false, data: [] };
  }
};

// ==================== RENTALS ENDPOINTS ====================
api.getActiveRentals = async (shiftId = null) => {
  try {
    const params = shiftId ? { shift_id: shiftId } : {};
    const response = await api.get('/rentals/active', { params });
    return {
      success: true,
      data: response.data || [],
      count: response.count || 0
    };
  } catch (error) {
    console.error('❌ خطأ في getActiveRentals:', error);
    return { success: false, data: [] };
  }
};

api.getCompletedRentals = async (params = {}) => {
  try {
    const response = await api.get('/rentals/completed', { params });
    return {
      success: true,
      data: response.data || [],
      count: response.count || 0
    };
  } catch (error) {
    console.error('❌ خطأ في getCompletedRentals:', error);
    return { success: false, data: [] };
  }
};

api.createRental = async (rentalData) => {
  try {
    console.log('📦 إنشاء تأجير جديد:', rentalData);
    
    if (!rentalData.customer_name) {
      throw new Error('اسم العميل مطلوب');
    }
    if (!rentalData.items || !rentalData.items.length) {
      throw new Error('يجب إضافة لعبة واحدة على الأقل');
    }
    
    const response = await api.post('/rentals', rentalData);
    return response;
  } catch (error) {
    console.error('❌ خطأ في إنشاء التأجير:', error);
    return { success: false, message: error.message || 'فشل إنشاء التأجير' };
  }
};

api.completeRental = async (rentalId, paymentData = {}) => {
  try {
    return await api.post(`/rentals/${rentalId}/complete`, paymentData);
  } catch (error) {
    console.error('❌ خطأ في completeRental:', error);
    return { success: false, message: error.message };
  }
};

api.cancelRental = async (rentalId, reason = '') => {
  try {
    return await api.post(`/rentals/${rentalId}/cancel`, { reason });
  } catch (error) {
    console.error('❌ خطأ في cancelRental:', error);
    return { success: false, message: error.message };
  }
};

api.getRentalById = async (rentalId) => {
  try {
    const response = await api.get(`/rentals/${rentalId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ خطأ في جلب تأجير ${rentalId}:`, error);
    return { success: false, message: 'تعذر جلب التأجير', data: null };
  }
};

// ==================== OPEN TIME RENTALS ENDPOINTS ====================
api.startOpenTime = async (openTimeData) => {
  try {
    console.log('⏱️ بدء وقت مفتوح:', openTimeData);
    
    if (!openTimeData.game_id || !openTimeData.customer_name) {
      throw new Error('معرف اللعبة واسم العميل مطلوبان');
    }
    
    const response = await api.post('/rentals/open-time', openTimeData);
    return response;
  } catch (error) {
    console.error('❌ خطأ في بدء الوقت المفتوح:', error);
    return { success: false, message: error.message || 'فشل بدء الوقت المفتوح' };
  }
};

api.completeOpenTime = async (rentalId, completionData) => {
  try {
    console.log(`⏱️ إنهاء وقت مفتوح ${rentalId}:`, completionData);
    
    if (!completionData.final_amount || !completionData.actual_minutes) {
      throw new Error('المبلغ النهائي والوقت الفعلي مطلوبان');
    }
    
    const response = await api.post(`/rentals/${rentalId}/complete-open`, completionData);
    return response;
  } catch (error) {
    console.error(`❌ خطأ في إنهاء الوقت المفتوح ${rentalId}:`, error);
    return { success: false, message: error.message || 'فشل إنهاء الوقت المفتوح' };
  }
};

api.completeFixedTime = async (rentalId) => {
  try {
    console.log(`⏱️ إنهاء وقت ثابت ${rentalId}`);
    const response = await api.post(`/rentals/${rentalId}/complete-fixed`);
    return response;
  } catch (error) {
    console.error(`❌ خطأ في إنهاء الوقت الثابت ${rentalId}:`, error);
    return { success: false, message: error.message || 'فشل إنهاء الوقت الثابت' };
  }
};

// ==================== RENTAL ITEMS ENDPOINTS ====================
api.getRentalItems = async (rentalId) => {
  try {
    const response = await api.get('/rental-items', { params: { rental_id: rentalId } });
    return {
      success: true,
      data: response.data || [],
      count: response.count || 0
    };
  } catch (error) {
    console.error('❌ خطأ في جلب عناصر التأجير:', error);
    return { success: false, data: [] };
  }
};


// ==================== REPORTS ENDPOINTS ====================
api.getRentalsReport = async (params = {}) => {
  try {
    const response = await api.get('/reports/rentals', { params });
    return {
      success: true,
      data: response.data || [],
      count: response.count || 0
    };
  } catch (error) {
    console.error('❌ خطأ في جلب تقرير التأجيرات:', error);
    return { success: false, data: [] };
  }
};

api.getRevenueReport = async (params = {}) => {
  try {
    const response = await api.get('/reports/revenue', { params });
    return {
      success: true,
      data: response.data || [],
      summary: response.summary || { total_rentals: 0, total_revenue: 0 }
    };
  } catch (error) {
    console.error('❌ خطأ في جلب تقرير الإيرادات:', error);
    return { success: false, data: [], summary: { total_rentals: 0, total_revenue: 0 } };
  }
};
// ==================== ADMIN DASHBOARD ENDPOINTS ====================
// ✅ الدوال المفقودة التي كانت تسبب الأخطاء

api.getAllActiveRentals = async () => {
  try {
    const response = await api.get('/admin/rentals/active-all-branches');
    return {
      success: true,
      data: response.data || [],
      count: response.count || 0
    };
  } catch (error) {
    console.error('❌ خطأ في getAllActiveRentals:', error);
    return { success: false, data: [] };
  }
};

api.getTodayCompletedRentalsAllBranches = async () => {
  try {
    const response = await api.get('/admin/rentals/completed-today-all-branches');
    return {
      success: true,
      data: response.data || [],
      total_revenue: response.total_revenue || 0,
      count: response.count || 0
    };
  } catch (error) {
    console.error('❌ خطأ في getTodayCompletedRentalsAllBranches:', error);
    return { success: false, data: [], total_revenue: 0 };
  }
};

api.getRecentRentalsAllBranches = async (limit = 20) => {
  try {
    const response = await api.get('/admin/rentals/recent-all-branches', { params: { limit } });
    return {
      success: true,
      data: response.data || [],
      count: response.count || 0
    };
  } catch (error) {
    console.error('❌ خطأ في getRecentRentalsAllBranches:', error);
    return { success: false, data: [] };
  }
};

// ==================== USERS ENDPOINTS ====================
api.getUsers = async (params = {}) => {
  try {
    const response = await api.get('/users', { params });
    return {
      success: true,
      data: response.data || [],
      count: response.count || 0
    };
  } catch (error) {
    console.error('❌ خطأ في جلب المستخدمين:', error);
    return { success: false, data: [] };
  }
};

api.getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`❌ خطأ في جلب مستخدم ${id}:`, error);
    return { success: false, message: error.message };
  }
};

api.createUser = async (userData) => {
  try {
    console.log('📝 إنشاء مستخدم جديد:', userData);
    const response = await api.post('/users', userData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'تم إنشاء المستخدم بنجاح'
    };
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error);
    return { success: false, message: error.message || 'فشل إنشاء المستخدم' };
  }
};

api.updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return {
      success: true,
      data: response.data,
      message: response.message || 'تم تحديث المستخدم بنجاح'
    };
  } catch (error) {
    console.error(`❌ خطأ في تحديث مستخدم ${id}:`, error);
    return { success: false, message: error.message };
  }
};

api.deleteUser = async (id, permanent = false) => {
  try {
    const response = await api.delete(`/users/${id}?permanent=${permanent}`);
    return {
      success: true,
      message: response.message || 'تم حذف المستخدم بنجاح'
    };
  } catch (error) {
    console.error(`❌ خطأ في حذف مستخدم ${id}:`, error);
    return { success: false, message: error.message };
  }
};

api.changePassword = async (id, passwordData) => {
  try {
    const response = await api.put(`/users/${id}/change-password`, passwordData);
    return {
      success: true,
      message: response.message || 'تم تغيير كلمة المرور بنجاح'
    };
  } catch (error) {
    console.error(`❌ خطأ في تغيير كلمة المرور:`, error);
    return { success: false, message: error.message };
  }
};

// ==================== DASHBOARD & STATS ====================
api.getSimpleStats = async () => {
  try {
    const response = await api.get('/dashboard/stats/simple');
    return response;
  } catch (error) {
    console.error('❌ خطأ في جلب الإحصائيات المبسطة:', error);
    return {
      success: false,
      data: {
        availableGames: 0,
        totalGames: 0,
        todayRevenue: 0,
        todayRentals: 0,
        activeRentals: 0
      }
    };
  }
};

api.getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response;
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات لوحة التحكم:', error);
    return { success: false, data: {} };
  }
};

api.getDashboardAllStats = async () => {
  try {
    const response = await api.get('/dashboard/all-stats');
    return response;
  } catch (error) {
    console.error('❌ خطأ في جلب جميع الإحصائيات:', error);
    return { success: false, data: {} };
  }
};

// ==================== SIMPLE SHIFTS ENDPOINT ====================
api.getSimpleShifts = async () => {
  try {
    const response = await api.get('/shifts/simple');
    return {
      success: true,
      data: response.data || [],
      count: response.count || 0
    };
  } catch (error) {
    console.error('❌ خطأ في getSimpleShifts:', error);
    return { success: false, data: [] };
  }
};


// ==================== دوال التوافق مع الإصدارات السابقة ====================
// هذه الدوال تضمن عدم كسر الكود القديم

api.getBranchesApi = api.getBranches; // alias
api.getGamesApi = api.getGames; // alias
api.getShiftsApi = api.getShifts; // alias
api.getUsersApi = api.getUsers; // alias

// دالة مساعدة لفحص صلاحيات المستخدم
api.hasPermission = (requiredRole) => {
  const user = api.getCurrentUser();
  if (!user) return false;
  
  const roleHierarchy = {
    'admin': 3,
    'branch_manager': 2,
    'employee': 1
  };
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};

// دالة لجلب إحصائيات الفرع
api.getBranchStats = async (branchId) => {
  try {
    const [games, rentals] = await Promise.all([
      api.getGames({ branch_id: branchId }),
      api.getActiveRentals()
    ]);
    
    return {
      success: true,
      data: {
        totalGames: games.data.length,
        availableGames: games.data.filter(g => g.status === 'available').length,
        activeRentals: rentals.data.length,
        rentedGames: games.data.filter(g => g.status === 'rented').length,
        maintenanceGames: games.data.filter(g => g.status === 'maintenance').length
      }
    };
  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات الفرع:', error);
    return { success: false, data: {} };
  }
};

// دالة للبحث
api.searchGames = async (query, branchId = null) => {
  try {
    const params = { search: query };
    if (branchId) params.branch_id = branchId;
    
    const response = await api.get('/games/search', { params });
    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    console.error('❌ خطأ في البحث عن الألعاب:', error);
    return { success: false, data: [] };
  }
};

api.searchCustomers = async (query) => {
  try {
    const response = await api.get('/customers/search', { params: { q: query } });
    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    console.error('❌ خطأ في البحث عن العملاء:', error);
    return { success: false, data: [] };
  }
};

// دالة لجلب العملاء المتكررين
api.getFrequentCustomers = async (limit = 10) => {
  try {
    const response = await api.get('/customers/frequent', { params: { limit } });
    return {
      success: true,
      data: response.data || []
    };
  } catch (error) {
    console.error('❌ خطأ في جلب العملاء المتكررين:', error);
    return { success: false, data: [] };
  }
};

// دالة لتصدير البيانات
api.exportData = async (type, params = {}) => {
  try {
    const response = await api.get(`/export/${type}`, { 
      params,
      responseType: 'blob'
    });
    return {
      success: true,
      blob: response
    };
  } catch (error) {
    console.error(`❌ خطأ في تصدير ${type}:`, error);
    return { success: false, message: error.message };
  }
};

// ==================== HEALTH & TEST ====================
api.healthCheck = async () => {
  try {
    return await api.get('/health');
  } catch (error) {
    return { success: false, message: 'تعذر الاتصال بالخادم' };
  }
};

api.testConnection = async () => {
  try {
    const response = await api.get('/health');
    return {
      success: true,
      message: '✅ اتصال API يعمل بشكل صحيح',
      data: response
    };
  } catch (error) {
    return {
      success: false,
      message: '❌ فشل اختبار الاتصال: ' + (error.message || 'تعذر الاتصال بالخادم')
    };
  }
};

// api.js - أضف هذا السطر بعد تعريف api
const savedToken = localStorage.getItem('token');
if (savedToken) {
  console.log('✅ تم العثور على توكن محفوظ:', savedToken.substring(0, 20) + '...');
  api.setToken(savedToken);
}




// وأضف هذه الدالة للتحقق من حالة التوكن
api.checkAuthAndToken = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('🔍 حالة المصادقة:', {
    hasToken: !!token,
    tokenPrefix: token ? token.substring(0, 10) + '...' : null,
    hasUser: !!user,
    user: user ? JSON.parse(user).email : null
  });
  
  return {
    isAuthenticated: !!token,
    token: token,
    user: user ? JSON.parse(user) : null
  };
};

export default api;