// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Gamepad2, 
  DollarSign, 
  Clock, 
  Calendar,
  ChevronRight,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  X,
  CheckCircle,
  Zap,
  Building,
  Phone,
  Mail,
  MapPin,
  Eye,
  Printer,
  Filter,
  Search,
  Info,
  PieChart,
  Activity,
  Award,
  Target,
  TrendingDown,
  User,
  List,
  Grid,
  AlertTriangle,
  CheckSquare,
  Square,
  Play,
  Pause,
  StopCircle,
  Settings,
  LogOut,
  Hash,
  Layers,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Dashboard.css';

// ==================== دوال المساعدة ====================
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') return '0 ج.م';
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
};

const formatDateTime = (dateString) => {
  if (!dateString) return '--/--/---- --:--';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--/--/---- --:--';
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '--/--/---- --:--';
  }
};

const formatTime = (dateString) => {
  if (!dateString) return '--:--';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '--:--';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '--/--/----';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--/--/----';
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return '--/--/----';
  }
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  return Math.max(0, Math.round((end - start) / (1000 * 60)));
};

const getRentalType = (rental) => {
  if (!rental) return 'fixed';
  
  if (rental.rental_type === 'open' || rental.is_open_time === 1) {
    return 'open';
  }
  
  if (rental.rental_type === 'fixed' || rental.is_open_time === 0) {
    return 'fixed';
  }
  
  if (rental.payment_status === 'عند الإنهاء' || rental.payment_status === 'pending') {
    return 'open';
  }
  
  if (rental.payment_status === 'مدفوع مسبقاً' || rental.payment_status === 'paid') {
    return 'fixed';
  }
  
  return 'fixed';
};

// ==================== المكونات الفرعية (StatCard, etc) ====================
// تعريف StatCard
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon">
      <Icon size={24} />
    </div>
    <div className="stat-content">
      <h3>{title}</h3>
      <p className="stat-value">{value}</p>
      {subtitle && <span className="stat-subtitle">{subtitle}</span>}
    </div>
  </div>
);

// تعريف CurrentUserShiftCard
const CurrentUserShiftCard = ({ shift, stats, onViewDetails }) => (
  <div className="current-shift-card">
    <h3>شيفتك الحالي</h3>
    <div className="shift-details">
      <p>رقم الشيفت: #{shift.id}</p>
      <p>وقت البدء: {formatTime(shift.start_time)}</p>
      <p>الإيرادات: {formatCurrency(stats?.totalRevenue || 0)}</p>
      <p>التأجيرات: {stats?.totalRentals || 0}</p>
    </div>
    <button onClick={() => onViewDetails(shift)}>عرض التفاصيل</button>
  </div>
);

