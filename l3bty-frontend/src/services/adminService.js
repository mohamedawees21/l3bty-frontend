import api from './api';
import ActivityService from './activityService';

class AdminService {
  // ==================== BRANCHES MANAGEMENT ====================

  // جلب الفروع
  static async getBranches(params = {}) {
    try {
      const response = await api.getBranches(params);
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب الفروع:', error);
      return {
        success: false,
        message: 'تعذر تحميل الفروع'
      };
    }
  }

  // إنشاء فرع جديد
  static async createBranch(branchData) {
    try {
      const response = await api.createBranch(branchData);
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.logCreateBranch(
          user.id, 
          user.name, 
          branchData.name, 
          response.branchId
        );
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في إنشاء الفرع:', error);
      return {
        success: false,
        message: 'تعذر إنشاء الفرع'
      };
    }
  }

  // تحديث فرع
  static async updateBranch(id, branchData) {
    try {
      const response = await api.updateBranch(id, branchData);
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.logUpdateBranch(
          user.id, 
          user.name, 
          branchData.name || 'فرع معدل', 
          id
        );
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في تحديث الفرع:', error);
      return {
        success: false,
        message: 'تعذر تحديث الفرع'
      };
    }
  }

  // حذف فرع
  static async deleteBranch(id, isPermanent = false) {
    try {
      let response;
      
      if (isPermanent) {
        response = await api.deleteBranchPermanent(id);
      } else {
        response = await api.deleteBranch(id);
      }
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.logDeleteBranch(
          user.id, 
          user.name, 
          'فرع محذوف', 
          id
        );
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في حذف الفرع:', error);
      return {
        success: false,
        message: 'تعذر حذف الفرع'
      };
    }
  }

  // تعطيل/تفعيل فرع
  static async toggleBranchStatus(id, currentStatus) {
    try {
      const response = await api.updateBranch(id, {
        is_active: currentStatus ? 0 : 1
      });
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        const action = currentStatus ? 'تعطيل' : 'تفعيل';
        await ActivityService.log(
          `تحديث فرع - ${action}`,
          `تم ${action} الفرع رقم ${id}`,
          { branch_id: id, action: action }
        );
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في تغيير حالة الفرع:', error);
      return {
        success: false,
        message: 'تعذر تغيير حالة الفرع'
      };
    }
  }

  // جلب ألعاب الفرع
  static async getBranchGames(branchId) {
    try {
      const response = await api.get(`/branches/${branchId}/games`);
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب ألعاب الفرع:', error);
      return {
        success: false,
        message: 'تعذر تحميل ألعاب الفرع',
        data: []
      };
    }
  }

  // ==================== GAMES MANAGEMENT ====================

  // جلب الألعاب
  static async getGames(params = {}) {
    try {
      const response = await api.getGames(params);
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب الألعاب:', error);
      return {
        success: false,
        message: 'تعذر تحميل الألعاب'
      };
    }
  }

  // إنشاء لعبة جديدة
  static async createGame(gameData) {
    try {
      const response = await api.createGame(gameData);
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.logCreateGame(
          user.id, 
          user.name, 
          gameData.name, 
          response.gameId
        );
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في إنشاء اللعبة:', error);
      return {
        success: false,
        message: 'تعذر إنشاء اللعبة'
      };
    }
  }

  // تحديث لعبة
  static async updateGame(id, gameData) {
    try {
      const response = await api.updateGame(id, gameData);
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.logUpdateGame(
          user.id, 
          user.name, 
          gameData.name || 'لعبة معدلة', 
          id
        );
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في تحديث اللعبة:', error);
      return {
        success: false,
        message: 'تعذر تحديث اللعبة'
      };
    }
  }

  // حذف لعبة
  static async deleteGame(id, isPermanent = false) {
    try {
      let response;
      
      if (isPermanent) {
        response = await api.deleteGamePermanent(id);
      } else {
        response = await api.deleteGame(id);
      }
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.logDeleteGame(
          user.id, 
          user.name, 
          'لعبة محذوفة', 
          id
        );
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في حذف اللعبة:', error);
      return {
        success: false,
        message: 'تعذر حذف اللعبة'
      };
    }
  }

  // تغيير حالة اللعبة
  static async updateGameStatus(id, status) {
    try {
      const response = await api.updateGame(id, { status });
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.log(
          'تحديث حالة لعبة',
          `تم تغيير حالة اللعبة ${id} إلى ${status}`,
          { game_id: id, status: status }
        );
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في تغيير حالة اللعبة:', error);
      return {
        success: false,
        message: 'تعذر تغيير حالة اللعبة'
      };
    }
  }

  // ==================== USERS MANAGEMENT ====================

  // جلب المستخدمين
  static async getUsers() {
    try {
      const response = await api.getUsers();
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب المستخدمين:', error);
      return {
        success: false,
        message: 'تعذر تحميل المستخدمين'
      };
    }
  }

