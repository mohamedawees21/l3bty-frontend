import apiClient from '../api/apiClient';

const branchService = {
  // الحصول على جميع الفروع
  getBranches: async () => {
    try {
      const response = await apiClient.get('/branches');
      return response.data;
    } catch (error) {
      console.error('Get branches error:', error);
      throw error;
    }
  },

  // الحصول على فرع محدد
  getBranch: async (branchId) => {
    try {
      const response = await apiClient.get(`/branches/${branchId}`);
      return response.data;
    } catch (error) {
      console.error('Get branch error:', error);
      throw error;
    }
  },

  // إنشاء فرع جديد
  createBranch: async (branchData) => {
    try {
      const response = await apiClient.post('/branches', branchData);
      return response.data;
    } catch (error) {
      console.error('Create branch error:', error);
      throw error;
    }
  },

  // تحديث فرع
  updateBranch: async (branchId, branchData) => {
    try {
      const response = await apiClient.put(`/branches/${branchId}`, branchData);
      return response.data;
    } catch (error) {
      console.error('Update branch error:', error);
      throw error;
    }
  },

  // حذف فرع
  deleteBranch: async (branchId) => {
    try {
      const response = await apiClient.delete(`/branches/${branchId}`);
      return response.data;
    } catch (error) {
      console.error('Delete branch error:', error);
      throw error;
    }
  },

  // الحصول على ألعاب الفرع
  getBranchGames: async (branchId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category_id) params.append('category_id', filters.category_id);
      
      const response = await apiClient.get(`/branches/${branchId}/games?${params}`);
      return response.data;
    } catch (error) {
      console.error('Get branch games error:', error);
      throw error;
    }
  },

  // إضافة لعبة للفرع
  addGameToBranch: async (branchId, gameData) => {
    try {
      const response = await apiClient.post(`/branches/${branchId}/games`, gameData);
      return response.data;
    } catch (error) {
      console.error('Add game to branch error:', error);
      throw error;
    }
  },

  // تحديث حالة لعبة في الفرع
  updateGameStatus: async (branchGameId, status) => {
    try {
      const response = await apiClient.put(`/games/branch/${branchGameId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Update game status error:', error);
      throw error;
    }
  },

  // تحديث سعر لعبة في الفرع
  updateGamePrice: async (branchGameId, priceData) => {
    try {
      const response = await apiClient.put(`/games/branch/${branchGameId}/price`, priceData);
      return response.data;
    } catch (error) {
      console.error('Update game price error:', error);
      throw error;
    }
  },

  // الحصول على الألعاب المتاحة في الفرع
  getAvailableGames: async (branchId) => {
    try {
      const response = await apiClient.get(`/games/available/${branchId}`);
      return response.data;
    } catch (error) {
      console.error('Get available games error:', error);
      throw error;
    }
  }
};

export default branchService;