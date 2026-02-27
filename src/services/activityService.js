import api from './api';

class ActivityService {
  // جلب سجل الأنشطة
  static async getActivities(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== 'all') {
          params.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/activities?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching activities:', error);
      return {
        success: false,
        message: 'تعذر تحميل سجل الأنشطة',
        data: []
      };
    }
  }

  // جلب إحصائيات الأنشطة
  static async getActivityStats() {
    try {
      // تحليل البيانات الحالية من سجل الأنشطة
      const response = await api.get('/activities');
      
      if (response.success && response.data) {
        const activities = response.data;
        const now = new Date();
        const last24Hours = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        const last7Days = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        // إحصائيات الأنشطة
        const totalActivities = activities.length;
        const last24HoursCount = activities.filter(a => 
          new Date(a.created_at) > last24Hours
        ).length;
        const last7DaysCount = activities.filter(a => 
          new Date(a.created_at) > last7Days
        ).length;
        
        // المستخدمون الأكثر نشاطاً
        const userActivityCount = {};
        activities.forEach(activity => {
          const userId = activity.user_id;
          userActivityCount[userId] = (userActivityCount[userId] || 0) + 1;
        });
        
        const topUsers = Object.entries(userActivityCount)
          .map(([userId, count]) => {
            const userActivity = activities.find(a => a.user_id == userId);
            return {
              user_id: userId,
              user_name: userActivity?.user_name || 'غير معروف',
              activity_count: count
            };
          })
          .sort((a, b) => b.activity_count - a.activity_count)
          .slice(0, 5);
        
        return {
          success: true,
          data: {
            total_activities: totalActivities,
            last_24_hours: last24HoursCount,
            last_7_days: last7DaysCount,
            top_users: topUsers
          }
        };
      }
      
      return {
        success: true,
        data: {
          total_activities: 0,
          last_24_hours: 0,
          last_7_days: 0,
          top_users: []
        }
      };
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      return {
        success: false,
        message: 'تعذر تحميل إحصائيات الأنشطة'
      };
    }
  }

  // تسجيل نشاط جديد (وظيفة مساعدة)
  static async log(action, description, metadata = {}) {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user) {
        console.warn('⚠️ لا يمكن تسجيل النشاط - لا يوجد مستخدم مسجل');
        return;
      }
      
      console.log('📝 تسجيل نشاط:', { 
        action, 
        description, 
        user: user.name,
        metadata 
      });
      
      // ملاحظة: لن يتم إرسال النشاط فعلياً لأن الـ endpoint غير موجود
      // في المستقبل يمكن إرساله عند إنشاء الـ endpoint
      const activityData = {
        user_id: user.id,
        user_name: user.name,
        user_role: user.role,
        action: action,
        details: description,
        ip_address: '127.0.0.1', // سيكون حقيقياً في البيئة الإنتاجية
        metadata: JSON.stringify(metadata)
      };
      
      // تخزين محلي مؤقت (يمكن استبداله بـ API call لاحقاً)
      const localActivities = JSON.parse(localStorage.getItem('local_activities') || '[]');
      localActivities.push({
        ...activityData,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('local_activities', JSON.stringify(localActivities.slice(-100))); // حفظ آخر 100 نشاط فقط
      
    } catch (error) {
      console.error('❌ Error logging activity:', error);
    }
  }
}

// وظائف مساعدة لتسجيل الأنشطة الشائعة
ActivityService.logLogin = (userId, userName) => {
  ActivityService.log('تسجيل دخول', `تسجيل دخول المستخدم ${userName}`, { user_id: userId });
};

ActivityService.logLogout = (userId, userName) => {
  ActivityService.log('تسجيل خروج', `تسجيل خروج المستخدم ${userName}`, { user_id: userId });
};

ActivityService.logCreateGame = (userId, userName, gameName, gameId) => {
  ActivityService.log('إنشاء لعبة', `تم إنشاء اللعبة "${gameName}"`, { 
    user_id: userId,
    user_name: userName,
    game_id: gameId,
    game_name: gameName 
  });
};

ActivityService.logUpdateGame = (userId, userName, gameName, gameId) => {
  ActivityService.log('تحديث لعبة', `تم تحديث اللعبة "${gameName}"`, { 
    user_id: userId,
    user_name: userName,
    game_id: gameId,
    game_name: gameName 
  });
};

ActivityService.logDeleteGame = (userId, userName, gameName, gameId) => {
  ActivityService.log('حذف لعبة', `تم حذف اللعبة "${gameName}"`, { 
    user_id: userId,
    user_name: userName,
    game_id: gameId,
    game_name: gameName 
  });
};

ActivityService.logCreateBranch = (userId, userName, branchName, branchId) => {
  ActivityService.log('إنشاء فرع', `تم إنشاء الفرع "${branchName}"`, { 
    user_id: userId,
    user_name: userName,
    branch_id: branchId,
    branch_name: branchName 
  });
};

ActivityService.logUpdateBranch = (userId, userName, branchName, branchId) => {
  ActivityService.log('تحديث فرع', `تم تحديث الفرع "${branchName}"`, { 
    user_id: userId,
    user_name: userName,
    branch_id: branchId,
    branch_name: branchName 
  });
};

ActivityService.logDeleteBranch = (userId, userName, branchName, branchId) => {
  ActivityService.log('حذف فرع', `تم حذف الفرع "${branchName}"`, { 
    user_id: userId,
    user_name: userName,
    branch_id: branchId,
    branch_name: branchName 
  });
};

ActivityService.logCreateRental = (userId, userName, rentalNumber, rentalId) => {
  ActivityService.log('إنشاء تأجير', `تم إنشاء التأجير رقم ${rentalNumber}`, { 
    user_id: userId,
    user_name: userName,
    rental_id: rentalId,
    rental_number: rentalNumber 
  });
};

ActivityService.logUpdateRental = (userId, userName, rentalNumber, rentalId, action) => {
  ActivityService.log(`تحديث تأجير - ${action}`, `تم ${action} التأجير رقم ${rentalNumber}`, { 
    user_id: userId,
    user_name: userName,
    rental_id: rentalId,
    rental_number: rentalNumber,
    action: action 
  });
};

ActivityService.logCreateUser = (userId, userName, newUserName, newUserId) => {
  ActivityService.log('إنشاء مستخدم', `تم إنشاء المستخدم "${newUserName}"`, { 
    user_id: userId,
    user_name: userName,
    new_user_id: newUserId,
    new_user_name: newUserName 
  });
};

ActivityService.logUpdateUser = (userId, userName, targetUserName, targetUserId) => {
  ActivityService.log('تحديث مستخدم', `تم تحديث المستخدم "${targetUserName}"`, { 
    user_id: userId,
    user_name: userName,
    target_user_id: targetUserId,
    target_user_name: targetUserName 
  });
};

ActivityService.logDeleteUser = (userId, userName, targetUserName, targetUserId) => {
  ActivityService.log('حذف مستخدم', `تم حذف المستخدم "${targetUserName}"`, { 
    user_id: userId,
    user_name: userName,
    target_user_id: targetUserId,
    target_user_name: targetUserName 
  });
};

export default ActivityService;