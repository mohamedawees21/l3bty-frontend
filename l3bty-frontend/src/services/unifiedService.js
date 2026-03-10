// frontend/src/services/unifiedService.js
import api from './api';
import authService from './authService-fixed.js';

const unifiedService = {
  // 🔐 Authentication
  auth: authService,

  // 👥 Users
  async getUsers() {
    try {
      console.log('📤 Fetching users...');
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Users error:', error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  // 🎮 Games
  async getGames() {
    try {
      console.log('📤 Fetching games...');
      const response = await api.get('/games');
      return response.data;
    } catch (error) {
      console.error('Games error:', error);
      throw error;
    }
  },

  async createGame(gameData) {
    try {
      const response = await api.post('/games', gameData);
      return response.data;
    } catch (error) {
      console.error('Create game error:', error);
      throw error;
    }
  },

  // 🏬 Branches
  async getBranches() {
    try {
      console.log('📤 Fetching branches...');
      const response = await api.get('/branches');
      return response.data;
    } catch (error) {
      console.error('Branches error:', error);
      throw error;
    }
  },

  async createBranch(branchData) {
    try {
      const response = await api.post('/branches', branchData);
      return response.data;
    } catch (error) {
      console.error('Create branch error:', error);
      throw error;
    }
  },

  // 📊 Dashboard
  async getDashboardStats() {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  },

  // 🔧 Health Check
  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }
};

export default unifiedService;