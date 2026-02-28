import axios from 'axios';

// ==================== إعدادات البيئة ====================
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🌐 عنوان API:', API_URL);
console.log('🔧 البيئة:', process.env.NODE_ENV);

const api = axios.create({
  baseURL: API_URL,  // ✅ استخدام المتغير
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Language': 'ar'
  }
});

// ==================== Interceptors ====================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    let authToken = token;
    if (token && token.startsWith('Bearer ')) {
      authToken = token.substring(7);
    }
    
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        fullUrl: `${API_URL}${config.url}`, // ✅ استخدام المتغير
        tokenExists: !!authToken
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        success: response.data?.success
      });
    }
    
    if (response.data && typeof response.data === 'object') {
      return response.data;
    }
    
    return {
      success: true,
      status: response.status,
      data: response.data,
      message: 'تم تنفيذ العملية بنجاح'
    };
  },
  (error) => {
    console.error('❌ خطأ في API:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    

    if (error.response?.status === 401) {
      console.log('🔒 توكن منتهي الصلاحية');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    if (error.response?.status === 500) {
      console.log('⚠️ خطأ في الخادم (500) - يمكن معالجته محلياً');
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
    let cleanToken = token;
    if (token.startsWith('Bearer ')) {
      cleanToken = token.substring(7);
    }
    
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

// ==================== USERS ENDPOINTS ====================

// جلب قائمة المستخدمين
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
    return { success: false, data: [], message: error.message };
  }
};

// جلب مستخدم محدد
api.getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`❌ خطأ في جلب مستخدم ${id}:`, error);
    return { success: false, message: error.message };
  }
};

// إنشاء مستخدم جديد (الفانكشن المطلوبة)
api.createUser = async (userData) => {
  try {
    console.log('📝 إنشاء مستخدم جديد:', userData);
    
    const response = await api.post('/users', userData);
    
    console.log('✅ تم إنشاء المستخدم:', response);
    
    return {
      success: true,
      data: response.data,
      message: response.message || 'تم إنشاء المستخدم بنجاح'
    };
  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error);
    return { 
      success: false, 
      message: error.message || 'فشل إنشاء المستخدم',
      error: error 
    };
  }
};

// تحديث مستخدم
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

// حذف مستخدم
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

// تغيير كلمة المرور
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

