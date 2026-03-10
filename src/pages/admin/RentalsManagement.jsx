import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Download, RefreshCw, BarChart, PieChart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// استيراد المكونات
import ShiftsList from '../../components/admin/shifts/ShiftsList';
import ShiftDetailsModal from '../../components/admin/shifts/ShiftDetailsModal';
import RentalsTable from '../../components/admin/rentals/RentalsTable';
import StatsCards from '../../components/admin/stats/StatsCards';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

const RentalsManagement = ({ showCompleted = false, showActive = false }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // State
  const [rentals, setRentals] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [showShiftDetails, setShowShiftDetails] = useState(false);
  const [loading, setLoading] = useState({ rentals: false, shifts: false, details: false });
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: showActive ? 'active' : showCompleted ? 'completed' : 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalRentals: 0,
    totalRevenue: 0,
    averagePerRental: 0,
    activeCount: 0
  });
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [viewMode, setViewMode] = useState('table');

  // Enhanced stats for charts
  const enhancedStats = useMemo(() => ({
    status: { completed: 0, active: 0, cancelled: 0 },
    paymentMethods: { cash: 0, card: 0, wallet: 0 }
  }), []);

  // Load data
  const loadRentals = useCallback(async () => {
    setLoading(prev => ({ ...prev, rentals: true }));
    try {
      const response = await api.getRentals({ ...filters, search: searchTerm });
      if (response?.success) {
        setRentals(response.data || []);
        // Update stats here
      }
    } catch (error) {
      setToast({ show: true, type: 'error', message: 'فشل تحميل التأجيرات' });
    } finally {
      setLoading(prev => ({ ...prev, rentals: false }));
    }
  }, [filters, searchTerm]);

  const loadShifts = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(prev => ({ ...prev, shifts: true }));
    try {
      const response = await api.getShifts(filters);
      if (response?.success) setShifts(response.data || []);
    } catch (error) {
      setToast({ show: true, type: 'error', message: 'فشل تحميل الشيفتات' });
    } finally {
      setLoading(prev => ({ ...prev, shifts: false }));
    }
  }, [filters, isAdmin]);

  // Handlers
  const handleViewShiftDetails = useCallback(async (shift) => {
    setSelectedShift(shift);
    setShowShiftDetails(true);
    setLoading(prev => ({ ...prev, details: true }));
    try {
      const response = await api.getShiftDetails(shift.id);
      if (response?.success) {
        setSelectedShift(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      setToast({ show: true, type: 'error', message: 'فشل تحميل التفاصيل' });
    } finally {
      setLoading(prev => ({ ...prev, details: false }));
    }
  }, []);

  const closeShiftDetailsModal = useCallback(() => {
    setShowShiftDetails(false);
    setSelectedShift(null);
  }, []);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(rentals, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `rentals_${new Date().toISOString()}.json`);
    link.click();
  }, [rentals]);

  // Effects
  useEffect(() => {
    loadRentals();
    if (isAdmin) loadShifts();
  }, [loadRentals, loadShifts, isAdmin]);

  return (
    <div className="rentals-management-page">
      {/* Header */}
      <div className="page-header">
        <h1>إدارة التأجيرات</h1>
        <div className="header-actions">
          <Button variant={viewMode === 'table' ? 'primary' : 'secondary'} onClick={() => setViewMode('table')}>
            جدول
          </Button>
          <Button variant={viewMode === 'charts' ? 'primary' : 'secondary'} onClick={() => setViewMode('charts')}>
            رسوم بيانية
          </Button>
          <Button variant="success" onClick={handleExport} icon={Download}>
            تصدير
          </Button>
          <Button variant="secondary" onClick={() => { loadRentals(); loadShifts(); }} icon={RefreshCw}>
            تحديث
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="بحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters">
          <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}>
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
          <input type="date" value={filters.dateFrom} onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))} />
          <input type="date" value={filters.dateTo} onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))} />
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="content-grid">
          <div className="rentals-table-section">
            <h2>التأجيرات</h2>
            <RentalsTable rentals={rentals} loading={loading.rentals} />
          </div>
          {isAdmin && (
            <div className="shifts-section">
              <h2>الشيفتات</h2>
              <ShiftsList shifts={shifts} loading={loading.shifts} onViewDetails={handleViewShiftDetails} />
            </div>
          )}
        </div>
      ) : (
        <div className="charts-section">
          <div className="chart-card">
            <h3>توزيع التأجيرات</h3>
            <div className="chart-placeholder">
              <PieChart size={48} />
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
              <div className="stats-summary">
                <div>نقدي: {enhancedStats.paymentMethods.cash}</div>
                <div>بطاقة: {enhancedStats.paymentMethods.card}</div>
                <div>محفظة: {enhancedStats.paymentMethods.wallet}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ShiftDetailsModal
        show={showShiftDetails}
        onClose={closeShiftDetailsModal}
        shift={selectedShift}
        loading={loading.details}
      />

      {/* Toast */}
      {toast.show && <Toast type={toast.type} message={toast.message} onClose={() => setToast({ show: false })} />}
    </div>
  );
};

export default RentalsManagement;