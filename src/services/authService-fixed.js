// frontend/src/services/authService-fixed.js
import api from './api';

class AuthService {
  constructor() {
    this.token = null;
    this.user = null;
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      this.token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      this.user = userStr ? JSON.parse(userStr) : null;
      console.log('📦 Loaded from storage:', {
        tokenExists: !!this.token,
        userExists: !!this.user
      });
    } catch (error) {
      console.error('❌ Error loading from storage:', error);
      this.clear();
    }
  }

  async login(email, password) {
    try {
      console.log('🔐 Attempting login for:', email);
      
      // استخدام fetch مباشرة للتأكد من العمل
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('📥 Login response:', data);

      if (data.success) {
        this.setAuthData(data.token, data.user);
        return {
          success: true,
          data: data
        };
      } else {
        return {
          success: false,
          message: data.message
        };
      }
    } catch (error) {
      console.error('🔥 Login error:', error);
      return {
        success: false,
        message: 'تعذر الاتصال بالخادم. تأكد من تشغيل Backend على http://localhost:5000'
      };
    }
  }

  setAuthData(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    console.log('💾 Saved auth data:', { token: token?.substring(0, 20) + '...', user: user?.name });
  }

  clear() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🧹 Cleared auth data');
  }

  getCurrentUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  logout() {
    this.clear();
    window.location.href = '/login';
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;