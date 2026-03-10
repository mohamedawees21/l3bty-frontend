import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Download, RefreshCw, Calendar, 
  DollarSign, TrendingUp, BarChart3, FileText,
  ChevronDown, ChevronUp, CheckCircle, XCircle,
  Eye, Printer, Save, Building, Clock, Users,
  ChevronLeft, ChevronRight, AlertCircle, Check,
  X, Plus, Minus, Calculator, Lock, Unlock,
  Edit, Trash2, User, Gamepad2, CreditCard,
  Calendar as CalendarIcon, Clock as ClockIcon,
  Phone, Mail, MapPin, Package, Tag, ExternalLink,
  MoreVertical, DownloadCloud, Upload, Settings,
  Shield, AlertTriangle, Bell, Star, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './RentalsRevenueAnalysis.css';

const RentalsRevenueAnalysis = () => {
  // ==================== CONTEXT & AUTH ====================
  const { user } = useAuth();
  
  // ==================== STATES ====================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data States - تهيئة بالقيم الافتراضية
  const [shifts, setShifts] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [games, setGames] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  // Filter States
  const [filters, setFilters] = useState({
    shiftId: '',
    branchId: 'all',
    employeeId: 'all',
    dateFrom: '',
    dateTo: '',
    period: 'today',
    status: 'all',
    shiftType: 'all'
  });
  
  // Pagination & Sorting
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'start_time',
    direction: 'desc'
  });
  
  // Analysis States - تهيئة بالقيم الافتراضية
  const [analysis, setAnalysis] = useState({
    totalRevenue: 0,
    totalRentals: 0,
    paidRentals: 0,
    pendingRentals: 0,
    averagePerRental: 0,
    dailyRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    totalShifts: 0,
    activeShifts: 0,
    completedShifts: 0,
    shiftDetails: null,
    dailyBreakdown: [],
    shiftBreakdown: [],
    monthlySummary: null,
    dailyStats: {},
    performanceMetrics: {}
  });
  
  // UI States
  const [selectedShiftDetails, setSelectedShiftDetails] = useState(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [closingShift, setClosingShift] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Editing States
  const [editingShift, setEditingShift] = useState(false);
  const [editedShift, setEditedShift] = useState(null);
  const [editedRentals, setEditedRentals] = useState({});
  const [savingChanges, setSavingChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [rentalToEdit, setRentalToEdit] = useState(null);
  const [showRentalEditModal, setShowRentalEditModal] = useState(false);
  const [showNewRentalModal, setShowNewRentalModal] = useState(false);
  const [newRental, setNewRental] = useState({
    customer_name: '',
    customer_phone: '',
    game_id: '',
    start_time: '',
    end_time: '',
    total_amount: '',
    payment_method: 'نقدي',
    payment_status: 'غير مدفوع',
    status: 'نشط',
    notes: ''
  });
  
  // Notification System
  const [notifications, setNotifications] = useState([]);

  // ==================== UTILITIES ====================
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '-';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
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
    } catch (error) {
      return '-';
    }
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    try {
      const startTime = new Date(start);
      const endTime = new Date(end);
      const diffMs = endTime - startTime;
      return Math.round(diffMs / (1000 * 60));
    } catch (error) {
      return 0;
    }
  };

  const addNotification = (type, message) => {
    const id = Date.now();
    const notification = {
      id,
      type,
      message,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // ==================== LOAD ALL DATA ====================
  const loadAllData = useCallback(async () => {
    try {
      if (!user) {
        setError('يجب تسجيل الدخول أولاً');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      // تحميل البيانات مع معالجة الأخطاء لكل API
      let branchesRes = { success: false, data: [] };
      let shiftsRes = { success: false, data: [] };
      let employeesRes = { success: false, data: [] };
      let gamesRes = { success: false, data: [] };
      let rentalsRes = { success: false, data: [] };
      
      try {
        branchesRes = await api.getBranches();
      } catch (error) {
        console.error('Error loading branches:', error);
        branchesRes = { success: false, data: [] };
      }
      
      try {
        shiftsRes = await api.getShiftsSafe({
          limit: 100,
          order_by: 'start_time',
          order_direction: 'DESC'
        });
      } catch (error) {
        console.error('Error loading shifts:', error);
        shiftsRes = { success: false, data: [] };
      }
      
      try {
        employeesRes = await api.get('/users', {
          params: { is_active: 1 }
        });
      } catch (error) {
        console.error('Error loading employees:', error);
        // إنشاء بيانات موظفين افتراضية من الشيفتات
        if (shiftsRes.success && shiftsRes.data) {
          const uniqueEmployees = new Map();
          shiftsRes.data.forEach(shift => {
            if (shift.employee_id && shift.employee_name) {
              uniqueEmployees.set(shift.employee_id, {
                id: shift.employee_id,
                name: shift.employee_name,
                role: 'employee'
              });
            }
          });
          employeesRes.data = Array.from(uniqueEmployees.values());
          employeesRes.success = true;
        } else {
          employeesRes = { success: false, data: [] };
        }
      }
      
      try {
        gamesRes = await api.getGames();
      } catch (error) {
        console.error('Error loading games:', error);
        gamesRes = { success: false, data: [] };
      }
      
      try {
        rentalsRes = await api.getRentals({
          limit: 1000,
          include_game: true,
          include_branch: true
        });
      } catch (error) {
        console.error('Error loading rentals:', error);
        rentalsRes = { success: false, data: [] };
      }
      
      // تحديث الحالات مع التحقق من البيانات
      setBranches(branchesRes.data || []);
      setShifts(shiftsRes.data || []);
      setEmployees(employeesRes.data || []);
      setGames(gamesRes.data || []);
      setRentals(rentalsRes.data || []);
      
      // تحليل البيانات
      analyzeData(rentalsRes.data || [], shiftsRes.data || []);
      
      // تحديث الباجينيشن
      const shiftsData = shiftsRes.data || [];
      setPagination(prev => ({
        ...prev,
        total: shiftsData.length,
        totalPages: Math.ceil(shiftsData.length / prev.limit) || 1
      }));
      
      addNotification('success', 'تم تحميل البيانات بنجاح');
      
    } catch (error) {
      console.error('Error in loadAllData:', error);
      setError(error.message || 'حدث خطأ في تحميل البيانات');
      addNotification('error', 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // ==================== ANALYZE DATA ====================
  const analyzeData = useCallback((rentalsData, shiftsData) => {
    try {
      // التأكد من أن البيانات عبارة عن مصفوفات
      const safeRentalsData = Array.isArray(rentalsData) ? rentalsData : [];
      const safeShiftsData = Array.isArray(shiftsData) ? shiftsData : [];
      
      // تحليل التأجيرات
      const paidRentals = safeRentalsData.filter(rental => 
        rental && rental.payment_status === 'مدفوع'
      );
      
      const totalRevenue = paidRentals.reduce((sum, rental) => {
        const amount = parseFloat(rental?.total_amount) || 0;
        return sum + amount;
      }, 0);
      
      const totalShifts = safeShiftsData.length;
      const activeShifts = safeShiftsData.filter(shift => 
        shift && !shift.end_time
      ).length;
      const completedShifts = safeShiftsData.filter(shift => 
        shift && shift.end_time
      ).length;
      
      // الإيراد اليومي
      const today = new Date().toISOString().split('T')[0];
      const todayRentals = paidRentals.filter(rental => 
        rental?.created_at && rental.created_at.split('T')[0] === today
      );
      
      const dailyRevenue = todayRentals.reduce((sum, rental) => {
        const amount = parseFloat(rental?.total_amount) || 0;
        return sum + amount;
      }, 0);
      
      // الإيراد الشهري (آخر 30 يوم)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const monthlyRentals = paidRentals.filter(rental => {
        if (!rental?.created_at) return false;
        try {
          const rentalDate = new Date(rental.created_at);
          return rentalDate >= thirtyDaysAgo;
        } catch (error) {
          return false;
        }
      });
      
      const monthlyRevenue = monthlyRentals.reduce((sum, rental) => {
        const amount = parseFloat(rental?.total_amount) || 0;
        return sum + amount;
      }, 0);
      
      // مقاييس الأداء
      const averageShiftRevenue = completedShifts > 0 ? totalRevenue / completedShifts : 0;
      
      const performanceMetrics = {
        averageShiftRevenue,
        averageShiftDuration: 0,
        rentalConversionRate: safeRentalsData.length > 0 ? (paidRentals.length / safeRentalsData.length) * 100 : 0,
        revenuePerHour: 0
      };
      
      setAnalysis(prev => ({
        ...prev,
        totalRevenue,
        totalRentals: paidRentals.length,
        paidRentals: paidRentals.length,
        pendingRentals: Math.max(0, safeRentalsData.length - paidRentals.length),
        averagePerRental: paidRentals.length > 0 ? totalRevenue / paidRentals.length : 0,
        dailyRevenue,
        monthlyRevenue,
        totalShifts,
        activeShifts,
        completedShifts,
        performanceMetrics
      }));
      
    } catch (error) {
      console.error('Error in analyzeData:', error);
      addNotification('error', 'حدث خطأ في تحليل البيانات');
    }
  }, []);

  // ==================== GET SHIFT DETAILS ====================
  const getShiftDetails = useCallback(async (shiftId) => {
    try {
      setLoading(true);
      setError(null);
      
      // البحث عن الشيفت مع التحقق من المصفوفة
      const shift = Array.isArray(shifts) 
        ? shifts.find(s => s && s.id == shiftId)
        : null;
      
      if (!shift) {
        addNotification('error', 'الشيفت غير موجود');
        return;
      }
      
      // تحميل تأجيرات الشيفت
      let shiftRentalsRes = { success: false, data: [] };
      try {
        shiftRentalsRes = await api.getRentals({
          shift_id: shiftId,
          limit: 500,
          include_game: true,
          include_branch: true,
          include_employee: true,
          include_customer: true
        });
      } catch (error) {
        console.error('Error loading shift rentals:', error);
        shiftRentalsRes = { success: false, data: [] };
      }
      
      if (!shiftRentalsRes.success) {
        addNotification('warning', 'لم يتم تحميل جميع تفاصيل التأجيرات');
      }
      
      const shiftRentals = Array.isArray(shiftRentalsRes.data) ? shiftRentalsRes.data : [];
      
      // حساب إحصائيات الشيفت
      const paidRentals = shiftRentals.filter(rental => 
        rental && rental.payment_status === 'مدفوع'
      );
      
      const shiftRevenue = paidRentals.reduce((sum, rental) => {
        const amount = parseFloat(rental?.total_amount) || 0;
        return sum + amount;
      }, 0);
      
      // إحصائيات المجموعات
      const gameStats = {};
      const paymentStats = {};
      
      paidRentals.forEach(rental => {
        if (!rental) return;
        
        const gameName = rental.game_name || 'غير معروف';
        const method = rental.payment_method || 'غير معروف';
        
        // إحصائيات الألعاب
        if (!gameStats[gameName]) {
          gameStats[gameName] = { 
            name: gameName, 
            count: 0, 
            revenue: 0 
          };
        }
        gameStats[gameName].count++;
        gameStats[gameName].revenue += parseFloat(rental.total_amount) || 0;
        
        // إحصائيات الدفع
        if (!paymentStats[method]) {
          paymentStats[method] = { 
            method, 
            count: 0, 
            revenue: 0 
          };
        }
        paymentStats[method].count++;
        paymentStats[method].revenue += parseFloat(rental.total_amount) || 0;
      });
      
      // إحصائيات العملاء
      const customerStats = {};
      paidRentals.forEach(rental => {
        if (!rental) return;
        
        const customerName = rental.customer_name || 'مجهول';
        if (!customerStats[customerName]) {
          customerStats[customerName] = {
            name: customerName,
            phone: rental.customer_phone || 'لا يوجد',
            count: 0,
            revenue: 0,
            lastVisit: rental.start_time
          };
        }
        customerStats[customerName].count++;
        customerStats[customerName].revenue += parseFloat(rental.total_amount) || 0;
        
        // تحديث آخر زيارة
        if (rental.start_time) {
          try {
            const rentalDate = new Date(rental.start_time);
            const lastVisit = new Date(customerStats[customerName].lastVisit || 0);
            if (rentalDate > lastVisit) {
              customerStats[customerName].lastVisit = rental.start_time;
            }
          } catch (error) {
            // تجاهل خطأ التاريخ
          }
        }
      });
      
      const shiftDetails = {
        shiftInfo: shift,
        totalRentals: shiftRentals.length,
        paidRentals: paidRentals.length,
        pendingRentals: Math.max(0, shiftRentals.length - paidRentals.length),
        shiftRevenue,
        averagePerRental: paidRentals.length > 0 ? shiftRevenue / paidRentals.length : 0,
        startTime: shift.start_time,
        endTime: shift.end_time,
        duration: calculateDuration(shift.start_time, shift.end_time),
        rentals: shiftRentals,
        paidRentalsList: paidRentals,
        gameStats: Object.values(gameStats),
        paymentStats: Object.values(paymentStats),
        customerStats: Object.values(customerStats).sort((a, b) => b.revenue - a.revenue),
        employeeName: shift.employee_name || 'غير معروف',
        branchName: shift.branch_name || 'غير محدد',
        shiftStatus: shift.status || 'غير محدد',
        notes: shift.notes || 'لا توجد ملاحظات'
      };
      
      setSelectedShiftDetails(shiftDetails);
      setEditedShift({ ...shift });
      setShowShiftModal(true);
      addNotification('success', `تم تحميل تفاصيل الشيفت #${shiftId}`);
      
    } catch (error) {
      console.error('Error in getShiftDetails:', error);
      addNotification('error', error.message || 'حدث خطأ في تحميل التفاصيل');
    } finally {
      setLoading(false);
    }
  }, [shifts]);

  // ==================== SHIFT EDITING FUNCTIONS ====================
  const handleEditShift = () => {
    if (!selectedShiftDetails || !selectedShiftDetails.shiftInfo) {
      addNotification('error', 'لا توجد بيانات للشيفت');
      return;
    }
    setEditingShift(true);
    addNotification('info', 'تم تفعيل وضع التعديل للشيفت');
  };

  const handleSaveShift = async () => {
    if (!editedShift || !editedShift.id) {
      addNotification('error', 'لا توجد بيانات لحفظها');
      return;
    }
    
    try {
      setSavingChanges(true);
      
      // التحقق من أوقات الشيفت
      if (editedShift.start_time && editedShift.end_time) {
        try {
          const startTime = new Date(editedShift.start_time);
          const endTime = new Date(editedShift.end_time);
          
          if (endTime <= startTime) {
            addNotification('error', 'وقت الانتهاء يجب أن يكون بعد وقت البدء');
            return;
          }
        } catch (error) {
          addNotification('warning', 'خطأ في تنسيق الوقت، سيتم استخدام الأوقات كما هي');
        }
      }
      
      // تحديث الشيفت
      const updateData = {
        employee_id: editedShift.employee_id || '',
        branch_id: editedShift.branch_id || '',
        start_time: editedShift.start_time || '',
        end_time: editedShift.end_time || '',
        notes: editedShift.notes || '',
        status: editedShift.status || 'نشط'
      };
      
      const response = await api.updateShift(editedShift.id, updateData);
      
      if (response.success) {
        addNotification('success', '✅ تم تحديث بيانات الشيفت بنجاح');
        setEditingShift(false);
        loadAllData();
        if (selectedShiftDetails?.shiftInfo?.id === editedShift.id) {
          getShiftDetails(editedShift.id); // تحديث التفاصيل
        }
      } else {
        throw new Error(response.message || 'فشل تحديث الشيفت');
      }
    } catch (error) {
      console.error('Error saving shift:', error);
      addNotification('error', error.message || 'حدث خطأ في حفظ البيانات');
    } finally {
      setSavingChanges(false);
    }
  };

  const handleCancelEdit = () => {
    if (selectedShiftDetails?.shiftInfo) {
      setEditedShift({ ...selectedShiftDetails.shiftInfo });
    }
    setEditingShift(false);
    addNotification('info', 'تم إلغاء التعديلات');
  };

  const handleShiftFieldChange = (field, value) => {
    setEditedShift(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ==================== RENTAL MANAGEMENT ====================
  const handleEditRental = (rental) => {
    if (!rental) {
      addNotification('error', 'لا توجد بيانات للتأجير');
      return;
    }
    setRentalToEdit({ ...rental });
    setShowRentalEditModal(true);
  };

  const handleSaveRental = async () => {
    if (!rentalToEdit || !rentalToEdit.id) {
      addNotification('error', 'لا توجد بيانات للتأجير');
      return;
    }
    
    try {
      setSavingChanges(true);
      
      // التحقق من بيانات التأجير
      if (!rentalToEdit.game_id) {
        addNotification('error', 'يجب اختيار لعبة');
        return;
      }
      
      const totalAmount = parseFloat(rentalToEdit.total_amount) || 0;
      if (totalAmount <= 0) {
        addNotification('error', 'يجب إدخال مبلغ صحيح أكبر من الصفر');
        return;
      }
      
      const updateData = {
        game_id: rentalToEdit.game_id,
        customer_name: rentalToEdit.customer_name || '',
        customer_phone: rentalToEdit.customer_phone || '',
        start_time: rentalToEdit.start_time || '',
        end_time: rentalToEdit.end_time || '',
        total_amount: totalAmount,
        payment_method: rentalToEdit.payment_method || 'نقدي',
        payment_status: rentalToEdit.payment_status || 'غير مدفوع',
        status: rentalToEdit.status || 'نشط',
        notes: rentalToEdit.notes || '',
        shift_id: rentalToEdit.shift_id || (selectedShiftDetails?.shiftInfo?.id || '')
      };
      
      const response = await api.updateRental(rentalToEdit.id, updateData);
      
      if (response.success) {
        addNotification('success', '✅ تم تحديث التأجير بنجاح');
        setShowRentalEditModal(false);
        if (selectedShiftDetails?.shiftInfo?.id) {
          getShiftDetails(selectedShiftDetails.shiftInfo.id);
        }
      } else {
        throw new Error(response.message || 'فشل تحديث التأجير');
      }
    } catch (error) {
      console.error('Error saving rental:', error);
      addNotification('error', error.message || 'حدث خطأ في حفظ التأجير');
    } finally {
      setSavingChanges(false);
    }
  };

  const handleAddNewRental = async () => {
    if (!selectedShiftDetails?.shiftInfo?.id) {
      addNotification('error', 'لا يوجد شيفت محدد');
      return;
    }
    
    try {
      setSavingChanges(true);
      
      // التحقق من البيانات
      if (!newRental.game_id) {
        addNotification('error', 'يجب اختيار لعبة');
        return;
      }
      
      const totalAmount = parseFloat(newRental.total_amount) || 0;
      if (totalAmount <= 0) {
        addNotification('error', 'يجب إدخال مبلغ صحيح أكبر من الصفر');
        return;
      }
      
      const createData = {
        ...newRental,
        total_amount: totalAmount,
        shift_id: selectedShiftDetails.shiftInfo.id,
        branch_id: user?.branch_id || selectedShiftDetails.shiftInfo.branch_id || '',
        employee_id: user?.id || selectedShiftDetails.shiftInfo.employee_id || '',
        rental_number: `R${Date.now()}`,
        created_at: new Date().toISOString()
      };
      
      const response = await api.createRental(createData);
      
      if (response.success) {
        addNotification('success', '✅ تم إضافة التأجير بنجاح');
        setShowNewRentalModal(false);
        setNewRental({
          customer_name: '',
          customer_phone: '',
          game_id: '',
          start_time: '',
          end_time: '',
          total_amount: '',
          payment_method: 'نقدي',
          payment_status: 'غير مدفوع',
          status: 'نشط',
          notes: ''
        });
        getShiftDetails(selectedShiftDetails.shiftInfo.id);
      } else {
        throw new Error(response.message || 'فشل إضافة التأجير');
      }
    } catch (error) {
      console.error('Error adding rental:', error);
      addNotification('error', error.message || 'حدث خطأ في إضافة التأجير');
    } finally {
      setSavingChanges(false);
    }
  };

  const handleDeleteRental = async (rentalId) => {
    if (!rentalId) {
      addNotification('error', 'لا يوجد تأجير محدد');
      return;
    }
    
    if (!window.confirm('هل تريد حذف هذا التأجير؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      return;
    }
    
    try {
      setSavingChanges(true);
      const response = await api.deleteRental(rentalId);
      
      if (response.success) {
        addNotification('success', '✅ تم حذف التأجير بنجاح');
        if (selectedShiftDetails?.shiftInfo?.id) {
          getShiftDetails(selectedShiftDetails.shiftInfo.id);
        }
      } else {
        throw new Error(response.message || 'فشل حذف التأجير');
      }
    } catch (error) {
      console.error('Error deleting rental:', error);
      addNotification('error', error.message || 'حدث خطأ في حذف التأجير');
    } finally {
      setSavingChanges(false);
    }
  };

  // ==================== SHIFT MANAGEMENT ====================
  const handleDeleteShift = async () => {
    if (!shiftToDelete) {
      addNotification('error', 'لا يوجد شيفت محدد');
      return;
    }
    
    try {
      setSavingChanges(true);
      const response = await api.deleteShift(shiftToDelete);
      
      if (response.success) {
        addNotification('success', '✅ تم حذف الشيفت بنجاح');
        setShowDeleteConfirm(false);
        setShowShiftModal(false);
        loadAllData();
      } else {
        throw new Error(response.message || 'فشل حذف الشيفت');
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
      addNotification('error', error.message || 'حدث خطأ في حذف الشيفت');
    } finally {
      setSavingChanges(false);
    }
  };

  const closeShift = useCallback(async (shiftId) => {
    if (!shiftId) {
      addNotification('error', 'لا يوجد شيفت محدد');
      return;
    }
    
    if (!window.confirm('هل تريد تقفيل هذا الشيفت؟ هذا الإجراء نهائي.')) {
      return;
    }
    
    try {
      setClosingShift(true);
      
      // البحث عن الشيفت
      const shift = Array.isArray(shifts) 
        ? shifts.find(s => s && s.id == shiftId)
        : null;
      
      if (!shift) {
        throw new Error('الشيفت غير موجود');
      }
      
      // تحميل تأجيرات الشيفت
      let response = { success: false, data: [] };
      try {
        response = await api.getRentals({
          shift_id: shiftId,
          include_game: true
        });
      } catch (error) {
        console.error('Error loading rentals for closing:', error);
        response = { success: false, data: [] };
      }
      
      const shiftRentals = Array.isArray(response.data) ? response.data : [];
      const paidRentals = shiftRentals.filter(r => 
        r && r.payment_status === 'مدفوع'
      );
      
      const shiftRevenue = paidRentals.reduce((sum, rental) => {
        const amount = parseFloat(rental?.total_amount) || 0;
        return sum + amount;
      }, 0);
      
      const closeResponse = await api.endShift(shiftId, {
        end_time: new Date().toISOString(),
        total_revenue: shiftRevenue,
        total_rentals: shiftRentals.length,
        paid_rentals: paidRentals.length,
        status: 'منتهي',
        notes: `تم التقفيل في ${new Date().toLocaleString('ar-EG')} - الإيراد: ${formatCurrency(shiftRevenue)}`
      });
      
      if (closeResponse.success) {
        addNotification('success', `✅ تم تقفيل الشيفت #${shiftId} بنجاح`);
        loadAllData();
        setShowShiftModal(false);
      } else {
        throw new Error(closeResponse.message || 'فشل تقفيل الشيفت');
      }
      
    } catch (error) {
      console.error('Error closing shift:', error);
      addNotification('error', error.message || 'حدث خطأ في تقفيل الشيفت');
    } finally {
      setClosingShift(false);
    }
  }, [shifts, loadAllData]);

  // ==================== FILTERS & SORTING ====================
  const applyFilters = () => {
    // التأكد من أن shifts هي مصفوفة
    const safeShifts = Array.isArray(shifts) ? [...shifts] : [];
    
    let filteredShifts = safeShifts.filter(shift => shift); // إزالة العناصر null/undefined
    
    // فلترة برقم الشيفت
    if (filters.shiftId) {
      filteredShifts = filteredShifts.filter(shift => 
        shift.id && shift.id.toString().includes(filters.shiftId)
      );
    }
    
    // فلترة بالفرع
    if (filters.branchId !== 'all') {
      filteredShifts = filteredShifts.filter(shift => 
        shift.branch_id == filters.branchId
      );
    }
    
    // فلترة بالموظف
    if (filters.employeeId !== 'all') {
      filteredShifts = filteredShifts.filter(shift => 
        shift.employee_id == filters.employeeId
      );
    }
    
    // فلترة بنطاق التاريخ
    if (filters.dateFrom) {
      filteredShifts = filteredShifts.filter(shift => {
        if (!shift.start_time) return false;
        try {
          return new Date(shift.start_time) >= new Date(filters.dateFrom);
        } catch (error) {
          return false;
        }
      });
    }
    
    if (filters.dateTo) {
      filteredShifts = filteredShifts.filter(shift => {
        if (!shift.start_time) return false;
        try {
          return new Date(shift.start_time) <= new Date(filters.dateTo + 'T23:59:59');
        } catch (error) {
          return false;
        }
      });
    }
    
    // فلترة بالحالة
    if (filters.status !== 'all') {
      if (filters.status === 'active') {
        filteredShifts = filteredShifts.filter(shift => !shift.end_time);
      } else if (filters.status === 'ended') {
        filteredShifts = filteredShifts.filter(shift => shift.end_time);
      }
    }
    
    // الترتيب
    filteredShifts.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filteredShifts;
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // ==================== EXPORT FUNCTIONS ====================
  const exportToExcel = async () => {
    try {
      setExporting(true);
      
      const filteredShifts = applyFilters();
      
      if (filteredShifts.length === 0) {
        addNotification('warning', 'لا توجد بيانات للتصدير');
        return;
      }
      
      // تحضير البيانات للتصدير
      const exportData = {
        shifts: filteredShifts.map(shift => ({
          'رقم الشيفت': shift.id || '',
          'الموظف': shift.employee_name || 'غير معروف',
          'الفرع': shift.branch_name || 'غير محدد',
          'وقت البدء': formatDateTime(shift.start_time),
          'وقت الانتهاء': shift.end_time ? formatDateTime(shift.end_time) : 'نشط',
          'المدة (دقيقة)': calculateDuration(shift.start_time, shift.end_time),
          'عدد التأجيرات': shift.total_rentals || 0,
          'الإيرادات': shift.total_revenue || 0,
          'الحالة': shift.end_time ? 'منتهي' : 'نشط',
          'ملاحظات': shift.notes || ''
        })),
        analysis: {
          'إجمالي الإيرادات': analysis.totalRevenue,
          'إجمالي التأجيرات': analysis.totalRentals,
          'متوسط التأجير': analysis.averagePerRental,
          'الإيراد اليومي': analysis.dailyRevenue,
          'الإيراد الشهري': analysis.monthlyRevenue,
          'عدد الشيفتات': analysis.totalShifts,
          'الشيفتات النشطة': analysis.activeShifts,
          'الشيفتات المنتهية': analysis.completedShifts
        }
      };
      
      // إنشاء محتوى CSV
      let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM للغة العربية
      
      // إضافة بيانات الشيفتات
      csvContent += "الشيفتات\n";
      if (exportData.shifts.length > 0) {
        const shiftHeaders = Object.keys(exportData.shifts[0]);
        csvContent += shiftHeaders.join(',') + "\n";
        exportData.shifts.forEach(row => {
          csvContent += Object.values(row).map(value => 
            `"${String(value).replace(/"/g, '""')}"`
          ).join(',') + "\n";
        });
      }
      
      csvContent += "\n\nالإحصائيات\n";
      Object.entries(exportData.analysis).forEach(([key, value]) => {
        csvContent += `"${key}","${value}"\n`;
      });
      
      // إنشاء رابط التنزيل
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `shifts_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addNotification('success', 'تم تصدير البيانات بنجاح');
      
    } catch (error) {
      console.error('Error exporting data:', error);
      addNotification('error', 'حدث خطأ في تصدير البيانات');
    } finally {
      setExporting(false);
    }
  };

  const printReport = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  };

  // ==================== REFRESH & RESET ====================
  const handleRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const resetFilters = () => {
    setFilters({
      shiftId: '',
      branchId: 'all',
      employeeId: 'all',
      dateFrom: '',
      dateTo: '',
      period: 'today',
      status: 'all',
      shiftType: 'all'
    });
    addNotification('info', 'تم إعادة تعيين الفلاتر');
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ==================== RENDER ====================
  // التأكد من أن البيانات جاهزة قبل العرض
  const safeShifts = Array.isArray(shifts) ? shifts : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeBranches = Array.isArray(branches) ? branches : [];
  const safeGames = Array.isArray(games) ? games : [];
  
  const filteredShifts = applyFilters();
  const displayedShifts = Array.isArray(filteredShifts) 
    ? filteredShifts.slice(
        (pagination.page - 1) * pagination.limit,
        pagination.page * pagination.limit
      )
    : [];

  if (loading && !showShiftModal) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>جاري تحميل البيانات المالية...</p>
      </div>
    );
  }

  return (
    <div className="revenue-analysis-page">
      {/* NOTIFICATIONS */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification notification-${notification.type}`}>
            <div className="notification-content">
              <span>{notification.message}</span>
              <button 
                className="notification-close"
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* HEADER */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <h1>
              <span className="header-icon">💰</span>
              التحليل المالي والإيرادات
            </h1>
            <span className="header-badge">شامل</span>
          </div>
          <p className="page-subtitle">إدارة كاملة للشيفتات، التأجيرات، والإيرادات</p>
        </div>
        
        <div className="header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'جاري التحديث...' : 'تحديث البيانات'}
          </button>
          
          <button
            className="btn btn-primary btn-sm"
            onClick={exportToExcel}
            disabled={exporting || filteredShifts.length === 0}
          >
            <DownloadCloud size={16} />
            {exporting ? 'جاري التصدير...' : 'تصدير Excel'}
          </button>
          
          <button
            className="btn btn-success btn-sm"
            onClick={printReport}
            disabled={printing}
          >
            <Printer size={16} />
            طباعة التقرير
          </button>
        </div>
      </div>
      
      {/* QUICK STATS */}
      <div className="quick-stats-section">
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-label">إجمالي الإيرادات</div>
              <div className="stat-value">{formatCurrency(analysis.totalRevenue)}</div>
              <div className="stat-trend">
                <TrendingUp size={14} />
                <span>شهرياً: {formatCurrency(analysis.monthlyRevenue)}</span>
              </div>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">إجمالي التأجيرات</div>
              <div className="stat-value">{analysis.totalRentals.toLocaleString('ar-EG')}</div>
              <div className="stat-sub">
                <span className="paid">مدفوعة: {analysis.paidRentals}</span>
                <span className="pending">معلقة: {analysis.pendingRentals}</span>
              </div>
            </div>
          </div>
          
          <div className="stat-card warning">
            <div className="stat-icon">🔄</div>
            <div className="stat-content">
              <div className="stat-label">الشيفتات</div>
              <div className="stat-value">{analysis.totalShifts.toLocaleString('ar-EG')}</div>
              <div className="stat-sub">
                <span className="active">نشطة: {analysis.activeShifts}</span>
                <span className="ended">منتهية: {analysis.completedShifts}</span>
              </div>
            </div>
          </div>
          
          <div className="stat-card info">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-label">متوسط التأجير</div>
              <div className="stat-value">{formatCurrency(analysis.averagePerRental)}</div>
              <div className="stat-trend">
                <BarChart3 size={14} />
                <span>الإيراد اليومي: {formatCurrency(analysis.dailyRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FILTERS SECTION */}
      <div className={`filters-section ${showFilters ? 'expanded' : ''}`}>
        <div className="filters-header" onClick={() => setShowFilters(!showFilters)}>
          <h3>
            <Filter size={20} />
            فلاتر البحث المتقدمة
            <span className="filter-toggle">
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </h3>
        </div>
        
        {showFilters && (
          <div className="filters-content">
            <div className="filters-grid">
              <div className="filter-group">
                <label>رقم الشيفت:</label>
                <input
                  type="number"
                  value={filters.shiftId}
                  onChange={(e) => setFilters(prev => ({ ...prev, shiftId: e.target.value }))}
                  placeholder="أدخل رقم الشيفت..."
                  className="filter-input"
                />
              </div>
              
              <div className="filter-group">
                <label>الفرع:</label>
                <select
                  value={filters.branchId}
                  onChange={(e) => setFilters(prev => ({ ...prev, branchId: e.target.value }))}
                  className="filter-select"
                >
                  <option value="all">جميع الفروع</option>
                  {safeBranches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>الموظف:</label>
                <select
                  value={filters.employeeId}
                  onChange={(e) => setFilters(prev => ({ ...prev, employeeId: e.target.value }))}
                  className="filter-select"
                >
                  <option value="all">جميع الموظفين</option>
                  {safeEmployees.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>من تاريخ:</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="filter-input"
                />
              </div>
              
              <div className="filter-group">
                <label>إلى تاريخ:</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="filter-input"
                />
              </div>
              
              <div className="filter-group">
                <label>الحالة:</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="filter-select"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط فقط</option>
                  <option value="ended">منتهي فقط</option>
                </select>
              </div>
            </div>
            
            <div className="filter-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (filters.shiftId) {
                    getShiftDetails(filters.shiftId);
                  }
                }}
                disabled={!filters.shiftId}
              >
                <Search size={16} />
                بحث عن الشيفت
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={resetFilters}
              >
                <X size={16} />
                إعادة تعيين
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* SHIFTS TABLE */}
      <div className="shifts-section">
        <div className="section-header">
          <h2>
            <span className="section-icon">🔄</span>
            قائمة الشيفتات
            <span className="section-count">({filteredShifts.length})</span>
          </h2>
          
          <div className="table-controls">
            <div className="pagination-info">
              عرض {Math.min(displayedShifts.length, pagination.limit)} من {filteredShifts.length}
            </div>
            <div className="pagination-controls">
              <button
                className="btn-pagination"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="page-info">صفحة {pagination.page} من {Math.max(1, Math.ceil(filteredShifts.length / pagination.limit))}</span>
              <button
                className="btn-pagination"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(Math.max(1, Math.ceil(filteredShifts.length / pagination.limit)), prev.page + 1) }))}
                disabled={pagination.page >= Math.max(1, Math.ceil(filteredShifts.length / pagination.limit))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {filteredShifts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>لا توجد شيفتات</h3>
            <p>{safeShifts.length === 0 ? 'لم يتم العثور على شيفتات في النظام' : 'قم بتعديل الفلاتر'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="shifts-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')}>
                    رقم الشيفت
                    {sortConfig.key === 'id' && (
                      <span className="sort-icon">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>الموظف</th>
                  <th>الفرع</th>
                  <th onClick={() => handleSort('start_time')}>
                    وقت البدء
                    {sortConfig.key === 'start_time' && (
                      <span className="sort-icon">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>وقت الانتهاء</th>
                  <th>المدة</th>
                  <th onClick={() => handleSort('total_rentals')}>
                    التأجيرات
                    {sortConfig.key === 'total_rentals' && (
                      <span className="sort-icon">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th onClick={() => handleSort('total_revenue')}>
                    الإيرادات
                    {sortConfig.key === 'total_revenue' && (
                      <span className="sort-icon">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {displayedShifts.map(shift => (
                  <tr key={shift.id} className={!shift.end_time ? 'active-row' : ''}>
                    <td>
                      <strong className="shift-number">#{shift.id}</strong>
                    </td>
                    <td>
                      <div className="employee-info">
                        <User size={14} />
                        <span>{shift.employee_name || 'غير معروف'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="branch-info">
                        <Building size={14} />
                        <span>{shift.branch_name || 'غير محدد'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="time-info">
                        <CalendarIcon size={12} />
                        <span>{formatDateTime(shift.start_time)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="time-info">
                        <ClockIcon size={12} />
                        <span>{shift.end_time ? formatDateTime(shift.end_time) : 'لا يزال نشط'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="duration-badge">
                        {calculateDuration(shift.start_time, shift.end_time)} دقيقة
                      </span>
                    </td>
                    <td>
                      <div className="rentals-count">
                        <FileText size={12} />
                        <span>{shift.total_rentals || 0}</span>
                      </div>
                    </td>
                    <td>
                      <div className="revenue-amount">
                        <DollarSign size={12} />
                        <span>{formatCurrency(shift.total_revenue || 0)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${!shift.end_time ? 'active' : shift.status === 'منتهي' ? 'ended' : 'other'}`}>
                        {!shift.end_time ? '🔥 نشط' : shift.status === 'منتهي' ? '✅ منتهي' : '📋 ' + (shift.status || 'غير محدد')}
                      </span>
                    </td>
                    <td>
                      <div className="shift-actions">
                        <button
                          className="btn-action btn-view"
                          onClick={() => getShiftDetails(shift.id)}
                          title="عرض وتعديل التفاصيل"
                        >
                          <Eye size={16} />
                          <span>عرض</span>
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => {
                            setEditedShift({ ...shift });
                            setSelectedShiftDetails({ shiftInfo: shift });
                            setShowShiftModal(true);
                            setEditingShift(true);
                          }}
                          title="تعديل الشيفت"
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SHIFT DETAILS MODAL */}
      {showShiftModal && selectedShiftDetails && selectedShiftDetails.shiftInfo && (
        <div className="modal-overlay">
          <div className="modal extra-wide-modal shift-details-modal">
            <div className="modal-header">
              <div className="modal-title">
                <h2>
                  <span className="modal-icon">📋</span>
                  تفاصيل الشيفت #{selectedShiftDetails.shiftInfo.id}
                  {editingShift && <span className="editing-badge">📝 وضع التحرير</span>}
                </h2>
                <div className="shift-status-header">
                  <span className={`status-badge-large ${selectedShiftDetails.shiftInfo.status === 'نشط' || !selectedShiftDetails.endTime ? 'active' : 'ended'}`}>
                    {selectedShiftDetails.shiftInfo.status === 'نشط' || !selectedShiftDetails.endTime ? '🔥 نشط' : '✅ منتهي'}
                  </span>
                </div>
              </div>
              
              <div className="modal-header-actions">
                {!editingShift ? (
                  <>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={handleEditShift}
                    >
                      <Edit size={16} />
                      تعديل الشيفت
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setShiftToDelete(selectedShiftDetails.shiftInfo.id);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      <Trash2 size={16} />
                      حذف الشيفت
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleSaveShift}
                      disabled={savingChanges}
                    >
                      {savingChanges ? (
                        <div className="spinner-small"></div>
                      ) : (
                        <>
                          <Save size={16} />
                          حفظ التغييرات
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleCancelEdit}
                      disabled={savingChanges}
                    >
                      <X size={16} />
                      إلغاء
                    </button>
                  </>
                )}
                <button
                  className="modal-close"
                  onClick={() => setShowShiftModal(false)}
                  disabled={savingChanges}
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="modal-body">
              {/* Scrollable content */}
              <div className="modal-scroll-content">
                
                {/* SHIFT BASIC INFO */}
                <div className="shift-info-section">
                  <h3>
                    <CalendarIcon size={20} />
                    معلومات أساسية للشيفت
                  </h3>
                  
                  <div className="info-grid">
                    <div className="info-group">
                      <label>الموظف:</label>
                      {editingShift ? (
                        <select
                          value={editedShift.employee_id || ''}
                          onChange={(e) => handleShiftFieldChange('employee_id', e.target.value)}
                          className="edit-input"
                        >
                          <option value="">اختر الموظف</option>
                          {safeEmployees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} - {emp.role || 'موظف'}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="info-value">
                          <User size={14} />
                          <span>{selectedShiftDetails.employeeName}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="info-group">
                      <label>الفرع:</label>
                      {editingShift ? (
                        <select
                          value={editedShift.branch_id || ''}
                          onChange={(e) => handleShiftFieldChange('branch_id', e.target.value)}
                          className="edit-input"
                        >
                          <option value="">اختر الفرع</option>
                          {safeBranches.map(branch => (
                            <option key={branch.id} value={branch.id}>
                              {branch.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="info-value">
                          <Building size={14} />
                          <span>{selectedShiftDetails.branchName}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="info-group">
                      <label>وقت البدء:</label>
                      {editingShift ? (
                        <input
                          type="datetime-local"
                          value={editedShift.start_time ? editedShift.start_time.slice(0, 16) : ''}
                          onChange={(e) => handleShiftFieldChange('start_time', e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        <div className="info-value">
                          <CalendarIcon size={14} />
                          <span>{formatDateTime(selectedShiftDetails.startTime)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="info-group">
                      <label>وقت الانتهاء:</label>
                      {editingShift ? (
                        <input
                          type="datetime-local"
                          value={editedShift.end_time ? editedShift.end_time.slice(0, 16) : ''}
                          onChange={(e) => handleShiftFieldChange('end_time', e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        <div className="info-value">
                          <ClockIcon size={14} />
                          <span>{selectedShiftDetails.endTime ? formatDateTime(selectedShiftDetails.endTime) : 'لا يزال نشط'}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="info-group">
                      <label>المدة:</label>
                      <div className="info-value">
                        <Clock size={14} />
                        <span>{selectedShiftDetails.duration} دقيقة</span>
                      </div>
                    </div>
                    
                    <div className="info-group">
                      <label>تاريخ الإنشاء:</label>
                      <div className="info-value">
                        <span>{formatDate(selectedShiftDetails.shiftInfo.created_at)}</span>
                      </div>
                    </div>
                    
                    {(editingShift || selectedShiftDetails.notes) && (
                      <div className="info-group full-width">
                        <label>ملاحظات:</label>
                        {editingShift ? (
                          <textarea
                            value={editedShift.notes || ''}
                            onChange={(e) => handleShiftFieldChange('notes', e.target.value)}
                            className="edit-input textarea"
                            rows="3"
                            placeholder="أضف ملاحظات عن الشيفت..."
                          />
                        ) : (
                          <div className="info-value notes">
                            {selectedShiftDetails.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* SHIFT STATISTICS */}
                <div className="shift-stats-section">
                  <h3>
                    <BarChart3 size={20} />
                    إحصائيات الشيفت
                  </h3>
                  
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">💰</div>
                      <div className="stat-content">
                        <div className="stat-label">إجمالي الإيرادات</div>
                        <div className="stat-value">{formatCurrency(selectedShiftDetails.shiftRevenue)}</div>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">📊</div>
                      <div className="stat-content">
                        <div className="stat-label">إجمالي التأجيرات</div>
                        <div className="stat-value">{selectedShiftDetails.totalRentals}</div>
                        <div className="stat-sub">
                          <span className="paid">مدفوعة: {selectedShiftDetails.paidRentals}</span>
                          <span className="pending">معلقة: {selectedShiftDetails.pendingRentals}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">📈</div>
                      <div className="stat-content">
                        <div className="stat-label">متوسط التأجير</div>
                        <div className="stat-value">{formatCurrency(selectedShiftDetails.averagePerRental)}</div>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">⏱️</div>
                      <div className="stat-content">
                        <div className="stat-label">متوسط الوقت</div>
                        <div className="stat-value">
                          {selectedShiftDetails.totalRentals > 0 
                            ? Math.round(selectedShiftDetails.duration / selectedShiftDetails.totalRentals) 
                            : 0} دقيقة/تأجير
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* RENTALS MANAGEMENT */}
                <div className="rentals-management-section">
                  <div className="section-header">
                    <h3>
                      <FileText size={20} />
                      إدارة التأجيرات
                      <span className="section-count">({selectedShiftDetails.rentals.length})</span>
                    </h3>
                    <div className="section-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowNewRentalModal(true)}
                      >
                        <Plus size={16} />
                        إضافة تأجير جديد
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => getShiftDetails(selectedShiftDetails.shiftInfo.id)}
                      >
                        <RefreshCw size={16} />
                        تحديث القائمة
                      </button>
                    </div>
                  </div>
                  
                  {selectedShiftDetails.rentals.length === 0 ? (
                    <div className="empty-state-sm">
                      <div className="empty-icon">📭</div>
                      <p>لا توجد تأجيرات في هذا الشيفت</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="rentals-table editable">
                        <thead>
                          <tr>
                            <th>رقم التأجير</th>
                            <th>العميل</th>
                            <th>اللعبة</th>
                            <th>وقت البدء</th>
                            <th>المبلغ</th>
                            <th>طريقة الدفع</th>
                            <th>حالة الدفع</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedShiftDetails.rentals.map(rental => rental && (
                            <tr key={rental.id}>
                              <td>
                                <strong>#{rental.rental_number || rental.id}</strong>
                              </td>
                              <td>
                                <div className="customer-info">
                                  <div className="customer-name">{rental.customer_name || 'مجهول'}</div>
                                  {rental.customer_phone && (
                                    <div className="customer-phone">
                                      <Phone size={12} />
                                      {rental.customer_phone}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="game-info">
                                  <Gamepad2 size={14} />
                                  <span className="game-name">{rental.game_name || 'غير محدد'}</span>
                                </div>
                              </td>
                              <td>
                                <div className="time-info">
                                  <Clock size={12} />
                                  <span>{formatTime(rental.start_time)}</span>
                                </div>
                              </td>
                              <td>
                                <div className="amount-info">
                                  <DollarSign size={12} />
                                  <span>{formatCurrency(rental.total_amount)}</span>
                                </div>
                              </td>
                              <td>
                                <span className={`payment-method ${rental.payment_method === 'نقدي' ? 'cash' : 
                                  rental.payment_method === 'بطاقة' ? 'card' : 'other'}`}>
                                  {rental.payment_method || 'غير محدد'}
                                </span>
                              </td>
                              <td>
                                <span className={`payment-status ${rental.payment_status === 'مدفوع' ? 'paid' : 
                                  rental.payment_status === 'جزئي' ? 'partial' : 'unpaid'}`}>
                                  {rental.payment_status || 'غير محدد'}
                                </span>
                              </td>
                              <td>
                                <span className={`rental-status ${rental.status === 'مكتمل' ? 'completed' : 
                                  rental.status === 'نشط' ? 'active' : 'cancelled'}`}>
                                  {rental.status || 'نشط'}
                                </span>
                              </td>
                              <td>
                                <div className="rental-actions">
                                  <button
                                    className="btn-action btn-edit"
                                    onClick={() => handleEditRental(rental)}
                                    title="تعديل التأجير"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    className="btn-action btn-delete"
                                    onClick={() => handleDeleteRental(rental.id)}
                                    title="حذف التأجير"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                {/* PAYMENT METHODS BREAKDOWN */}
                {selectedShiftDetails.paymentStats && selectedShiftDetails.paymentStats.length > 0 && (
                  <div className="payment-methods-section">
                    <h3>
                      <CreditCard size={20} />
                      تفصيل طرق الدفع
                    </h3>
                    <div className="payment-grid">
                      {selectedShiftDetails.paymentStats.map(method => method && (
                        <div key={method.method} className="payment-method-card">
                          <div className="payment-header">
                            <span className="method-name">{method.method}</span>
                            <span className="method-count">{method.count} عملية</span>
                          </div>
                          <div className="payment-body">
                            <span className="method-revenue">{formatCurrency(method.revenue)}</span>
                            <span className="method-percentage">
                              {selectedShiftDetails.shiftRevenue > 0 
                                ? ((method.revenue / selectedShiftDetails.shiftRevenue) * 100).toFixed(1)
                                : 0}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* GAMES BREAKDOWN */}
                {selectedShiftDetails.gameStats && selectedShiftDetails.gameStats.length > 0 && (
                  <div className="games-section">
                    <h3>
                      <Gamepad2 size={20} />
                      إحصائيات الألعاب
                    </h3>
                    <div className="table-container">
                      <table className="games-table">
                        <thead>
                          <tr>
                            <th>اللعبة</th>
                            <th>عدد التأجيرات</th>
                            <th>الإيرادات</th>
                            <th>النسبة</th>
                            <th>متوسط التأجير</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedShiftDetails.gameStats.map(game => game && (
                            <tr key={game.name}>
                              <td>{game.name}</td>
                              <td>{game.count}</td>
                              <td>{formatCurrency(game.revenue)}</td>
                              <td>
                                <div className="percentage-bar">
                                  <div 
                                    className="percentage-fill"
                                    style={{
                                      width: `${Math.min(100, selectedShiftDetails.shiftRevenue > 0 
                                        ? (game.revenue / selectedShiftDetails.shiftRevenue) * 100 
                                        : 0)}%`
                                    }}
                                  ></div>
                                  <span className="percentage-text">
                                    {selectedShiftDetails.shiftRevenue > 0 
                                      ? ((game.revenue / selectedShiftDetails.shiftRevenue) * 100).toFixed(1)
                                      : 0}%
                                  </span>
                                </div>
                              </td>
                              <td>{formatCurrency(game.count > 0 ? game.revenue / game.count : 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* CUSTOMER ANALYSIS */}
                {selectedShiftDetails.customerStats && selectedShiftDetails.customerStats.length > 0 && (
                  <div className="customers-section">
                    <h3>
                      <Users size={20} />
                      تحليل العملاء
                      <span className="section-count">({selectedShiftDetails.customerStats.length})</span>
                    </h3>
                    <div className="customers-grid">
                      {selectedShiftDetails.customerStats.slice(0, 5).map(customer => customer && (
                        <div key={customer.name} className="customer-card">
                          <div className="customer-header">
                            <span className="customer-name">{customer.name}</span>
                            <span className="customer-visits">{customer.count} زيارة</span>
                          </div>
                          <div className="customer-body">
                            <div className="customer-revenue">
                              <span className="revenue-label">إجمالي الإنفاق:</span>
                              <span className="revenue-value">{formatCurrency(customer.revenue)}</span>
                            </div>
                            {customer.phone && customer.phone !== 'لا يوجد' && (
                              <div className="customer-contact">
                                <Phone size={12} />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <div className="footer-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowShiftModal(false)}
                >
                  إغلاق
                </button>
                
                <div className="action-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={printReport}
                    disabled={printing}
                  >
                    <Printer size={18} />
                    {printing ? 'جاري الطباعة...' : 'طباعة التقرير'}
                  </button>
                  
                  {selectedShiftDetails.shiftInfo.status !== 'منتهي' && !selectedShiftDetails.endTime && (
                    <button
                      className="btn btn-warning"
                      onClick={() => closeShift(selectedShiftDetails.shiftInfo.id)}
                      disabled={closingShift}
                    >
                      {closingShift ? (
                        <div className="spinner-small"></div>
                      ) : (
                        <>
                          <Lock size={18} />
                          تقفيل الشيفت
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal confirm-modal">
            <div className="modal-header">
              <h2>
                <AlertCircle size={24} />
                تأكيد الحذف
              </h2>
            </div>
            <div className="modal-body">
              <div className="confirm-icon">
                <AlertTriangle size={48} />
              </div>
                            <p className="confirm-text">
                ⚠️ هل أنت متأكد من حذف الشيفت #{shiftToDelete}؟
              </p>
              <p className="confirm-warning">
                <strong>تحذير:</strong> هذا الإجراء سيحذف الشيفت وجميع التأجيرات المرتبطة به ولا يمكن التراجع عنه.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setShiftToDelete(null);
                }}
                disabled={savingChanges}
              >
                <X size={18} />
                إلغاء
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteShift}
                disabled={savingChanges}
              >
                {savingChanges ? (
                  <div className="spinner-small"></div>
                ) : (
                  <>
                    <Trash2 size={18} />
                    نعم، احذف الشيفت
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* RENTAL EDIT MODAL */}
      {showRentalEditModal && rentalToEdit && (
        <div className="modal-overlay">
          <div className="modal rental-edit-modal">
            <div className="modal-header">
              <h2>
                <Edit size={24} />
                تعديل التأجير #{rentalToEdit.rental_number || rentalToEdit.id}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowRentalEditModal(false)}
                disabled={savingChanges}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="rental-edit-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>اسم العميل:</label>
                    <input
                      type="text"
                      value={rentalToEdit.customer_name || ''}
                      onChange={(e) => setRentalToEdit(prev => ({ ...prev, customer_name: e.target.value }))}
                      className="form-input"
                      placeholder="اسم العميل"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>رقم الهاتف:</label>
                    <input
                      type="tel"
                      value={rentalToEdit.customer_phone || ''}
                      onChange={(e) => setRentalToEdit(prev => ({ ...prev, customer_phone: e.target.value }))}
                      className="form-input"
                      placeholder="رقم الهاتف"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>اللعبة:</label>
                    <select
                      value={rentalToEdit.game_id || ''}
                      onChange={(e) => setRentalToEdit(prev => ({ ...prev, game_id: e.target.value }))}
                      className="form-input"
                    >
                      <option value="">اختر لعبة</option>
                      {safeGames.map(game => (
                        <option key={game.id} value={game.id}>
                          {game.name} - {formatCurrency(game.hourly_rate || 0)}/ساعة
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>وقت البدء:</label>
                    <input
                      type="datetime-local"
                      value={rentalToEdit.start_time ? rentalToEdit.start_time.slice(0, 16) : ''}
                      onChange={(e) => setRentalToEdit(prev => ({ ...prev, start_time: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>وقت الانتهاء:</label>
                    <input
                      type="datetime-local"
                      value={rentalToEdit.end_time ? rentalToEdit.end_time.slice(0, 16) : ''}
                      onChange={(e) => setRentalToEdit(prev => ({ ...prev, end_time: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>المبلغ الإجمالي:</label>
                    <div className="amount-input-group">
                      <input
                        type="number"
                        value={rentalToEdit.total_amount || ''}
                        onChange={(e) => setRentalToEdit(prev => ({ ...prev, total_amount: e.target.value }))}
                        className="form-input"
                        min="0"
                        step="0.01"
                      />
                      <span className="currency">ج.م</span>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>طريقة الدفع:</label>
                    <select
                      value={rentalToEdit.payment_method || 'نقدي'}
                      onChange={(e) => setRentalToEdit(prev => ({ ...prev, payment_method: e.target.value }))}
                      className="form-input"
                    >
                      <option value="نقدي">نقدي</option>
                      <option value="بطاقة">بطاقة ائتمان</option>
                      <option value="محفظة">محفظة إلكترونية</option>
                      <option value="تحويل">تحويل بنكي</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>حالة الدفع:</label>
                    <select
                      value={rentalToEdit.payment_status || 'غير مدفوع'}
                      onChange={(e) => setRentalToEdit(prev => ({ ...prev, payment_status: e.target.value }))}
                      className="form-input"
                    >
                      <option value="غير مدفوع">غير مدفوع</option>
                      <option value="مدفوع">مدفوع</option>
                      <option value="جزئي">مدفوع جزئياً</option>
                      <option value="مجاني">مجاني</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>حالة التأجير:</label>
                    <select
                      value={rentalToEdit.status || 'نشط'}
                      onChange={(e) => setRentalToEdit(prev => ({ ...prev, status: e.target.value }))}
                      className="form-input"
                    >
                      <option value="نشط">نشط</option>
                      <option value="مكتمل">مكتمل</option>
                      <option value="ملغي">ملغي</option>
                      <option value="متأخر">متأخر</option>
                    </select>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>ملاحظات:</label>
                    <textarea
                      value={rentalToEdit.notes || ''}
                      onChange={(e) => setRentalToEdit(prev => ({ ...prev, notes: e.target.value }))}
                      className="form-input textarea"
                      rows="3"
                      placeholder="أضف ملاحظات عن التأجير..."
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowRentalEditModal(false)}
                disabled={savingChanges}
              >
                إلغاء
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveRental}
                disabled={savingChanges}
              >
                {savingChanges ? (
                  <div className="spinner-small"></div>
                ) : (
                  <>
                    <Save size={18} />
                    حفظ التغييرات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* NEW RENTAL MODAL */}
      {showNewRentalModal && (
        <div className="modal-overlay">
          <div className="modal new-rental-modal">
            <div className="modal-header">
              <h2>
                <Plus size={24} />
                إضافة تأجير جديد
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowNewRentalModal(false)}
                disabled={savingChanges}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="rental-edit-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>اسم العميل:</label>
                    <input
                      type="text"
                      value={newRental.customer_name}
                      onChange={(e) => setNewRental(prev => ({ ...prev, customer_name: e.target.value }))}
                      className="form-input"
                      placeholder="اسم العميل"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>رقم الهاتف:</label>
                    <input
                      type="tel"
                      value={newRental.customer_phone}
                      onChange={(e) => setNewRental(prev => ({ ...prev, customer_phone: e.target.value }))}
                      className="form-input"
                      placeholder="رقم الهاتف"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>اللعبة:</label>
                    <select
                      value={newRental.game_id}
                      onChange={(e) => setNewRental(prev => ({ ...prev, game_id: e.target.value }))}
                      className="form-input"
                    >
                      <option value="">اختر لعبة</option>
                      {safeGames.map(game => (
                        <option key={game.id} value={game.id}>
                          {game.name} - {formatCurrency(game.hourly_rate || 0)}/ساعة
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>وقت البدء:</label>
                    <input
                      type="datetime-local"
                      value={newRental.start_time}
                      onChange={(e) => setNewRental(prev => ({ ...prev, start_time: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>وقت الانتهاء:</label>
                    <input
                      type="datetime-local"
                      value={newRental.end_time}
                      onChange={(e) => setNewRental(prev => ({ ...prev, end_time: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>المبلغ الإجمالي:</label>
                    <div className="amount-input-group">
                      <input
                        type="number"
                        value={newRental.total_amount}
                        onChange={(e) => setNewRental(prev => ({ ...prev, total_amount: e.target.value }))}
                        className="form-input"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                      <span className="currency">ج.م</span>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>طريقة الدفع:</label>
                    <select
                      value={newRental.payment_method}
                      onChange={(e) => setNewRental(prev => ({ ...prev, payment_method: e.target.value }))}
                      className="form-input"
                    >
                      <option value="نقدي">نقدي</option>
                      <option value="بطاقة">بطاقة ائتمان</option>
                      <option value="محفظة">محفظة إلكترونية</option>
                      <option value="تحويل">تحويل بنكي</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>حالة الدفع:</label>
                    <select
                      value={newRental.payment_status}
                      onChange={(e) => setNewRental(prev => ({ ...prev, payment_status: e.target.value }))}
                      className="form-input"
                    >
                      <option value="غير مدفوع">غير مدفوع</option>
                      <option value="مدفوع">مدفوع</option>
                      <option value="جزئي">مدفوع جزئياً</option>
                      <option value="مجاني">مجاني</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>حالة التأجير:</label>
                    <select
                      value={newRental.status}
                      onChange={(e) => setNewRental(prev => ({ ...prev, status: e.target.value }))}
                      className="form-input"
                    >
                      <option value="نشط">نشط</option>
                      <option value="مكتمل">مكتمل</option>
                      <option value="ملغي">ملغي</option>
                      <option value="متأخر">متأخر</option>
                    </select>
                  </div>
                  
                  <div className="form-group full-width">
                    <label>ملاحظات:</label>
                    <textarea
                      value={newRental.notes}
                      onChange={(e) => setNewRental(prev => ({ ...prev, notes: e.target.value }))}
                      className="form-input textarea"
                      rows="3"
                      placeholder="أضف ملاحظات عن التأجير..."
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowNewRentalModal(false)}
                disabled={savingChanges}
              >
                إلغاء
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddNewRental}
                disabled={savingChanges}
              >
                {savingChanges ? (
                  <div className="spinner-small"></div>
                ) : (
                  <>
                    <Plus size={18} />
                    إضافة التأجير
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalsRevenueAnalysis;