import { get, post, del, downloadFile } from './api';

export const exportService = {
  // إنشاء تقرير
  generateReport: async (reportData) => {
    const response = await post('/export/generate', reportData);
    return response.data;
  },

  // الحصول على التقارير المنشأة
  getGeneratedReports: async (filters = {}) => {
    const response = await get('/export/reports', filters);
    return response.data || [];
  },

  // تنزيل تقرير
  downloadReport: async (reportId) => {
    const response = await get(`/export/reports/${reportId}/download`);
    return response.data?.download_url;
  },

  // حذف تقرير
  deleteReport: async (reportId) => {
    await del(`/export/reports/${reportId}`);
  },

  // حذف تقارير متعددة
  deleteReports: async (reportIds) => {
    await post('/export/reports/delete-multiple', { report_ids: reportIds });
  },

  // تصدير تأجيرات
  exportRentals: async (filters = {}) => {
    const response = await post('/export/rentals', filters);
    return response.data;
  },

  // تصدير إيرادات
  exportRevenue: async (filters = {}) => {
    const response = await post('/export/revenue', filters);
    return response.data;
  },

  // تصدير موظفين
  exportEmployees: async (filters = {}) => {
    const response = await post('/export/employees', filters);
    return response.data;
  },

  // تصدير ألعاب
  exportGames: async (filters = {}) => {
    const response = await post('/export/games', filters);
    return response.data;
  },

  // تصدير فروع
  exportBranches: async (filters = {}) => {
    const response = await post('/export/branches', filters);
    return response.data;
  },

  // تصدير إلغاءات
  exportCancellations: async (filters = {}) => {
    const response = await post('/export/cancellations', filters);
    return response.data;
  },

  // تصدير التقرير الكامل
  exportFullReport: async (filters = {}) => {
    const response = await post('/export/full-report', filters);
    return response.data;
  },

  // تصدير إلى PDF
  exportToPDF: async (data, type) => {
    const response = await post('/export/pdf', { data, type });
    return response.data;
  },

  // تصدير إلى Excel
  exportToExcel: async (data, type) => {
    const response = await post('/export/excel', { data, type });
    return response.data;
  },

  // تنزيل ملف مباشر
  downloadFile: async (url, filename) => {
    return downloadFile(url, filename);
  }
};