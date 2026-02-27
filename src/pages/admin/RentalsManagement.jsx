import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Building, Clock, Users, DollarSign, Calendar,
  ChevronDown, Filter, RefreshCw, Eye, X,
  BarChart3, PieChart, TrendingUp, Activity,
  Zap, CheckCircle, XCircle, Loader2, AlertCircle,
  User, Phone, Gamepad2, CreditCard, Download
} from 'lucide-react';
import api from '../../services/api';
import './ShiftStatistics.css';

const ShiftStatistics = () => {
  // ==================== الحالات الأساسية ====================
  const [loading, setLoading] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState(null);
  
  // بيانات الفروع
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  // بيانات الشيفتات
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  
  // إحصائيات الشيفت
  const [shiftStats, setShiftStats] = useState({
    shift: null,
    rentals: [],
    activeRentals: [],
    completedRentals: [],
    stats: {
      totalRentals: 0,
      activeCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      totalRevenue: 0,
      cashRevenue: 0,
      cardRevenue: 0,
      averageRentalTime: 0,
      peakHour: null,
      topGame: null,
      openTimeCount: 0,
      fixedTimeCount: 0
    }
  });

  // حالة النوافذ
  const [showRentalDetails, setShowRentalDetails] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // overview, rentals, detailed

  // ==================== تحميل الفروع ====================
  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getBranches();
      
      if (response.success && response.data) {
        setBranches(response.data);
        
        // تحديد الفرع الافتراضي للمستخدم
        const currentUser = api.getCurrentUser();
        if (currentUser?.branch_id) {
          const userBranch = response.data.find(b => b.id === currentUser.branch_id);
          if (userBranch) {
            setSelectedBranch(userBranch);
          }
        }
      } else {
        setError('فشل تحميل الفروع');
      }
    } catch (error) {
      console.error('خطأ في تحميل الفروع:', error);
      setError('حدث خطأ في تحميل الفروع');
    } finally {
      setLoading(false);
    }
  };

  // ==================== تحميل الشيفتات ====================
  const loadShifts = useCallback(async (branchId) => {
    if (!branchId) return;
    
    try {
      setLoadingShifts(true);
      setError(null);
      
      const response = await api.getShifts({
        branch_id: branchId,
        limit: 30,
        order_by: 'start_time',
        order_direction: 'DESC'
      });
      
      if (response.success && response.data) {
        // معالجة الشيفتات وإضافة معلومات إضافية
        const processedShifts = response.data.map(shift => ({
          ...shift,
          duration_hours: shift.start_time && shift.end_time ?
            Math.round((new Date(shift.end_time) - new Date(shift.start_time)) / (1000 * 60 * 60) * 10) / 10 : null,
          is_active: shift.status === 'نشط' || shift.status === 'active'
        }));
        
        setShifts(processedShifts);
        
        // إعادة تعيين الشيفت المحدد
        setSelectedShift(null);
        setShiftStats({
          shift: null,
          rentals: [],
          activeRentals: [],
          completedRentals: [],
          stats: {
            totalRentals: 0,
            activeCount: 0,
            completedCount: 0,
            cancelledCount: 0,
            totalRevenue: 0,
            cashRevenue: 0,
            cardRevenue: 0,
            averageRentalTime: 0,
            peakHour: null,
            topGame: null,
            openTimeCount: 0,
            fixedTimeCount: 0
          }
        });
      } else {
        setShifts([]);
      }
    } catch (error) {
      console.error('خطأ في تحميل الشيفتات:', error);
      setError('حدث خطأ في تحميل الشيفتات');
      setShifts([]);
    } finally {
      setLoadingShifts(false);
    }
  }, []);

  // تحميل الشيفتات عند اختيار فرع
  useEffect(() => {
    if (selectedBranch) {
      loadShifts(selectedBranch.id);
    }
  }, [selectedBranch, loadShifts]);

  // ==================== تحميل إحصائيات الشيفت ====================
  const loadShiftStats = useCallback(async (shift) => {
    if (!shift) return;
    
    try {
      setLoadingStats(true);
      setError(null);
      
      console.log(`📊 تحميل إحصائيات الشيفت #${shift.id}`);
      
      // 1. جلب جميع تأجيرات الشيفت
      const rentalsResponse = await api.getRentals({
        shift_id: shift.id,
        branch_id: shift.branch_id,
        limit: 500
      });
      
      // 2. جلب التأجيرات النشطة
      const activeResponse = await api.getActiveRentalsForShift(shift.id, shift.branch_id);
      
      // 3. جلب التأجيرات المكتملة
      const completedResponse = await api.getCompletedRentalsForShift(shift.id, shift.branch_id);
      
      let allRentals = [];
      let activeRentals = [];
      let completedRentals = [];
      
      if (rentalsResponse.success && rentalsResponse.data) {
        allRentals = rentalsResponse.data;
      }
      
      if (activeResponse.success && activeResponse.data) {
        activeRentals = activeResponse.data;
      }
      
      if (completedResponse.success && completedResponse.data) {
        completedRentals = completedResponse.data;
      }
      
      // حساب الإحصائيات المتقدمة
      const stats = calculateShiftStats(shift, allRentals, activeRentals, completedRentals);
      
      setShiftStats({
        shift: shift,
        rentals: allRentals,
        activeRentals: activeRentals,
        completedRentals: completedRentals,
        stats: stats
      });
      
    } catch (error) {
      console.error('خطأ في تحميل إحصائيات الشيفت:', error);
      setError('حدث خطأ في تحميل إحصائيات الشيفت');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ==================== حساب إحصائيات الشيفت ====================
  const calculateShiftStats = (shift, allRentals, activeRentals, completedRentals) => {
    // إحصائيات أساسية
    const totalRentals = allRentals.length;
    const activeCount = activeRentals.length;
    const completedCount = completedRentals.length;
    
    // التأجيرات الملغاة
    const cancelledRentals = allRentals.filter(r => 
      r.status === 'ملغي' || r.status?.toLowerCase() === 'cancelled'
    );
    const cancelledCount = cancelledRentals.length;
    
    // الإيرادات
    let totalRevenue = 0;
    let cashRevenue = 0;
    let cardRevenue = 0;
    
    completedRentals.forEach(rental => {
      const amount = parseFloat(rental.final_amount) || parseFloat(rental.total_amount) || 0;
      totalRevenue += amount;
      
      if (rental.payment_method === 'كاش' || rental.payment_method === 'cash') {
        cashRevenue += amount;
      } else if (rental.payment_method === 'بطاقة' || rental.payment_method === 'card') {
        cardRevenue += amount;
      }
    });
    
    // إيرادات التأجيرات الثابتة النشطة (المدفوعة مسبقاً)
    activeRentals.forEach(rental => {
      if (rental.rental_type === 'fixed' || rental.is_open_time === 0) {
        const amount = parseFloat(rental.paid_amount) || parseFloat(rental.total_amount) || 0;
        totalRevenue += amount;
        
        if (rental.payment_method === 'كاش' || rental.payment_method === 'cash') {
          cashRevenue += amount;
        } else {
          cardRevenue += amount;
        }
      }
    });
    
    // أنواع التأجيرات
    const openTimeCount = allRentals.filter(r => 
      r.rental_type === 'open' || r.is_open_time === 1
    ).length;
    
    const fixedTimeCount = allRentals.filter(r => 
      r.rental_type === 'fixed' || r.is_open_time === 0
    ).length;
    
    // متوسط مدة التأجير
    let totalDuration = 0;
    let rentalsWithDuration = 0;
    
    completedRentals.forEach(rental => {
      if (rental.actual_duration_minutes) {
        totalDuration += rental.actual_duration_minutes;
        rentalsWithDuration++;
      } else if (rental.start_time && rental.end_time) {
        const duration = (new Date(rental.end_time) - new Date(rental.start_time)) / (1000 * 60);
        totalDuration += duration;
        rentalsWithDuration++;
      }
    });
    
    const averageRentalTime = rentalsWithDuration > 0 
      ? Math.round(totalDuration / rentalsWithDuration) 
      : 0;
    
    // أكثر لعبة تأجيراً
    const gameCounts = {};
    allRentals.forEach(rental => {
      const gameName = rental.game_name || 'غير معروفة';
      gameCounts[gameName] = (gameCounts[gameName] || 0) + 1;
    });
    
    let topGame = null;
    let maxCount = 0;
    
    Object.entries(gameCounts).forEach(([game, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topGame = game;
      }
    });
    
    // أكثر ساعة نشاطاً
    const hourCounts = {};
    allRentals.forEach(rental => {
      if (rental.start_time) {
        const hour = new Date(rental.start_time).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });
    
    let peakHour = null;
    let maxHourCount = 0;
    
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxHourCount) {
        maxHourCount = count;
        peakHour = parseInt(hour);
      }
    });
    
    return {
      totalRentals,
      activeCount,
      completedCount,
      cancelledCount,
      totalRevenue,
      cashRevenue,
      cardRevenue,
      averageRentalTime,
      peakHour,
      topGame,
      openTimeCount,
      fixedTimeCount,
      gameCounts,
      hourCounts
    };
  };

  // ==================== تغيير الفرع ====================
  const handleBranchChange = (branch) => {
    setSelectedBranch(branch);
  };

  // ==================== اختيار شيفت ====================
  const handleShiftSelect = (shift) => {
    setSelectedShift(shift);
    loadShiftStats(shift);
  };

  // ==================== دوال مساعدة ====================
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(num).replace('EGP', 'ج.م');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes || minutes < 0) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours} ساعة ${mins > 0 ? `و ${mins} دقيقة` : ''}`;
    }
    return `${mins} دقيقة`;
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase?.()) {
      case 'نشط':
      case 'active':
        return <span className="badge badge-active">🟢 نشط</span>;
      case 'مكتمل':
      case 'completed':
        return <span className="badge badge-completed">✅ مكتمل</span>;
      case 'ملغي':
      case 'cancelled':
        return <span className="badge badge-cancelled">❌ ملغي</span>;
      default:
        return <span className="badge">{status || 'غير معروف'}</span>;
    }
  };

  const getRentalType = (rental) => {
    if (rental.rental_type === 'open' || rental.is_open_time === 1) {
      return 'open';
    }
    return 'fixed';
  };

  const getRentalTypeBadge = (rental) => {
    const type = getRentalType(rental);
    return type === 'open' ? 
      <span className="badge badge-open">⏱️ وقت مفتوح</span> : 
      <span className="badge badge-fixed">⏰ وقت ثابت</span>;
  };

  // ==================== تحديث البيانات ====================
  const refreshData = () => {
    if (selectedShift) {
      loadShiftStats(selectedShift);
    } else if (selectedBranch) {
      loadShifts(selectedBranch.id);
    } else {
      loadBranches();
    }
  };

  // ==================== عرض تفاصيل تأجير ====================
  const viewRentalDetails = (rental) => {
    setSelectedRental(rental);
    setShowRentalDetails(true);
  };

  // ==================== تصدير التقرير ====================
  const exportReport = () => {
    if (!selectedShift || !shiftStats) return;
    
    const reportData = {
      shift: selectedShift,
      stats: shiftStats.stats,
      rentals: shiftStats.rentals,
      generatedAt: new Date().toISOString()
    };
    
    console.log('📄 تصدير تقرير الشيفت:', reportData);
    alert('سيتم تصدير تقرير الشيفت قريباً...');
  };

  // ==================== واجهة المستخدم ====================
  return (
    <div className="shift-statistics-container" dir="rtl">
      {/* رأس الصفحة */}
      <div className="page-header">
        <h1>
          <BarChart3 size={28} />
          إحصائيات الشيفتات
        </h1>
        
        <button 
          className="btn btn-outline"
          onClick={refreshData}
          disabled={loading || loadingShifts || loadingStats}
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          تحديث
        </button>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="close-btn">✕</button>
        </div>
      )}

      {/* خطوات الاختيار */}
      <div className="selection-steps">
        <div className={`step ${selectedBranch ? 'completed' : 'active'}`}>
          <div className="step-number">1</div>
          <div className="step-content">
            <span className="step-label">اختر الفرع</span>
            {selectedBranch && (
              <span className="step-value">{selectedBranch.name}</span>
            )}
          </div>
        </div>
        
        <div className={`step ${selectedShift ? 'completed' : selectedBranch ? 'active' : 'disabled'}`}>
          <div className="step-number">2</div>
          <div className="step-content">
            <span className="step-label">اختر الشيفت</span>
            {selectedShift && (
              <span className="step-value">
                {selectedShift.shift_number || `#${selectedShift.id}`}
              </span>
            )}
          </div>
        </div>
        
        <div className={`step ${selectedShift ? 'active' : 'disabled'}`}>
          <div className="step-number">3</div>
          <div className="step-content">
            <span className="step-label">عرض الإحصائيات</span>
          </div>
        </div>
      </div>

      {/* اختيار الفرع */}
      <div className="branches-section">
        <h2>
          <Building size={20} />
          اختر الفرع
        </h2>
        
        {loading && !branches.length ? (
          <div className="loading-state">
            <Loader2 size={32} className="spinning" />
            <p>جاري تحميل الفروع...</p>
          </div>
        ) : (
          <div className="branches-grid">
            {branches.map(branch => (
              <div
                key={branch.id}
                className={`branch-card ${selectedBranch?.id === branch.id ? 'selected' : ''}`}
                onClick={() => handleBranchChange(branch)}
              >
                <div className="branch-icon">
                  <Building size={24} />
                </div>
                <div className="branch-info">
                  <h3>{branch.name}</h3>
                  <p>{branch.city || 'القاهرة'}</p>
                </div>
                {branch.is_active === 0 && (
                  <span className="branch-inactive">غير نشط</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* اختيار الشيفت */}
      {selectedBranch && (
        <div className="shifts-section">
          <div className="section-header">
            <h2>
              <Clock size={20} />
              شيفتات {selectedBranch.name}
            </h2>
            <span className="shifts-count">
              {shifts.length} شيفت
            </span>
          </div>
          
          {loadingShifts ? (
            <div className="loading-state">
              <Loader2 size={32} className="spinning" />
              <p>جاري تحميل الشيفتات...</p>
            </div>
          ) : shifts.length === 0 ? (
            <div className="empty-state">
              <Clock size={48} />
              <h3>لا توجد شيفتات</h3>
              <p>لم يتم العثور على شيفتات لهذا الفرع</p>
            </div>
          ) : (
            <div className="shifts-list">
              {shifts.map(shift => (
                <div
                  key={shift.id}
                  className={`shift-item ${selectedShift?.id === shift.id ? 'selected' : ''} ${shift.is_active ? 'active' : ''}`}
                  onClick={() => handleShiftSelect(shift)}
                >
                  <div className="shift-header">
                    <span className="shift-number">
                      {shift.shift_number || `شيفت #${shift.id}`}
                    </span>
                    {shift.is_active && (
                      <span className="shift-active-badge">نشط الآن</span>
                    )}
                  </div>
                  
                  <div className="shift-details">
                    <div className="shift-detail">
                      <User size={14} />
                      <span>{shift.employee_name}</span>
                    </div>
                    
                    <div className="shift-detail">
                      <Calendar size={14} />
                      <span>{formatDateTime(shift.start_time)}</span>
                    </div>
                    
                    {shift.end_time && (
                      <div className="shift-detail">
                        <Clock size={14} />
                        <span>إلى {formatTime(shift.end_time)}</span>
                      </div>
                    )}
                    
                    {shift.duration_hours && (
                      <div className="shift-detail">
                        <Activity size={14} />
                        <span>{shift.duration_hours} ساعة</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="shift-stats">
                    <div className="stat">
                      <DollarSign size={14} />
                      <span>{formatCurrency(shift.total_revenue || 0)}</span>
                    </div>
                    <div className="stat">
                      <BarChart3 size={14} />
                      <span>{shift.total_rentals || 0} تأجير</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* إحصائيات الشيفت */}
      {selectedShift && loadingStats ? (
        <div className="loading-state full-width">
          <Loader2 size={48} className="spinning" />
          <p>جاري تحميل إحصائيات الشيفت...</p>
        </div>
      ) : selectedShift && shiftStats.shift && (
        <div className="shift-stats-container">
          {/* رأس إحصائيات الشيفت */}
          <div className="stats-header">
            <h2>
              <BarChart3 size={20} />
              إحصائيات الشيفت
              {shiftStats.shift.shift_number && (
                <span className="shift-number-badge">{shiftStats.shift.shift_number}</span>
              )}
            </h2>
            
            <div className="header-actions">
              <button 
                className="btn btn-outline btn-sm"
                onClick={exportReport}
              >
                <Download size={16} />
                تصدير تقرير
              </button>
            </div>
          </div>

          {/* معلومات الشيفت الأساسية */}
          <div className="shift-info-cards">
            <div className="info-card">
              <div className="info-icon">
                <User size={20} />
              </div>
              <div className="info-content">
                <span className="info-label">الموظف</span>
                <span className="info-value">{shiftStats.shift.employee_name}</span>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <Building size={20} />
              </div>
              <div className="info-content">
                <span className="info-label">الفرع</span>
                <span className="info-value">{shiftStats.shift.branch_name}</span>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <Calendar size={20} />
              </div>
              <div className="info-content">
                <span className="info-label">بداية الشيفت</span>
                <span className="info-value">{formatDateTime(shiftStats.shift.start_time)}</span>
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-icon">
                <Clock size={20} />
              </div>
              <div className="info-content">
                <span className="info-label">نهاية الشيفت</span>
                <span className="info-value">
                  {shiftStats.shift.end_time ? formatDateTime(shiftStats.shift.end_time) : 'لم ينته بعد'}
                </span>
              </div>
            </div>
          </div>

          {/* بطاقات الإحصائيات الرئيسية */}
          <div className="main-stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <span className="stat-label">إجمالي التأجيرات</span>
                <span className="stat-value">{shiftStats.stats.totalRentals}</span>
              </div>
            </div>
            
            <div className="stat-card active">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <span className="stat-label">تأجيرات نشطة</span>
                <span className="stat-value">{shiftStats.stats.activeCount}</span>
              </div>
            </div>
            
            <div className="stat-card completed">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <span className="stat-label">تأجيرات مكتملة</span>
                <span className="stat-value">{shiftStats.stats.completedCount}</span>
              </div>
            </div>
            
            <div className="stat-card cancelled">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <span className="stat-label">تأجيرات ملغاة</span>
                <span className="stat-value">{shiftStats.stats.cancelledCount}</span>
              </div>
            </div>
          </div>

          {/* إحصائيات الإيرادات */}
          <div className="revenue-stats">
            <h3>إحصائيات الإيرادات</h3>
            
            <div className="revenue-grid">
              <div className="revenue-card total">
                <div className="revenue-icon">💰</div>
                <div className="revenue-content">
                  <span className="revenue-label">إجمالي الإيرادات</span>
                  <span className="revenue-value">{formatCurrency(shiftStats.stats.totalRevenue)}</span>
                </div>
              </div>
              
              <div className="revenue-card cash">
                <div className="revenue-icon">💵</div>
                <div className="revenue-content">
                  <span className="revenue-label">إيرادات نقدية</span>
                  <span className="revenue-value">{formatCurrency(shiftStats.stats.cashRevenue)}</span>
                </div>
              </div>
              
              <div className="revenue-card card">
                <div className="revenue-icon">💳</div>
                <div className="revenue-content">
                  <span className="revenue-label">إيرادات بطاقة</span>
                  <span className="revenue-value">{formatCurrency(shiftStats.stats.cardRevenue)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* تحليلات متقدمة */}
          <div className="advanced-analytics">
            <h3>تحليلات متقدمة</h3>
            
            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="analytics-header">
                  <Clock size={18} />
                  <span>متوسط مدة التأجير</span>
                </div>
                <div className="analytics-value">
                  {formatDuration(shiftStats.stats.averageRentalTime)}
                </div>
              </div>
              
              <div className="analytics-card">
                <div className="analytics-header">
                  <Gamepad2 size={18} />
                  <span>أكثر لعبة تأجيراً</span>
                </div>
                <div className="analytics-value">
                  {shiftStats.stats.topGame || 'لا توجد بيانات'}
                </div>
              </div>
              
              <div className="analytics-card">
                <div className="analytics-header">
                  <Activity size={18} />
                  <span>أكثر ساعة نشاطاً</span>
                </div>
                <div className="analytics-value">
                  {shiftStats.stats.peakHour !== null ? 
                    `${shiftStats.stats.peakHour}:00 - ${shiftStats.stats.peakHour + 1}:00` : 
                    'لا توجد بيانات'}
                </div>
              </div>
              
              <div className="analytics-card">
                <div className="analytics-header">
                  <PieChart size={18} />
                  <span>نسبة الأوقات المفتوحة</span>
                </div>
                <div className="analytics-value">
                  {shiftStats.stats.totalRentals > 0 ?
                    `${Math.round((shiftStats.stats.openTimeCount / shiftStats.stats.totalRentals) * 100)}%` :
                    '0%'}
                </div>
              </div>
            </div>
          </div>

          {/* توزيع أنواع التأجيرات */}
          <div className="distribution-section">
            <h3>توزيع أنواع التأجيرات</h3>
            
            <div className="distribution-bars">
              <div className="distribution-item">
                <div className="distribution-label">
                  <span>⏱️ وقت مفتوح</span>
                  <span>{shiftStats.stats.openTimeCount}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress open-time"
                    style={{ 
                      width: shiftStats.stats.totalRentals > 0 ? 
                        `${(shiftStats.stats.openTimeCount / shiftStats.stats.totalRentals) * 100}%` : '0%'
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="distribution-item">
                <div className="distribution-label">
                  <span>⏰ وقت ثابت</span>
                  <span>{shiftStats.stats.fixedTimeCount}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress fixed-time"
                    style={{ 
                      width: shiftStats.stats.totalRentals > 0 ? 
                        `${(shiftStats.stats.fixedTimeCount / shiftStats.stats.totalRentals) * 100}%` : '0%'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* التبويبات */}
          <div className="tabs-section">
            <div className="tabs-header">
              <button 
                className={`tab-btn ${viewMode === 'overview' ? 'active' : ''}`}
                onClick={() => setViewMode('overview')}
              >
                نظرة عامة
              </button>
              <button 
                className={`tab-btn ${viewMode === 'active' ? 'active' : ''}`}
                onClick={() => setViewMode('active')}
              >
                التأجيرات النشطة ({shiftStats.activeRentals.length})
              </button>
              <button 
                className={`tab-btn ${viewMode === 'completed' ? 'active' : ''}`}
                onClick={() => setViewMode('completed')}
              >
                التأجيرات المكتملة ({shiftStats.completedRentals.length})
              </button>
              <button 
                className={`tab-btn ${viewMode === 'detailed' ? 'active' : ''}`}
                onClick={() => setViewMode('detailed')}
              >
                جميع التأجيرات ({shiftStats.rentals.length})
              </button>
            </div>
            
            <div className="tab-content">
              {/* نظرة عامة */}
              {viewMode === 'overview' && (
                <div className="overview-tab">
                  {/* إحصائيات سريعة */}
                  <div className="quick-stats">
                    <div className="quick-stat-item">
                      <span className="stat-name">إجمالي الوقت</span>
                      <span className="stat-number">
                        {shiftStats.shift.end_time ?
                          formatDuration(Math.round((new Date(shiftStats.shift.end_time) - new Date(shiftStats.shift.start_time)) / (1000 * 60))) :
                          'جاري'
                        }
                      </span>
                    </div>
                    
                    <div className="quick-stat-item">
                      <span className="stat-name">متوسط الإيراد لكل تأجير</span>
                      <span className="stat-number">
                        {shiftStats.stats.completedCount > 0 ?
                          formatCurrency(shiftStats.stats.totalRevenue / shiftStats.stats.completedCount) :
                          formatCurrency(0)
                        }
                      </span>
                    </div>
                    
                    <div className="quick-stat-item">
                      <span className="stat-name">الإيراد لكل ساعة</span>
                      <span className="stat-number">
                        {shiftStats.shift.end_time ?
                          formatCurrency(shiftStats.stats.totalRevenue / 
                            (Math.round((new Date(shiftStats.shift.end_time) - new Date(shiftStats.shift.start_time)) / (1000 * 60 * 60)) || 1)
                          ) :
                          formatCurrency(shiftStats.stats.totalRevenue)
                        }
                      </span>
                    </div>
                  </div>

                  {/* أكثر الألعاب تأجيراً */}
                  {Object.keys(shiftStats.stats.gameCounts || {}).length > 0 && (
                    <div className="top-games">
                      <h4>أكثر الألعاب تأجيراً</h4>
                      <div className="games-list">
                        {Object.entries(shiftStats.stats.gameCounts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([game, count]) => (
                            <div key={game} className="game-item">
                              <span className="game-name">{game}</span>
                              <span className="game-count">{count} تأجير</span>
                              <div className="game-bar">
                                <div 
                                  className="bar-fill"
                                  style={{ 
                                    width: `${(count / shiftStats.stats.totalRentals) * 100}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  {/* توزيع الساعات */}
                  {Object.keys(shiftStats.stats.hourCounts || {}).length > 0 && (
                    <div className="hourly-distribution">
                      <h4>توزيع التأجيرات حسب الساعة</h4>
                      <div className="hour-grid">
                        {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                          <div key={hour} className="hour-item">
                            <span className="hour-label">{hour}:00</span>
                            <div className="hour-bar-container">
                              <div 
                                className="hour-bar"
                                style={{ 
                                  height: `${((shiftStats.stats.hourCounts[hour] || 0) / 
                                    Math.max(...Object.values(shiftStats.stats.hourCounts))) * 40}px` 
                                }}
                              ></div>
                            </div>
                            <span className="hour-count">{shiftStats.stats.hourCounts[hour] || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* التأجيرات النشطة */}
              {viewMode === 'active' && (
                <div className="rentals-list">
                  {shiftStats.activeRentals.length === 0 ? (
                    <div className="empty-state small">
                      <Zap size={32} />
                      <p>لا توجد تأجيرات نشطة</p>
                    </div>
                  ) : (
                    shiftStats.activeRentals.map(rental => (
                      <div key={rental.id} className="rental-item">
                        <div className="rental-header">
                          <span className="rental-number">{rental.rental_number}</span>
                          {getRentalTypeBadge(rental)}
                        </div>
                        
                        <div className="rental-details">
                          <div className="detail">
                            <User size={14} />
                            <span>{rental.customer_name}</span>
                          </div>
                          
                          <div className="detail">
                            <Gamepad2 size={14} />
                            <span>{rental.game_name}</span>
                          </div>
                          
                          <div className="detail">
                            <Clock size={14} />
                            <span>{formatTime(rental.start_time)}</span>
                          </div>
                          
                          {getRentalType(rental) === 'fixed' && (
                            <div className="detail">
                              <DollarSign size={14} />
                              <span>{formatCurrency(rental.paid_amount)}</span>
                            </div>
                          )}
                        </div>
                        
                        <button 
                          className="view-btn"
                          onClick={() => viewRentalDetails(rental)}
                        >
                          <Eye size={14} />
                          عرض التفاصيل
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* التأجيرات المكتملة */}
              {viewMode === 'completed' && (
                <div className="rentals-list">
                  {shiftStats.completedRentals.length === 0 ? (
                    <div className="empty-state small">
                      <CheckCircle size={32} />
                      <p>لا توجد تأجيرات مكتملة</p>
                    </div>
                  ) : (
                    shiftStats.completedRentals.map(rental => (
                      <div key={rental.id} className="rental-item">
                        <div className="rental-header">
                          <span className="rental-number">{rental.rental_number}</span>
                          <span className="rental-amount">{formatCurrency(rental.final_amount)}</span>
                        </div>
                        
                        <div className="rental-details">
                          <div className="detail">
                            <User size={14} />
                            <span>{rental.customer_name}</span>
                          </div>
                          
                          <div className="detail">
                            <Gamepad2 size={14} />
                            <span>{rental.game_name}</span>
                          </div>
                          
                          <div className="detail">
                            <Clock size={14} />
                            <span>{formatTime(rental.start_time)}</span>
                          </div>
                          
                          <div className="detail">
                            <Calendar size={14} />
                            <span>{formatTime(rental.end_time)}</span>
                          </div>
                        </div>
                        
                        <div className="rental-footer">
                          <span className="payment-method">{rental.payment_method || 'كاش'}</span>
                          <button 
                            className="view-btn small"
                            onClick={() => viewRentalDetails(rental)}
                          >
                            <Eye size={12} />
                            عرض
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* جميع التأجيرات */}
              {viewMode === 'detailed' && (
                <div className="rentals-table-container">
                  <table className="rentals-table">
                    <thead>
                      <tr>
                        <th>رقم التأجير</th>
                        <th>العميل</th>
                        <th>اللعبة</th>
                        <th>النوع</th>
                        <th>المبلغ</th>
                        <th>حالة الدفع</th>
                        <th>الحالة</th>
                        <th>الوقت</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {shiftStats.rentals.map(rental => (
                        <tr key={rental.id}>
                          <td>
                            <span className="rental-number-small">{rental.rental_number}</span>
                          </td>
                          <td>{rental.customer_name}</td>
                          <td>{rental.game_name}</td>
                          <td>{getRentalTypeBadge(rental)}</td>
                          <td className="amount">{formatCurrency(rental.final_amount)}</td>
                          <td>{getStatusBadge(rental.payment_status)}</td>
                          <td>{getStatusBadge(rental.status)}</td>
                          <td>{formatTime(rental.start_time)}</td>
                          <td>
                            <button 
                              className="btn-icon small"
                              onClick={() => viewRentalDetails(rental)}
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* نافذة تفاصيل التأجير */}
      {showRentalDetails && selectedRental && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>تفاصيل التأجير</h3>
              <button className="modal-close" onClick={() => setShowRentalDetails(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="rental-detail-header">
                <span className="rental-number-large">{selectedRental.rental_number}</span>
                {getStatusBadge(selectedRental.status)}
              </div>
              
              <div className="details-grid">
                <div className="detail-row">
                  <span className="label">العميل:</span>
                  <span className="value">{selectedRental.customer_name}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">رقم الهاتف:</span>
                  <span className="value">{selectedRental.customer_phone || 'غير متوفر'}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">اللعبة:</span>
                  <span className="value">{selectedRental.game_name}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">نوع التأجير:</span>
                  <span className="value">{getRentalTypeBadge(selectedRental)}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">الموظف:</span>
                  <span className="value">{selectedRental.employee_name}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">الفرع:</span>
                  <span className="value">{selectedRental.branch_name}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">وقت البدء:</span>
                  <span className="value">{formatDateTime(selectedRental.start_time)}</span>
                </div>
                
                {selectedRental.end_time && (
                  <div className="detail-row">
                    <span className="label">وقت الانتهاء:</span>
                    <span className="value">{formatDateTime(selectedRental.end_time)}</span>
                  </div>
                )}
                
                <div className="detail-row">
                  <span className="label">المدة:</span>
                  <span className="value">
                    {selectedRental.actual_duration_minutes || selectedRental.duration_minutes || 0} دقيقة
                  </span>
                </div>
                
                <div className="detail-row amount-row">
                  <span className="label">المبلغ الإجمالي:</span>
                  <span className="value amount">{formatCurrency(selectedRental.total_amount)}</span>
                </div>
                
                <div className="detail-row amount-row">
                  <span className="label">المبلغ النهائي:</span>
                  <span className="value amount">{formatCurrency(selectedRental.final_amount)}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">حالة الدفع:</span>
                  <span className="value">{getStatusBadge(selectedRental.payment_status)}</span>
                </div>
                
                <div className="detail-row">
                  <span className="label">طريقة الدفع:</span>
                  <span className="value">{selectedRental.payment_method || 'كاش'}</span>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowRentalDetails(false)}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftStatistics;