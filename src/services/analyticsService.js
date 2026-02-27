import api from './api';

class AnalyticsService {
  // جلب إحصائيات اللوحة
  static async getDashboardStats() {
    try {
      console.log('📊 جلب إحصائيات اللوحة...');
      const response = await api.getDashboardStats();
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب إحصائيات اللوحة:', error);
      return {
        success: false,
        message: 'تعذر تحميل إحصائيات اللوحة'
      };
    }
  }

  // جلب الإحصائيات الشهرية
  static async getMonthlyStats(month, year) {
    try {
      const response = await api.get('/dashboard/stats/monthly', {
        params: { month, year }
      });
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب الإحصائيات الشهرية:', error);
      return {
        success: false,
        message: 'تعذر تحميل الإحصائيات الشهرية'
      };
    }
  }

  // جلب أفضل الألعاب
  static async getTopGames(params = {}) {
    try {
      const response = await api.get('/analytics/top-games', { params });
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب أفضل الألعاب:', error);
      return {
        success: false,
        message: 'تعذر تحميل أفضل الألعاب'
      };
    }
  }

  // جلب أداء الفروع
  static async getBranchPerformance(params = {}) {
    try {
      const response = await api.get('/analytics/branch-performance', { params });
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب أداء الفروع:', error);
      return {
        success: false,
        message: 'تعذر تحميل أداء الفروع'
      };
    }
  }

  // جلب اتجاه الإيرادات
  static async getRevenueTrend(params = {}) {
    try {
      const response = await api.get('/analytics/revenue-trend', { params });
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب اتجاه الإيرادات:', error);
      return {
        success: false,
        message: 'تعذر تحميل اتجاه الإيرادات'
      };
    }
  }

  // جلب تقارير متقدمة
  static async getAdvancedReports(reportType, params = {}) {
    try {
      const response = await api.get(`/analytics/reports/${reportType}`, { params });
      return response;
    } catch (error) {
      console.error('❌ خطأ في جلب التقرير:', error);
      return {
        success: false,
        message: 'تعذر تحميل التقرير'
      };
    }
  }

  // تحميل بيانات المحاكاة للاختبار
  static async getMockData() {
    try {
      // بيانات محاكاة للاختبار
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // توليد بيانات شهرية محاكاة
      const monthlyData = {
        revenue: Math.floor(Math.random() * 50000) + 20000,
        rentals: Math.floor(Math.random() * 200) + 100,
        active_rentals: Math.floor(Math.random() * 10) + 5,
        available_games: Math.floor(Math.random() * 50) + 30,
        occupancy_rate: Math.floor(Math.random() * 40) + 60,
        avg_revenue_per_rental: Math.floor(Math.random() * 200) + 100,
        avg_rental_duration: Math.floor(Math.random() * 60) + 30,
        total_customers: Math.floor(Math.random() * 100) + 50
      };
      
      // أفضل الألعاب محاكاة
      const mockGames = [
        { id: 1, name: 'دريفت كار', category: 'سيارات', rental_count: 45, revenue: 6750, price_per_hour: 150, branch_name: 'الفرع الرئيسي' },
        { id: 2, name: 'موتوسيكل كهربائي', category: 'دراجات نارية', rental_count: 38, revenue: 4560, price_per_hour: 120, branch_name: 'فرع المعادي' },
        { id: 3, name: 'عربة كهربائية', category: 'سيارات', rental_count: 32, revenue: 6400, price_per_hour: 200, branch_name: 'الفرع الرئيسي' },
        { id: 4, name: 'هافر بورد', category: 'كهربائية', rental_count: 28, revenue: 2240, price_per_hour: 80, branch_name: 'فرع التجمع' },
        { id: 5, name: 'سكوتر كهربائي', category: 'كهربائية', rental_count: 25, revenue: 1750, price_per_hour: 70, branch_name: 'الفرع الرئيسي' }
      ];
      
      // أداء الفروع محاكاة
      const mockBranches = [
        { id: 1, name: 'الفرع الرئيسي', revenue: 25000, rentals: 120, occupancy_rate: 75 },
        { id: 2, name: 'فرع المعادي', revenue: 18000, rentals: 90, occupancy_rate: 68 },
        { id: 3, name: 'فرع التجمع', revenue: 15000, rentals: 75, occupancy_rate: 62 }
      ];
      
      // اتجاه الإيرادات محاكاة (آخر 7 أيام)
      const mockRevenueTrend = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockRevenueTrend.push({
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 5000) + 2000
        });
      }
      
      return {
        success: true,
        data: {
          ...monthlyData,
          top_games: mockGames,
          branch_performance: mockBranches,
          revenue_trend: mockRevenueTrend,
          month: currentMonth,
          year: currentYear
        }
      };
    } catch (error) {
      console.error('❌ خطأ في توليد بيانات المحاكاة:', error);
      return {
        success: false,
        message: 'تعذر توليد بيانات المحاكاة'
      };
    }
  }
}

export default AnalyticsService;