import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/api';
import './AdminPages.css';

const UsersManagement = () => {
  // 🔹 States الأساسية
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [branches, setBranches] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const itemsPerPage = 10;
  
  // 🔹 إحصائيات المستخدمين
  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter(user => user.role === 'admin').length,
      managers: users.filter(user => user.role === 'branch_manager').length,
      employees: users.filter(user => user.role === 'employee').length,
      active: users.filter(user => user.is_active).length,
      inactive: users.filter(user => !user.is_active).length
    };
  }, [users]);

  // 🔹 بيانات المستخدم الجديد
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '123456',
    name: '',
    role: 'employee',
    branch_id: '',
    phone: '',
    is_active: true
  });

  // 🔹 تحميل البيانات عند التهيئة
  useEffect(() => {
    loadData();
  }, []);

  // 🔹 إعادة تعيين الصفحة إلى 1 عند تغيير الفلتر
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole]);

// 🔹 دالة تحميل البيانات - نسخة محسنة
const loadData = useCallback(async () => {
  try {
    setLoading(true);
    setError('');
    setSuccess('');
    
    console.log('👥 جلب بيانات المستخدمين...');
    
    // التحقق من التوكن أولاً
    const token = localStorage.getItem('token');
    if (!token) {
      setError('الرجاء تسجيل الدخول أولاً');
      window.location.href = '/login';
      return;
    }
    
    // التحقق من المستخدم
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin' && user.role !== 'branch_manager') {
        setError('ليس لديك صلاحية لعرض هذه الصفحة');
        setLoading(false);
        return;
      }
    }
    
    // محاولة جلب المستخدمين والفروع
    let usersSuccess = false;
    let branchesSuccess = false;
    
    // جلب المستخدمين
    try {
      console.log('📡 محاولة جلب المستخدمين...');
      const usersResponse = await api.getUsers();
      console.log('📊 استجابة المستخدمين:', usersResponse);
      
      if (usersResponse.success) {
        setUsers(usersResponse.data || []);
        usersSuccess = true;
      } else {
        console.warn('⚠️ فشل جلب المستخدمين:', usersResponse.message);
        
        // إذا كان الخطأ 403، المستخدم ليس لديه صلاحية
        if (usersResponse.status === 403) {
          setError('ليس لديك صلاحية لعرض المستخدمين');
        }
      }
    } catch (userError) {
      console.error('❌ خطأ في جلب المستخدمين:', userError);
    }
    
    // جلب الفروع
    try {
      console.log('📡 محاولة جلب الفروع...');
      const branchesResponse = await api.getBranches();
      console.log('📊 استجابة الفروع:', branchesResponse);
      
      if (branchesResponse.success && branchesResponse.data?.length > 0) {
        setBranches(branchesResponse.data);
        branchesSuccess = true;
        
        // تعيين الفرع الافتراضي للمستخدم الجديد
        setNewUser(prev => ({
          ...prev,
          branch_id: branchesResponse.data[0].id
        }));
      } else {
        console.warn('⚠️ فشل جلب الفروع:', branchesResponse.message);
        
        // إذا كان الخطأ 403، المستخدم ليس لديه صلاحية
        if (branchesResponse.status === 403) {
          setError('ليس لديك صلاحية لعرض الفروع');
        }
      }
    } catch (branchError) {
      console.error('❌ خطأ في جلب الفروع:', branchError);
    }
    
    console.log('📊 نتائج جلب البيانات:', {
      users: usersSuccess ? '✅ نجاح' : '❌ فشل',
      branches: branchesSuccess ? '✅ نجاح' : '❌ فشل'
    });
    
    // إذا فشل كل شيء، استخدم بيانات تجريبية للعرض
    if (!usersSuccess && !branchesSuccess) {
      console.log('📦 استخدام بيانات تجريبية للعرض');
      
      // بيانات تجريبية للمستخدمين
      setUsers([
        { id: 1, name: 'المدير العام', username: 'admin', email: 'admin@l3bty.com', role: 'admin', branch_id: 1, is_active: true, created_at: new Date().toISOString() },
        { id: 2, name: 'مدير فرع', username: 'manager', email: 'manager@l3bty.com', role: 'branch_manager', branch_id: 1, is_active: true, created_at: new Date().toISOString() },
        { id: 3, name: 'موظف', username: 'employee', email: 'employee@l3bty.com', role: 'employee', branch_id: 1, is_active: true, created_at: new Date().toISOString() }
      ]);
      
      // بيانات تجريبية للفروع
      setBranches([
        { id: 1, name: 'الفرع الرئيسي', location: 'القاهرة' },
        { id: 2, name: 'فرع 6 أكتوبر', location: '6 أكتوبر' }
      ]);
      
      setNewUser(prev => ({
        ...prev,
        branch_id: 1
      }));
      
      setError('عرض بيانات تجريبية - فشل الاتصال بالخادم');
    }
    
  } catch (error) {
    console.error('❌ خطأ في تحميل البيانات:', error);
    setError('تعذر الاتصال بالخادم. تأكد من تشغيل الخادم.');
  } finally {
    setLoading(false);
  }
}, []);

  // 🔹 التحقق من صحة البريد الإلكتروني
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // 🔹 التحقق من صحة رقم الهاتف
  const validatePhone = (phone) => {
    if (!phone) return true;
    const re = /^01[0-9]{9}$/;
    return re.test(phone);
  };

  // 🔹 دالة إضافة مستخدم جديد
  const handleAddUser = async () => {
    try {
      // التحقق من الحقول المطلوبة
      if (!newUser.username?.trim()) {
        setError('اسم المستخدم مطلوب');
        return;
      }
      
      if (!newUser.email?.trim()) {
        setError('البريد الإلكتروني مطلوب');
        return;
      }
      
      if (!validateEmail(newUser.email)) {
        setError('البريد الإلكتروني غير صحيح');
        return;
      }
      
      if (!newUser.name?.trim()) {
        setError('الاسم الكامل مطلوب');
        return;
      }
      
      if (!newUser.branch_id) {
        setError('الفرع مطلوب');
        return;
      }
      
      if (newUser.phone && !validatePhone(newUser.phone)) {
        setError('رقم الهاتف غير صحيح. يجب أن يبدأ بـ 01 ويتكون من 11 رقم');
        return;
      }

      console.log('➕ إضافة مستخدم جديد:', newUser);
      setLoading(true);
      
      const response = await api.createUser(newUser);
      
      console.log('📋 استجابة إنشاء المستخدم:', response);
      
      if (response.success) {
        setSuccess('✅ تم إنشاء المستخدم بنجاح');
        setShowAddModal(false);
        resetNewUserForm();
        loadData();
      } else {
        setError(response.message || 'فشل في إنشاء المستخدم');
      }
    } catch (error) {
      console.error('❌ خطأ في إنشاء المستخدم:', error);
      setError('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 إعادة تعيين نموذج المستخدم الجديد
  const resetNewUserForm = () => {
    setNewUser({
      username: '',
      email: '',
      password: '123456',
      name: '',
      role: 'employee',
      branch_id: branches.length > 0 ? branches[0].id : '',
      phone: '',
      is_active: true
    });
  };

  // 🔹 دالة تحديث المستخدم
  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      // التحقق من الحقول المطلوبة
      if (!editingUser.name?.trim()) {
        setError('الاسم الكامل مطلوب');
        return;
      }
      
      if (!editingUser.email?.trim()) {
        setError('البريد الإلكتروني مطلوب');
        return;
      }
      
      if (!validateEmail(editingUser.email)) {
        setError('البريد الإلكتروني غير صحيح');
        return;
      }
      
      if (!editingUser.branch_id) {
        setError('الفرع مطلوب');
        return;
      }
      
      if (editingUser.phone && !validatePhone(editingUser.phone)) {
        setError('رقم الهاتف غير صحيح. يجب أن يبدأ بـ 01 ويتكون من 11 رقم');
        return;
      }

      console.log('✏️ تحديث المستخدم:', editingUser);
      setLoading(true);
      
      // إزالة كلمة المرور إذا كانت فارغة
      const updateData = { ...editingUser };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      const response = await api.updateUser(editingUser.id, updateData);
      
      console.log('📋 استجابة تحديث المستخدم:', response);
      
      if (response.success) {
        setSuccess('✅ تم تحديث المستخدم بنجاح');
        setShowEditModal(false);
        setEditingUser(null);
        loadData();
      } else {
        setError(response.message || 'فشل في تحديث المستخدم');
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث المستخدم:', error);
      setError('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

// 🔹 دالة حذف/تعطيل المستخدم - نسخة محسنة مع الدوال الجديدة
const handleDeleteUser = async (id, permanent = false) => {
  try {
    setLoading(true);
    
    // تحقق إذا كان المستخدم هو المدير العام (id = 1)
    if (id === 1) {
      setError('لا يمكن حذف أو تعطيل المدير العام');
      setConfirmDelete(null);
      return;
    }
    
    // البحث عن المستخدم في القائمة
    const user = users.find(u => u.id === id);
    if (!user) {
      setError('المستخدم غير موجود');
      setConfirmDelete(null);
      return;
    }
    
    console.log(`🔍 معالجة المستخدم:`, { id, name: user.name, role: user.role });
    
    if (!permanent) {
      // محاولة التعطيل أولاً باستخدام الدالة الجديدة
      try {
        console.log('🟡 محاولة تعطيل المستخدم:', id);
        const response = await api.deactivateUser(id);
        
        if (response.success) {
          setSuccess(`✅ تم تعطيل المستخدم "${user.name}" بنجاح`);
          setConfirmDelete(null);
          await loadData();
          return;
        }
      } catch (deactivateError) {
        console.log('⚠️ فشل التعطيل:', deactivateError);
        // استمر في محاولة الحذف المباشر
      }
    }
    
    // الحذف المباشر (نهائي أو تعطيل)
    console.log(`🗑️ ${permanent ? 'حذف نهائي' : 'تعطيل'} المستخدم:`, id);
    
    const response = await api.deleteUser(id, permanent);
    
    if (response.success) {
      setSuccess(`✅ تم ${permanent ? 'حذف' : 'تعطيل'} المستخدم "${user.name}" بنجاح`);
      setConfirmDelete(null);
      await loadData();
    } else {
      setError(response.message || 'فشل في حذف المستخدم');
    }
  } catch (error) {
    console.error('❌ خطأ في حذف المستخدم:', error);
    
    // رسائل خطأ مخصصة
    if (error.response?.status === 403) {
      setError('ليس لديك صلاحية لحذف هذا المستخدم');
    } else if (error.response?.status === 400) {
      const details = error.response.data?.details;
      if (details) {
        setError(
          `لا يمكن حذف المستخدم نهائياً لأنه مرتبط بـ ${details.rentals || 0} تأجير و ${details.shifts || 0} شيفت. ` +
          `استخدم التعطيل بدلاً من الحذف.`
        );
      } else {
        setError(error.response.data?.message || 'طلب غير صالح');
      }
    } else if (error.response?.data?.message) {
      setError(error.response.data.message);
    } else {
      setError('تعذر الاتصال بالخادم');
    }
  } finally {
    setLoading(false);
    setConfirmDelete(null);
  }
};

// 🔹 دالة تغيير حالة المستخدم (تفعيل/تعطيل) - محسنة ومصححة
const handleToggleStatus = async (id, currentStatus) => {
  try {
    // البحث عن المستخدم في القائمة
    const targetUser = users.find(u => u.id === id);
    
    if (!targetUser) {
      setError('المستخدم غير موجود');
      return;
    }
    
    // تحقق إذا كان المستخدم هو المدير العام
    if (id === 1 && !currentStatus) {
      setError('لا يمكن تعطيل المدير العام');
      return;
    }
    
    const action = currentStatus ? 'تعطيل' : 'تفعيل';
    
    if (!window.confirm(`هل أنت متأكد من ${action} المستخدم "${targetUser.name}"؟`)) {
      return;
    }
    
    console.log(`🔄 ${action} المستخدم:`, id);
    setLoading(true);
    
    let response;
    if (currentStatus) {
      // تعطيل
      response = await api.deactivateUser(id);
    } else {
      // تفعيل
      response = await api.activateUser(id);
    }
    
    if (response.success) {
      setSuccess(`✅ تم ${action} المستخدم "${targetUser.name}" بنجاح`);
      await loadData();
    } else {
      setError(response.message || `فشل في ${action} المستخدم`);
    }
  } catch (error) {
    console.error(`❌ خطأ في تغيير حالة المستخدم:`, error);
    
    if (error.response?.status === 404) {
      // إذا كانت النقاط غير موجودة، استخدم التحديث المباشر
      try {
        const targetUser = users.find(u => u.id === id);
        if (!targetUser) return;
        
        const response = await api.updateUser(id, {
          is_active: !currentStatus
        });
        
        if (response.success) {
          setSuccess(`✅ تم ${currentStatus ? 'تعطيل' : 'تفعيل'} المستخدم "${targetUser.name}" بنجاح`);
          await loadData();
        } else {
          setError(response.message || 'فشل في تغيير الحالة');
        }
      } catch (updateError) {
        setError('فشل في تغيير حالة المستخدم');
      }
    } else {
      setError(error.response?.data?.message || 'حدث خطأ في تغيير الحالة');
    }
  } finally {
    setLoading(false);
  }
};

  // 🔹 دوال مساعدة
  const getRoleText = (role) => {
    switch(role) {
      case 'admin': return 'المدير العام';
      case 'branch_manager': return 'مدير فرع';
      case 'employee': return 'موظف';
      default: return role;
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return '👑';
      case 'branch_manager': return '🏢';
      case 'employee': return '👤';
      default: return '❓';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return '#ef4444';
      case 'branch_manager': return '#f59e0b';
      case 'employee': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : 'غير محدد';
  };

  // التحقق من صحة المستخدم والتوكن
useEffect(() => {
  const validateUserAndToken = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      console.log('🔍 فحص الجلسة الحالية:', {
        tokenExists: !!token,
        userExists: !!userStr
      });
      
      if (!token || !userStr) {
        console.log('⚠️ لا يوجد توكن أو مستخدم، التوجيه إلى صفحة login');
        window.location.href = '/login';
        return;
      }
      
      // التحقق من صحة المستخدم مع الخادم
      try {
        const profileResponse = await api.getProfile();
        console.log('👤 استجابة profile:', profileResponse);
        
        if (!profileResponse.success) {
          console.log('⚠️ المستخدم غير صالح، تنظيف localStorage وإعادة التوجيه');
          localStorage.clear();
          window.location.href = '/login';
          return;
        }
        
        // التحقق من الصلاحية
        const user = profileResponse.data || JSON.parse(userStr);
        if (user.role !== 'admin' && user.role !== 'branch_manager') {
          setError('ليس لديك صلاحية لعرض هذه الصفحة');
          return;
        }
        
        console.log('✅ المستخدم صالح:', user);
        
      } catch (profileError) {
        console.error('❌ فشل التحقق من المستخدم:', profileError);
        localStorage.clear();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('❌ خطأ في التحقق:', error);
    }
  };
  
  validateUserAndToken();
}, []);

  // 🔹 فلترة وترتيب المستخدمين
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phone && user.phone.includes(searchTerm));
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // 🔹 توليد كلمة مرور عشوائية
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // في UsersManagement.jsx، أضف هذا useEffect للتحقق من المستخدم
useEffect(() => {
  // التحقق من المستخدم الحالي والتوكن
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    console.log('🔐 حالة المصادقة:', {
      tokenExists: !!token,
      userExists: !!userStr
    });
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('👤 المستخدم الحالي:', {
          id: user.id,
          name: user.name,
          role: user.role,
          branch_id: user.branch_id
        });
        
        // إذا كان المستخدم ليس Admin أو Branch Manager
        if (user.role !== 'admin' && user.role !== 'branch_manager') {
          setError('ليس لديك صلاحية لعرض هذه الصفحة');
        }
      } catch (e) {
        console.error('خطأ في قراءة بيانات المستخدم:', e);
      }
    }
  };
  
  checkAuth();
}, []);

  // 🔹 عرض حالة التحميل
  if (loading && users.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="users-management">
      {/* ===== رأس الصفحة ===== */}
      <div className="page-header">
        <div className="header-title">
          <h1>
            <span className="header-icon">👥</span>
            إدارة المستخدمين
          </h1>
          <p>إدارة وتنظيم جميع مستخدمي النظام</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => {
            resetNewUserForm();
            setShowAddModal(true);
          }}
          disabled={loading}
        >
          <span>+</span> إضافة مستخدم جديد
        </button>
      </div>

      {/* ===== رسائل التنبيه ===== */}
      {error && (
        <div className="alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
          <button className="btn-close" onClick={() => setError('')}>✕</button>
        </div>
      )}

      {success && (
        <div className="alert-success">
          <span className="alert-icon">✅</span>
          <span>{success}</span>
          <button className="btn-close" onClick={() => setSuccess('')}>✕</button>
        </div>
      )}

      {/* ===== إحصائيات سريعة ===== */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">إجمالي المستخدمين</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ color: getRoleColor('admin') }}>👑</div>
          <div className="stat-info">
            <span className="stat-value">{stats.admins}</span>
            <span className="stat-label">المديرون</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ color: getRoleColor('branch_manager') }}>🏢</div>
          <div className="stat-info">
            <span className="stat-value">{stats.managers}</span>
            <span className="stat-label">مديرو الفروع</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ color: getRoleColor('employee') }}>👤</div>
          <div className="stat-info">
            <span className="stat-value">{stats.employees}</span>
            <span className="stat-label">الموظفون</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#10b981' }}>🟢</div>
          <div className="stat-info">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">نشطين</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#ef4444' }}>🔴</div>
          <div className="stat-info">
            <span className="stat-value">{stats.inactive}</span>
            <span className="stat-label">غير نشطين</span>
          </div>
        </div>
      </div>

      {/* ===== لوحة التحكم ===== */}
      <div className="control-panel">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="بحث عن مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="مسح البحث"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="filters-section">
          <div className="filter-label">تصفية:</div>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filterRole === 'all' ? 'active' : ''}`}
              onClick={() => setFilterRole('all')}
            >
              الكل ({filteredUsers.length})
            </button>
            <button 
              className={`filter-btn ${filterRole === 'admin' ? 'active' : ''}`}
              onClick={() => setFilterRole('admin')}
            >
              <span>👑</span> مديرون ({stats.admins})
            </button>
            <button 
              className={`filter-btn ${filterRole === 'branch_manager' ? 'active' : ''}`}
              onClick={() => setFilterRole('branch_manager')}
            >
              <span>🏢</span> مديرو فروع ({stats.managers})
            </button>
            <button 
              className={`filter-btn ${filterRole === 'employee' ? 'active' : ''}`}
              onClick={() => setFilterRole('employee')}
            >
              <span>👤</span> موظفون ({stats.employees})
            </button>
          </div>
        </div>
        
        <div className="results-info">
          <span className="results-count">
            عرض {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredUsers.length)} من {filteredUsers.length}
          </span>
        </div>
      </div>

      {/* ===== جدول المستخدمين مع Scrollbar ===== */}
      <div className="table-container with-scrollbar">
        <table className="users-table">
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>البريد الإلكتروني</th>
              <th>الدور</th>
              <th>الفرع</th>
              <th>رقم الهاتف</th>
              <th>الحالة</th>
              <th>تاريخ الإنشاء</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state-cell">
                  <div className="empty-state">
                    <span className="empty-icon">👥</span>
                    <p>لا يوجد مستخدمين</p>
                    <button 
                      className="btn-primary"
                      onClick={() => {
                        resetNewUserForm();
                        setShowAddModal(true);
                      }}
                    >
                      + إضافة مستخدم جديد
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id} className={!user.is_active ? 'inactive-row' : ''}>
                  <td>
                    <div className="user-info">
                      <div 
                        className="user-avatar"
                        style={{ backgroundColor: getRoleColor(user.role) }}
                      >
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div className="user-details">
                        <span className="user-name">{user.name || 'غير معروف'}</span>
                        <span className="user-username">@{user.username || 'غير معروف'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <a href={`mailto:${user.email}`} className="email-link">
                      {user.email || '-'}
                    </a>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      <span className="role-icon">{getRoleIcon(user.role)}</span>
                      {getRoleText(user.role)}
                    </span>
                  </td>
                  <td>
                    <span className="branch-name">
                      <span className="branch-icon">🏬</span>
                      {getBranchName(user.branch_id)}
                    </span>
                  </td>
                  <td>
                    {user.phone ? (
                      <a href={`tel:${user.phone}`} className="phone-link">
                        📞 {user.phone}
                      </a>
                    ) : (
                      <span className="no-data">-</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? '🟢 نشط' : '🔴 غير نشط'}
                    </span>
                  </td>
                  <td>
                    <span className="date-cell">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG') : '-'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon small"
                        onClick={() => {
                          setEditingUser({...user});
                          setShowEditModal(true);
                        }}
                        title="تعديل"
                        disabled={loading}
                      >
                        ✏️
                      </button>
                      <button 
                        className={`btn-icon small ${user.is_active ? 'warning' : 'success'}`}
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        title={user.is_active ? 'تعطيل' : 'تفعيل'}
                        disabled={loading}
                      >
                        {user.is_active ? '⏸️' : '▶️'}
                      </button>
                      <button 
                        className="btn-icon small danger"
                        onClick={() => setConfirmDelete({ id: user.id, name: user.name })}
                        title="حذف"
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== الترقيم الصفحي ===== */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
          >
            ← السابق
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                if (totalPages <= 7) return true;
                if (page === 1 || page === totalPages) return true;
                if (page >= currentPage - 2 && page <= currentPage + 2) return true;
                return false;
              })
              .map((page, index, array) => {
                if (index > 0 && page - array[index - 1] > 1) {
                  return (
                    <React.Fragment key={`ellipsis-${page}`}>
                      <span className="pagination-ellipsis">...</span>
                      <button
                        className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                        disabled={loading}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                }
                return (
                  <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                    disabled={loading}
                  >
                    {page}
                  </button>
                );
              })}
          </div>
          
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
          >
            التالي →
          </button>
        </div>
      )}

      {/* ===== نافذة تأكيد الحذف ===== */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal modal-small" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ تأكيد الحذف</h2>
              <button className="close-btn" onClick={() => setConfirmDelete(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>هل تريد حذف المستخدم <strong>{confirmDelete.name}</strong>؟</p>
              <p className="warning-text">هذا الإجراء قد لا يمكن التراجع عنه.</p>
              
              <div className="delete-options">
                <button 
                  className="btn-warning"
                  onClick={() => handleDeleteUser(confirmDelete.id, false)}
                  disabled={loading}
                >
                  <span>⏸️</span>
                  تعطيل فقط
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => handleDeleteUser(confirmDelete.id, true)}
                  disabled={loading}
                >
                  <span>🗑️</span>
                  حذف نهائي
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== نافذة إضافة مستخدم جديد ===== */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ إضافة مستخدم جديد</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body with-scrollbar">
              <div className="form-grid">
                <div className="form-group">
                  <label>اسم المستخدم <span className="required">*</span></label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="أدخل اسم المستخدم"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>البريد الإلكتروني <span className="required">*</span></label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="example@domain.com"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>الاسم الكامل <span className="required">*</span></label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="أدخل الاسم الكامل"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>الدور</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    disabled={loading}
                  >
                    <option value="employee">👤 موظف</option>
                    <option value="branch_manager">🏢 مدير فرع</option>
                    <option value="admin">👑 المدير العام</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>الفرع <span className="required">*</span></label>
                  <select
                    value={newUser.branch_id}
                    onChange={(e) => setNewUser({...newUser, branch_id: parseInt(e.target.value)})}
                    disabled={loading || branches.length === 0}
                  >
                    <option value="">اختر الفرع</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} - {branch.location}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="01XXXXXXXXX"
                    maxLength="11"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>كلمة المرور</label>
                  <div className="password-input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="كلمة المرور"
                      className="form-input"
                      disabled={loading}
                    />
                    <button 
                      type="button"
                      className="btn-toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "إخفاء" : "إظهار"}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                    <button 
                      type="button"
                      className="btn-generate-password"
                      onClick={() => setNewUser({...newUser, password: generatePassword()})}
                      title="توليد كلمة مرور عشوائية"
                      disabled={loading}
                    >
                      🔄
                    </button>
                  </div>
                  <small className="form-hint">كلمة المرور الافتراضية: 123456</small>
                </div>
              </div>
              
              <div className="form-group checkbox-setting">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newUser.is_active}
                    onChange={(e) => setNewUser({...newUser, is_active: e.target.checked})}
                    disabled={loading}
                  />
                  <span>تفعيل المستخدم فوراً</span>
                </label>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowAddModal(false)}
                disabled={loading}
              >
                إلغاء
              </button>
              <button 
                className="btn-primary"
                onClick={handleAddUser}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">✓</span>
                    حفظ المستخدم
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== نافذة تعديل المستخدم ===== */}
      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ تعديل المستخدم</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body with-scrollbar">
              <div className="user-info-preview">
                <div 
                  className="preview-avatar"
                  style={{ backgroundColor: getRoleColor(editingUser.role) }}
                >
                  {editingUser.name?.charAt(0) || 'U'}
                </div>
                <div className="preview-details">
                  <div className="preview-name">{editingUser.name}</div>
                  <div className="preview-username">@{editingUser.username}</div>
                  <div className="preview-email">{editingUser.email}</div>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>الاسم الكامل <span className="required">*</span></label>
                  <input
                    type="text"
                    value={editingUser.name || ''}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>البريد الإلكتروني <span className="required">*</span></label>
                  <input
                    type="email"
                    value={editingUser.email || ''}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>الدور</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    className="form-select"
                    disabled={loading}
                  >
                    <option value="employee">👤 موظف</option>
                    <option value="branch_manager">🏢 مدير فرع</option>
                    <option value="admin">👑 المدير العام</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>الفرع</label>
                  <select
                    value={editingUser.branch_id || ''}
                    onChange={(e) => setEditingUser({...editingUser, branch_id: parseInt(e.target.value)})}
                    className="form-select"
                    disabled={loading}
                  >
                    <option value="">اختر الفرع</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} - {branch.location}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input
                    type="tel"
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                    className="form-input"
                    placeholder="01XXXXXXXXX"
                    maxLength="11"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>كلمة المرور الجديدة</label>
                  <div className="password-input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="اترك فارغاً للحفاظ على كلمة المرور الحالية"
                      onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                      className="form-input"
                      disabled={loading}
                    />
                    <button 
                      type="button"
                      className="btn-toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "إخفاء" : "إظهار"}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  <small className="form-hint">اترك الحقل فارغاً للحفاظ على كلمة المرور الحالية</small>
                </div>
              </div>
              
              <div className="form-group checkbox-setting">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingUser.is_active}
                    onChange={(e) => setEditingUser({...editingUser, is_active: e.target.checked})}
                    disabled={loading}
                  />
                  <span>المستخدم نشط</span>
                </label>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowEditModal(false)}
                disabled={loading}
              >
                إلغاء
              </button>
              <button 
                className="btn-primary"
                onClick={handleUpdateUser}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <span className="btn-icon">✓</span>
                    حفظ التغييرات
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

export default UsersManagement;