// frontend/src/services/api-fixed.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// إنشاء axios instance
const apiInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// ✅ **الحل: استخدم تسمية مختلفة**
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log('🔐 [API Request]', {
      url: config.url,
      method: config.method,
      token: token ? `Present (${token.substring(0, 20)}...)` : 'Missing'
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

apiInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ [${response.config.method?.toUpperCase()}] ${response.config.url}: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.message);
    
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ✅ **الحل: تصدير الـ instance مباشرة**
export default apiInstance;