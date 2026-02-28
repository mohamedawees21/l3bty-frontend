// src/services/authService.js

import api from './api';

// ==================== إعدادات البيئة ====================
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_BASE_URL = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;

console.log('🌐 [authService] API URL:', API_URL);
console.log('🌐 [authService] API Base URL:', API_BASE_URL);
console.log('🔧 [authService] Environment:', process.env.NODE_ENV);

// ==================== إعدادات المحاولات ====================
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 ثانية

// تأخير تنفيذ
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== دوال مساعدة للتحقق من المسارات ====================

/**
 * التحقق من المسارات المتاحة على السيرفر
 */
const checkAvailableEndpoints = async () => {
  const endpoints = [
    { method: 'GET', url: '/api/games', name: 'games_list' },
    { method: 'POST', url: '/api/games', name: 'games_create' },
    { method: 'POST', url: '/api/games/create', name: 'games_create_alt' },
    { method: 'POST', url: '/api/branches/1/add-game', name: 'branches_add_game' },
    { method: 'GET', url: '/api/health', name: 'health' },
    { method: 'GET', url: '/api/test', name: 'test' },
    { method: 'GET', url: '/auth/verify', name: 'auth_verify' },
    { method: 'POST', url: '/auth/login', name: 'auth_login' }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const fullUrl = `${API_BASE_URL}${endpoint.url.replace('/api', '')}`;
      console.log(`🔍 Checking endpoint: ${fullUrl}`);
      
      const response = await fetch(fullUrl, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 3000
      });
      
      results[endpoint.name] = {
        available: response.status !== 404,
        status: response.status,
        url: fullUrl,
        method: endpoint.method
      };
    } catch (error) {
      results[endpoint.name] = {
        available: false,
        error: error.message,
        url: `${API_BASE_URL}${endpoint.url.replace('/api', '')}`,
        method: endpoint.method
      };
    }
  }
  
  console.log('🔍 المسارات المتاحة:', results);
  return results;
};

