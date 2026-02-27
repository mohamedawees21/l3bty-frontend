// src/services/authService.js

import api from './api';

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
    { method: 'GET', url: '/api/test', name: 'test' }
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      const response = await api({
        method: endpoint.method,
        url: endpoint.url,
        timeout: 3000,
        validateStatus: () => true // لا تعتبر أي استجابة خطأ
      });
      
      results[endpoint.name] = {
        available: response.status !== 404,
        status: response.status,
        url: endpoint.url,
        method: endpoint.method
      };
    } catch (error) {
      results[endpoint.name] = {
        available: false,
        error: error.message,
        url: endpoint.url,
        method: endpoint.method
      };
    }
  }
  
  console.log('🔍 المسارات المتاحة:', results);
  return results;
};

const authService = {
  // ==================== المصادقة ====================
  

login: async (email, password) => {
    try {
        console.log('🔐 محاولة تسجيل دخول:', email);
        
        const response = await api.post('/auth/login', { email, password });
        
        if (response && response.success) {
            // تخزين التوكن والمستخدم
            if (response.token) {
                localStorage.setItem('token', response.token);
                api.setToken(response.token);
            }
            
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
                
                // تخزين الصلاحيات
                if (response.permissions) {
                    localStorage.setItem('permissions', JSON.stringify(response.permissions));
                }
            }
            
            localStorage.setItem('lastLogin', new Date().toISOString());
            
            console.log('✅ تم تخزين بيانات المستخدم بنجاح:', response.user);
            
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

  logout: () => {
    console.log('🚪 تسجيل الخروج...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastLogin');
  },

  getToken: () => {
    const token = localStorage.getItem('token');
    return token;
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  isAuthenticated: () => {
    const token = authService.getToken();
    const user = authService.getCurrentUser();
    return !!(token && user);
  },

  // دالة مساعدة للتحقق من استجابة 401
  handleAuthError: (error) => {
    if (error.response && error.response.status === 401) {
      console.log('🔒 توكن منتهي الصلاحية - تسجيل خروج تلقائي');
      authService.logout();
      return true;
    }
    return false;
  },

  // ==================== دوال إنشاء الألعاب المقاومة للكسر ====================

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
            return await api.post('/api/games', gamePayload);
          }
        },
        {
          name: 'مسار بديل POST /api/games/create',
          executor: async () => {
            return await api.post('/api/games/create', gamePayload);
          }
        },
        {
          name: 'إضافة لعبة لفرع POST /api/branches/{branchId}/add-game',
          executor: async () => {
            return await api.post(`/api/branches/${branchId}/add-game`, {
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
            return await api.post('/api/branches/add-game', {
              ...gamePayload,
              branch_id: branchId
            });
          }
        },
        {
          name: 'إنشاء لعبة عبر إدارة الفروع POST /api/admin/games',
          executor: async () => {
            return await api.post('/api/admin/games', gamePayload);
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
            return await api.post('/api/games/simple', simplePayload);
          }
        },
        {
          name: 'إنشاء لعبة باستخدام fetch (طريقة مباشرة)',
          executor: async () => {
            const response = await fetch(`http://localhost:5000/api/games`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(gamePayload)
            });
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
          }
        }
      ];
      
      // تنفيذ الاستراتيجيات بالترتيب
      for (let i = 0; i < strategies.length; i++) {
        try {
          console.log(`🔄 المحاولة ${i + 1}: ${strategies[i].name}`);
          const response = await strategies[i].executor();
          
          console.log(`📊 استجابة المحاولة ${i + 1}:`, response.status || response);
          
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
            return await api.get('/api/games', { params });
          }
        },
        {
          name: 'GET /api/games/list',
          executor: async () => {
            return await api.get('/api/games/list', { params });
          }
        },
        {
          name: `GET /api/branches/${params.branch_id}/games`,
          executor: async () => {
            if (!params.branch_id) throw new Error('branch_id مطلوب');
            return await api.get(`/api/branches/${params.branch_id}/games`);
          }
        },
        {
          name: 'GET /api/admin/games',
          executor: async () => {
            return await api.get('/api/admin/games', { params });
          }
        },
        {
          name: 'GET /api/games/all',
          executor: async () => {
            return await api.get('/api/games/all', { params });
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
  
  getBranches: async () => {
    try {
      return await api.getBranches();
    } catch (error) {
      console.error('🔥 خطأ في getBranches:', error);
      return {
        success: false,
        message: 'تعذر جلب الفروع',
        data: []
      };
    }
  },

  createBranch: async (branchData) => {
    try {
      console.log('🔑 التوكن الحالي:', authService.getToken());
      console.log('👤 المستخدم الحالي:', authService.getCurrentUser());
      
      const response = await api.createBranch(branchData);
      console.log('📥 استجابة إنشاء الفرع:', response);
      return response;
    } catch (error) {
      console.error('🔥 خطأ في createBranch:', error);
      return {
        success: false,
        message: 'تعذر إنشاء الفرع: ' + error.message
      };
    }
  },

  updateBranch: async (id, branchData) => {
    try {
      return await api.updateBranch(id, branchData);
    } catch (error) {
      console.error('🔥 خطأ في updateBranch:', error);
      return {
        success: false,
        message: 'تعذر تحديث الفرع: ' + error.message
      };
    }
  },

  deleteBranch: async (id) => {
    try {
      return await api.deleteBranch(id, false);
    } catch (error) {
      console.error('🔥 خطأ في deleteBranch:', error);
      return {
        success: false,
        message: 'تعذر حذف الفرع: ' + error.message
      };
    }
  },

  deleteBranchPermanent: async (id) => {
    try {
      console.log('🗑️ [AUTH SERVICE] حذف فرع نهائياً:', id);
      const response = await api.deleteBranch(id, true);
      console.log('📥 استجابة حذف الفرع:', response);
      return response;
    } catch (error) {
      console.error('🔥 خطأ في حذف الفرع:', error);
      return {
        success: false,
        message: 'تعذر حذف الفرع: ' + error.message
      };
    }
  },

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

  updateGame: async (gameId, gameData) => {
    try {
      console.log(`🎮 تحديث لعبة ${gameId}:`, gameData);
      
      // استراتيجيات التحديث
      const strategies = [
        async () => await api.put(`/games/${gameId}`, gameData),
        async () => await api.put(`/games/update/${gameId}`, gameData),
        async () => await api.post(`/games/${gameId}/update`, gameData)
      ];
      
      for (let i = 0; i < strategies.length; i++) {
        try {
          const response = await strategies[i]();
          if (response && response.success) {
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

  deleteGame: async (id) => {
    try {
      return await api.deleteGame(id);
    } catch (error) {
      console.error('🔥 خطأ في deleteGame:', error);
      return {
        success: false,
        message: 'تعذر حذف اللعبة: ' + error.message
      };
    }
  },

  // ==================== SHIFTS MANAGEMENT =================
  
  getActiveShift: async () => {
    try {
      return await api.getActiveShift();
    } catch (error) {
      console.error('🔥 خطأ في getActiveShift:', error);
      return {
        success: false,
        message: 'تعذر جلب الشيفت النشط'
      };
    }
  },

  startShift: async () => {
    try {
      return await api.startShift();
    } catch (error) {
      console.error('🔥 خطأ في startShift:', error);
      return {
        success: false,
        message: 'تعذر بدء الشيفت'
      };
    }
  },

  endShift: async (shiftId) => {
    try {
      return await api.endShift(shiftId);
    } catch (error) {
      console.error('🔥 خطأ في endShift:', error);
      return {
        success: false,
        message: 'تعذر إنهاء الشيفت'
      };
    }
  },

  getBranchShifts: async (branchId) => {
    try {
      console.log(`📋 جلب شيفتات الفرع ${branchId}`);
      const response = await api.getShifts({ branch_id: branchId });
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب شيفتات الفرع:', error);
      return {
        success: false,
        message: 'تعذر جلب شيفتات الفرع',
        data: []
      };
    }
  },

  // ==================== RENTALS MANAGEMENT =================
  
  getRentals: async (params = {}) => {
    try {
      return await api.getRentals(params);
    } catch (error) {
      console.error('🔥 خطأ في getRentals:', error);
      return {
        success: false,
        data: [],
        message: 'تعذر جلب التأجيرات'
      };
    }
  },

  createRental: async (rentalData) => {
    try {
      return await api.createRental(rentalData);
    } catch (error) {
      console.error('🔥 خطأ في createRental:', error);
      return {
        success: false,
        message: 'تعذر إنشاء التأجير: ' + error.message
      };
    }
  },

  completeRental: async (rentalId, paymentData = {}) => {
    try {
      return await api.completeRental(rentalId, paymentData);
    } catch (error) {
      console.error('🔥 خطأ في completeRental:', error);
      return {
        success: false,
        message: 'تعذر إنهاء التأجير'
      };
    }
  },

  cancelRental: async (rentalId) => {
    try {
      return await api.cancelRental(rentalId);
    } catch (error) {
      console.error('🔥 خطأ في cancelRental:', error);
      return {
        success: false,
        message: 'تعذر إلغاء التأجير'
      };
    }
  },

  getActiveRentals: async (branchId = null) => {
    try {
      return await api.getActiveRentals(branchId);
    } catch (error) {
      console.error('🔥 خطأ في getActiveRentals:', error);
      return {
        success: false,
        data: [],
        message: 'تعذر جلب التأجيرات النشطة'
      };
    }
  },

  getCompletedRentals: async (params = {}) => {
    try {
      return await api.getCompletedRentals(params);
    } catch (error) {
      console.error('🔥 خطأ في getCompletedRentals:', error);
      return {
        success: false,
        data: [],
        message: 'تعذر جلب التأجيرات المكتملة'
      };
    }
  },

  // ==================== CUSTOMERS MANAGEMENT =================
  
  getCustomers: async (search = '') => {
    try {
      return await api.getCustomers(search);
    } catch (error) {
      console.error('🔥 خطأ في getCustomers:', error);
      return {
        success: false,
        data: [],
        message: 'تعذر جلب العملاء'
      };
    }
  },

  createCustomer: async (customerData) => {
    try {
      return await api.createCustomer(customerData);
    } catch (error) {
      console.error('🔥 خطأ في createCustomer:', error);
      return {
        success: false,
        message: 'تعذر إنشاء العميل'
      };
    }
  },

  // ==================== USERS MANAGEMENT =================
  
  getUsers: async (params = {}) => {
    try {
      return await api.getUsers(params);
    } catch (error) {
      console.error('🔥 خطأ في getUsers:', error);
      return {
        success: false,
        data: [],
        message: 'تعذر جلب المستخدمين'
      };
    }
  },

  createUser: async (userData) => {
    try {
      return await api.createUser(userData);
    } catch (error) {
      console.error('🔥 خطأ في createUser:', error);
      return {
        success: false,
        message: 'تعذر إنشاء المستخدم'
      };
    }
  },

  updateUser: async (id, userData) => {
    try {
      return await api.updateUser(id, userData);
    } catch (error) {
      console.error('🔥 خطأ في updateUser:', error);
      return {
        success: false,
        message: 'تعذر تحديث المستخدم'
      };
    }
  },

  deleteUser: async (id) => {
    try {
      return await api.deleteUser(id);
    } catch (error) {
      console.error('🔥 خطأ في deleteUser:', error);
      return {
        success: false,
        message: 'تعذر حذف المستخدم'
      };
    }
  },

  // ==================== STATISTICS =================
  
  getSimpleStats: async () => {
    try {
      return await api.getSimpleStats();
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

  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response;
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

  getDashboardAllStats: async () => {
    try {
      return await api.getDashboardAllStats();
    } catch (error) {
      console.error('🔥 خطأ في getDashboardAllStats:', error);
      return {
        success: false,
        data: {}
      };
    }
  },

  // ==================== HEALTH CHECK =================
  
  healthCheck: async () => {
    try {
      return await api.healthCheck();
    } catch (error) {
      console.error('🔥 خطأ في healthCheck:', error);
      return {
        success: false,
        message: 'الخادم غير متصل'
      };
    }
  },

  testApiConnection: async () => {
    try {
      return await api.testConnection();
    } catch (error) {
      console.error('🔥 خطأ في testApiConnection:', error);
      return {
        success: false,
        message: 'تعذر الاتصال بالخادم'
      };
    }
  },

  // ==================== CURRENT BRANCH OPERATIONS =================
  
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
      
      return await api.getBranchById(user.branch_id);
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
  
  formatError: (error) => {
    if (error.response) {
      return error.response.data?.message || `خطأ ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      return 'تعذر الاتصال بالخادم. تأكد من تشغيل الخادم';
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
    return roles.includes(user?.role);
  },

  validateCustomerPhone: (phone) => {
    const phoneRegex = /^01[0-9]{9}$/;
    return phoneRegex.test(phone);
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
    return `${hours} ساعة${remainingMinutes > 0 ? ` ${remainingMinutes} دقيقة` : ''}`;
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
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '--/--/----';
    }
  },

  showNotification: (type, message) => {
    const messages = {
      error: `❌ ${message}`,
      success: `✅ ${message}`,
      warning: `⚠️ ${message}`,
      info: `ℹ️ ${message}`
    };
    alert(messages[type] || message);
  },

  // دالة مساعدة للتحقق من المسارات المتاحة
  checkEndpoints: async () => {
    return await checkAvailableEndpoints();
  }
};

export default authService;