// تعريف AllBranchesActiveRentals
const AllBranchesActiveRentals = ({ rentals, loading, onView }) => (
  <div className="all-rentals-section">
    {loading ? <Loader2 className="spinner" /> : (
      <div className="rentals-grid">
        {rentals.map(rental => (
          <div key={rental.id} className="rental-card" onClick={() => onView(rental)}>
            <p>#{rental.id} - {rental.customer_name}</p>
            <p>{rental.game_name}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

// تعريف AllBranchesCompletedRentals
const AllBranchesCompletedRentals = ({ rentals, loading, onView }) => (
  <div className="all-rentals-section">
    {loading ? <Loader2 className="spinner" /> : (
      <div className="rentals-grid">
        {rentals.map(rental => (
          <div key={rental.id} className="rental-card completed" onClick={() => onView(rental)}>
            <p>#{rental.id} - {rental.customer_name}</p>
            <p>{rental.game_name} - {formatCurrency(rental.total_amount)}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

// تعريف AllBranchesRecentRentals
const AllBranchesRecentRentals = ({ rentals, loading, onView }) => (
  <div className="all-rentals-section">
    {loading ? <Loader2 className="spinner" /> : (
      <div className="rentals-grid">
        {rentals.map(rental => (
          <div key={rental.id} className="rental-card recent" onClick={() => onView(rental)}>
            <p>#{rental.id} - {rental.customer_name}</p>
            <p>{rental.game_name} - {formatTime(rental.start_time)}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

// تعريف ShiftsList
const ShiftsList = ({ shifts, onViewShift }) => (
  <div className="shifts-list">
    {shifts.map(shift => (
      <div key={shift.id} className="shift-item">
        <p>شيفت #{shift.id}</p>
        <p>{formatDateTime(shift.start_time)}</p>
        <button onClick={() => onViewShift(shift)}>عرض</button>
      </div>
    ))}
  </div>
);

// تعريف ShiftDetailsModal
const ShiftDetailsModal = ({ show, onClose, shift, details }) => {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>تفاصيل الشيفت #{shift?.id}</h3>
        <button onClick={onClose}>إغلاق</button>
      </div>
    </div>
  );
};

// ==================== مكون عرض تفاصيل الفرع الموسع ====================
const BranchDetailedCard = React.memo(({ branch, stats, onViewDetails, isExpanded, onToggleExpand }) => {
  return (
    <div className={`dashboard-branch-detailed-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="dashboard-branch-detailed-header" onClick={() => onToggleExpand(branch.id)}>
        <div className="dashboard-branch-detailed-icon">
          <Building size={24} />
        </div>
        <div className="dashboard-branch-detailed-info">
          <h3>{branch.name}</h3>
          <div className="dashboard-branch-detailed-location">
            <MapPin size={14} />
            <span>{branch.city || 'غير محدد'} - {branch.location || ''}</span>
          </div>
        </div>
        <div className="dashboard-branch-detailed-status">
          {branch.is_active === 0 ? (
            <span className="dashboard-branch-status-inactive">غير نشط</span>
          ) : (
            <span className="dashboard-branch-status-active">نشط</span>
          )}
          <button className="dashboard-branch-expand-btn">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      
      <div className="dashboard-branch-detailed-stats">
        <div className="dashboard-branch-stat-item">
          <Gamepad2 size={16} />
          <div className="dashboard-branch-stat-content">
            <span className="dashboard-branch-stat-label">الألعاب</span>
            <span className="dashboard-branch-stat-value">{stats?.games || 0}</span>
          </div>
        </div>
        <div className="dashboard-branch-stat-item">
          <Users size={16} />
          <div className="dashboard-branch-stat-content">
            <span className="dashboard-branch-stat-label">الموظفين</span>
            <span className="dashboard-branch-stat-value">{stats?.employees || 0}</span>
          </div>
        </div>
        <div className="dashboard-branch-stat-item">
          <Zap size={16} />
          <div className="dashboard-branch-stat-content">
            <span className="dashboard-branch-stat-label">تأجيرات نشطة</span>
            <span className="dashboard-branch-stat-value">{stats?.activeRentals || 0}</span>
          </div>
        </div>
        <div className="dashboard-branch-stat-item highlight">
          <DollarSign size={16} />
          <div className="dashboard-branch-stat-content">
            <span className="dashboard-branch-stat-label">إيراد اليوم</span>
            <span className="dashboard-branch-stat-value">{formatCurrency(stats?.todayRevenue || 0)}</span>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="dashboard-branch-detailed-expanded">
          {/* معلومات الاتصال */}
          <div className="dashboard-branch-contact">
            <h4>معلومات الاتصال</h4>
            <div className="dashboard-branch-contact-grid">
              {branch.contact_phone && (
                <div className="dashboard-contact-item">
                  <Phone size={14} />
                  <span>{branch.contact_phone}</span>
                </div>
              )}
              {branch.contact_email && (
                <div className="dashboard-contact-item">
                  <Mail size={14} />
                  <span>{branch.contact_email}</span>
                </div>
              )}
              <div className="dashboard-contact-item">
                <Clock size={14} />
                <span>{branch.opening_time || '09:00'} - {branch.closing_time || '22:00'}</span>
              </div>
            </div>
          </div>
          
          {/* إحصائيات إضافية */}
          <div className="dashboard-branch-additional-stats">
            <div className="dashboard-additional-stat">
              <span className="stat-label">تأجيرات اليوم</span>
              <span className="stat-value">{stats?.todayRentals || 0}</span>
            </div>
            <div className="dashboard-additional-stat">
              <span className="stat-label">إجمالي التأجيرات</span>
              <span className="stat-value">{stats?.totalRentals || 0}</span>
            </div>
            <div className="dashboard-additional-stat">
              <span className="stat-label">ألعاب متاحة</span>
              <span className="stat-value">{stats?.availableGames || 0}</span>
            </div>
            <div className="dashboard-additional-stat">
              <span className="stat-label">ألعاب مؤجرة</span>
              <span className="stat-value">{stats?.rentedGames || 0}</span>
            </div>
          </div>
          
          {/* الشيفتات النشطة في هذا الفرع */}
          {stats?.activeShifts && stats.activeShifts.length > 0 && (
            <div className="dashboard-branch-shifts">
              <h4>الشيفتات النشطة ({stats.activeShifts.length})</h4>
              <div className="dashboard-branch-shifts-list">
                {stats.activeShifts.map(shift => (
                  <div key={shift.id} className="dashboard-branch-shift-item">
                    <div className="shift-item-header">
                      <Hash size={12} />
                      <span>شيفت #{shift.id}</span>
                      <span className="shift-item-employee">{shift.employee_name}</span>
                    </div>
                    <div className="shift-item-details">
                      <span><Clock size={12} /> {formatTime(shift.start_time)}</span>
                      <span><Activity size={12} /> {shift.active_rentals || 0} نشط</span>
                      <span><DollarSign size={12} /> {formatCurrency(shift.total_revenue || 0)}</span>
                    </div>
                    <button 
                      onClick={() => onViewDetails(shift)}
                      className="shift-item-view-btn"
                    >
                      <Eye size={12} />
                      عرض
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* آخر التأجيرات في هذا الفرع */}
          {stats?.recentRentals && stats.recentRentals.length > 0 && (
            <div className="dashboard-branch-recent">
              <h4>آخر التأجيرات</h4>
              <div className="dashboard-branch-recent-list">
                {stats.recentRentals.slice(0, 3).map(rental => (
                  <div key={rental.id} className="dashboard-branch-recent-item">
                    <div className="recent-item-game">
                      <Gamepad2 size={12} />
                      <span>{rental.game_name}</span>
                    </div>
                    <div className="recent-item-customer">
                      <User size={12} />
                      <span>{rental.customer_name}</span>
                    </div>
                    <div className="recent-item-amount">
                      <DollarSign size={12} />
                      <span>{formatCurrency(rental.total_amount || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="dashboard-branch-detailed-footer">
        <button 
          onClick={() => onViewDetails(branch)}
          className="dashboard-btn-view"
        >
          <Eye size={14} />
          عرض تفاصيل الفرع
        </button>
      </div>
    </div>
  );
});
BranchDetailedCard.displayName = 'BranchDetailedCard';

// ==================== مكون عرض تفاصيل الشيفت الموسع ====================
const ShiftDetailedCard = React.memo(({ shift, onViewDetails, isExpanded, onToggleExpand }) => {
  if (!shift) return null;
  
  const shiftStartTime = new Date(shift.start_time);
  const now = new Date();
  const shiftDuration = Math.floor((now - shiftStartTime) / (1000 * 60 * 60)); // بالساعات
  const shiftDurationMinutes = Math.floor((now - shiftStartTime) / (1000 * 60));
  
  return (
    <div className={`dashboard-shift-detailed-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="dashboard-shift-detailed-header" onClick={() => onToggleExpand(shift.id)}>
        <div className="dashboard-shift-detailed-icon">
          <Clock size={20} />
        </div>
        <div className="dashboard-shift-detailed-info">
          <h4>شيفت #{shift.id}</h4>
          <div className="dashboard-shift-detailed-meta">
            <span className="shift-meta-branch">{shift.branch_name || `فرع ${shift.branch_id}`}</span>
            <span className="shift-meta-employee">{shift.employee_name}</span>
          </div>
        </div>
        <div className="dashboard-shift-detailed-status">
          <span className="shift-status-badge active">نشط</span>
          <button className="dashboard-shift-expand-btn">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      
      <div className="dashboard-shift-detailed-stats">
        <div className="dashboard-shift-stat-item">
          <span className="stat-label">وقت البدء</span>
          <span className="stat-value">{formatTime(shift.start_time)}</span>
        </div>
        <div className="dashboard-shift-stat-item">
          <span className="stat-label">المدة</span>
          <span className="stat-value">
            {shiftDuration > 0 ? `${shiftDuration} س` : `${shiftDurationMinutes} د`}
          </span>
        </div>
        <div className="dashboard-shift-stat-item">
          <span className="stat-label">التأجيرات</span>
          <span className="stat-value">{shift.total_rentals || 0}</span>
        </div>
        <div className="dashboard-shift-stat-item highlight">
          <span className="stat-label">الإيراد</span>
          <span className="stat-value">{formatCurrency(shift.total_revenue || 0)}</span>
        </div>
      </div>
      
      {isExpanded && shift.rentals && shift.rentals.length > 0 && (
        <div className="dashboard-shift-detailed-expanded">
          <h5>التأجيرات النشطة في هذا الشيفت</h5>
          <div className="dashboard-shift-rentals-list">
            {shift.rentals.map(rental => (
              <div key={rental.id} className="dashboard-shift-rental-item">
                <div className="rental-item-game">
                  <Gamepad2 size={12} />
                  <span>{rental.game_name}</span>
                </div>
                <div className="rental-item-customer">
                  <User size={12} />
                  <span>{rental.customer_name}</span>
                </div>
                <div className="rental-item-time">
                  <Clock size={12} />
                  <span>{formatTime(rental.start_time)}</span>
                </div>
                <div className="rental-item-type">
                  <span className={`rental-type-badge ${getRentalType(rental)}`}>
                    {getRentalType(rental) === 'open' ? 'مفتوح' : 'ثابت'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="dashboard-shift-detailed-footer">
        <button 
          onClick={() => onViewDetails(shift)}
          className="dashboard-btn-view-small"
        >
          <Eye size={12} />
          تفاصيل الشيفت
        </button>
      </div>
    </div>
  );
});
ShiftDetailedCard.displayName = 'ShiftDetailedCard';

// ==================== مكون عرض الفروع مع تفاصيل كاملة ====================
const BranchesDetailedView = React.memo(({ branches, branchesStats, onViewBranchDetails, onViewShiftDetails }) => {
  const [expandedBranches, setExpandedBranches] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  
  const toggleBranchExpand = (branchId) => {
    setExpandedBranches(prev => ({
      ...prev,
      [branchId]: !prev[branchId]
    }));
  };
  
  const filteredBranches = useMemo(() => {
    return branches.filter(branch => {
      // فلترة حسب البحث
      const matchesSearch = !searchTerm || 
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // فلترة حسب الحالة
      const matchesFilter = filterActive === 'all' || 
        (filterActive === 'active' && branch.is_active === 1) ||
        (filterActive === 'inactive' && branch.is_active === 0);
      
      return matchesSearch && matchesFilter;
    });
  }, [branches, searchTerm, filterActive]);
  
  return (
    <div className="dashboard-branches-detailed-view">
      <div className="dashboard-branches-filters">
        <div className="dashboard-search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="بحث عن فرع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="dashboard-filter-tabs">
          <button 
            className={`filter-tab ${filterActive === 'all' ? 'active' : ''}`}
            onClick={() => setFilterActive('all')}
          >
            الكل ({branches.length})
          </button>
          <button 
            className={`filter-tab ${filterActive === 'active' ? 'active' : ''}`}
            onClick={() => setFilterActive('active')}
          >
            النشط ({branches.filter(b => b.is_active === 1).length})
          </button>
          <button 
            className={`filter-tab ${filterActive === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilterActive('inactive')}
          >
            غير النشط ({branches.filter(b => b.is_active === 0).length})
          </button>
        </div>
      </div>
      
      <div className="dashboard-branches-detailed-grid">
        {filteredBranches.length === 0 ? (
          <div className="dashboard-empty-state">
            <Building size={48} />
            <p>لا توجد فروع تطابق البحث</p>
          </div>
        ) : (
          filteredBranches.map(branch => (
            <BranchDetailedCard
              key={branch.id}
              branch={branch}
              stats={branchesStats[branch.id] || { 
                games: 0, 
                employees: 0, 
                activeRentals: 0, 
                todayRevenue: 0,
                todayRentals: 0,
                totalRentals: 0,
                availableGames: 0,
                rentedGames: 0,
                activeShifts: []
              }}
              onViewDetails={onViewBranchDetails}
              isExpanded={expandedBranches[branch.id]}
              onToggleExpand={toggleBranchExpand}
            />
          ))
        )}
      </div>
    </div>
  );
});
BranchesDetailedView.displayName = 'BranchesDetailedView';

// ==================== مكون عرض الشيفتات النشطة مع تفاصيل ====================
const ActiveShiftsDetailedView = React.memo(({ shifts, onViewShiftDetails }) => {
  const [expandedShifts, setExpandedShifts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const toggleShiftExpand = (shiftId) => {
    setExpandedShifts(prev => ({
      ...prev,
      [shiftId]: !prev[shiftId]
    }));
  };
  
  // تجميع الشيفتات حسب الفرع
  const shiftsByBranch = useMemo(() => {
    const filtered = shifts.filter(shift => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (shift.branch_name && shift.branch_name.toLowerCase().includes(term)) ||
        (shift.employee_name && shift.employee_name.toLowerCase().includes(term))
      );
    });
    
    return filtered.reduce((acc, shift) => {
      const branchId = shift.branch_id;
      if (!acc[branchId]) {
        acc[branchId] = {
          branchId: branchId,
          branchName: shift.branch_name || `فرع ${branchId}`,
          shifts: []
        };
      }
      acc[branchId].shifts.push(shift);
      return acc;
    }, {});
  }, [shifts, searchTerm]);
  
  const branchGroups = Object.values(shiftsByBranch);
  
  if (shifts.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <Clock size={48} />
        <h3>لا توجد شيفتات نشطة</h3>
        <p>جميع الفروع ليس لديها شيفتات نشطة حالياً</p>
      </div>
    );
  }
  
  return (
    <div className="dashboard-active-shifts-detailed-view">
      <div className="dashboard-shifts-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="بحث عن فرع أو موظف..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {branchGroups.map(group => (
        <div key={group.branchId} className="dashboard-branch-shifts-group">
          <div className="dashboard-branch-group-header">
            <Building size={18} />
            <h4>{group.branchName}</h4>
            <span className="dashboard-branch-shifts-count">
              ({group.shifts.length} {group.shifts.length === 1 ? 'شيفت' : 'شيفتات'})
            </span>
          </div>
          
          <div className="dashboard-shifts-detailed-grid">
            {group.shifts.map(shift => (
              <ShiftDetailedCard
                key={shift.id}
                shift={shift}
                onViewDetails={onViewShiftDetails}
                isExpanded={expandedShifts[shift.id]}
                onToggleExpand={toggleShiftExpand}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});
ActiveShiftsDetailedView.displayName = 'ActiveShiftsDetailedView';

// ==================== المكون الرئيسي ====================
const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const userBranchId = user?.branch_id || 1;
  
  // تعريف جميع الـ states هنا داخل المكون الرئيسي
  const [loading, setLoading] = useState({
    stats: false,
    branches: false,
    rentals: false,
    processing: false,
    shift: false,
    otherShifts: false,
    allRentals: false,
    allCompleted: false,
    allRecent: false,
    branchDetails: false
  });
  
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalGames: 0,
    totalUsers: 0,
    totalRentals: 0,
    totalRevenue: 0,
    todayRentals: 0,
    todayRevenue: 0,
    activeRentals: 0,
    availableGames: 0
  });
  
  const [branches, setBranches] = useState([]);
  const [branchesStats, setBranchesStats] = useState({});
  const [allActiveRentals, setAllActiveRentals] = useState([]);
  const [allCompletedRentals, setAllCompletedRentals] = useState([]);
  const [allRecentRentals, setAllRecentRentals] = useState([]);
  const [currentUserShift, setCurrentUserShift] = useState(null);
  const [currentUserShiftStats, setCurrentUserShiftStats] = useState(null);
  const [otherBranchesActiveShifts, setOtherBranchesActiveShifts] = useState([]);
  const [previousShifts, setPreviousShifts] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedShiftForDetails, setSelectedShiftForDetails] = useState(null);
  const [showShiftDetailsModal, setShowShiftDetailsModal] = useState(false);
  const [shiftDetails, setShiftDetails] = useState(null);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  // Refs للتحكم في التحديثات
  const isMountedRef = useRef(true);
  const updateLockRef = useRef(false);
  const refreshTimerRef = useRef(null);

  // تعريف الدوال المفقودة
  const loadDashboardStats = async () => { console.log('loadDashboardStats'); };
  const loadAllActiveRentals = async () => { console.log('loadAllActiveRentals'); };
  const loadAllCompletedRentals = async () => { console.log('loadAllCompletedRentals'); };
  const loadAllRecentRentals = async () => { console.log('loadAllRecentRentals'); };
  const loadCurrentUserShift = async () => { console.log('loadCurrentUserShift'); };
  const loadPreviousShifts = async () => { console.log('loadPreviousShifts'); };
  const handleExportData = () => { console.log('handleExportData'); };
  const handlePrintReport = () => { console.log('handlePrintReport'); };
  const handleViewShiftDetails = (shift) => { 
    console.log('handleViewShiftDetails', shift);
    setSelectedShiftForDetails(shift);
    setShowShiftDetailsModal(true);
  };
  const handleViewRental = (rental) => { console.log('handleViewRental', rental); };
  const closeShiftDetailsModal = () => { setShowShiftDetailsModal(false); };

  // تعريف enhancedStats
  const enhancedStats = {
    openTimeRentals: 0,
    fixedTimeRentals: 0,
    averageRentalDuration: 15,
    totalActiveRentals: 0,
    topGame: { 'لعبة': 0 }
  };

  // ==================== دوال تحميل البيانات المحسنة ====================

  // تحميل إحصائيات الفرع بالتفصيل
  const loadBranchDetailedStats = useCallback(async (branchId) => {
    try {
      const response = await api.get(`/branches/${branchId}/detailed-stats`);
      
      if (response.success && response.data && isMountedRef.current) {
        setBranchesStats(prev => ({
          ...prev,
          [branchId]: response.data
        }));
      }
    } catch (error) {
      console.error(`❌ خطأ في تحميل إحصائيات الفرع ${branchId}:`, error);
    }
  }, []);

  // تحميل جميع إحصائيات الفروع بالتفصيل
  const loadAllBranchesDetailedStats = useCallback(async () => {
    if (!branches.length) return;
    
    setLoading(prev => ({ ...prev, branchDetails: true }));
    
    try {
      const statsPromises = branches.map(async (branch) => {
        try {
          const response = await api.get(`/branches/${branch.id}/detailed-stats`);
          return { branchId: branch.id, stats: response.data };
        } catch (error) {
          console.warn(`⚠️ فشل تحميل إحصائيات الفرع ${branch.id}:`, error.message);
          return { 
            branchId: branch.id, 
            stats: { 
              games: 0, 
              employees: 0, 
              activeRentals: 0, 
              todayRevenue: 0,
              todayRentals: 0,
              totalRentals: 0,
              availableGames: 0,
              rentedGames: 0,
              activeShifts: [],
              recentRentals: []
            } 
          };
        }
      });
      
      const results = await Promise.all(statsPromises);
      const statsMap = {};
      results.forEach(result => {
        statsMap[result.branchId] = result.stats;
      });
      
      setBranchesStats(statsMap);
    } catch (error) {
      console.error('❌ خطأ في تحميل إحصائيات الفروع:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(prev => ({ ...prev, branchDetails: false }));
      }
    }
  }, [branches]);

  // تحميل قائمة الفروع
  const loadBranches = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, branches: true }));
      
      const response = await api.get('/branches');
      
      if (response.success && response.data && isMountedRef.current) {
        setBranches(response.data);
        
        // بعد تحميل الفروع، حمل إحصائياتها التفصيلية
        setTimeout(() => {
          loadAllBranchesDetailedStats();
        }, 100);
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل الفروع:', error);
      setError('فشل تحميل قائمة الفروع');
    } finally {
      if (isMountedRef.current) {
        setLoading(prev => ({ ...prev, branches: false }));
      }
    }
  }, [loadAllBranchesDetailedStats]);

  // تحميل جميع الشيفتات النشطة للفروع الأخرى مع تفاصيلها
  const loadOtherBranchesActiveShifts = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      setLoading(prev => ({ ...prev, otherShifts: true }));
      
      const response = await api.get('/shifts/active-all-branches');
      
      if (response.success && response.data && isMountedRef.current) {
        // فلترة الشيفتات لاستبعاد فرع المستخدم
        const filteredShifts = response.data.filter(shift => 
          shift.branch_id !== userBranchId
        );
        
        // تحميل تفاصيل إضافية لكل شيفت
        const shiftsWithDetails = await Promise.all(
          filteredShifts.map(async (shift) => {
            try {
              const detailsResponse = await api.get(`/shifts/${shift.id}/simple-rentals`);
              if (detailsResponse.success) {
                shift.rentals = detailsResponse.data || [];
              }
            } catch (error) {
              console.warn(`⚠️ فشل تحميل تأجيرات الشيفت ${shift.id}:`, error.message);
            }
            return shift;
          })
        );
        
        setOtherBranchesActiveShifts(shiftsWithDetails);
        console.log(`✅ تم تحميل ${shiftsWithDetails.length} شيفت نشط من الفروع الأخرى مع تفاصيلها`);
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل جميع الشيفتات النشطة للفروع الأخرى:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(prev => ({ ...prev, otherShifts: false }));
      }
    }
  }, [isAdmin, userBranchId]);

  // دالة التحديث الشامل المعدلة
  const refreshAllData = useCallback(async (force = false) => {
    if (updateLockRef.current && !force) {
      console.log('⏳ تأجيل التحديث - هناك تحديث قيد التنفيذ');
      return;
    }
    
    updateLockRef.current = true;
    
    try {
      console.log('🔄 بدء التحديث الشامل للوحة التحكم مع التفاصيل');
      
      await loadDashboardStats();
      await loadBranches(); // هذه الدالة ستقوم بتحميل الإحصائيات التفصيلية
      await loadAllActiveRentals();
      await loadAllCompletedRentals();
      await loadAllRecentRentals();
      
      if (!isAdmin) {
        await loadCurrentUserShift();
      }
      
      await loadOtherBranchesActiveShifts();
      await loadPreviousShifts();
      
      setError(null);
      
    } catch (error) {
      console.error('🔥 خطأ في التحديث الشامل:', error);
      setError('فشل تحديث البيانات');
    } finally {
      updateLockRef.current = false;
    }
  }, [loadDashboardStats, loadBranches, loadAllActiveRentals, loadAllCompletedRentals, 
      loadAllRecentRentals, loadCurrentUserShift, loadOtherBranchesActiveShifts, 
      loadPreviousShifts, isAdmin]);

  return (
    <div className="dashboard-container">
      {/* رأس الصفحة */}
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1>
            <BarChart3 size={32} />
            لوحة التحكم
          </h1>
          <div className="dashboard-date">
            <Calendar size={16} />
            <span>{formatDate(new Date())}</span>
          </div>
        </div>
        
        <div className="dashboard-header-actions">
          <button 
            onClick={() => refreshAllData(true)}
            className="dashboard-btn dashboard-btn-outline"
            disabled={loading.processing || updateLockRef.current}
          >
            {loading.stats ? (
              <Loader2 className="dashboard-spinner" size={16} />
            ) : (
              <RefreshCw size={16} />
            )}
            تحديث
          </button>
          
          <button 
            onClick={handleExportData}
            className="dashboard-btn dashboard-btn-outline"
          >
            <Download size={16} />
            تصدير
          </button>
          
          <button 
            onClick={handlePrintReport}
            className="dashboard-btn dashboard-btn-outline"
          >
            <Printer size={16} />
            طباعة
          </button>
        </div>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="dashboard-error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="dashboard-error-close">
            <X size={16} />
          </button>
        </div>
      )}

      {/* البطاقات الإحصائية الرئيسية */}
      <div className="dashboard-stats-grid">
        <StatCard
          title="إجمالي الإيرادات"
          value={formatCurrency(stats.totalRevenue || 0)}
          icon={DollarSign}
          color="primary"
          subtitle="جميع الفروع"
        />
        
        <StatCard
          title="تأجيرات اليوم"
          value={stats.todayRentals || 0}
          icon={Activity}
          color="success"
          subtitle={`إيراد ${formatCurrency(stats.todayRevenue || 0)}`}
        />
        
        <StatCard
          title="تأجيرات نشطة"
          value={stats.activeRentals || 0}
          icon={Zap}
          color="warning"
          subtitle={`${enhancedStats.openTimeRentals} مفتوح، ${enhancedStats.fixedTimeRentals} ثابت`}
        />
        
        <StatCard
          title="الألعاب المتاحة"
          value={stats.availableGames || 0}
          icon={Gamepad2}
          color="info"
          subtitle={`من أصل ${stats.totalGames || 0} لعبة`}
        />
      </div>

      {/* شيفت المستخدم الحالي (لغير المدير) */}
      {!isAdmin && currentUserShift && (
        <div className="dashboard-current-shift-section">
          <CurrentUserShiftCard 
            shift={currentUserShift}
            stats={currentUserShiftStats}
            onViewDetails={handleViewShiftDetails}
          />
        </div>
      )}

      {/* البطاقات الإحصائية الثانوية (للمدير فقط) */}
      {isAdmin && (
        <div className="dashboard-secondary-stats">
          <StatCard
            title="عدد الفروع"
            value={stats.totalBranches || 0}
            icon={Building}
            color="secondary"
          />
          
          <StatCard
            title="عدد المستخدمين"
            value={stats.totalUsers || 0}
            icon={Users}
            color="secondary"
          />
          
          <StatCard
            title="متوسط المدة"
            value={`${enhancedStats.averageRentalDuration} دقيقة`}
            icon={Clock}
            color="secondary"
          />
          
          <StatCard
            title="إجمالي التأجيرات"
            value={stats.totalRentals || 0}
            icon={Target}
            color="secondary"
          />
        </div>
      )}

      {/* ===== قسم الفروع مع عرض تفصيلي ===== */}
      {isAdmin && (
        <div className="dashboard-section dashboard-branches-detailed-section">
          <div className="dashboard-section-header">
            <h2>
              <Layers size={20} />
              تفاصيل الفروع
              <span className="dashboard-section-count">
                ({branches.length})
              </span>
            </h2>
            <button 
              onClick={loadBranches}
              className="dashboard-btn-icon"
              disabled={loading.branches || loading.branchDetails}
            >
              <RefreshCw size={16} className={loading.branches ? 'dashboard-spinner' : ''} />
            </button>
          </div>
          
          {loading.branches ? (
            <div className="dashboard-loading-state">
              <Loader2 className="dashboard-spinner" size={32} />
              <p>جاري تحميل بيانات الفروع...</p>
            </div>
          ) : (
            <BranchesDetailedView 
              branches={branches}
              branchesStats={branchesStats}
              onViewBranchDetails={(branch) => {
                setSelectedBranch(branch);
                console.log('تم اختيار الفرع:', branch);
              }}
              onViewShiftDetails={handleViewShiftDetails}
            />
          )}
        </div>
      )}

      {/* ===== قسم الشيفتات النشطة مع عرض تفصيلي ===== */}
      {isAdmin && (
        <div className="dashboard-section dashboard-shifts-detailed-section">
          <div className="dashboard-section-header">
            <h2>
              <Clock size={20} />
              تفاصيل الشيفتات النشطة
              <span className="dashboard-section-count">
                ({otherBranchesActiveShifts.length})
              </span>
            </h2>
            <button 
              onClick={loadOtherBranchesActiveShifts}
              className="dashboard-btn-icon"
              disabled={loading.otherShifts}
            >
              <RefreshCw size={16} className={loading.otherShifts ? 'dashboard-spinner' : ''} />
            </button>
          </div>
          
          <ActiveShiftsDetailedView 
            shifts={otherBranchesActiveShifts}
            onViewShiftDetails={handleViewShiftDetails}
          />
        </div>
      )}

      {/* التأجيرات النشطة */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>
            <Zap size={20} />
            التأجيرات النشطة في جميع الفروع
            <span className="dashboard-section-count">
              ({allActiveRentals.length})
            </span>
          </h2>
          <button 
            onClick={loadAllActiveRentals}
            className="dashboard-btn-icon"
            disabled={loading.allRentals}
          >
            <RefreshCw size={16} className={loading.allRentals ? 'dashboard-spinner' : ''} />
          </button>
        </div>
        
        <AllBranchesActiveRentals 
          rentals={allActiveRentals}
          loading={loading.allRentals}
          onView={handleViewRental}
        />
      </div>

      {/* التأجيرات المكتملة اليوم */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>
            <CheckCircle size={20} />
            تأجيرات اليوم المكتملة في جميع الفروع
            <span className="dashboard-section-count">
              ({allCompletedRentals.length})
            </span>
          </h2>
          <button 
            onClick={loadAllCompletedRentals}
            className="dashboard-btn-icon"
            disabled={loading.allCompleted}
          >
            <RefreshCw size={16} className={loading.allCompleted ? 'dashboard-spinner' : ''} />
          </button>
        </div>
        
        <AllBranchesCompletedRentals 
          rentals={allCompletedRentals}
          loading={loading.allCompleted}
          onView={handleViewRental}
        />
      </div>

      {/* آخر التأجيرات */}
      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>
            <Activity size={20} />
            آخر التأجيرات في جميع الفروع
            <span className="dashboard-section-count">
              ({allRecentRentals.length})
            </span>
          </h2>
          <button 
            onClick={loadAllRecentRentals}
            className="dashboard-btn-icon"
            disabled={loading.allRecent}
          >
            <RefreshCw size={16} className={loading.allRecent ? 'dashboard-spinner' : ''} />
          </button>
        </div>
        
        <AllBranchesRecentRentals 
          rentals={allRecentRentals}
          loading={loading.allRecent}
          onView={handleViewRental}
        />
      </div>

      {/* الشيفتات السابقة */}
      {isAdmin && previousShifts.length > 0 && (
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>
              <Clock size={20} />
              الشيفتات السابقة
              <span className="dashboard-section-count">
                ({previousShifts.length})
              </span>
            </h2>
          </div>
          
          <ShiftsList 
            shifts={previousShifts}
            onViewShift={handleViewShiftDetails}
          />
        </div>
      )}

      {/* مودال عرض تفاصيل الشيفت */}
      <ShiftDetailsModal
        show={showShiftDetailsModal}
        onClose={closeShiftDetailsModal}
        shift={selectedShiftForDetails}
        details={shiftDetails}
      />

      {/* ملخص سريع */}
      <div className="dashboard-summary">
        <div className="dashboard-summary-item">
          <Info size={16} />
          <span>آخر تحديث: {formatDateTime(new Date())}</span>
        </div>
        
        <div className="dashboard-summary-item">
          <Activity size={16} />
          <span>إجمالي التأجيرات النشطة: {enhancedStats.totalActiveRentals}</span>
        </div>
        
        <div className="dashboard-summary-item">
          <Award size={16} />
          <span>أكثر لعبة تأجيراً: {Object.keys(enhancedStats.topGame)[0] || 'لا توجد'}</span>
        </div>
        
        <div className="dashboard-summary-item">
          <PieChart size={16} />
          <span>نسبة الأوقات المفتوحة: {enhancedStats.totalActiveRentals > 0 
            ? Math.round((enhancedStats.openTimeRentals / enhancedStats.totalActiveRentals) * 100) 
            : 0}%</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;