const authService = {
  // ==================== المصادقة الأساسية ====================
  
  /**
   * تسجيل الدخول
   */
  login: async (email, password) => {
    try {
      console.log('🔐 محاولة تسجيل دخول:', email);
      console.log('🌐 API URL:', API_URL);
      console.log('🌐 API Base URL:', API_BASE_URL);
      
      // ✅ استخدام api.post مباشرة
      const response = await api.post('/auth/login', { email, password });
      
      console.log('📥 استجابة تسجيل الدخول:', response);
      
      if (response && response.success) {
        // تخزين التوكن
        if (response.token) {
          localStorage.setItem('token', response.token);
          api.setToken(response.token);
          console.log('✅ تم تخزين التوكن');
        }
        
        // تخزين المستخدم
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          console.log('✅ تم تخزين المستخدم:', response.user);
        }
        
        // تخزين الصلاحيات
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
      
      // تحسين رسائل الخطأ
      let errorMessage = 'حدث خطأ في الاتصال بالخادم';
      
      if (error.status === 401) {
        errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      } else if (error.status === 500) {
        errorMessage = 'خطأ في الخادم. يرجى المحاولة مرة أخرى';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'انتهت مهلة الاتصال. تأكد من تشغيل الخادم';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  },

  /**
   * تسجيل الخروج
   */
  logout: () => {
    console.log('🚪 تسجيل الخروج...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    localStorage.removeItem('lastLogin');
    localStorage.removeItem('current_shift');
    api.setToken(null);
  },

  /**
   * الحصول على التوكن
   */
  getToken: () => {
    const token = localStorage.getItem('token');
    return token;
  },

  /**
   * الحصول على المستخدم الحالي
   */
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('❌ خطأ في جلب المستخدم الحالي:', error);
      return null;
    }
  },

  /**
   * التحقق من حالة المصادقة
   */
  isAuthenticated: () => {
    const token = authService.getToken();
    const user = authService.getCurrentUser();
    return !!(token && user);
  },

  /**
   * معالجة خطأ 401
   */
  handleAuthError: (error) => {
    if (error.response && error.response.status === 401) {
      console.log('🔒 توكن منتهي الصلاحية - تسجيل خروج تلقائي');
      authService.logout();
      return true;
    }
    return false;
  },

  /**
   * التحقق من صحة التوكن
   */
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

  // ==================== دوال مساعدة للـ fetch المباشر ====================
  
  /**
   * تنفيذ طلب fetch مع استخدام API_URL
   */
  fetchWithApiUrl: async (endpoint, options = {}) => {
    // تنظيف endpoint من /api الزائد
    let cleanEndpoint = endpoint;
    if (cleanEndpoint.startsWith('/api')) {
      cleanEndpoint = cleanEndpoint.substring(4);
    }
    
    const url = `${API_BASE_URL}${cleanEndpoint}`;
    console.log('🌐 Fetch URL:', url);
    
    const token = authService.getToken();
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };
    
    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      const data = await response.json();
      
      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || `HTTP ${response.status}`,
          data
        };
      }
      
      return data;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }
  },

  /**
   * اختبار الاتصال المباشر
   */
  testDirectConnection: async () => {
    try {
      const url = `${API_BASE_URL}/health`;
      console.log('🔍 اختبار الاتصال المباشر:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      return {
        success: true,
        message: '✅ اتصال ناجح',
        data,
        apiUrl: API_URL,
        apiBaseUrl: API_BASE_URL
      };
    } catch (error) {
      return {
        success: false,
        message: '❌ فشل الاتصال',
        error: error.message,
        apiUrl: API_URL,
        apiBaseUrl: API_BASE_URL
      };
    }
  },

  // ==================== دوال إنشاء الألعاب المقاومة للكسر ====================

  /**
   * إنشاء لعبة باستخدام fetch مباشرة
   */
  createGameDirect: async (gameData) => {
    try {
      console.log('🎮 [DIRECT] محاولة إنشاء لعبة:', gameData);
      
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      
      if (!token || !user) {
        return {
          success: false,
          message: 'يجب تسجيل الدخول أولاً'
        };
      }
      
      const branchId = gameData.branch_id || user.branch_id || 1;
      
      const gamePayload = {
        name: gameData.name,
        description: gameData.description || `${gameData.name}`,
        category: gameData.category || 'سيارات',
        price_per_15min: parseFloat(gameData.price_per_15min) || 50,
        branch_id: branchId,
        status: gameData.status || 'available',
        min_rental_time: gameData.min_rental_time || 15,
        max_rental_time: gameData.max_rental_time || 120,
        image_url: gameData.image_url || 'default-game.jpg',
        is_active: true
      };
      
      // ✅ استخدام API_BASE_URL مباشرة
      const url = `${API_BASE_URL}/games`;
      console.log('🌐 إنشاء لعبة عبر:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(gamePayload)
      });
      
      const data = await response.json();
      console.log('📥 استجابة:', data);
      
      if (response.ok && data.success) {
        return {
          success: true,
          data: data.data || data,
          message: 'تم إنشاء اللعبة بنجاح'
        };
      } else {
        return {
          success: false,
          message: data.message || 'فشل إنشاء اللعبة'
        };
      }
      
    } catch (error) {
      console.error('❌ خطأ في createGameDirect:', error);
      return {
        success: false,
        message: error.message || 'حدث خطأ غير متوقع'
      };
    }
  },

  /**
   * إنشاء لعبة بأي طريقة ممكنة (UNBREAKABLE)
   */
  createGameUnbreakable: async (gameData) => {
    try {
      console.log('🛡️ [UNBREAKABLE] محاولة إنشاء لعبة بأي طريقة:', gameData);
      
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      
      if (!token || !user) {
        return {
          success: false,
          message: 'يجب تسجيل الدخول أولاً'
        };
      }
      
      const branchId = gameData.branch_id || user.branch_id || 1;
      
      // تجهيز الحمولة الأساسية
      const gamePayload = {
        name: gameData.name,
        description: gameData.description || `${gameData.name}`,
        category: gameData.category || 'سيارات',
        price_per_15min: parseFloat(gameData.price_per_15min) || 50,
        price_per_hour: Math.ceil((parseFloat(gameData.price_per_15min) || 50) * 4),
        branch_id: branchId,
        status: gameData.status || 'available',
        min_rental_time: gameData.min_rental_time || 15,
        max_rental_time: gameData.max_rental_time || 120,
        minimum_age: gameData.minimum_age || 16,
        image_url: gameData.image_url || 'default-game.jpg',
        external_image_url: gameData.external_image_url || '',
        is_active: true
      };
      
      console.log('📤 الحمولة النهائية:', gamePayload);
      
      // استراتيجيات المحاولة - مرتبة حسب الأولوية
      const strategies = [
        {
          name: 'المسار الرئيسي POST /api/games',
          executor: async () => {
            return await api.post('/games', gamePayload);
          }
        },
        {
          name: 'مسار بديل POST /api/games/create',
          executor: async () => {
            return await api.post('/games/create', gamePayload);
          }
        },
        {
          name: 'إضافة لعبة لفرع POST /api/branches/{branchId}/add-game',
          executor: async () => {
            return await api.post(`/branches/${branchId}/add-game`, {
              name: gamePayload.name,
              price_per_15min: gamePayload.price_per_15min,
              category: gamePayload.category,
              description: gamePayload.description,
              branch_id: branchId
            });
          }
        },
        {
          name: 'إضافة لعبة لفرع (صيغة مختلفة) POST /api/branches/add-game',
          executor: async () => {
            return await api.post('/branches/add-game', {
              ...gamePayload,
              branch_id: branchId
            });
          }
        },
        {
          name: 'إنشاء لعبة عبر إدارة الفروع POST /api/admin/games',
          executor: async () => {
            return await api.post('/admin/games', gamePayload);
          }
        },
        {
          name: 'مسار مبسط POST /api/games/simple',
          executor: async () => {
            const simplePayload = {
              name: gamePayload.name,
              price_per_15min: gamePayload.price_per_15min,
              branch_id: branchId
            };
            return await api.post('/games/simple', simplePayload);
          }
        },
        {
          name: 'إنشاء لعبة باستخدام fetch (طريقة مباشرة)',
          executor: async () => {
            return await authService.createGameDirect(gameData);
          }
        },
        {
          name: 'إنشاء لعبة باستخدام fetch مع مسار بديل',
          executor: async () => {
            const url = `${API_BASE_URL}/branches/${branchId}/add-game`;
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(gamePayload)
            });
            return await response.json();
          }
        }
      ];
      
      // تنفيذ الاستراتيجيات بالترتيب
      for (let i = 0; i < strategies.length; i++) {
        try {
          console.log(`🔄 المحاولة ${i + 1}: ${strategies[i].name}`);
          const response = await strategies[i].executor();
          
          console.log(`📊 استجابة المحاولة ${i + 1}:`, response);
          
          // التحقق من نجاح الاستجابة
          if (response && (response.status === 201 || response.status === 200 || response.success)) {
            console.log(`✅ نجحت المحاولة ${i + 1}:`, response.data || response);
            return {
              success: true,
              data: response.data || response,
              attempt: i + 1,
              method: strategies[i].name
            };
          }
          
          // إذا كانت الاستجابة تحتوي على success: true
          if (response && response.success === true) {
            return response;
          }
          
        } catch (error) {
          console.log(`❌ فشلت المحاولة ${i + 1}:`, error.message);
          
          // إذا كان الخطأ 404 (المسار غير موجود)، نكمل للمحاولة التالية
          if (error.response?.status === 404) {
            continue;
          }
          
          // إذا كان الخطأ 500 (خطأ في السيرفر) ونحن في المحاولة الأخيرة
          if (error.response?.status >= 500 && i === strategies.length - 1) {
            // ننتظر ثم نعيد المحاولة من البداية (مرة واحدة فقط)
            await delay(RETRY_DELAY);
            return authService.createGameUnbreakable(gameData);
          }
        }
      }
      
      // جميع المحاولات فشلت - الحل الأخير: تخزين محلي
      console.warn('⚠️ جميع محاولات إنشاء اللعبة فشلت، سيتم التخزين محلياً');
      
      const localGame = {
        id: 'local-' + Date.now(),
        name: gamePayload.name,
        price_per_15min: gamePayload.price_per_15min,
        branch_id: branchId,
        category: gamePayload.category,
        status: 'متاح (محلي)',
        local: true,
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      // حفظ في localStorage
      try {
        const localGames = JSON.parse(localStorage.getItem('local_games') || '[]');
        localGames.push(localGame);
        localStorage.setItem('local_games', JSON.stringify(localGames));
        console.log('💾 تم حفظ اللعبة محلياً:', localGame.id);
      } catch (e) {
        console.warn('⚠️ لا يمكن حفظ اللعبة محلياً:', e.message);
      }
      
      return {
        success: true,
        data: localGame,
        message: 'تم حفظ اللعبة محلياً (سيتم مزامنتها لاحقاً)',
        local: true,
        emergency: true
      };
      
    } catch (error) {
      console.error('🔥 خطأ شامل في إنشاء اللعبة:', error);
      return {
        success: false,
        message: 'حدث خطأ غير متوقع: ' + error.message
      };
    }
  },

  /**
   * جلب الألعاب مع دعم تعدد المسارات
   */
  fetchGamesUnbreakable: async (params = {}) => {
    try {
      console.log('🔄 محاولة جلب الألعاب:', params);
      
      const strategies = [
        {
          name: 'GET /api/games',
          executor: async () => {
            return await api.get('/games', { params });
          }
        },
        {
          name: 'GET /api/games/list',
          executor: async () => {
            return await api.get('/games/list', { params });
          }
        },
        {
          name: `GET /api/branches/${params.branch_id}/games`,
          executor: async () => {
            if (!params.branch_id) throw new Error('branch_id مطلوب');
            return await api.get(`/branches/${params.branch_id}/games`);
          }
        },
        {
          name: 'GET /api/admin/games',
          executor: async () => {
            return await api.get('/admin/games', { params });
          }
        },
        {
          name: 'GET /api/games/all',
          executor: async () => {
            return await api.get('/games/all', { params });
          }
        },
        {
          name: 'GET باستخدام fetch مباشر',
          executor: async () => {
            const queryString = new URLSearchParams(params).toString();
            const url = `${API_BASE_URL}/games${queryString ? `?${queryString}` : ''}`;
            const response = await fetch(url, {
              headers: {
                'Authorization': `Bearer ${authService.getToken()}`
              }
            });
            return await response.json();
          }
        }
      ];
      
      for (const strategy of strategies) {
        try {
          // تخطي الاستراتيجيات التي تتطلب branch_id إذا لم يكن موجوداً
          if (strategy.name.includes('branches/') && !params.branch_id) {
            continue;
          }
          
          const response = await strategy.executor();
          
          if (response && (response.status === 200 || response.success)) {
            const gamesData = response.data?.data || response.data || [];
            console.log(`✅ نجحت ${strategy.name}:`, gamesData.length, 'لعبة');
            
            // دمج الألعاب المحلية إذا وجدت
            const localGames = JSON.parse(localStorage.getItem('local_games') || '[]');
            const filteredLocalGames = localGames.filter(g => 
              !params.branch_id || g.branch_id === params.branch_id
            );
            
            if (filteredLocalGames.length > 0) {
              console.log('📦 دمج ألعاب محلية:', filteredLocalGames.length);
              return {
                success: true,
                data: [...gamesData, ...filteredLocalGames],
                local_count: filteredLocalGames.length,
                method: strategy.name
              };
            }
            
            return {
              success: true,
              data: gamesData,
              method: strategy.name
            };
          }
        } catch (error) {
          if (error.response?.status !== 404) {
            console.log(`⚠️ خطأ في ${strategy.name}:`, error.message);
          }
        }
      }
      
      // إذا فشلت جميع المحاولات، نرجع الألعاب المحلية فقط
      const localGames = JSON.parse(localStorage.getItem('local_games') || '[]');
      const filteredLocalGames = localGames.filter(g => 
        !params.branch_id || g.branch_id === params.branch_id
      );
      
      return {
        success: true,
        data: filteredLocalGames,
        local_only: true,
        message: 'تم تحميل الألعاب المحلية فقط'
      };
      
    } catch (error) {
      console.error('🔥 خطأ في جلب الألعاب:', error);
      return {
        success: false,
        data: [],
        message: 'فشل جلب الألعاب'
      };
    }
  },

  // ==================== BRANCHES MANAGEMENT =================
  
  /**
   * جلب قائمة الفروع
   */
  getBranches: async () => {
    try {
      const response = await api.get('/branches');
      return {
        success: true,
        data: response.data || [],
        count: response.count || 0
      };
    } catch (error) {
      console.error('🔥 خطأ في getBranches:', error);
      return {
        success: false,
        message: 'تعذر جلب الفروع',
        data: []
      };
    }
  },

  /**
   * جلب فرع محدد
   */
  getBranchById: async (branchId) => {
    try {
      const response = await api.get(`/branches/${branchId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`🔥 خطأ في جلب فرع ${branchId}:`, error);
      return {
        success: false,
        message: 'تعذر جلب الفرع',
        data: null
      };
    }
  },

  /**
   * إنشاء فرع جديد
   */
  createBranch: async (branchData) => {
    try {
      console.log('🔑 التوكن الحالي:', authService.getToken());
      console.log('👤 المستخدم الحالي:', authService.getCurrentUser());
      console.log('📦 بيانات الفرع:', branchData);
      
      const response = await api.post('/branches', branchData);
      console.log('📥 استجابة إنشاء الفرع:', response);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || 'تم إنشاء الفرع بنجاح'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل إنشاء الفرع'
      };
    } catch (error) {
      console.error('🔥 خطأ في createBranch:', error);
      return {
        success: false,
        message: 'تعذر إنشاء الفرع: ' + (error.message || 'خطأ غير معروف')
      };
    }
  },

  /**
   * تحديث فرع
   */
  updateBranch: async (id, branchData) => {
    try {
      const response = await api.put(`/branches/${id}`, branchData);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || 'تم تحديث الفرع بنجاح'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل تحديث الفرع'
      };
    } catch (error) {
      console.error('🔥 خطأ في updateBranch:', error);
      return {
        success: false,
        message: 'تعذر تحديث الفرع: ' + error.message
      };
    }
  },

  /**
   * حذف فرع (تعطيل)
   */
  deleteBranch: async (id) => {
    try {
      const response = await api.delete(`/branches/${id}?permanent=false`);
      
      if (response && response.success) {
        return {
          success: true,
          message: response.message || 'تم تعطيل الفرع بنجاح'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل تعطيل الفرع'
      };
    } catch (error) {
      console.error('🔥 خطأ في deleteBranch:', error);
      return {
        success: false,
        message: 'تعذر تعطيل الفرع: ' + error.message
      };
    }
  },

  /**
   * حذف فرع نهائياً
   */
  deleteBranchPermanent: async (id) => {
    try {
      console.log('🗑️ [AUTH SERVICE] حذف فرع نهائياً:', id);
      const response = await api.delete(`/branches/${id}?permanent=true`);
      console.log('📥 استجابة حذف الفرع:', response);
      
      if (response && response.success) {
        return {
          success: true,
          message: response.message || 'تم حذف الفرع نهائياً بنجاح'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل حذف الفرع نهائياً'
      };
    } catch (error) {
      console.error('🔥 خطأ في حذف الفرع:', error);
      return {
        success: false,
        message: 'تعذر حذف الفرع: ' + error.message
      };
    }
  },

  /**
   * جلب ألعاب فرع معين
   */
  getBranchGames: async (branchId) => {
    try {
      return await authService.fetchGamesUnbreakable({ branch_id: branchId });
    } catch (error) {
      console.error('🔥 خطأ في getBranchGames:', error);
      return {
        success: false,
        data: [],
        message: 'تعذر جلب ألعاب الفرع'
      };
    }
  },

  // ==================== GAMES MANAGEMENT =================
  
  /**
   * جلب الألعاب
   */
  getGames: async (params = {}) => {
    try {
      return await authService.fetchGamesUnbreakable(params);
    } catch (error) {
      console.error('🔥 خطأ في getGames:', error);
      return {
        success: false,
        data: [],
        message: 'تعذر جلب الألعاب'
      };
    }
  },

  /**
   * إنشاء لعبة
   */
  createGame: async (gameData) => {
    try {
      return await authService.createGameUnbreakable(gameData);
    } catch (error) {
      console.error('🔥 خطأ في createGame:', error);
      return {
        success: false,
        message: 'تعذر إنشاء اللعبة: ' + error.message
      };
    }
  },

  /**
   * تحديث لعبة
   */
  updateGame: async (gameId, gameData) => {
    try {
      console.log(`🎮 تحديث لعبة ${gameId}:`, gameData);
      
      // استراتيجيات التحديث
      const strategies = [
        async () => await api.put(`/games/${gameId}`, gameData),
        async () => await api.put(`/games/update/${gameId}`, gameData),
        async () => await api.post(`/games/${gameId}/update`, gameData),
        async () => {
          const url = `${API_BASE_URL}/games/${gameId}`;
          const response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authService.getToken()}`
            },
            body: JSON.stringify(gameData)
          });
          return await response.json();
        }
      ];
      
      for (let i = 0; i < strategies.length; i++) {
        try {
          console.log(`🔄 محاولة تحديث ${i + 1}`);
          const response = await strategies[i]();
          if (response && response.success) {
            console.log(`✅ نجحت محاولة التحديث ${i + 1}`);
            return response;
          }
        } catch (e) {
          console.warn(`⚠️ فشلت استراتيجية التحديث ${i + 1}:`, e.message);
        }
      }
      
      return {
        success: false,
        message: 'فشل تحديث اللعبة بعد جميع المحاولات'
      };
      
    } catch (error) {
      console.error('🔥 خطأ في تحديث اللعبة:', error);
      return {
        success: false,
        message: 'تعذر تحديث اللعبة: ' + error.message
      };
    }
  },

  /**
   * حذف لعبة
   */
  deleteGame: async (id, permanent = false) => {
    try {
      const response = await api.delete(`/games/${id}?permanent=${permanent}`);
      
      if (response && response.success) {
        return {
          success: true,
          message: response.message || (permanent ? 'تم حذف اللعبة نهائياً' : 'تم تعطيل اللعبة')
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل حذف اللعبة'
      };
    } catch (error) {
      console.error('🔥 خطأ في deleteGame:', error);
      return {
        success: false,
        message: 'تعذر حذف اللعبة: ' + error.message
      };
    }
  },

  /**
   * جلب الألعاب المتاحة للفرع الحالي
   */
  getAvailableGamesForCurrentBranch: async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user?.branch_id) {
        return {
          success: false,
          message: 'المستخدم غير مرتبط بفرع',
          data: []
        };
      }
      
      const response = await authService.fetchGamesUnbreakable({ branch_id: user.branch_id });
      
      if (response.success) {
        const availableGames = response.data.filter(game => 
          game.status === 'available' || game.status === 'متاح'
        );
        
        return {
          success: true,
          data: availableGames,
          message: `تم تحميل ${availableGames.length} لعبة متاحة`
        };
      }
      
      return response;
    } catch (error) {
      console.error('🔥 خطأ في getAvailableGamesForCurrentBranch:', error);
      return {
        success: false,
        message: 'تعذر تحميل ألعاب الفرع',
        data: []
      };
    }
  },

  // ==================== SHIFTS MANAGEMENT =================
  
  /**
   * جلب الشيفت النشط
   */
  getActiveShift: async () => {
    try {
      const response = await api.get('/shifts/current');
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          exists: !!response.data
        };
      }
      
      return {
        success: true,
        data: null,
        exists: false
      };
    } catch (error) {
      console.error('🔥 خطأ في getActiveShift:', error);
      return {
        success: false,
        message: 'تعذر جلب الشيفت النشط',
        data: null,
        exists: false
      };
    }
  },

  /**
   * بدء شيفت جديد
   */
  startShift: async (openingCash = 0) => {
    try {
      console.log('🔄 بدء شيفت جديد...');
      
      const response = await api.post('/shifts/start', { opening_cash: openingCash });
      
      if (response && response.success) {
        if (response.data) {
          localStorage.setItem('current_shift', JSON.stringify(response.data));
        }
        
        return {
          success: true,
          data: response.data,
          message: response.message || 'تم بدء الشيفت بنجاح'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل بدء الشيفت'
      };
    } catch (error) {
      console.error('🔥 خطأ في startShift:', error);
      return {
        success: false,
        message: 'تعذر بدء الشيفت: ' + error.message
      };
    }
  },

  /**
   * إنهاء شيفت
   */
  endShift: async (shiftId, closingData = {}) => {
    try {
      console.log(`🏁 إنهاء الشيفت ${shiftId}...`);
      
      const response = await api.put(`/shifts/${shiftId}/end`, {
        closing_cash: closingData.closing_cash,
        notes: closingData.notes || 'تم إنهاء الشيفت'
      });
      
      if (response && response.success) {
        localStorage.removeItem('current_shift');
        return {
          success: true,
          data: response.data,
          stats: response.stats || {},
          message: response.message || 'تم إنهاء الشيفت بنجاح'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل إنهاء الشيفت'
      };
    } catch (error) {
      console.error('🔥 خطأ في endShift:', error);
      
      // محاولة بديلة
      try {
        const altResponse = await api.post(`/shifts/${shiftId}/end-quick`, {
          notes: closingData.notes || 'إنهاء سريع'
        });
        
        if (altResponse.success) {
          localStorage.removeItem('current_shift');
          return altResponse;
        }
      } catch (altError) {
        console.warn('⚠️ فشلت المحاولة البديلة:', altError.message);
      }
      
      return {
        success: false,
        message: 'تعذر إنهاء الشيفت: ' + error.message
      };
    }
  },

  /**
   * جلب تفاصيل شيفت
   */
  getShiftDetails: async (shiftId) => {
    try {
      const response = await api.get(`/shifts/${shiftId}/details`);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data || {},
          stats: response.stats || {}
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل جلب تفاصيل الشيفت',
        data: null
      };
    } catch (error) {
      console.error('🔥 خطأ في getShiftDetails:', error);
      return {
        success: false,
        message: 'تعذر جلب تفاصيل الشيفت',
        data: null
      };
    }
  },

  /**
   * جلب إحصائيات شيفت
   */
  getShiftStats: async (shiftId) => {
    try {
      const response = await api.get(`/shifts/${shiftId}/stats`);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data || {}
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل جلب إحصائيات الشيفت',
        data: null
      };
    } catch (error) {
      console.error('🔥 خطأ في getShiftStats:', error);
      return {
        success: false,
        message: 'تعذر جلب إحصائيات الشيفت',
        data: null
      };
    }
  },

  /**
   * جلب شيفتات فرع معين
   */
  getBranchShifts: async (branchId, params = {}) => {
    try {
      console.log(`📋 جلب شيفتات الفرع ${branchId}`);
      const response = await api.get('/shifts', { ...params, branch_id: branchId });
      
      return {
        success: true,
        data: response.data || [],
        count: response.count || 0
      };
    } catch (error) {
      console.error('❌ خطأ في جلب شيفتات الفرع:', error);
      return {
        success: false,
        message: 'تعذر جلب شيفتات الفرع',
        data: []
      };
    }
  },

  /**
   * جلب جميع الشيفتات النشطة
   */
  getAllActiveShifts: async () => {
    try {
      const response = await api.get('/shifts/active-all-branches');
      
      return {
        success: true,
        data: response.data || [],
        count: response.count || 0
      };
    } catch (error) {
      console.error('🔥 خطأ في getAllActiveShifts:', error);
      return {
        success: false,
        message: 'تعذر جلب الشيفتات النشطة',
        data: []
      };
    }
  },

  // ==================== RENTALS MANAGEMENT =================
  
  /**
   * جلب التأجيرات
   */
  getRentals: async (params = {}) => {
    try {
      const response = await api.get('/rentals', { params });
      
      return {
        success: true,
        data: response.data || [],
        count: response.count || 0
      };
    } catch (error) {
      console.error('🔥 خطأ في getRentals:', error);
      return {
        success: false,
        data: [],
        message: 'تعذر جلب التأجيرات'
      };
    }
  },

  /**
   * إنشاء تأجير جديد
   */
  createRental: async (rentalData) => {
    try {
      console.log('📦 إنشاء تأجير جديد:', rentalData);
      
      const response = await api.post('/rentals', rentalData);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || 'تم إنشاء التأجير بنجاح'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل إنشاء التأجير'
      };
    } catch (error) {
      console.error('🔥 خطأ في createRental:', error);
      return {
        success: false,
        message: 'تعذر إنشاء التأجير: ' + error.message
      };
    }
  },

  /**
   * إنهاء تأجير
   */
  completeRental: async (rentalId, paymentData = {}) => {
    try {
      const response = await api.post(`/rentals/${rentalId}/complete`, paymentData);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || 'تم إنهاء التأجير بنجاح'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل إنهاء التأجير'
      };
    } catch (error) {
      console.error('🔥 خطأ في completeRental:', error);
      return {
        success: false,
        message: 'تعذر إنهاء التأجير: ' + error.message
      };
    }
  },

  /**
   * إلغاء تأجير
   */
  cancelRental: async (rentalId, reason = '') => {
    try {
      const response = await api.post(`/rentals/${rentalId}/cancel`, { reason });
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || 'تم إلغاء التأجير بنجاح'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل إلغاء التأجير'
      };
    } catch (error) {
      console.error('🔥 خطأ في cancelRental:', error);
      return {
        success: false,
        message: 'تعذر إلغاء التأجير: ' + error.message
      };
    }
  },

  /**
   * جلب التأجيرات النشطة
   */
  getActiveRentals: async (shiftId = null) => {
    try {
      const params = shiftId ? { shift_id: shiftId } : {};
      const response = await api.get('/rentals/active', { params });
      
      return {
        success: true,
        data: response.data || [],
        count: response.count || 0
      };
    } catch (error) {
      console.error('🔥 خطأ في getActiveRentals:', error);
      return {
        success: false,
        data: [],
        message: 'تعذر جلب التأجيرات النشطة'
      };
    }
  },

  /**
   * جلب التأجيرات المكتملة
   */
  getCompletedRentals: async (params = {}) => {
    try {
      const response = await api.get('/rentals/completed', { params });
      
      return {
        success: true,
        data: response.data || [],
        count: response.count || 0
      };
    } catch (error) {
      console.error('🔥 خطأ في getCompletedRentals:', error);
      return {
        success: false,
        data: [],
        message: 'تعذر جلب التأجيرات المكتملة'
      };
    }
  },

  /**
   * جلب تأجير محدد
   */
  getRentalById: async (rentalId) => {
    try {
      const response = await api.get(`/rentals/${rentalId}`);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل جلب التأجير'
      };
    } catch (error) {
      console.error(`🔥 خطأ في جلب تأجير ${rentalId}:`, error);
      return {
        success: false,
        message: 'تعذر جلب التأجير',
        data: null
      };
    }
  },

  // ==================== CUSTOMERS MANAGEMENT =================
  
  /**
   * جلب العملاء
   */
  getCustomers: async (search = '') => {
    try {
      const response = await api.get('/customers', { params: { search } });
      
      return {
        success: true,
        data: response.data || [],
        count: response.count || 0
      };
    } catch (error) {
      console.error('🔥 خطأ في getCustomers:', error);
      return {
        success: false,
        data: [],
        message: 'تعذر جلب العملاء'
      };
    }
  },

  /**
   * إنشاء عميل جديد
   */
  createCustomer: async (customerData) => {
    try {
      const response = await api.post('/customers', customerData);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || 'تم إنشاء العميل بنجاح'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل إنشاء العميل'
      };
    } catch (error) {
      console.error('🔥 خطأ في createCustomer:', error);
      return {
        success: false,
        message: 'تعذر إنشاء العميل: ' + error.message
      };
    }
  },

  // ==================== USERS MANAGEMENT =================
  
  /**
   * جلب المستخدمين
   */
  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/users', { params });
      
      return {
        success: true,
        data: response.data || [],
        count: response.count || 0
      };
    } catch (error) {
      console.error('🔥 خطأ في getUsers:', error);
      return {
        success: false,
        data: [],
        message: 'تعذر جلب المستخدمين'
      };
    }
  },

  /**
   * جلب مستخدم محدد
   */
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل جلب المستخدم'
      };
    } catch (error) {
      console.error(`🔥 خطأ في جلب مستخدم ${id}:`, error);
      return {
        success: false,
        message: 'تعذر جلب المستخدم',
        data: null
      };
    }
  },

  /**
   * إنشاء مستخدم جديد
   */
  createUser: async (userData) => {
    try {
      console.log('👤 إنشاء مستخدم جديد:', userData);
      
      const response = await api.post('/users', userData);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || 'تم إنشاء المستخدم بنجاح'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل إنشاء المستخدم'
      };
    } catch (error) {
      console.error('🔥 خطأ في createUser:', error);
      return {
        success: false,
        message: 'تعذر إنشاء المستخدم: ' + error.message
      };
    }
  },

  /**
   * تحديث مستخدم
   */
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message || 'تم تحديث المستخدم بنجاح'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل تحديث المستخدم'
      };
    } catch (error) {
      console.error('🔥 خطأ في updateUser:', error);
      return {
        success: false,
        message: 'تعذر تحديث المستخدم: ' + error.message
      };
    }
  },

  /**
   * حذف مستخدم (تعطيل)
   */
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}?permanent=false`);
      
      if (response && response.success) {
        return {
          success: true,
          message: response.message || 'تم تعطيل المستخدم بنجاح'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل تعطيل المستخدم'
      };
    } catch (error) {
      console.error('🔥 خطأ في deleteUser:', error);
      return {
        success: false,
        message: 'تعذر تعطيل المستخدم: ' + error.message
      };
    }
  },

  /**
   * حذف مستخدم نهائياً
   */
  deleteUserPermanent: async (id) => {
    try {
      const response = await api.delete(`/users/${id}?permanent=true`);
      
      if (response && response.success) {
        return {
          success: true,
          message: response.message || 'تم حذف المستخدم نهائياً'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل حذف المستخدم نهائياً'
      };
    } catch (error) {
      console.error('🔥 خطأ في deleteUserPermanent:', error);
      return {
        success: false,
        message: 'تعذر حذف المستخدم نهائياً: ' + error.message
      };
    }
  },

  /**
   * تغيير كلمة المرور
   */
  changePassword: async (id, passwordData) => {
    try {
      const response = await api.put(`/users/${id}/change-password`, passwordData);
      
      if (response && response.success) {
        return {
          success: true,
          message: response.message || 'تم تغيير كلمة المرور بنجاح'
        };
      }
      
      return {
        success: false,
        message: response?.message || 'فشل تغيير كلمة المرور'
      };
    } catch (error) {
      console.error('🔥 خطأ في changePassword:', error);
      return {
        success: false,
        message: 'تعذر تغيير كلمة المرور: ' + error.message
      };
    }
  },

  // ==================== STATISTICS =================
  
  /**
   * جلب إحصائيات مبسطة
   */
  getSimpleStats: async () => {
    try {
      const response = await api.get('/dashboard/stats/simple');
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data || {
            totalGames: 0,
            availableGames: 0,
            activeRentals: 0,
            todayRentals: 0,
            todayRevenue: 0
          }
        };
      }
      
      return {
        success: false,
        data: {
          totalGames: 0,
          availableGames: 0,
          activeRentals: 0,
          todayRentals: 0,
          todayRevenue: 0
        }
      };
    } catch (error) {
      console.error('🔥 خطأ في getSimpleStats:', error);
      return {
        success: false,
        data: {
          totalGames: 0,
          availableGames: 0,
          activeRentals: 0,
          todayRentals: 0,
          todayRevenue: 0
        }
      };
    }
  },

  /**
   * جلب إحصائيات لوحة التحكم
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data || {}
        };
      }
      
      return {
        success: false,
        message: 'تعذر تحميل الإحصائيات',
        data: {
          summary: {},
          today_revenue: 0,
          today_rentals: 0,
          active_rentals: 0,
          total_games: 0,
          available_games: 0
        }
      };
    } catch (error) {
      console.error('🔥 خطأ في getDashboardStats:', error);
      return {
        success: false,
        message: 'تعذر تحميل الإحصائيات',
        data: {
          summary: {},
          today_revenue: 0,
          today_rentals: 0,
          active_rentals: 0,
          total_games: 0,
          available_games: 0
        }
      };
    }
  },

  /**
   * جلب جميع الإحصائيات
   */
  getDashboardAllStats: async () => {
    try {
      const response = await api.get('/dashboard/all-stats');
      
      if (response && response.success) {
        return {
          success: true,
          data: response.data || {}
        };
      }
      
      return {
        success: false,
        data: {}
      };
    } catch (error) {
      console.error('🔥 خطأ في getDashboardAllStats:', error);
      return {
        success: false,
        data: {}
      };
    }
  },

  // ==================== HEALTH CHECK =================
  
  /**
   * التحقق من صحة الخادم
   */
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      
      return {
        success: true,
        data: response,
        message: '✅ الخادم يعمل بشكل صحيح'
      };
    } catch (error) {
      console.error('🔥 خطأ في healthCheck:', error);
      return {
        success: false,
        message: '❌ الخادم غير متصل'
      };
    }
  },

  /**
   * اختبار اتصال API
   */
  testApiConnection: async () => {
    try {
      const response = await api.get('/test');
      
      return {
        success: true,
        message: '✅ اتصال API يعمل بشكل صحيح',
        data: response
      };
    } catch (error) {
      console.error('🔥 خطأ في testApiConnection:', error);
      return {
        success: false,
        message: '❌ فشل اختبار الاتصال: ' + (error.message || 'تعذر الاتصال بالخادم')
      };
    }
  },

  // ==================== CURRENT BRANCH OPERATIONS =================
  
  /**
   * جلب بيانات فرع المستخدم الحالي
   */
  getCurrentUserBranch: async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user?.branch_id) {
        return {
          success: false,
          message: 'المستخدم غير مرتبط بفرع',
          data: null
        };
      }
      
      return await authService.getBranchById(user.branch_id);
    } catch (error) {
      console.error('🔥 خطأ في getCurrentUserBranch:', error);
      return {
        success: false,
        message: 'تعذر تحميل بيانات الفرع',
        data: null
      };
    }
  },

  // ==================== UTILITY FUNCTIONS =================
  
  /**
   * تنسيق رسالة الخطأ
   */
  formatError: (error) => {
    if (error.response) {
      return error.response.data?.message || `خطأ ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      return 'تعذر الاتصال بالخادم. تأكد من تشغيل الخادم';
    } else {
      return error.message || 'حدث خطأ غير معروف';
    }
  },

  /**
   * التحقق من دور المستخدم
   */
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  },

  /**
   * التحقق من وجود أي من الأدوار
   */
  hasAnyRole: (roles) => {
    const user = authService.getCurrentUser();
    return roles.includes(user?.role);
  },

  /**
   * الحصول على الدور الموحد
   */
  getNormalizedRole: () => {
    const user = authService.getCurrentUser();
    if (!user) return null;
    
    const roleMap = {
      'مدير': 'admin',
      'مشرف': 'manager',
      'موظف': 'employee',
      'admin': 'admin',
      'manager': 'manager',
      'employee': 'employee',
      'branch_manager': 'manager'
    };
    
    return roleMap[user.role] || user.role;
  },

  /**
   * التحقق من صلاحية المستخدم
   */
  checkPermission: (allowedRoles) => {
    const user = authService.getCurrentUser();
    if (!user) return false;
    
    // المدير له جميع الصلاحيات
    if (user.role === 'admin' || user.role === 'مدير') {
      return true;
    }
    
    // تحويل الأدوار العربية إلى إنجليزية
    const roleMap = {
      'مدير': 'admin',
      'مشرف': 'manager',
      'موظف': 'employee'
    };
    
    const normalizedUserRole = roleMap[user.role] || user.role;
    
    if (Array.isArray(allowedRoles)) {
      const normalizedAllowedRoles = allowedRoles.map(role => roleMap[role] || role);
      return normalizedAllowedRoles.includes(normalizedUserRole);
    }
    
    const normalizedRequiredRole = roleMap[allowedRoles] || allowedRoles;
    return normalizedUserRole === normalizedRequiredRole;
  },

  /**
   * التحقق من صحة رقم الهاتف
   */
  validateCustomerPhone: (phone) => {
    const phoneRegex = /^01[0-9]{9}$/;
    return phoneRegex.test(phone);
  },

  /**
   * تنسيق العملة
   */
  formatCurrency: (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(num);
  },

  /**
   * تنسيق المدة
   */
  formatDuration: (minutes) => {
    if (!minutes || minutes === 0) return 'وقت مفتوح';
    if (minutes < 60) return `${minutes} دقيقة`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} ساعة${remainingMinutes > 0 ? ` و ${remainingMinutes} دقيقة` : ''}`;
  },

  /**
   * تنسيق الوقت
   */
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

  /**
   * تنسيق التاريخ
   */
  formatDate: (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '--/--/----';
    }
  },

  /**
   * تنسيق التاريخ والوقت
   */
  formatDateTime: (dateString) => {
    try {
      const date = new Date(dateString);
      return `${authService.formatDate(dateString)} ${authService.formatTime(dateString)}`;
    } catch {
      return '--/--/---- --:--';
    }
  },

  /**
   * عرض إشعار
   */
  showNotification: (type, message) => {
    const messages = {
      error: `❌ ${message}`,
      success: `✅ ${message}`,
      warning: `⚠️ ${message}`,
      info: `ℹ️ ${message}`
    };
    alert(messages[type] || message);
  },

  /**
   * التحقق من المسارات المتاحة
   */
  checkEndpoints: async () => {
    return await checkAvailableEndpoints();
  },

  /**
   * الحصول على معلومات البيئة
   */
  getEnvironmentInfo: () => {
    return {
      apiUrl: API_URL,
      apiBaseUrl: API_BASE_URL,
      environment: process.env.NODE_ENV,
      isAuthenticated: authService.isAuthenticated(),
      user: authService.getCurrentUser(),
      token: authService.getToken() ? 'موجود' : 'غير موجود'
    };
  }
};

export default authService;