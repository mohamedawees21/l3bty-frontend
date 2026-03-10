import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar, Filter, Search, Download, RefreshCw,
  Eye, DollarSign, TrendingUp, Users, Gamepad2,
  Clock, CheckCircle, XCircle, AlertCircle,
  BarChart, PieChart, Activity, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

// استيراد المكونات
import ShiftsList from '../../components/rentals/admin/ShiftsList';
import ShiftDetailsModal from '../../components/rentals/admin/ShiftDetailsModal';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Toast from '../../components/ui/Toast';

const RentalsManagement = ({ showCompleted = false, showActive = false }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // حالات البيانات
  const [rentals, setRentals] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [loading, setLoading] = useState({
    rentals: false,
    shifts: false,
    details: false
  });
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    branchId: user?.branch_id || '',
    status: showActive ? 'active' : showCompleted ? 'completed' : 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalRentals: 0,
    totalRevenue: 0,
    averagePerRental: 0,
    cashAmount: 0,
    cardAmount: 0,
    walletAmount: 0,
    completedCount: 0,
    cancelledCount: 0,
    activeCount: 0
  });

  // حالات واجهة المستخدم
  const [showShiftDetails, setShowShiftDetails] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'charts'

  // تحميل التأجيرات
  const loadRentals = useCallback(async () => {
    setLoading(prev => ({ ...prev, rentals: true }));
    try {
      const params = {
        ...filters,
        search: searchTerm || undefined
      };
      
      const response = await api.getRentals(params);
      if (response?.success) {
        setRentals(response.data || []);
        
        // حساب الإحصائيات
        const rentalsData = response.data || [];
        const totalRevenue = rentalsData.reduce((sum, r) => 
          sum + (r.final_amount || r.total_amount || 0), 0
        );
        const cashAmount = rentalsData
          .filter(r => r.payment_method === 'cash')
          .reduce((sum, r) => sum + (r.final_amount || r.total_amount || 0), 0);
        const cardAmount = rentalsData
          .filter(r => r.payment_method === 'card')
          .reduce((sum, r) => sum + (r.final_amount || r.total_amount || 0), 0);
        const walletAmount = rentalsData
          .filter(r => r.payment_method === 'wallet')
          .reduce((sum, r) => sum + (r.final_amount || r.total_amount || 0), 0);

        setStats({
          totalRentals: rentalsData.length,
          totalRevenue,
          averagePerRental: rentalsData.length ? totalRevenue / rentalsData.length : 0,
          cashAmount,
          cardAmount,
          walletAmount,
          completedCount: rentalsData.filter(r => r.status === 'completed').length,
          cancelledCount: rentalsData.filter(r => r.status === 'cancelled').length,
          activeCount: rentalsData.filter(r => r.status === 'active').length
        });
      }
    } catch (error) {
      console.error('خطأ في تحميل التأجيرات:', error);
      setToast({ show: true, type: 'error', message: 'فشل تحميل التأجيرات' });
    } finally {
      setLoading(prev => ({ ...prev, rentals: false }));
    }
  }, [filters, searchTerm]);

  // تحميل الشيفتات
  const loadShifts = useCallback(async () => {
    setLoading(prev => ({ ...prev, shifts: true }));
    try {
      const params = {
        branch_id: filters.branchId || undefined,
        date_from: filters.dateFrom || undefined,
        date_to: filters.dateTo || undefined
      };
      
      const response = await api.getShifts(params);
      if (response?.success) {
        setShifts(response.data || []);
      }
    } catch (error) {
      console.error('خطأ في تحميل الشيفتات:', error);
      setToast({ show: true, type: 'error', message: 'فشل تحميل الشيفتات' });
    } finally {
      setLoading(prev => ({ ...prev, shifts: false }));
    }
  }, [filters]);

  // عرض تفاصيل الشيفت
  const handleViewShiftDetails = useCallback(async (shift) => {
    setSelectedShift(shift);
    setShowShiftDetails(true);
    
    setLoading(prev => ({ ...prev, details: true }));
    try {
      const response = await api.getShiftDetails(shift.id);
      if (response?.success) {
        setSelectedShift(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (error) {
      console.error('خطأ في تحميل تفاصيل الشيفت:', error);
      setToast({ show: true, type: 'error', message: 'فشل تحميل تفاصيل الشيفت' });
    } finally {
      setLoading(prev => ({ ...prev, details: false }));
    }
  }, []);

  const closeShiftDetailsModal = useCallback(() => {
    setShowShiftDetails(false);
    setSelectedShift(null);
  }, []);

  // تحميل البيانات عند تغيير الفلاتر
  useEffect(() => {
    loadRentals();
    if (isAdmin) {
      loadShifts();
    }
  }, [loadRentals, loadShifts, isAdmin]);

  // تصدير البيانات
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(rentals, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `rentals_${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [rentals]);

  // حساب الإحصائيات المحسنة للرسوم البيانية
  const enhancedStats = useMemo(() => {
    const dailyStats = {};
    const paymentMethodStats = {
      cash: 0,
      card: 0,
      wallet: 0
    };
    const statusStats = {
      completed: 0,
      active: 0,
      cancelled: 0
    };

    rentals.forEach(rental => {
      // إحصائيات يومية
      const date = new Date(rental.start_time).toLocaleDateString('ar-EG');
      dailyStats[date] = (dailyStats[date] || 0) + 1;

      // إحصائيات طرق الدفع
      if (rental.payment_method) {
        paymentMethodStats[rental.payment_method] = 
          (paymentMethodStats[rental.payment_method] || 0) + 1;
      }

      // إحصائيات الحالات
      if (rental.status) {
        statusStats[rental.status] = (statusStats[rental.status] || 0) + 1;
      }
    });

    return {
      daily: Object.entries(dailyStats).map(([date, count]) => ({ date, count })),
      paymentMethods: paymentMethodStats,
      status: statusStats
    };
  }, [rentals]);

  return (
    <div className="rentals-management-page">
      {/* رأس الصفحة */}
      <div className="page-header">
        <h1>
          <Calendar size={24} />
          إدارة التأجيرات
        </h1>
        
        <div className="header-actions">
          <Button 
            variant={viewMode === 'table' ? 'primary' : 'secondary'}
            size="small"
            onClick={() => setViewMode('table')}
          >
            جدول
          </Button>
          <Button 
            variant={viewMode === 'charts' ? 'primary' : 'secondary'}
            size="small"
            onClick={() => setViewMode('charts')}
          >
            رسوم بيانية
          </Button>
          <Button 
            variant="success" 
            size="small"
            onClick={handleExport}
            icon={Download}
          >
            تصدير
          </Button>
          <Button 
            variant="secondary" 
            size="small"
            onClick={() => {
              loadRentals();
              if (isAdmin) loadShifts();
            }}
            icon={RefreshCw}
            loading={loading.rentals || loading.shifts}
          >
            تحديث
          </Button>
        </div>
      </div>

      {/* فلاتر البحث */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="بحث برقم التأجير أو اسم العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            className="filter-date"
            placeholder="من تاريخ"
          />

          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            className="filter-date"
            placeholder="إلى تاريخ"
          />

          {isAdmin && (
            <select
              value={filters.branchId}
              onChange={(e) => setFilters(prev => ({ ...prev, branchId: e.target.value }))}
              className="filter-select"
            >
              <option value="">جميع الفروع</option>
              {/* سيتم ملؤها من API الفروع */}
            </select>
          )}
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">إجمالي التأجيرات</span>
            <span className="stat-value">{stats.totalRentals}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">إجمالي الإيرادات</span>
            <span className="stat-value">{formatCurrency(stats.totalRevenue)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon average">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">متوسط التأجير</span>
            <span className="stat-value">{formatCurrency(stats.averagePerRental)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">نشط حالياً</span>
            <span className="stat-value">{stats.activeCount}</span>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي حسب وضع العرض */}
      {viewMode === 'table' ? (
        <div className="content-grid">
          {/* جدول التأجيرات */}
          <div className="rentals-table-section">
            <h2>التأجيرات</h2>
            {loading.rentals ? (
              <Spinner />
            ) : (
              <table className="rentals-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>العميل</th>
                    <th>الألعاب</th>
                    <th>المدة</th>
                    <th>المبلغ</th>
                    <th>الحالة</th>
                    <th>طريقة الدفع</th>
                    <th>التاريخ</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.map(rental => (
                    <tr key={rental.id}>
                      <td>#{rental.rental_number || rental.id}</td>
                      <td>{rental.customer_name}</td>
                      <td>
                        {rental.items?.map(item => item.game_name).join(', ')}
                      </td>
                      <td>{rental.duration_minutes || 15} د</td>
                      <td>{formatCurrency(rental.final_amount || rental.total_amount || 0)}</td>
                      <td>
                        <span className={`status-badge ${rental.status}`}>
                          {rental.status === 'active' ? 'نشط' :
                           rental.status === 'completed' ? 'مكتمل' :
                           rental.status === 'cancelled' ? 'ملغي' : rental.status}
                        </span>
                      </td>
                      <td>
                        {rental.payment_method === 'cash' ? 'نقدي' :
                         rental.payment_method === 'card' ? 'بطاقة' :
                         rental.payment_method === 'wallet' ? 'محفظة' : '-'}
                      </td>
                      <td>{formatDateTime(rental.start_time)}</td>
                      <td>
                        <button className="action-btn" title="عرض التفاصيل">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* قائمة الشيفتات (للمدير فقط) */}
          {isAdmin && (
            <div className="shifts-section">
              <h2>الشيفتات</h2>
              <ShiftsList 
                shifts={shifts}
                loading={loading.shifts}
                onViewDetails={handleViewShiftDetails}
              />
            </div>
          )}
        </div>
      ) : (
        // وضع الرسوم البيانية
        <div className="charts-section">
          <div className="chart-card">
            <h3>توزيع التأجيرات حسب الحالة</h3>
            <div className="chart-placeholder">
              <PieChart size={48} />
              <p>قيد التطوير - سيتم إضافة رسم بياني دائري</p>
              <div className="stats-summary">
                <div>مكتمل: {enhancedStats.status.completed}</div>
                <div>نشط: {enhancedStats.status.active}</div>
                <div>ملغي: {enhancedStats.status.cancelled}</div>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h3>طرق الدفع</h3>
            <div className="chart-placeholder">
              <BarChart size={48} />
              <p>قيد التطوير - سيتم إضافة رسم بياني</p>
              <div className="stats-summary">
                <div>نقدي: {enhancedStats.paymentMethods.cash}</div>
                <div>بطاقة: {enhancedStats.paymentMethods.card}</div>
                <div>محفظة: {enhancedStats.paymentMethods.wallet}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال تفاصيل الشيفت */}
      <ShiftDetailsModal
        show={showShiftDetails}
        onClose={closeShiftDetailsModal}
        shift={selectedShift}
        loading={loading.details}
      />

      {/* تنبيهات */}
      {toast.show && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ show: false, type: '', message: '' })}
        />
      )}
    </div>
  );
};

export default RentalsManagement;