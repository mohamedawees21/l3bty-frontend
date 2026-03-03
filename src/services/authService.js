import api from './api';

// ==================== إعدادات البيئة ====================
// ✅ استخدم نفس عنوان api.js - مهم جداً
const API_URL = "https://l3btybackend.vercel.app";

console.log('🌐 [authService] API URL:', API_URL);
console.log('🔧 [authService] Environment:', process.env.NODE_ENV);

const authService = {
  // ==================== المصادقة الأساسية ====================
  
  login: async (email, password) => {
    try {
      console.log('🔐 محاولة تسجيل دخول:', email);
      
      const response = await api.post('/auth/login', { email, password });
      
      if (response && response.success) {
        if (response.token) {
          localStorage.setItem('token', response.token);
          api.setToken(response.token);
        }
        
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        if (response.permissions) {
          localStorage.setItem('permissions', JSON.stringify(response.permissions));
        }
        
        localStorage.setItem('lastLogin', new Date().toISOString());
        
        return {
          success: true,
          data: {
            token: response.token,
            user: response.user,
            permissions: response.permissions
          },
          message: response.message || 'تم تسجيل الدخول بنجاح'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل تسجيل الدخول'
      };
      
    } catch (error) {
      console.error('🔥 خطأ في تسجيل الدخول:', error);
      
      let errorMessage = 'حدث خطأ في الاتصال بالخادم';
      
      if (error.status === 401) {
        errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'انتهت مهلة الاتصال';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
        error
      };
    }
  },

  logout: () => {
    console.log('🚪 تسجيل الخروج...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    localStorage.removeItem('lastLogin');
    localStorage.removeItem('current_shift');
    api.setToken(null);
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('❌ خطأ في جلب المستخدم الحالي:', error);
      return null;
    }
  },

  isAuthenticated: () => {
    const token = authService.getToken();
    const user = authService.getCurrentUser();
    return !!(token && user);
  },

  handleAuthError: (error) => {
    if (error && error.status === 401) {
      console.log('🔒 توكن منتهي الصلاحية - تسجيل خروج تلقائي');
      authService.logout();
      return true;
    }
    return false;
  },

  verifyToken: async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        return { valid: false, message: 'لا يوجد توكن' };
      }
      
      const response = await api.get('/auth/verify');
      
      if (response && response.success) {
        return {
          valid: true,
          user: response.user,
          message: 'التوكن صالح'
        };
      }
      
      return {
        valid: false,
        message: response?.message || 'التوكن غير صالح'
      };
      
    } catch (error) {
      console.error('❌ خطأ في التحقق من التوكن:', error);
      
      if (error.status === 401) {
        authService.logout();
      }
      
      return {
        valid: false,
        message: error.message || 'فشل التحقق من التوكن'
      };
    }
  },

  // ==================== BRANCHES ====================
  
  getBranches: async () => {
    try {
      return await api.getBranches();
    } catch (error) {
      console.error('🔥 خطأ في getBranches:', error);
      return { success: false, data: [] };
    }
  },

  getBranchById: async (branchId) => {
    try {
      return await api.getBranch(branchId);
    } catch (error) {
      console.error(`🔥 خطأ في جلب فرع ${branchId}:`, error);
      return { success: false, message: 'تعذر جلب الفرع', data: null };
    }
  },

  createBranch: async (branchData) => {
    try {
      return await api.createBranch(branchData);
    } catch (error) {
      console.error('🔥 خطأ في createBranch:', error);
      return { success: false, message: 'تعذر إنشاء الفرع' };
    }
  },

  updateBranch: async (id, branchData) => {
    try {
      return await api.updateBranch(id, branchData);
    } catch (error) {
      console.error('🔥 خطأ في updateBranch:', error);
      return { success: false, message: 'تعذر تحديث الفرع' };
    }
  },

  deleteBranch: async (id) => {
    try {
      return await api.deleteBranch(id, false);
    } catch (error) {
      console.error('🔥 خطأ في deleteBranch:', error);
      return { success: false, message: 'تعذر حذف الفرع' };
    }
  },

  deleteBranchPermanent: async (id) => {
    try {
      return await api.deleteBranch(id, true);
    } catch (error) {
      console.error('🔥 خطأ في deleteBranchPermanent:', error);
      return { success: false, message: 'تعذر حذف الفرع نهائياً' };
    }
  },

  getBranchGames: async (branchId) => {
    try {
      return await api.getBranchGames(branchId);
    } catch (error) {
      console.error('🔥 خطأ في getBranchGames:', error);
      return { success: false, data: [] };
    }
  },

  // ==================== GAMES ====================
  
  getGames: async (params = {}) => {
    try {
      return await api.getGames(params);
    } catch (error) {
      console.error('🔥 خطأ في getGames:', error);
      return { success: false, data: [] };
    }
  },

  getAvailableGames: async (params = {}) => {
    try {
      return await api.getAvailableGames(params);
    } catch (error) {
      console.error('🔥 خطأ في getAvailableGames:', error);
      return { success: false, data: [] };
    }
  },

  getGameById: async (id) => {
    try {
      return await api.getGameById(id);
    } catch (error) {
      console.error(`🔥 خطأ في جلب لعبة ${id}:`, error);
      return { success: false, message: 'تعذر جلب اللعبة' };
    }
  },

  createGame: async (gameData) => {
    try {
      return await api.createGame(gameData);
    } catch (error) {
      console.error('🔥 خطأ في createGame:', error);
      return { success: false, message: 'تعذر إنشاء اللعبة' };
    }
  },

  updateGame: async (id, gameData) => {
    try {
      return await api.updateGame(id, gameData);
    } catch (error) {
      console.error('🔥 خطأ في updateGame:', error);
      return { success: false, message: 'تعذر تحديث اللعبة' };
    }
  },

  deleteGame: async (id, permanent = false) => {
    try {
      return await api.deleteGame(id, permanent);
    } catch (error) {
      console.error('🔥 خطأ في deleteGame:', error);
      return { success: false, message: 'تعذر حذف اللعبة' };
    }
  },

  getAvailableGamesForCurrentBranch: async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user?.branch_id) {
        return { success: false, message: 'المستخدم غير مرتبط بفرع', data: [] };
      }
      
      const response = await api.getAvailableGames({ branch_id: user.branch_id });
      return response;
    } catch (error) {
      console.error('🔥 خطأ في getAvailableGamesForCurrentBranch:', error);
      return { success: false, data: [] };
    }
  },

  // ==================== SHIFTS ====================
  
  getActiveShift: async () => {
    try {
      return await api.getCurrentShift();
    } catch (error) {
      console.error('🔥 خطأ في getActiveShift:', error);
      return { success: false, data: null, exists: false };
    }
  },

  startShift: async (openingCash = 0) => {
    try {
      return await api.startShift(openingCash);
    } catch (error) {
      console.error('🔥 خطأ في startShift:', error);
      return { success: false, message: 'تعذر بدء الشيفت' };
    }
  },

  endShift: async (shiftId, closingData = {}) => {
    try {
      return await api.endShift(shiftId, closingData);
    } catch (error) {
      console.error('🔥 خطأ في endShift:', error);
      return { success: false, message: 'تعذر إنهاء الشيفت' };
    }
  },

  getShiftDetails: async (shiftId) => {
    try {
      return await api.getShiftDetails(shiftId);
    } catch (error) {
      console.error('🔥 خطأ في getShiftDetails:', error);
      return { success: false, data: null };
    }
  },

  getShiftStats: async (shiftId) => {
    try {
      return await api.getShiftStats(shiftId);
    } catch (error) {
      console.error('🔥 خطأ في getShiftStats:', error);
      return { success: false, data: null };
    }
  },

  getBranchShifts: async (branchId, params = {}) => {
    try {
      return await api.getShifts({ ...params, branch_id: branchId });
    } catch (error) {
      console.error('❌ خطأ في جلب شيفتات الفرع:', error);
      return { success: false, data: [] };
    }
  },

  getAllActiveShifts: async () => {
    try {
      return await api.getAllActiveShifts();
    } catch (error) {
      console.error('🔥 خطأ في getAllActiveShifts:', error);
      return { success: false, data: [] };
    }
  },

  // ==================== RENTALS ====================
  
  getRentals: async (params = {}) => {
    try {
      return await api.getRentals(params);
    } catch (error) {
      console.error('🔥 خطأ في getRentals:', error);
      return { success: false, data: [] };
    }
  },

  createRental: async (rentalData) => {
    try {
      return await api.createRental(rentalData);
    } catch (error) {
      console.error('🔥 خطأ في createRental:', error);
      return { success: false, message: 'تعذر إنشاء التأجير' };
    }
  },

  completeRental: async (rentalId, paymentData = {}) => {
    try {
      return await api.completeRental(rentalId, paymentData);
    } catch (error) {
      console.error('🔥 خطأ في completeRental:', error);
      return { success: false, message: 'تعذر إنهاء التأجير' };
    }
  },

  cancelRental: async (rentalId, reason = '') => {
    try {
      return await api.cancelRental(rentalId, reason);
    } catch (error) {
      console.error('🔥 خطأ في cancelRental:', error);
      return { success: false, message: 'تعذر إلغاء التأجير' };
    }
  },

  getActiveRentals: async (shiftId = null) => {
    try {
      return await api.getActiveRentals(shiftId);
    } catch (error) {
      console.error('🔥 خطأ في getActiveRentals:', error);
      return { success: false, data: [] };
    }
  },

  getCompletedRentals: async (params = {}) => {
    try {
      return await api.getCompletedRentals(params);
    } catch (error) {
      console.error('🔥 خطأ في getCompletedRentals:', error);
      return { success: false, data: [] };
    }
  },

  getRentalById: async (rentalId) => {
    try {
      return await api.getRentalById(rentalId);
    } catch (error) {
      console.error(`🔥 خطأ في جلب تأجير ${rentalId}:`, error);
      return { success: false, data: null };
    }
  },

  // ==================== ADMIN DASHBOARD ====================
  
  getAllActiveRentals: async () => {
    try {
      return await api.getAllActiveRentals();
    } catch (error) {
      console.error('🔥 خطأ في getAllActiveRentals:', error);
      return { success: false, data: [] };
    }
  },

  getTodayCompletedRentalsAllBranches: async () => {
    try {
      return await api.getTodayCompletedRentalsAllBranches();
    } catch (error) {
      console.error('🔥 خطأ في getTodayCompletedRentalsAllBranches:', error);
      return { success: false, data: [], total_revenue: 0 };
    }
  },

  getRecentRentalsAllBranches: async (limit = 20) => {
    try {
      return await api.getRecentRentalsAllBranches(limit);
    } catch (error) {
      console.error('🔥 خطأ في getRecentRentalsAllBranches:', error);
      return { success: false, data: [] };
    }
  },

  // ==================== USERS ====================
  
  getUsers: async (params = {}) => {
    try {
      return await api.getUsers(params);
    } catch (error) {
      console.error('🔥 خطأ في getUsers:', error);
      return { success: false, data: [] };
    }
  },

  getUserById: async (id) => {
    try {
      return await api.getUserById(id);
    } catch (error) {
      console.error(`🔥 خطأ في جلب مستخدم ${id}:`, error);
      return { success: false, message: 'تعذر جلب المستخدم', data: null };
    }
  },

  createUser: async (userData) => {
    try {
      return await api.createUser(userData);
    } catch (error) {
      console.error('🔥 خطأ في createUser:', error);
      return { success: false, message: 'تعذر إنشاء المستخدم' };
    }
  },

  updateUser: async (id, userData) => {
    try {
      return await api.updateUser(id, userData);
    } catch (error) {
      console.error('🔥 خطأ في updateUser:', error);
      return { success: false, message: 'تعذر تحديث المستخدم' };
    }
  },

  deleteUser: async (id) => {
    try {
      return await api.deleteUser(id, false);
    } catch (error) {
      console.error('🔥 خطأ في deleteUser:', error);
      return { success: false, message: 'تعذر حذف المستخدم' };
    }
  },

  deleteUserPermanent: async (id) => {
    try {
      return await api.deleteUser(id, true);
    } catch (error) {
      console.error('🔥 خطأ في deleteUserPermanent:', error);
      return { success: false, message: 'تعذر حذف المستخدم نهائياً' };
    }
  },

  changePassword: async (id, passwordData) => {
    try {
      return await api.changePassword(id, passwordData);
    } catch (error) {
      console.error('🔥 خطأ في changePassword:', error);
      return { success: false, message: 'تعذر تغيير كلمة المرور' };
    }
  },

  // ==================== STATISTICS ====================
  
  getSimpleStats: async () => {
    try {
      return await api.getSimpleStats();
    } catch (error) {
      console.error('🔥 خطأ في getSimpleStats:', error);
      return { success: false, data: {} };
    }
  },

  getDashboardStats: async () => {
    try {
      return await api.getDashboardStats();
    } catch (error) {
      console.error('🔥 خطأ في getDashboardStats:', error);
      return { success: false, data: {} };
    }
  },

  getDashboardAllStats: async () => {
    try {
      return await api.getDashboardAllStats();
    } catch (error) {
      console.error('🔥 خطأ في getDashboardAllStats:', error);
      return { success: false, data: {} };
    }
  },

  // ==================== HEALTH & TEST ====================
  
  healthCheck: async () => {
    try {
      return await api.healthCheck();
    } catch (error) {
      return { success: false, message: '❌ الخادم غير متصل' };
    }
  },

  testApiConnection: async () => {
    try {
      return await api.testConnection();
    } catch (error) {
      return { success: false, message: '❌ فشل اختبار الاتصال' };
    }
  },

  // ==================== CURRENT BRANCH ====================
  
  getCurrentUserBranch: async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user?.branch_id) {
        return { success: false, message: 'المستخدم غير مرتبط بفرع', data: null };
      }
      return await authService.getBranchById(user.branch_id);
    } catch (error) {
      console.error('🔥 خطأ في getCurrentUserBranch:', error);
      return { success: false, message: 'تعذر تحميل بيانات الفرع', data: null };
    }
  },

  // ==================== UTILITY FUNCTIONS ====================
  
  formatError: (error) => {
    if (error.response) {
      return error.response.data?.message || `خطأ ${error.response.status}`;
    } else if (error.request) {
      return 'تعذر الاتصال بالخادم';
    } else {
      return error.message || 'حدث خطأ غير معروف';
    }
  },

  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  },

  hasAnyRole: (roles) => {
    const user = authService.getCurrentUser();
    return user && roles.includes(user.role);
  },

  checkPermission: (allowedRoles) => {
    const user = authService.getCurrentUser();
    if (!user) return false;
    
    if (user.role === 'admin') return true;
    
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    return user.role === allowedRoles;
  },

  formatCurrency: (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(num);
  },

  formatDuration: (minutes) => {
    if (!minutes || minutes === 0) return 'وقت مفتوح';
    if (minutes < 60) return `${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} ساعة${remainingMinutes > 0 ? ` و ${remainingMinutes} دقيقة` : ''}`;
  },

  formatTime: (dateString) => {
    try {
      return new Date(dateString).toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '--:--';
    }
  },

  formatDate: (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '--/--/----';
    }
  },

  formatDateTime: (dateString) => {
    try {
      return `${authService.formatDate(dateString)} ${authService.formatTime(dateString)}`;
    } catch {
      return '--/--/---- --:--';
    }
  },

  getEnvironmentInfo: () => {
    return {
      apiUrl: API_URL,
      environment: process.env.NODE_ENV,
      isAuthenticated: authService.isAuthenticated(),
      user: authService.getCurrentUser(),
      token: authService.getToken() ? 'موجود' : 'غير موجود'
    };
  }
};

export default authService;