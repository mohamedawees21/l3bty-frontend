// frontend/src/services/service.js
import api from './api';

const service = {
  // إحصائيات لوحة التحكم
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, message: 'تعذر تحميل الإحصائيات' };
    }
  },

  // تأجيرات
  getRecentRentals: async (limit = 5) => {
    try {
      const response = await api.get(`/rentals/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent rentals:', error);
      return { success: false, message: 'تعذر تحميل التأجيرات' };
    }
  },

  getAllRentals: async (page = 1, filters = {}) => {
    try {
      const response = await api.get('/rentals/all', {
        params: { page, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all rentals:', error);
      return { success: false, message: 'تعذر تحميل التأجيرات' };
    }
  },

  getRentalById: async (id) => {
    try {
      const response = await api.get(`/rentals/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rental:', error);
      return { success: false, message: 'تعذر تحميل بيانات التأجير' };
    }
  },

  updateRental: async (id, data) => {
    try {
      const response = await api.put(`/rentals/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating rental:', error);
      return { success: false, message: 'تعذر تحديث التأجير' };
    }
  },

  deleteRental: async (id) => {
    try {
      const response = await api.delete(`/rentals/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting rental:', error);
      return { success: false, message: 'تعذر حذف التأجير' };
    }
  },

  endRental: async (id) => {
    try {
      const response = await api.post(`/rentals/${id}/end`);
      return response.data;
    } catch (error) {
      console.error('Error ending rental:', error);
      return { success: false, message: 'تعذر إنهاء التأجير' };
    }
  },

  cancelRental: async (id) => {
    try {
      const response = await api.post(`/rentals/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling rental:', error);
      return { success: false, message: 'تعذر إلغاء التأجير' };
    }
  },

  extendRental: async (id, hours) => {
    try {
      const response = await api.post(`/rentals/${id}/extend`, { hours });
      return response.data;
    } catch (error) {
      console.error('Error extending rental:', error);
      return { success: false, message: 'تعذر تمديد التأجير' };
    }
  },

  // سجل الأنشطة
  getActivitiesLog: async (filters = {}) => {
    try {
      const response = await api.get('/activities', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      return { success: false, message: 'تعذر تحميل سجل الأنشطة' };
    }
  },

  // الألعاب
  getTopGames: async (limit = 5) => {
    try {
      const response = await api.get(`/games/top?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top games:', error);
      return { success: false, message: 'تعذر تحميل الألعاب' };
    }
  },

  // المستخدمين
  getUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, message: 'تعذر تحميل المستخدمين' };
    }
  },

  // التقارير
  generateReport: async (type, startDate, endDate) => {
    try {
      const response = await api.post('/reports/generate', {
        type,
        start_date: startDate,
        end_date: endDate
      });
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      return { success: false, message: 'تعذر إنشاء التقرير' };
    }
  }
};

export default service;