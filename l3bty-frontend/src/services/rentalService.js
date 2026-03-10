import api from './api';

class RentalService {
  // جلب الألعاب المتاحة
  static async getAvailableGames(branchId = null) {
    try {
      const params = { status: 'متاح' };
      if (branchId) params.branch_id = branchId;
      
      const response = await api.getGames(params);
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب الألعاب المتاحة:', error);
      return {
        success: false,
        message: 'تعذر تحميل الألعاب المتاحة',
        data: []
      };
    }
  }

  // جلب الفروع النشطة
  static async getActiveBranches() {
    try {
      const response = await api.getBranches();
      
      if (response.success) {
        // فلترة الفروع النشطة فقط
        const activeBranches = response.data.filter(branch => branch.is_active === 1);
        return {
          ...response,
          data: activeBranches
        };
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب الفروع:', error);
      return {
        success: false,
        message: 'تعذر تحميل الفروع',
        data: []
      };
    }
  }

  // إنشاء تأجير جديد
  static async createNewRental(rentalData) {
    try {
      console.log('📤 إنشاء تأجير جديد:', rentalData);
      
      // التحقق من البيانات المطلوبة
      if (!rentalData.game_id || !rentalData.customer_phone || !rentalData.duration_minutes) {
        return {
          success: false,
          message: 'اللعبة ورقم العميل والمدة مطلوبة'
        };
      }

      // توليد رقم تأجير فريد
      const rentalNumber = `RENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // إعداد بيانات التأجير الكاملة
      const completeRentalData = {
        ...rentalData,
        rental_number: rentalNumber,
        start_time: new Date().toISOString(),
        status: 'نشط',
        created_by: JSON.parse(localStorage.getItem('user'))?.id
      };
      
      const response = await api.createRental(completeRentalData);
      
      if (response.success) {
        // تحديث حالة اللعبة إلى "مؤجرة"
        await api.updateGame(rentalData.game_id, { status: 'مؤجرة' });
      }
      
      return response;
      
    } catch (error) {
      console.error('❌ خطأ في إنشاء التأجير:', error);
      return {
        success: false,
        message: 'تعذر إنشاء التأجير'
      };
    }
  }

  // إنهاء تأجير
  static async endRental(rentalId, gameId, paymentData = {}) {
    try {
      console.log(`✅ إنهاء تأجير ${rentalId}...`);
      
      // إكمال التأجير
      const response = await api.completeRental(rentalId, paymentData);
      
      if (response.success) {
        // تحديث حالة اللعبة إلى "متاح"
        await api.updateGame(gameId, { status: 'متاح' });
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في إنهاء التأجير:', error);
      return {
        success: false,
        message: 'تعذر إنهاء التأجير'
      };
    }
  }

  // إلغاء تأجير
  static async cancelRental(rentalId, gameId) {
    try {
      console.log(`❌ إلغاء تأجير ${rentalId}...`);
      
      // إلغاء التأجير
      const response = await api.cancelRental(rentalId);
      
      if (response.success) {
        // تحديث حالة اللعبة إلى "متاح"
        await api.updateGame(gameId, { status: 'متاح' });
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في إلغاء التأجير:', error);
      return {
        success: false,
        message: 'تعذر إلغاء التأجير'
      };
    }
  }

  // تمديد تأجير
  static async extendRental(rentalId, extraHours) {
    try {
      console.log(`⏱️ تمديد تأجير ${rentalId}...`);
      
      const response = await api.extendRental(rentalId, extraHours);
      return response;
    } catch (error) {
      console.error('❌ خطأ في تمديد التأجير:', error);
      return {
        success: false,
        message: 'تعذر تمديد التأجير'
      };
    }
  }

  // جلب تأجيرات العميل
  static async getCustomerRentals(phone) {
    try {
      const response = await api.getRentals({ customer_phone: phone });
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب تأجيرات العميل:', error);
      return {
        success: false,
        message: 'تعذر تحميل تأجيرات العميل',
        data: []
      };
    }
  }

  // جلب تأجيرات اليوم
  static async getTodayRentals() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.getRentals({ date_from: today, date_to: today });
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب تأجيرات اليوم:', error);
      return {
        success: false,
        message: 'تعذر تحميل تأجيرات اليوم',
        data: []
      };
    }
  }

  // جلب التأجيرات النشطة
  static async getActiveRentals() {
    try {
      const response = await api.getRentals({ status: 'نشط' });
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب التأجيرات النشطة:', error);
      return {
        success: false,
        message: 'تعذر تحميل التأجيرات النشطة',
        data: []
      };
    }
  }

  // حساب التكلفة
  static async calculateCost(gameId, durationMinutes) {
    try {
      // جلب سعر اللعبة
      const gameResponse = await api.getGames({ id: gameId });
      
      if (gameResponse.success && gameResponse.data.length > 0) {
        const game = gameResponse.data[0];
        const pricePerHour = game.price_per_hour || 100;
        
        // تحويل المدة من دقائق إلى ساعات
        const durationHours = durationMinutes / 60;
        
        // حساب التكلفة الإجمالية
        const totalCost = pricePerHour * durationHours;
        
        return {
          success: true,
          data: {
            price_per_hour: pricePerHour,
            duration_minutes: durationMinutes,
            duration_hours: durationHours,
            total_amount: Math.round(totalCost),
            game: game
          }
        };
      }
      
      return {
        success: false,
        message: 'اللعبة غير موجودة'
      };
    } catch (error) {
      console.error('❌ خطأ في حساب التكلفة:', error);
      return {
        success: false,
        message: 'تعذر حساب التكلفة'
      };
    }
  }

  // البحث المتقدم في التأجيرات
  static async advancedSearch(filters) {
    try {
      const response = await api.getRentals(filters);
      return response;
    } catch (error) {
      console.error('❌ خطأ في البحث المتقدم:', error);
      return {
        success: false,
        message: 'تعذر تنفيذ البحث',
        data: []
      };
    }
  }

  // جلب إحصائيات التأجير
  static async getRentalStats() {
    try {
      const response = await api.getDashboardStats();
      
      if (response.success) {
        return {
          success: true,
          data: {
            total_rentals: response.data.total_rentals || 0,
            active_rentals: response.data.active_rentals || 0,
            today_rentals: response.data.today_rentals || 0,
            total_revenue: response.data.total_revenue || 0,
            today_revenue: response.data.today_revenue || 0
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب إحصائيات التأجير:', error);
      return {
        success: false,
        message: 'تعذر تحميل إحصائيات التأجير'
      };
    }
  }
}

export default RentalService;