  // إنشاء مستخدم جديد
  static async createUser(userData) {
    try {
      const response = await api.createUser(userData);
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.logCreateUser(
          user.id, 
          user.name, 
          userData.name, 
          response.userId
        );
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في إنشاء المستخدم:', error);
      return {
        success: false,
        message: 'تعذر إنشاء المستخدم'
      };
    }
  }

  // تحديث مستخدم
  static async updateUser(id, userData) {
    try {
      const response = await api.updateUser(id, userData);
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.logUpdateUser(
          user.id, 
          user.name, 
          userData.name || 'مستخدم معدل', 
          id
        );
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في تحديث المستخدم:', error);
      return {
        success: false,
        message: 'تعذر تحديث المستخدم'
      };
    }
  }

  // حذف مستخدم
  static async deleteUser(id, isPermanent = false) {
    try {
      let response;
      
      if (isPermanent) {
        response = await api.deleteUserPermanent(id);
      } else {
        response = await api.deleteUser(id);
      }
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.logDeleteUser(
          user.id, 
          user.name, 
          'مستخدم محذوف', 
          id
        );
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في حذف المستخدم:', error);
      return {
        success: false,
        message: 'تعذر حذف المستخدم'
      };
    }
  }

  // تعطيل/تفعيل مستخدم
  static async toggleUserStatus(id, currentStatus) {
    try {
      const response = await api.updateUser(id, {
        is_active: currentStatus ? 0 : 1
      });
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        const action = currentStatus ? 'تعطيل' : 'تفعيل';
        await ActivityService.log(
          `تحديث مستخدم - ${action}`,
          `تم ${action} المستخدم رقم ${id}`,
          { user_id: id, action: action }
        );
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في تغيير حالة المستخدم:', error);
      return {
        success: false,
        message: 'تعذر تغيير حالة المستخدم'
      };
    }
  }

  // ==================== RENTALS MANAGEMENT ====================

  // جلب التأجيرات
  static async getRentals(params = {}) {
    try {
      const response = await api.getRentals(params);
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب التأجيرات:', error);
      return {
        success: false,
        message: 'تعذر تحميل التأجيرات'
      };
    }
  }

  // إنشاء تأجير جديد
  static async createRental(rentalData) {
    try {
      const response = await api.createRental(rentalData);
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.logCreateRental(
          user.id, 
          user.name, 
          rentalData.rental_number || 'جديد', 
          response.rentalId || response.data?.id
        );
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
  static async completeRental(id, paymentData = {}) {
    try {
      const response = await api.completeRental(id, paymentData);
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.logUpdateRental(
          user.id, 
          user.name, 
          'مكتمل', 
          id, 
          'إكمال'
        );
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
  static async cancelRental(id) {
    try {
      const response = await api.updateRental(id, { status: 'ملغي' });
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.logUpdateRental(
          user.id, 
          user.name, 
          'ملغي', 
          id, 
          'إلغاء'
        );
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
  static async extendRental(id, extraHours) {
    try {
      const response = await api.updateRental(id, { 
        extended_hours: extraHours 
      });
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.logUpdateRental(
          user.id, 
          user.name, 
          'ممدد', 
          id, 
          'تمديد'
        );
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في تمديد التأجير:', error);
      return {
        success: false,
        message: 'تعذر تمديد التأجير'
      };
    }
  }

  // ==================== SYSTEM OPERATIONS ====================

  // جلب سجل الأنشطة
  static async getActivities(filters = {}) {
    try {
      const response = await api.getActivities(filters);
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب سجل الأنشطة:', error);
      return {
        success: false,
        message: 'تعذر تحميل سجل الأنشطة'
      };
    }
  }

  // جمل التقارير
  static async getReports(reportType, params = {}) {
    try {
      const response = await api.getSalesReport({ ...params, type: reportType });
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب التقرير:', error);
      return {
        success: false,
        message: 'تعذر تحميل التقرير'
      };
    }
  }

  // تحديث إعدادات النظام
  static async updateSettings(settingsData) {
    try {
      const response = await api.put('/admin/settings', settingsData);
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.log(
          'تحديث إعدادات النظام',
          'تم تحديث إعدادات النظام',
          { settings: settingsData }
        );
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في تحديث الإعدادات:', error);
      return {
        success: false,
        message: 'تعذر تحديث الإعدادات'
      };
    }
  }

  // تصدير البيانات
  static async exportData(type, params = {}) {
    try {
      const response = await api.get(`/admin/export/${type}`, { 
        params,
        responseType: 'blob' // مهم لتحميل الملفات
      });
      
      if (response.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        await ActivityService.log(
          'تصدير بيانات',
          `تم تصدير بيانات ${type}`,
          { export_type: type, params: params }
        );
      }
      
      return response;
    } catch (error) {
      console.error('❌ خطأ في تصدير البيانات:', error);
      return {
        success: false,
        message: 'تعذر تصدير البيانات'
      };
    }
  }

  // فحص صحة النظام
  static async healthCheck() {
    try {
      const response = await api.healthCheck();
      return response;
    } catch (error) {
      console.error('❌ خطأ في فحص صحة النظام:', error);
      return {
        success: false,
        message: 'تعذر الاتصال بالخادم'
      };
    }
  }
}

export default AdminService;