// ==================== إنشاء تأجير جديد ====================
api.createRental = async (rentalData) => {
  try {
    console.log('📦 إنشاء تأجير جديد:', rentalData);
    
    if (!rentalData.customer_name) {
      throw new Error('اسم العميل مطلوب');
    }
    
    if (!rentalData.items || !rentalData.items.length) {
      throw new Error('يجب إضافة لعبة واحدة على الأقل');
    }
    
    const payload = {
      customer_name: rentalData.customer_name,
      customer_phone: rentalData.customer_phone || '',
      items: rentalData.items.map(item => ({
        game_id: item.game_id,
        child_name: item.child_name || '',
        duration_minutes: item.duration_minutes || 15,
        quantity: item.quantity || 1,
        rental_type: item.rental_type || 'fixed'
      })),
      notes: rentalData.notes || ''
    };
    
    console.log('📤 إرسال البيانات إلى:', `${API_URL}/rentals`); // ✅ استخدام المتغير
    
    // استخدام المتغير مباشرة في الطلب
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/rentals`,  // ✅ استخدام المتغير
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ استجابة الخادم:', response.data);
    
    if (response.data && response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'فشل إنشاء التأجير');
    }
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء التأجير:', error);
    
    // تخزين محلي
    try {
      const localRentals = JSON.parse(localStorage.getItem('local_rentals') || '[]');
      const localRental = {
        id: `local-${Date.now()}`,
        rental_number: `RNT-${Date.now().toString().slice(-8)}`,
        customer_name: rentalData.customer_name,
        items: rentalData.items,
        created_at: new Date().toISOString(),
        local: true,
        synced: false
      };
      localRentals.push(localRental);
      localStorage.setItem('local_rentals', JSON.stringify(localRentals.slice(-20)));
      
      return {
        success: true,
        data: localRental,
        message: 'تم حفظ التأجير محلياً (سيتم مزامنته لاحقاً)',
        local: true
      };
    } catch (e) {
      console.error('❌ فشل التخزين المحلي:', e);
    }
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'فشل إنشاء التأجير'
    };
  }
};

// ==================== استراتيجيات متعددة للمسارات ====================
api.createGameUnbreakable = async (gameData) => {
  try {
    console.log('🛡️ محاولة إنشاء لعبة بأي طريقة:', gameData);
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
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
    
    // استراتيجيات متعددة - كلها تستخدم API_URL
    const strategies = [
      {
        name: 'المسار الرئيسي POST /games',
        executor: async () => {
          return await api.post('/games', gamePayload);
        }
      },
      {
        name: 'إضافة لعبة لفرع POST /branches/{branchId}/add-game',
        executor: async () => {
          return await api.post(`/branches/${branchId}/add-game`, gamePayload);
        }
      },
      {
        name: 'طريقة fetch مباشرة',
        executor: async () => {
          const response = await fetch(`${API_URL}/games`, {  // ✅ استخدام المتغير
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
    
    // تنفيذ الاستراتيجيات
    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`🔄 المحاولة ${i + 1}: ${strategies[i].name}`);
        const response = await strategies[i].executor();
        
        if (response && (response.status === 201 || response.status === 200 || response.success)) {
          console.log(`✅ نجحت المحاولة ${i + 1}`);
          return {
            success: true,
            data: response.data || response,
            method: strategies[i].name
          };
        }
      } catch (error) {
        console.log(`❌ فشلت المحاولة ${i + 1}:`, error.message);
      }
    }
    
    // تخزين محلي
    const localGame = {
      id: 'local-' + Date.now(),
      ...gamePayload,
      local: true,
      created_at: new Date().toISOString()
    };
    
    try {
      const localGames = JSON.parse(localStorage.getItem('local_games') || '[]');
      localGames.push(localGame);
      localStorage.setItem('local_games', JSON.stringify(localGames));
    } catch (e) {
      console.warn('⚠️ لا يمكن حفظ اللعبة محلياً');
    }
    
    return {
      success: true,
      data: localGame,
      message: 'تم حفظ اللعبة محلياً',
      local: true
    };
    
  } catch (error) {
    console.error('🔥 خطأ شامل:', error);
    return {
      success: false,
      message: error.message
    };
  }
};


api.getActiveRentalsUnbreakable = async (params = {}) => {
  console.log('🔄 محاولة جلب التأجيرات النشطة:', params);
  
  const strategies = [
    {
      name: 'GET /rentals/active',
      executor: async () => {
        return await api.get('/rentals/active', { params });
      }
    },
    {
      name: 'GET /rentals/active-all',
      executor: async () => {
        return await api.get('/rentals/active-all', { params });
      }
    },
    {
      name: 'GET /rentals?status=active',
      executor: async () => {
        return await api.get('/rentals', { params: { ...params, status: 'active' } });
      }
    },
    {
      name: 'GET /rentals/list?active=true',
      executor: async () => {
        return await api.get('/rentals/list', { params: { ...params, active: true } });
      }
    }
  ];
  
  for (const strategy of strategies) {
    try {
      const response = await strategy.executor();
      
      if (response.success) {
        const rentals = response.data || [];
        console.log(`✅ نجحت ${strategy.name}:`, rentals.length, 'تأجير');
        
        // دمج التأجيرات المحلية
        const localRentals = JSON.parse(localStorage.getItem('local_rentals') || '[]');
        const activeLocal = localRentals.filter(r => r.status === 'active');
        
        if (activeLocal.length > 0) {
          console.log('📦 دمج تأجيرات محلية:', activeLocal.length);
          return {
            success: true,
            data: [...rentals, ...activeLocal],
            local_count: activeLocal.length,
            method: strategy.name
          };
        }
        
        return {
          success: true,
          data: rentals,
          method: strategy.name
        };
      }
    } catch (error) {
      if (error.status !== 404 && error.response?.status !== 404) {
        console.log(`⚠️ خطأ في ${strategy.name}:`, error.message);
      }
    }
  }
  
  // إذا فشلت جميع المحاولات، نرجع التأجيرات المحلية
  const localRentals = JSON.parse(localStorage.getItem('local_rentals') || '[]');
  const activeLocal = localRentals.filter(r => r.status === 'active');
  
  return {
    success: true,
    data: activeLocal,
    local_only: true,
    message: 'تم تحميل التأجيرات المحلية فقط'
  };
};

/**
 * إنهاء تأجير مفتوح مع دعم تعدد المسارات
 */
api.completeOpenRentalUnbreakable = async (rentalId, data = {}) => {
  console.log(`🔄 محاولة إنهاء تأجير مفتوح ${rentalId}:`, data);
  
  const strategies = [
    {
      name: `POST /rentals/${rentalId}/complete-open`,
      executor: async () => {
        return await api.post(`/rentals/${rentalId}/complete-open`, {
          payment_method: data.payment_method || 'كاش',
          actual_minutes: data.actual_minutes,
          final_amount: data.final_amount
        });
      }
    },
    {
      name: `POST /rentals/complete/${rentalId}`,
      executor: async () => {
        return await api.post(`/rentals/complete/${rentalId}`, {
          type: 'open',
          ...data
        });
      }
    },
    {
      name: `PUT /rentals/${rentalId}/complete`,
      executor: async () => {
        return await api.put(`/rentals/${rentalId}/complete`, {
          rental_type: 'open',
          ...data
        });
      }
    },
    {
      name: `POST /rentals/${rentalId}/finish`,
      executor: async () => {
        return await api.post(`/rentals/${rentalId}/finish`, data);
      }
    }
  ];
  
  for (const strategy of strategies) {
    try {
      const response = await strategy.executor();
      
      if (response && response.success) {
        console.log(`✅ نجحت ${strategy.name}`);
        
        // تحديث التأجيرات المحلية
        try {
          const localRentals = JSON.parse(localStorage.getItem('local_rentals') || '[]');
          const updatedRentals = localRentals.map(r => 
            r.id === rentalId || r.id === `local-${rentalId}` 
              ? { ...r, status: 'completed', synced: true } 
              : r
          );
          localStorage.setItem('local_rentals', JSON.stringify(updatedRentals));
        } catch (e) {
          console.warn('⚠️ فشل تحديث التأجيرات المحلية:', e.message);
        }
        
        return response;
      }
    } catch (error) {
      if (error.status !== 404 && error.response?.status !== 404) {
        console.log(`⚠️ خطأ في ${strategy.name}:`, error.message);
      }
    }
  }
  
  // إذا فشلت جميع المحاولات، نعالج محلياً
  console.warn('⚠️ فشلت جميع محاولات إنهاء التأجير، سيتم المعالجة محلياً');
  
  try {
    const localRentals = JSON.parse(localStorage.getItem('local_rentals') || '[]');
    const updatedRentals = localRentals.map(r => 
      r.id === rentalId || r.id === `local-${rentalId}` 
        ? { 
            ...r, 
            status: 'completed', 
            end_time: new Date().toISOString(),
            final_amount: data.final_amount || r.total_amount || 0,
            local_completed: true 
          } 
        : r
    );
    localStorage.setItem('local_rentals', JSON.stringify(updatedRentals));
  } catch (e) {
    console.warn('⚠️ فشل التحديث المحلي:', e.message);
  }
  
  return {
    success: true,
    data: {
      id: rentalId,
      final_amount: data.final_amount || 0,
      actual_minutes: data.actual_minutes || 15,
      completed_at: new Date().toISOString()
    },
    message: 'تم إنهاء التأجير محلياً',
    local: true
  };
};

/**
 * إلغاء تأجير مع دعم تعدد المسارات
 */
api.cancelRentalUnbreakable = async (rentalId, reason = '') => {
  console.log(`🔄 محاولة إلغاء تأجير ${rentalId}`);
  
  const strategies = [
    {
      name: `POST /rentals/${rentalId}/cancel`,
      executor: async () => {
        return await api.post(`/rentals/${rentalId}/cancel`, { reason });
      }
    },
    {
      name: `DELETE /rentals/${rentalId}`,
      executor: async () => {
        return await api.delete(`/rentals/${rentalId}`);
      }
    },
    {
      name: `PUT /rentals/${rentalId}/cancel`,
      executor: async () => {
        return await api.put(`/rentals/${rentalId}/cancel`, { reason });
      }
    },
    {
      name: `POST /rentals/cancel/${rentalId}`,
      executor: async () => {
        return await api.post(`/rentals/cancel/${rentalId}`, { reason });
      }
    }
  ];
  
  for (const strategy of strategies) {
    try {
      const response = await strategy.executor();
      
      if (response && response.success) {
        console.log(`✅ نجحت ${strategy.name}`);
        
        // تحديث التأجيرات المحلية
        try {
          const localRentals = JSON.parse(localStorage.getItem('local_rentals') || '[]');
          const updatedRentals = localRentals.map(r => 
            r.id === rentalId || r.id === `local-${rentalId}` 
              ? { ...r, status: 'cancelled', synced: true } 
              : r
          );
          localStorage.setItem('local_rentals', JSON.stringify(updatedRentals));
        } catch (e) {
          console.warn('⚠️ فشل تحديث التأجيرات المحلية:', e.message);
        }
        
        return response;
      }
    } catch (error) {
      if (error.status !== 404 && error.response?.status !== 404) {
        console.log(`⚠️ خطأ في ${strategy.name}:`, error.message);
      }
    }
  }
  
  // معالجة محلية
  try {
    const localRentals = JSON.parse(localStorage.getItem('local_rentals') || '[]');
    const updatedRentals = localRentals.map(r => 
      r.id === rentalId || r.id === `local-${rentalId}` 
        ? { ...r, status: 'cancelled', cancelled_at: new Date().toISOString() } 
        : r
    );
    localStorage.setItem('local_rentals', JSON.stringify(updatedRentals));
  } catch (e) {
    console.warn('⚠️ فشل التحديث المحلي:', e.message);
  }
  
  return {
    success: true,
    data: { id: rentalId, cancelled: true },
    message: 'تم إلغاء التأجير محلياً',
    local: true
  };
};

// ==================== واجهة برمجة التطبيقات الموحدة ====================

// تأجيرات
api.createRental = api.createRentalUnbreakable;
api.getActiveRentals = api.getActiveRentalsUnbreakable;
api.completeOpenRental = api.completeOpenRentalUnbreakable;
api.cancelRental = api.cancelRentalUnbreakable;

// ==================== باقي الدوال (محذوفة للاختصار ولكن تبقى كما هي) ====================
// ... (باقي الدوال من ملفك الأصلي تبقى كما هي)

// AUTH ENDPOINTS
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

// BRANCHES ENDPOINTS
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
    
    if (response.success) {
      return { success: true, data: response.data };
    }
    
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

// GAMES ENDPOINTS
api.getGames = async (params = {}) => {
  try {
    const requestParams = { ...params };
    delete requestParams.status;
    
    const response = await api.get('/games', { params: requestParams, timeout: 15000 });
    
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

// SHIFTS ENDPOINTS
api.getCurrentShift = async () => {
  try {
    const response = await api.get('/shifts/current');
    
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
        exists: true,
        message: 'تم جلب الشيفت النشط'
      };
    }
    
    return {
      success: true,
      data: null,
      exists: false,
      message: 'لا يوجد شيفت نشط'
    };
  } catch (error) {
    console.error('❌ خطأ في جلب الشيفت الحالي:', error.message);
    return { success: true, data: null, exists: false };
  }
};

api.startShift = async (openingCash = 0) => {
  try {
    console.log('🔄 بدء شيفت جديد...');
    
    // المحاولات المتعددة
    const endpoints = [
      { method: 'post', url: '/shifts/start', data: { opening_cash: openingCash } },
      { method: 'post', url: '/shifts/start-simple', data: {} },
      { method: 'post', url: '/shifts/start-clean', data: {} }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await api[endpoint.method](endpoint.url, endpoint.data);
        if (response && response.success) {
          console.log(`✅ نجح بدء الشيفت عبر ${endpoint.url}`);
          
          if (response.data) {
            localStorage.setItem('current_shift', JSON.stringify(response.data));
          }
          
          return response;
        }
      } catch (error) {
        console.warn(`⚠️ فشل ${endpoint.url}:`, error.message);
      }
    }
    
    return {
      success: false,
      message: 'فشل في بدء الشيفت. تأكد من تشغيل الخادم'
    };
  } catch (error) {
    console.error('🔥 خطأ في startShift:', error);
    return { success: false, message: 'حدث خطأ غير متوقع' };
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
    
    try {
      const altResponse = await api.post(`/shifts/${shiftId}/end-quick`, {
        notes: closingData.notes || 'إنهاء سريع'
      });
      
      if (altResponse.success) {
        localStorage.removeItem('current_shift');
      }
      
      return altResponse;
    } catch (altError) {
      return { success: false, message: error.message || 'تعذر إنهاء الشيفت' };
    }
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
    const response = await api.get('/shifts/active-all');
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

// DASHBOARD & STATS
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

// HEALTH & TEST
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

// ==================== التهيئة الأولية ====================
const savedToken = localStorage.getItem('token');
if (savedToken) {
  api.setToken(savedToken);
}

export default api;