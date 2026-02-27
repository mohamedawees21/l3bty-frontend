import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import authService from '../../services/authService';
import './EmployeeDashboard.css';
import {
  Gamepad2, Zap, DollarSign, Clock, Users,
  CheckCircle, RefreshCw, Building,
  Loader2, Calendar, TrendingUp, User,
  LogOut, Bell, Package, Activity,
  ShoppingCart, ChevronRight
} from 'lucide-react';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  
  // حالة مبسطة للغاية
  const [user, setUser] = useState(null);
  const [currentShift, setCurrentShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // إحصائيات بسيطة
  const [stats, setStats] = useState({
    availableGames: 0,
    activeRentals: 0,
    todayRevenue: 0,
    todayRentals: 0
  });

  // تنسيق العملة
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0 ج.م';
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // تنسيق الوقت
  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '--:--';
    }
  };

  // تحميل البيانات الأساسية
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. جلب بيانات المستخدم
      const userData = await authService.getCurrentUser();
      setUser(userData);
      
      // 2. جلب الشيفت النشط
      const shiftResponse = await api.getActiveShift();
      const shift = shiftResponse.success ? shiftResponse.data : null;
      setCurrentShift(shift);
      
      if (!shift) {
        setStats({
          availableGames: 0,
          activeRentals: 0,
          todayRevenue: 0,
          todayRentals: 0
        });
        return;
      }
      
      // 3. جلب الألعاب المتاحة
      let availableCount = 0;
      try {
        const gamesResponse = await api.getGames({ branch_id: userData?.branch_id });
        if (gamesResponse.success) {
          const games = gamesResponse.data || [];
          availableCount = games.filter(g => g.status === 'متاح').length;
        }
      } catch (error) {
        console.warn('⚠️ فشل جلب الألعاب:', error.message);
      }
      
      // 4. جلب التأجيرات النشطة
      let activeCount = 0;
      try {
        const activeResponse = await api.get('/rentals/active', {
          params: { branch_id: userData?.branch_id }
        });
        if (activeResponse.success) {
          const active = activeResponse.data || [];
          activeCount = active.filter(r => r.shift_id === shift.id).length;
        }
      } catch (error) {
        console.warn('⚠️ فشل جلب التأجيرات النشطة:', error.message);
      }
      
      // 5. جلب التأجيرات المكتملة اليوم
      let todayRevenue = 0;
      let todayRentals = 0;
      
      try {
        const today = new Date().toISOString().split('T')[0];
        const completedResponse = await api.get('/rentals/completed', {
          params: { 
            shift_id: shift.id,
            date: today
          }
        });
        
        if (completedResponse.success) {
          const completed = completedResponse.data || [];
          todayRentals = completed.length;
          todayRevenue = completed.reduce((sum, r) => 
            sum + (parseFloat(r.final_amount) || 0), 0
          );
        }
      } catch (error) {
        console.warn('⚠️ فشل جلب التأجيرات المكتملة:', error.message);
      }
      
      // تحديث الإحصائيات
      setStats({
        availableGames: availableCount,
        activeRentals: activeCount,
        todayRevenue: todayRevenue,
        todayRentals: todayRentals
      });
      
    } catch (error) {
      console.error('❌ خطأ في تحميل البيانات:', error);
      setError('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // بدء شيفت جديد
  const handleStartShift = async () => {
    try {
      setLoading(true);
      const response = await api.post('/shifts/start');
      
      if (response.success) {
        setCurrentShift(response.data);
        await loadDashboardData();
      } else {
        alert('❌ فشل بدء الشيفت');
      }
    } catch (error) {
      console.error('🔥 خطأ:', error);
      alert('حدث خطأ في بدء الشيفت');
    } finally {
      setLoading(false);
    }
  };

  // التحميل الأولي
  useEffect(() => {
    loadDashboardData();
    
    // تحديث كل 30 ثانية
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="employee-dashboard-loading">
        <Loader2 className="spinner" size={48} />
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="employee-dashboard">
      {/* رأس الصفحة */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            <Activity size={32} />
            لوحة التحكم
          </h1>
          <p className="dashboard-subtitle">
            مرحباً {user?.name || 'موظف'} 
            {user?.branch_name && ` - ${user.branch_name}`}
          </p>
        </div>
        
        <div className="header-actions">
          <button 
            onClick={loadDashboardData}
            className="btn-refresh"
            title="تحديث"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="error-message">
          <Bell size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* حالة الشيفت */}
      <div className="shift-status">
        {currentShift ? (
          <div className="shift-active">
            <div className="shift-info">
              <Clock size={20} />
              <div>
                <span className="shift-label">الشيفت نشط</span>
                <span className="shift-time">
                  بدأ في {formatTime(currentShift.start_time)}
                </span>
              </div>
            </div>
            <Link to="/employee/rentals" className="btn-primary">
              <ShoppingCart size={18} />
              صفحة التأجير
            </Link>
          </div>
        ) : (
          <div className="shift-inactive">
            <span>لا يوجد شيفت نشط</span>
            <button onClick={handleStartShift} className="btn-start">
              <Zap size={18} />
              بدء شيفت جديد
            </button>
          </div>
        )}
      </div>

      {/* الإحصائيات الأساسية - 4 بطاقات فقط */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon games">
            <Gamepad2 size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.availableGames}</span>
            <span className="stat-label">ألعاب متاحة</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <Zap size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.activeRentals}</span>
            <span className="stat-label">تأجيرات نشطة</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.todayRentals}</span>
            <span className="stat-label">تأجيرات اليوم</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{formatCurrency(stats.todayRevenue)}</span>
            <span className="stat-label">إيراد اليوم</span>
          </div>
        </div>
      </div>

      {/* أزرار التنقل السريع */}
      <div className="quick-actions">
        <Link 
          to="/employee/rentals" 
          className={`quick-action ${!currentShift ? 'disabled' : ''}`}
          onClick={(e) => {
            if (!currentShift) {
              e.preventDefault();
              alert('⚠️ يجب بدء شيفت أولاً');
            }
          }}
        >
          <ShoppingCart size={24} />
          <div>
            <h3>تأجير جديد</h3>
            <p>بدء تأجير لعبة</p>
          </div>
          <ChevronRight size={20} />
        </Link>

        <Link 
          to="/employee/rentals?tab=active" 
          className={`quick-action ${!currentShift ? 'disabled' : ''}`}
          onClick={(e) => {
            if (!currentShift) {
              e.preventDefault();
              alert('⚠️ يجب بدء شيفت أولاً');
            }
          }}
        >
          <Clock size={24} />
          <div>
            <h3>تأجيرات نشطة</h3>
            <p>{stats.activeRentals} تأجير جاري</p>
          </div>
          <ChevronRight size={20} />
        </Link>

        <Link 
          to="/employee/rentals?tab=completed" 
          className={`quick-action ${!currentShift ? 'disabled' : ''}`}
          onClick={(e) => {
            if (!currentShift) {
              e.preventDefault();
              alert('⚠️ يجب بدء شيفت أولاً');
            }
          }}
        >
          <CheckCircle size={24} />
          <div>
            <h3>تأجيرات مكتملة</h3>
            <p>{stats.todayRentals} تأجير اليوم</p>
          </div>
          <ChevronRight size={20} />
        </Link>
      </div>

      {/* معلومات سريعة */}
      <div className="info-card">
        <h3>معلومات سريعة</h3>
        <div className="info-grid">
          <div>
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('ar-EG')}</span>
          </div>
          <div>
            <User size={16} />
            <span>{user?.name || 'موظف'}</span>
          </div>
          <div>
            <Building size={16} />
            <span>{user?.branch_name || 'الفرع الرئيسي'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;