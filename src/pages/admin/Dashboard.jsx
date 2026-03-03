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
  LogOut
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

// ==================== المكونات الفرعية ====================

// بطاقة إحصائية
const StatCard = React.memo(({ title, value, icon: Icon, color, trend, subtitle }) => {
  return (
    <div className={`dashboard-stat-card dashboard-stat-${color}`}>
      <div className="dashboard-stat-icon">
        <Icon size={24} />
      </div>
      <div className="dashboard-stat-content">
        <div className="dashboard-stat-value">{value}</div>
        <div className="dashboard-stat-label">{title}</div>
        {subtitle && <div className="dashboard-stat-subtitle">{subtitle}</div>}
        {trend !== undefined && (
          <div className={`dashboard-stat-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(trend)}% عن الأمس</span>
          </div>
        )}
      </div>
    </div>
  );
});
StatCard.displayName = 'StatCard';

// بطاقة فرع
const BranchCard = React.memo(({ branch, onClick, stats }) => {
  return (
    <div className="dashboard-branch-card" onClick={() => onClick(branch)}>
      <div className="dashboard-branch-header">
        <div className="dashboard-branch-icon">
          <Building size={20} />
        </div>
        <div className="dashboard-branch-name">{branch.name}</div>
        {branch.is_active === 0 && (
          <span className="dashboard-branch-inactive">غير نشط</span>
        )}
      </div>
      
      <div className="dashboard-branch-location">
        <MapPin size={14} />
        <span>{branch.city || 'غير محدد'}</span>
      </div>
      
      <div className="dashboard-branch-stats">
        <div className="dashboard-branch-stat">
          <Gamepad2 size={14} />
          <span>{stats?.games || 0} لعبة</span>
        </div>
        <div className="dashboard-branch-stat">
          <Zap size={14} />
          <span>{stats?.activeRentals || 0} نشط</span>
        </div>
        <div className="dashboard-branch-stat">
          <DollarSign size={14} />
          <span>{formatCurrency(stats?.revenue || 0)}</span>
        </div>
      </div>
      
      <div className="dashboard-branch-footer">
        <span className="dashboard-branch-details">
          عرض التفاصيل
          <ChevronRight size={14} />
        </span>
      </div>
    </div>
  );
});
BranchCard.displayName = 'BranchCard';

// بطاقة تأجير نشط
const ActiveRentalCard = React.memo(({ rental, onView }) => {
  const rentalType = getRentalType(rental);
  const isFixed = rentalType === 'fixed';
  
  const calculateElapsedTime = () => {
    if (!rental.start_time) return '--:--';
    const start = new Date(rental.start_time);
    const now = new Date();
    const diffMs = now - start;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffSeconds = Math.floor((diffMs % 60000) / 1000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}:${minutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
    }
  };
  
  const calculateRemainingTime = () => {
    if (!isFixed || !rental.start_time) return '--:--';
    
    const duration = rental.duration_minutes || 15;
    const start = new Date(rental.start_time);
    const end = new Date(start.getTime() + duration * 60000);
    const now = new Date();
    
    if (now > end) return '00:00';
    
    const remainingMs = end - now;
    const remainingMinutes = Math.floor(remainingMs / 60000);
    const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
    return `${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="dashboard-rental-card">
      <div className="dashboard-rental-header">
        <div className="dashboard-rental-game">
          <Gamepad2 size={16} />
          <span>{rental.game_name || 'لعبة غير معروفة'}</span>
        </div>
        <span className={`dashboard-rental-type dashboard-type-${rentalType}`}>
          {isFixed ? '⏰ ثابت' : '🔓 مفتوح'}
        </span>
      </div>
      
      <div className="dashboard-rental-customer">
        <div className="dashboard-customer-name">
          <Users size={14} />
          <span>{rental.customer_name || 'عميل'}</span>
        </div>
        {rental.customer_phone && rental.customer_phone !== '00000000000' && (
          <div className="dashboard-customer-phone">
            <Phone size={12} />
            <span>{rental.customer_phone}</span>
          </div>
        )}
      </div>
      
      <div className="dashboard-rental-time">
        <Clock size={14} />
        <span>البداية: {formatTime(rental.start_time)}</span>
      </div>
      
      <div className="dashboard-rental-timer">
        {isFixed ? (
          <>
            <div className="dashboard-timer-label">الوقت المتبقي:</div>
            <div className="dashboard-timer-value">{calculateRemainingTime()}</div>
          </>
        ) : (
          <>
            <div className="dashboard-timer-label">الوقت المنقضي:</div>
            <div className="dashboard-timer-value">{calculateElapsedTime()}</div>
          </>
        )}
      </div>
      
      <div className="dashboard-rental-footer">
        <button 
          onClick={() => onView(rental)}
          className="dashboard-btn-view"
        >
          <Eye size={14} />
          عرض التفاصيل
        </button>
      </div>
    </div>
  );
});
ActiveRentalCard.displayName = 'ActiveRentalCard';

// بطاقة تأجير مكتمل
const CompletedRentalCard = React.memo(({ rental }) => {
  const duration = calculateDuration(rental.start_time, rental.end_time);
  const amount = rental.final_amount || rental.total_amount || 0;
  
  return (
    <div className="dashboard-rental-card dashboard-completed">
      <div className="dashboard-rental-header">
        <div className="dashboard-rental-game">
          <Gamepad2 size={16} />
          <span>{rental.game_name || 'لعبة غير معروفة'}</span>
        </div>
        <span className="dashboard-rental-status completed">
          <CheckCircle size={14} />
          مكتمل
        </span>
      </div>
      
      <div className="dashboard-rental-customer">
        <Users size={14} />
        <span>{rental.customer_name || 'عميل'}</span>
      </div>
      
      <div className="dashboard-rental-details">
        <div className="dashboard-detail-item">
          <Clock size={14} />
          <span>{duration} دقيقة</span>
        </div>
        <div className="dashboard-detail-item">
          <DollarSign size={14} />
          <span>{formatCurrency(amount)}</span>
        </div>
      </div>
      
      <div className="dashboard-rental-time">
        <Calendar size={14} />
        <span>{formatTime(rental.end_time)}</span>
      </div>
    </div>
  );
});
CompletedRentalCard.displayName = 'CompletedRentalCard';

// مكون بطاقة الشيفت النشط للمستخدم الحالي
const CurrentUserShiftCard = React.memo(({ shift, stats, onViewDetails }) => {
  if (!shift) return null;
  
  const shiftStartTime = new Date(shift.start_time);
  const now = new Date();
  const shiftDuration = Math.floor((now - shiftStartTime) / (1000 * 60 * 60)); // بالساعات
  const shiftDurationMinutes = Math.floor((now - shiftStartTime) / (1000 * 60));
  
  return (
    <div className="dashboard-current-shift-card">
      <div className="dashboard-current-shift-header">
        <div className="dashboard-current-shift-title">
          <Clock size={20} />
          <h3>الشيفت الخاص بي</h3>
        </div>
        <span className="dashboard-current-shift-badge">نشط</span>
      </div>
      
      <div className="dashboard-current-shift-content">
        <div className="dashboard-current-shift-row">
          <span className="dashboard-current-shift-label">
            <User size={16} />
            الموظف:
          </span>
          <span className="dashboard-current-shift-value">
            <strong>{shift.employee_name}</strong>
            <span className="dashboard-current-shift-employee-id">(#{shift.employee_id})</span>
          </span>
        </div>
        
        <div className="dashboard-current-shift-row">
          <span className="dashboard-current-shift-label">
            <Building size={16} />
            الفرع:
          </span>
          <span className="dashboard-current-shift-value">
            <strong>{shift.branch_name || `فرع ${shift.branch_id}`}</strong>
          </span>
        </div>
        
        <div className="dashboard-current-shift-row">
          <span className="dashboard-current-shift-label">
            <Calendar size={16} />
            رقم الشيفت:
          </span>
          <span className="dashboard-current-shift-value">
            <span className="dashboard-current-shift-number">#{shift.id}</span>
            {shift.shift_number && <span> ({shift.shift_number})</span>}
          </span>
        </div>
        
        <div className="dashboard-current-shift-row">
          <span className="dashboard-current-shift-label">
            <Clock size={16} />
            وقت البدء:
          </span>
          <span className="dashboard-current-shift-value">
            {formatDateTime(shift.start_time)}
          </span>
        </div>
        
        <div className="dashboard-current-shift-row">
          <span className="dashboard-current-shift-label">
            <Activity size={16} />
            المدة:
          </span>
          <span className="dashboard-current-shift-value">
            <strong>
              {shiftDuration > 0 ? `${shiftDuration} ساعة` : `${shiftDurationMinutes} دقيقة`}
            </strong>
          </span>
        </div>
        
        {stats && (
          <>
            <div className="dashboard-current-shift-stats-divider"></div>
            
            <div className="dashboard-current-shift-stats-row">
              <div className="dashboard-current-shift-stat-item">
                <span className="dashboard-current-shift-stat-label">التأجيرات</span>
                <span className="dashboard-current-shift-stat-value">{stats.totalRentals || 0}</span>
              </div>
              <div className="dashboard-current-shift-stat-item">
                <span className="dashboard-current-shift-stat-label">النشطة</span>
                <span className="dashboard-current-shift-stat-value">{stats.activeRentals || 0}</span>
              </div>
              <div className="dashboard-current-shift-stat-item">
                <span className="dashboard-current-shift-stat-label">المكتملة</span>
                <span className="dashboard-current-shift-stat-value">{stats.completedRentals || 0}</span>
              </div>
            </div>
            
            <div className="dashboard-current-shift-revenue">
              <DollarSign size={16} />
              <span>إيراد الشيفت:</span>
              <strong>{formatCurrency(stats.shiftRevenue || 0)}</strong>
            </div>
          </>
        )}
      </div>
      
      <div className="dashboard-current-shift-footer">
        <button 
          onClick={() => onViewDetails(shift)}
          className="dashboard-btn-view"
        >
          <Eye size={14} />
          عرض التفاصيل
        </button>
      </div>
    </div>
  );
});
CurrentUserShiftCard.displayName = 'CurrentUserShiftCard';

// مكون بطاقة الشيفت النشط للفروع الأخرى
const OtherBranchShiftCard = React.memo(({ shift, onViewDetails }) => {
  if (!shift) return null;
  
  const shiftStartTime = new Date(shift.start_time);
  const now = new Date();
  const shiftDuration = Math.floor((now - shiftStartTime) / (1000 * 60 * 60)); // بالساعات
  const shiftDurationMinutes = Math.floor((now - shiftStartTime) / (1000 * 60));
  
  return (
    <div className="dashboard-other-shift-card">
      <div className="dashboard-other-shift-header">
        <div className="dashboard-other-shift-title">
          <Clock size={18} />
          <h4>شيفت #{shift.id}</h4>
        </div>
        <span className="dashboard-other-shift-badge">نشط</span>
      </div>
      
      <div className="dashboard-other-shift-content">
        <div className="dashboard-other-shift-row">
          <span className="dashboard-other-shift-label">
            <Building size={14} />
            الفرع:
          </span>
          <span className="dashboard-other-shift-value">
            <strong>{shift.branch_name || `فرع ${shift.branch_id}`}</strong>
          </span>
        </div>
        
        <div className="dashboard-other-shift-row">
          <span className="dashboard-other-shift-label">
            <User size={14} />
            الموظف:
          </span>
          <span className="dashboard-other-shift-value">
            {shift.employee_name}
          </span>
        </div>
        
        <div className="dashboard-other-shift-row">
          <span className="dashboard-other-shift-label">
            <Calendar size={14} />
            وقت البدء:
          </span>
          <span className="dashboard-other-shift-value">
            {formatDateTime(shift.start_time)}
          </span>
        </div>
        
        <div className="dashboard-other-shift-row">
          <span className="dashboard-other-shift-label">
            <Activity size={14} />
            المدة:
          </span>
          <span className="dashboard-other-shift-value">
            <strong>
              {shiftDuration > 0 ? `${shiftDuration} ساعة` : `${shiftDurationMinutes} دقيقة`}
            </strong>
          </span>
        </div>
        
        <div className="dashboard-other-shift-stats">
          <div className="dashboard-other-shift-stat">
            <span className="dashboard-stat-label">التأجيرات</span>
            <span className="dashboard-stat-value">{shift.total_rentals || 0}</span>
          </div>
          <div className="dashboard-other-shift-stat">
            <span className="dashboard-stat-label">النشطة</span>
            <span className="dashboard-stat-value">{shift.active_rentals || 0}</span>
          </div>
          <div className="dashboard-other-shift-stat highlight">
            <span className="dashboard-stat-label">الإيراد</span>
            <span className="dashboard-stat-value">{formatCurrency(shift.total_revenue || 0)}</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-other-shift-footer">
        <button 
          onClick={() => onViewDetails(shift)}
          className="dashboard-btn-view-small"
        >
          <Eye size={14} />
          عرض التفاصيل
        </button>
      </div>
    </div>
  );
});
OtherBranchShiftCard.displayName = 'OtherBranchShiftCard';

// مكون عرض جميع الشيفتات النشطة للفروع الأخرى
const OtherBranchesShiftsList = React.memo(({ shifts, onViewDetails, loading }) => {
  if (loading) {
    return (
      <div className="dashboard-loading-state">
        <Loader2 className="dashboard-spinner" size={32} />
        <p>جاري تحميل الشيفتات النشطة...</p>
      </div>
    );
  }
  
  if (!shifts || shifts.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <Clock size={48} />
        <h3>لا توجد شيفتات نشطة في الفروع الأخرى</h3>
        <p>جميع الفروع الأخرى ليس لديها شيفتات نشطة حالياً</p>
      </div>
    );
  }
  
  // تجميع الشيفتات حسب الفرع
  const shiftsByBranch = shifts.reduce((acc, shift) => {
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
  
  const branchGroups = Object.values(shiftsByBranch);
  
  return (
    <div className="dashboard-other-branches-container">
      {branchGroups.map(group => (
        <div key={group.branchId} className="dashboard-branch-shifts-group">
          <div className="dashboard-branch-group-header">
            <Building size={18} />
            <h4>{group.branchName}</h4>
            <span className="dashboard-branch-shifts-count">
              ({group.shifts.length} {group.shifts.length === 1 ? 'شيفت' : 'شيفتات'})
            </span>
          </div>
          
          <div className="dashboard-other-shifts-grid">
            {group.shifts.map(shift => (
              <OtherBranchShiftCard
                key={shift.id}
                shift={shift}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});
OtherBranchesShiftsList.displayName = 'OtherBranchesShiftsList';

// مكون عرض الشيفتات السابقة
const ShiftsList = React.memo(({ shifts, onViewShift }) => {
  if (!shifts || shifts.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <Clock size={48} />
        <p>لا توجد شيفتات سابقة</p>
      </div>
    );
  }
  
  return (
    <div className="dashboard-shifts-table">
      <div className="dashboard-shifts-table-header">
        <div>رقم الشيفت</div>
        <div>الموظف</div>
        <div>الفرع</div>
        <div>تاريخ البدء</div>
        <div>المدة</div>
        <div>الإيراد</div>
        <div>الحالة</div>
        <div>الإجراءات</div>
      </div>
      
      {shifts.map(shift => (
        <div key={shift.id} className="dashboard-shifts-table-row">
          <div>#{shift.id}</div>
          <div>{shift.employee_name}</div>
          <div>{shift.branch_name || `فرع ${shift.branch_id}`}</div>
          <div>{formatDate(shift.start_time)}</div>
          <div>
            {shift.duration_minutes 
              ? `${Math.floor(shift.duration_minutes / 60)} ساعة ${shift.duration_minutes % 60} دقيقة`
              : '--'
            }
          </div>
          <div className="dashboard-shift-revenue-cell">
            {formatCurrency(shift.total_revenue || 0)}
          </div>
          <div>
            <span className={`dashboard-shift-status ${shift.status === 'نشط' ? 'active' : 'completed'}`}>
              {shift.status}
            </span>
          </div>
          <div>
            <button 
              onClick={() => onViewShift(shift)}
              className="dashboard-btn-view-small"
            >
              <Eye size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});
ShiftsList.displayName = 'ShiftsList';

// مكون عرض التأجيرات النشطة في جميع الفروع
const AllBranchesActiveRentals = React.memo(({ rentals, loading, onView }) => {
  if (loading) {
    return (
      <div className="dashboard-loading-state">
        <Loader2 className="dashboard-spinner" size={32} />
        <p>جاري تحميل التأجيرات النشطة...</p>
      </div>
    );
  }
  
  if (!rentals || rentals.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <Zap size={48} />
        <h3>لا توجد تأجيرات نشطة</h3>
        <p>جميع الفروع ليس لديها تأجيرات نشطة حالياً</p>
      </div>
    );
  }
  
  // تجميع التأجيرات حسب الفرع
  const rentalsByBranch = rentals.reduce((acc, rental) => {
    const branchId = rental.branch_id;
    if (!acc[branchId]) {
      acc[branchId] = {
        branchId: branchId,
        branchName: rental.branch_name || `فرع ${branchId}`,
        rentals: []
      };
    }
    acc[branchId].rentals.push(rental);
    return acc;
  }, {});
  
  const branchGroups = Object.values(rentalsByBranch);
  
  return (
    <div className="dashboard-all-branches-rentals">
      {branchGroups.map(group => (
        <div key={group.branchId} className="dashboard-branch-rentals-group">
          <div className="dashboard-branch-group-header">
            <Building size={18} />
            <h4>{group.branchName}</h4>
            <span className="dashboard-branch-rentals-count">
              ({group.rentals.length} {group.rentals.length === 1 ? 'تأجير' : 'تأجيرات'})
            </span>
          </div>
          
          <div className="dashboard-rentals-grid">
            {group.rentals.map(rental => (
              <ActiveRentalCard
                key={rental.id}
                rental={rental}
                onView={onView}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});
AllBranchesActiveRentals.displayName = 'AllBranchesActiveRentals';

// مكون عرض التأجيرات المكتملة اليوم في جميع الفروع
const AllBranchesCompletedRentals = React.memo(({ rentals, loading, onView }) => {
  if (loading) {
    return (
      <div className="dashboard-loading-state">
        <Loader2 className="dashboard-spinner" size={32} />
        <p>جاري تحميل التأجيرات المكتملة...</p>
      </div>
    );
  }
  
  if (!rentals || rentals.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <CheckCircle size={48} />
        <h3>لا توجد تأجيرات مكتملة اليوم</h3>
        <p>جميع الفروع ليس لديها تأجيرات مكتملة اليوم</p>
      </div>
    );
  }
  
  // تجميع التأجيرات حسب الفرع
  const rentalsByBranch = rentals.reduce((acc, rental) => {
    const branchId = rental.branch_id;
    if (!acc[branchId]) {
      acc[branchId] = {
        branchId: branchId,
        branchName: rental.branch_name || `فرع ${branchId}`,
        rentals: []
      };
    }
    acc[branchId].rentals.push(rental);
    return acc;
  }, {});
  
  const branchGroups = Object.values(rentalsByBranch);
  
  return (
    <div className="dashboard-all-branches-rentals">
      {branchGroups.map(group => (
        <div key={group.branchId} className="dashboard-branch-rentals-group">
          <div className="dashboard-branch-group-header">
            <Building size={18} />
            <h4>{group.branchName}</h4>
            <span className="dashboard-branch-rentals-count">
              ({group.rentals.length} {group.rentals.length === 1 ? 'تأجير' : 'تأجيرات'})
            </span>
          </div>
          
          <div className="dashboard-rentals-grid">
            {group.rentals.map(rental => (
              <CompletedRentalCard
                key={rental.id}
                rental={rental}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});
AllBranchesCompletedRentals.displayName = 'AllBranchesCompletedRentals';

// مكون عرض آخر التأجيرات في جميع الفروع
const AllBranchesRecentRentals = React.memo(({ rentals, loading, onView }) => {
  if (loading) {
    return (
      <div className="dashboard-loading-state">
        <Loader2 className="dashboard-spinner" size={32} />
        <p>جاري تحميل آخر التأجيرات...</p>
      </div>
    );
  }
  
  if (!rentals || rentals.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <Activity size={48} />
        <h3>لا توجد تأجيرات</h3>
        <p>جميع الفروع ليس لديها تأجيرات</p>
      </div>
    );
  }
  
  return (
    <div className="dashboard-recent-table">
      <div className="dashboard-table-header">
        <div className="dashboard-table-cell">الفرع</div>
        <div className="dashboard-table-cell">العميل</div>
        <div className="dashboard-table-cell">اللعبة</div>
        <div className="dashboard-table-cell">الوقت</div>
        <div className="dashboard-table-cell">الحالة</div>
        <div className="dashboard-table-cell">المبلغ</div>
        <div className="dashboard-table-cell">الإجراءات</div>
      </div>
      
      {rentals.map(rental => (
        <div key={rental.id} className="dashboard-table-row">
          <div className="dashboard-table-cell">
            <div className="dashboard-branch-info">
              <Building size={14} />
              <span>{rental.branch_name || `فرع ${rental.branch_id}`}</span>
            </div>
          </div>
          
          <div className="dashboard-table-cell">
            <div className="dashboard-customer-info">
              <Users size={14} />
              <span>{rental.customer_name || 'عميل'}</span>
            </div>
          </div>
          
          <div className="dashboard-table-cell">
            <div className="dashboard-game-info">
              <Gamepad2 size={14} />
              <span>{rental.game_name || 'لعبة'}</span>
            </div>
          </div>
          
          <div className="dashboard-table-cell">
            {formatTime(rental.start_time)}
          </div>
          
          <div className="dashboard-table-cell">
            <span className={`dashboard-status-badge ${rental.status === 'نشط' ? 'active' : 'completed'}`}>
              {rental.status === 'نشط' ? '🟢 نشط' : '✅ مكتمل'}
            </span>
          </div>
          
          <div className="dashboard-table-cell">
            {formatCurrency(rental.total_amount || 0)}
          </div>
          
          <div className="dashboard-table-cell">
            <button 
              onClick={() => onView(rental)}
              className="dashboard-btn-view-small"
              title="عرض التفاصيل"
            >
              <Eye size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});
AllBranchesRecentRentals.displayName = 'AllBranchesRecentRentals';

// مودال تفاصيل الشيفت
const ShiftDetailsModal = React.memo(({ show, onClose, shift, details }) => {
  if (!show || !shift) return null;
  
  return (
    <div className="dashboard-modal-overlay">
      <div className="dashboard-modal dashboard-shift-details-modal">
        <div className="dashboard-modal-header">
          <h2>
            <Clock size={24} />
            تفاصيل الشيفت #{shift.id}
          </h2>
          <button onClick={onClose} className="dashboard-modal-close">
            <X size={24} />
          </button>
        </div>
        
        <div className="dashboard-modal-body">
          {/* معلومات الشيفت الأساسية */}
          <div className="dashboard-shift-info-grid">
            <div className="dashboard-info-item">
              <span className="dashboard-info-label">الموظف:</span>
              <span className="dashboard-info-value">{shift.employee_name}</span>
            </div>
            
            <div className="dashboard-info-item">
              <span className="dashboard-info-label">الفرع:</span>
              <span className="dashboard-info-value">{shift.branch_name || `فرع ${shift.branch_id}`}</span>
            </div>
            
            <div className="dashboard-info-item">
              <span className="dashboard-info-label">وقت البدء:</span>
              <span className="dashboard-info-value">{formatDateTime(shift.start_time)}</span>
            </div>
            
            <div className="dashboard-info-item">
              <span className="dashboard-info-label">الحالة:</span>
              <span className="dashboard-info-value">
                <span className={`dashboard-shift-status ${shift.status === 'نشط' ? 'active' : 'completed'}`}>
                  {shift.status}
                </span>
              </span>
            </div>
          </div>
          
          {details && details.stats && (
            <>
              {/* إحصائيات الشيفت */}
              <div className="dashboard-shift-stats-summary">
                <h3>إحصائيات الشيفت</h3>
                <div className="dashboard-stats-grid-small">
                  <div className="dashboard-stat-box">
                    <span className="stat-label">إجمالي التأجيرات</span>
                    <span className="stat-value">{details.stats.total_rentals || 0}</span>
                  </div>
                  <div className="dashboard-stat-box">
                    <span className="stat-label">التأجيرات النشطة</span>
                    <span className="stat-value">{details.stats.active_count || 0}</span>
                  </div>
                  <div className="dashboard-stat-box">
                    <span className="stat-label">التأجيرات المكتملة</span>
                    <span className="stat-value">{details.stats.completed_count || 0}</span>
                  </div>
                  <div className="dashboard-stat-box highlight">
                    <span className="stat-label">إجمالي الإيرادات</span>
                    <span className="stat-value">{formatCurrency(details.stats.total_revenue || 0)}</span>
                  </div>
                </div>
              </div>
              
              {/* التأجيرات النشطة */}
              {details.active_rentals && details.active_rentals.length > 0 && (
                <div className="dashboard-shift-rentals-section">
                  <h4>
                    <Zap size={18} />
                    التأجيرات النشطة ({details.active_rentals.length})
                  </h4>
                  <div className="dashboard-rentals-mini-list">
                    {details.active_rentals.map(rental => (
                      <div key={rental.id} className="dashboard-rental-mini-item">
                        <div className="rental-mini-header">
                          <span className="rental-mini-game">{rental.game_name}</span>
                          <span className={`rental-mini-type ${rental.rental_type === 'open' ? 'open' : 'fixed'}`}>
                            {rental.rental_type === 'open' ? 'مفتوح' : 'ثابت'}
                          </span>
                        </div>
                        <div className="rental-mini-details">
                          <span><User size={12} /> {rental.customer_name}</span>
                          <span><Clock size={12} /> {formatTime(rental.start_time)}</span>
                          <span><DollarSign size={12} /> {formatCurrency(rental.paid_amount || 0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* آخر التأجيرات المكتملة */}
              {details.completed_rentals && details.completed_rentals.length > 0 && (
                <div className="dashboard-shift-rentals-section">
                  <h4>
                    <CheckCircle size={18} />
                    آخر التأجيرات المكتملة ({details.completed_rentals.length})
                  </h4>
                  <div className="dashboard-rentals-mini-list">
                    {details.completed_rentals.slice(0, 5).map(rental => (
                      <div key={rental.id} className="dashboard-rental-mini-item completed">
                        <div className="rental-mini-header">
                          <span className="rental-mini-game">{rental.game_name}</span>
                          <span className="rental-mini-amount">{formatCurrency(rental.final_amount || 0)}</span>
                        </div>
                        <div className="rental-mini-details">
                          <span><User size={12} /> {rental.customer_name}</span>
                          <span><Clock size={12} /> {formatTime(rental.end_time)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="dashboard-modal-footer">
          <button onClick={onClose} className="dashboard-btn dashboard-btn-primary">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
});
ShiftDetailsModal.displayName = 'ShiftDetailsModal';

// ==================== المكون الرئيسي ====================
const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const userBranchId = user?.branch_id || 1;
  
  const [loading, setLoading] = useState({
    stats: false,
    branches: false,
    rentals: false,
    processing: false,
    shift: false,
    otherShifts: false,
    allRentals: false,
    allCompleted: false,
    allRecent: false
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

  // ==================== دوال تحميل البيانات ====================

  // تحميل إحصائيات لوحة التحكم
  const loadDashboardStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      
      const response = await api.get('/dashboard/stats/simple');
      
      if (response.success && isMountedRef.current) {
        setStats(prev => ({
          ...prev,
          ...response.data
        }));
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل إحصائيات لوحة التحكم:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(prev => ({ ...prev, stats: false }));
      }
    }
  }, []);

  // تحميل قائمة الفروع
  const loadBranches = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, branches: true }));
      
      const response = await api.get('/branches');
      
      if (response.success && response.data && isMountedRef.current) {
        setBranches(response.data);
        
        const statsPromises = response.data.map(async (branch) => {
          try {
            const branchResponse = await api.get('/branches/stats/simple', {
              params: { branch_id: branch.id }
            });
            
            if (branchResponse.success) {
              return { branchId: branch.id, stats: branchResponse.data };
            }
          } catch (error) {
            console.warn(`⚠️ فشل تحميل إحصائيات الفرع ${branch.id}:`, error.message);
          }
          return { branchId: branch.id, stats: { games: 0, activeRentals: 0, revenue: 0 } };
        });
        
        const results = await Promise.all(statsPromises);
        const statsMap = {};
        results.forEach(result => {
          statsMap[result.branchId] = result.stats;
        });
        
        setBranchesStats(statsMap);
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل الفروع:', error);
      setError('فشل تحميل قائمة الفروع');
    } finally {
      if (isMountedRef.current) {
        setLoading(prev => ({ ...prev, branches: false }));
      }
    }
  }, []);



const loadAllActiveRentals = useCallback(async () => {
  try {
    setLoading(prev => ({ ...prev, allRentals: true }));
    
    const response = await api.getAllActiveRentals();
    
    if (response.success && response.data && isMountedRef.current) {
      console.log('📦 البيانات الخام من API:', response.data);
      
      // ✅ التصفية الصحيحة: فقط التأجيرات التي status = 'نشط'
      const activeOnly = response.data.filter(rental => {
        // التحقق من الحالة بعدة طرق
        const status = rental.status?.toLowerCase?.() || '';
        const isActive = 
          status === 'نشط' || 
          status === 'active' ||
          rental.status === 'نشط' ||
          rental.payment_status === 'عند الإنهاء' || // الوقت المفتوح
          (rental.end_time === null && !rental.actual_end_time); // لم ينته بعد
        
        return isActive;
      });
      
      console.log(`✅ بعد التصفية: ${activeOnly.length} تأجير نشط فقط`);
      
      // إضافة معلومات الفرع لكل تأجير
      const rentalsWithBranch = await Promise.all(
        activeOnly.map(async (rental) => {
          if (!rental.branch_name) {
            try {
              const branchResponse = await api.getBranchById(rental.branch_id);
              if (branchResponse.success) {
                rental.branch_name = branchResponse.data.name;
              }
            } catch (error) {
              console.warn(`⚠️ فشل جلب اسم الفرع ${rental.branch_id}:`, error.message);
              rental.branch_name = `فرع ${rental.branch_id}`;
            }
          }
          return rental;
        })
      );
      
      setAllActiveRentals(rentalsWithBranch);
    } else {
      setAllActiveRentals([]);
    }
  } catch (error) {
    console.error('❌ خطأ في تحميل جميع التأجيرات النشطة:', error);
    setAllActiveRentals([]);
  } finally {
    if (isMountedRef.current) {
      setLoading(prev => ({ ...prev, allRentals: false }));
    }
  }
}, []);

// تحميل جميع التأجيرات المكتملة اليوم
const loadAllCompletedRentals = useCallback(async () => {
  try {
    setLoading(prev => ({ ...prev, allCompleted: true }));
    
    const response = await api.getTodayCompletedRentalsAllBranches();
    
    if (response.success && response.data && isMountedRef.current) {
      // إضافة معلومات الفرع لكل تأجير (إذا كانت مفقودة)
      const rentalsWithBranch = await Promise.all(
        response.data.map(async (rental) => {
          if (!rental.branch_name) {
            try {
              const branchResponse = await api.getBranchById(rental.branch_id);
              if (branchResponse.success) {
                rental.branch_name = branchResponse.data.name;
              }
            } catch (error) {
              console.warn(`⚠️ فشل جلب اسم الفرع ${rental.branch_id}:`, error.message);
            }
          }
          return rental;
        })
      );
      
      setAllCompletedRentals(rentalsWithBranch);
    }
  } catch (error) {
    console.error('❌ خطأ في تحميل جميع التأجيرات المكتملة:', error);
  } finally {
    if (isMountedRef.current) {
      setLoading(prev => ({ ...prev, allCompleted: false }));
    }
  }
}, []);

// تحميل آخر التأجيرات في جميع الفروع
const loadAllRecentRentals = useCallback(async () => {
  try {
    setLoading(prev => ({ ...prev, allRecent: true }));
    
    const response = await api.getRecentRentalsAllBranches(20);
    
    if (response.success && response.data && isMountedRef.current) {
      // إضافة معلومات الفرع لكل تأجير (إذا كانت مفقودة)
      const rentalsWithBranch = await Promise.all(
        response.data.map(async (rental) => {
          if (!rental.branch_name) {
            try {
              const branchResponse = await api.getBranchById(rental.branch_id);
              if (branchResponse.success) {
                rental.branch_name = branchResponse.data.name;
              }
            } catch (error) {
              console.warn(`⚠️ فشل جلب اسم الفرع ${rental.branch_id}:`, error.message);
            }
          }
          return rental;
        })
      );
      
      setAllRecentRentals(rentalsWithBranch);
    }
  } catch (error) {
    console.error('❌ خطأ في تحميل آخر التأجيرات:', error);
  } finally {
    if (isMountedRef.current) {
      setLoading(prev => ({ ...prev, allRecent: false }));
    }
  }
}, []);

const loadCurrentUserShift = useCallback(async () => {
  try {
    setLoading(prev => ({ ...prev, shift: true }));
    
    const response = await api.get('/shifts/simple');
    
    if (response.success && response.data && isMountedRef.current) {
      const shift = response.data;
      
      if (shift.employee_id === user?.id || shift.employee_name === user?.name) {
        setCurrentUserShift(shift);
        
        try {
          const activeResponse = await api.get('/rentals/active-simple', {
            params: { shift_id: shift.id, branch_id: user?.branch_id }
          });
          
          const completedResponse = await api.get('/rentals/completed-only', {
            params: { shift_id: shift.id, branch_id: user?.branch_id }
          });
          
          let shiftRevenue = 0;
          if (completedResponse.success && completedResponse.data) {
            shiftRevenue = completedResponse.data.reduce((sum, rental) => {
              return sum + (parseFloat(rental.final_amount) || parseFloat(rental.total_amount) || 0);
            }, 0);
          }
          
          if (activeResponse.success && activeResponse.data) {
            const fixedRentals = activeResponse.data.filter(r => 
              r.rental_type === 'fixed' || r.is_open_time === 0
            );
            
            shiftRevenue += fixedRentals.reduce((sum, rental) => {
              return sum + (parseFloat(rental.paid_amount) || parseFloat(rental.total_amount) || 0);
            }, 0);
          }
          
          setCurrentUserShiftStats({
            activeRentals: activeResponse.success ? activeResponse.data?.length || 0 : 0,
            completedRentals: completedResponse.success ? completedResponse.data?.length || 0 : 0,
            totalRentals: (activeResponse.success ? activeResponse.data?.length || 0 : 0) + 
                         (completedResponse.success ? completedResponse.data?.length || 0 : 0),
            shiftRevenue: shiftRevenue
          });
          
        } catch (statsError) {
          console.warn('⚠️ فشل تحميل إحصائيات الشيفت:', statsError.message);
          setCurrentUserShiftStats({
            activeRentals: 0,
            completedRentals: 0,
            totalRentals: 0,
            shiftRevenue: 0
          });
        }
        
      } else {
        setCurrentUserShift(null);
        setCurrentUserShiftStats(null);
      }
    } else {
      setCurrentUserShift(null);
      setCurrentUserShiftStats(null);
    }
  } catch (error) {
    console.error('❌ خطأ في تحميل الشيفت:', error);
    setCurrentUserShift(null);
    setCurrentUserShiftStats(null);
  } finally {
    if (isMountedRef.current) {
      setLoading(prev => ({ ...prev, shift: false }));
    }
  }
}, [user?.id, user?.name, user?.branch_id]);

// تحميل جميع الشيفتات النشطة للفروع الأخرى (باستثناء فرع المستخدم)
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
        
        setOtherBranchesActiveShifts(filteredShifts);
        console.log(`✅ تم تحميل ${filteredShifts.length} شيفت نشط من الفروع الأخرى`);
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل جميع الشيفتات النشطة للفروع الأخرى:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(prev => ({ ...prev, otherShifts: false }));
      }
    }
  }, [isAdmin, userBranchId]);

// تحميل الشيفتات السابقة
const loadPreviousShifts = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      const response = await api.get('/shifts', {
        params: {
          limit: 10,
          order_by: 'start_time',
          order_direction: 'DESC'
        }
      });
      
      if (response.success && response.data && isMountedRef.current) {
        setPreviousShifts(response.data);
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل الشيفتات السابقة:', error);
    }
  }, [isAdmin]);

// عرض تفاصيل شيفت معين
const handleViewShiftDetails = useCallback(async (shift) => {
    setSelectedShiftForDetails(shift);
    setShowShiftDetailsModal(true);
    
    try {
      const response = await api.get(`/shifts/${shift.id}/details`);
      
      if (response.success && response.data && isMountedRef.current) {
        setShiftDetails(response.data);
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل تفاصيل الشيفت:', error);
    }
}, []);

const closeShiftDetailsModal = useCallback(() => {
    setShowShiftDetailsModal(false);
    setSelectedShiftForDetails(null);
    setShiftDetails(null);
  }, []);

  // عرض تفاصيل تأجير
  const handleViewRental = useCallback((rental) => {
    alert(`📋 تفاصيل التأجير:
رقم التأجير: ${rental.rental_number || 'غير متوفر'}
الفرع: ${rental.branch_name || `فرع ${rental.branch_id}`}
العميل: ${rental.customer_name}
اللعبة: ${rental.game_name}
وقت البدء: ${formatDateTime(rental.start_time)}
الحالة: ${rental.status}
المبلغ: ${formatCurrency(rental.total_amount || 0)}`);
  }, []);


// دالة التحديث الشامل للبيانات
const refreshAllData = useCallback(async (force = false) => {
  if (updateLockRef.current && !force) {
    console.log('⏳ تأجيل التحديث - هناك تحديث قيد التنفيذ');
    return;
  }
  
  updateLockRef.current = true;
  
  try {
    console.log('🔄 بدء التحديث الشامل للوحة التحكم');
    
    await loadDashboardStats();
    await loadBranches();
    await loadAllActiveRentals();
    await loadAllCompletedRentals();
    await loadAllRecentRentals();
    
    // ✅ تحميل الشيفت فقط إذا لم يكن المستخدم مديراً
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
}, [loadDashboardStats, loadBranches, loadAllActiveRentals, loadAllCompletedRentals, loadAllRecentRentals, loadCurrentUserShift, loadOtherBranchesActiveShifts, loadPreviousShifts, isAdmin]);
  // ==================== Effects ====================

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    refreshAllData(true);
    
    const interval = setInterval(() => {
      if (isMountedRef.current && !updateLockRef.current) {
        refreshAllData();
      }
    }, 300000);
    
    return () => clearInterval(interval);
  }, [refreshAllData]);

  // قبل كل طلب API، تحقق من التوكن
useEffect(() => {
  const authStatus = api.checkAuthStatus();
  console.log('🔐 حالة المصادقة في Dashboard:', authStatus);
  
  if (!authStatus.isAuthenticated) {
    console.log('⚠️ لا يوجد توكن، سيتم إعادة التوجيه للصفحة الرئيسية');
    // يمكنك إضافة إعادة توجيه هنا إذا أردت
  }
}, []);

  // ==================== معالجة الأحداث ====================

  const handleBranchClick = (branch) => {
    setSelectedBranch(branch);
    console.log('تم اختيار الفرع:', branch);
  };

  const handleExportData = () => {
    alert('جاري تجهيز التقرير للتصدير...');
  };

  const handlePrintReport = () => {
    window.print();
  };

  // ==================== حساب الإحصائيات المحسنة ====================

  const enhancedStats = useMemo(() => {
    const totalCompletedRentals = allCompletedRentals.length;
    const totalActiveRentals = allActiveRentals.length;
    
    const openTimeRentals = allActiveRentals.filter(r => getRentalType(r) === 'open').length;
    const fixedTimeRentals = allActiveRentals.filter(r => getRentalType(r) === 'fixed').length;
    
    const averageRentalDuration = allCompletedRentals.length > 0 
      ? Math.round(allCompletedRentals.reduce((sum, r) => 
          sum + calculateDuration(r.start_time, r.end_time), 0) / allCompletedRentals.length)
      : 0;
    
    const topGame = allCompletedRentals.length > 0
      ? allCompletedRentals.reduce((acc, r) => {
          acc[r.game_name] = (acc[r.game_name] || 0) + 1;
          return acc;
        }, {})
      : {};
    
    return {
      totalCompletedRentals,
      totalActiveRentals,
      openTimeRentals,
      fixedTimeRentals,
      averageRentalDuration,
      topGame
    };
  }, [allActiveRentals, allCompletedRentals]);

  // ==================== Render ====================

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

      {/* قسم جميع الفروع النشطة */}
      {isAdmin && (
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>
              <Building size={20} />
              جميع الفروع النشطة
            </h2>
            <button 
              onClick={loadBranches}
              className="dashboard-btn-icon"
              disabled={loading.branches}
            >
              <RefreshCw size={16} className={loading.branches ? 'dashboard-spinner' : ''} />
            </button>
          </div>
          
          <div className="dashboard-branches-grid">
            {loading.branches ? (
              <div className="dashboard-loading-state">
                <Loader2 className="dashboard-spinner" size={32} />
                <p>جاري تحميل الفروع...</p>
              </div>
            ) : branches.length === 0 ? (
              <div className="dashboard-empty-state">
                <Building size={48} />
                <p>لا توجد فروع</p>
              </div>
            ) : (
              branches.map(branch => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  onClick={handleBranchClick}
                  stats={branchesStats[branch.id] || { games: 0, activeRentals: 0, revenue: 0 }}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* قسم الشيفتات النشطة في الفروع الأخرى */}
      {isAdmin && (
        <div className="dashboard-section dashboard-other-branches-section">
          <div className="dashboard-section-header">
            <h2>
              <Clock size={20} />
              الشيفتات النشطة في الفروع الأخرى
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
          
          <OtherBranchesShiftsList 
            shifts={otherBranchesActiveShifts}
            onViewDetails={handleViewShiftDetails}
            loading={loading.otherShifts}
          />
        </div>
      )}

      {/* قسم التأجيرات النشطة في جميع الفروع */}
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

      {/* قسم التأجيرات المكتملة اليوم في جميع الفروع */}
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

      {/* قسم آخر التأجيرات في جميع الفروع */}
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

      {/* قسم الشيفتات السابقة (للمدير فقط) */}
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