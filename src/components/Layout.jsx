import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePath, setActivePath] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);
  const menuToggleRef = useRef(null);

  // تحديد حجم الشاشة بشكل دقيق
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth <= 760; // تغيير من 1024 إلى 768
      setIsMobile(mobile);
      
      // إغلاق القائمة تلقائياً عند التبديل من كمبيوتر إلى موبايل
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
      
      // فتح القائمة تلقائياً عند التبديل من موبايل إلى كمبيوتر (إذا كانت مغلقة)
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };
    
    // التحقق عند التحميل الأولي
    checkIsMobile();
    
    // تهيئة حالة القائمة حسب نوع الجهاز
    const isMobileOnLoad = window.innerWidth <= 768;
    setIsMobile(isMobileOnLoad);
    setSidebarOpen(!isMobileOnLoad); // مفتوحة على الكمبيوتر، مغلقة على الموبايل
    
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // تحديث المسار النشط
  useEffect(() => {
    setActivePath(location.pathname);
    
    // إغلاق القائمة على الموبايل عند تغيير المسار
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile, sidebarOpen]);

  // إغلاق القائمة عند النقر خارجها (للموبايل فقط)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile && 
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        menuToggleRef.current &&
        !menuToggleRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    if (isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [sidebarOpen, isMobile]);

  // إغلاق القائمة بالزر Escape (لكلا الجهازين)
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  // إدارة التمرير (إغلاق القائمة عند التمرير على الموبايل)
  useEffect(() => {
    const handleScroll = () => {
      if (isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, sidebarOpen]);

  const handleLogout = () => {
    if (window.confirm('هل تريد تسجيل الخروج؟')) {
      logout();
      navigate('/login');
    }
  };

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

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const openSidebar = () => {
    if (!isMobile) {
      setSidebarOpen(true);
    }
  };

  const adminMenu = [
    { path: '/admin/dashboard', icon: '📊', label: 'لوحة التحكم' },
    { path: '/admin/users', icon: '👥', label: 'المستخدمين' },
    { path: '/admin/branches', icon: '🏬', label: 'الفروع' },
    { path: '/admin/games', icon: '🎮', label: 'الألعاب' },
    { path: '/admin/rentals', icon: '📋', label: 'التأجيرات' },
    { path: '/admin/revenue-analysis', icon: '💰', label: 'تحليل الإيرادات' },
    { path: '/admin/settings', icon: '⚙️', label: 'الإعدادات' },
  ];

  const employeeMenu = [
    { path: '/employee/rentals', icon: '📋', label: 'التأجيرات' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenu : employeeMenu;

  const isActive = (path) => {
    if (path === activePath) return true;
    if (path.includes('/dashboard') && activePath.includes('/dashboard')) return true;
    if (path.includes('/rentals') && activePath.includes('/rentals')) return true;
    return false;
  };

  return (
    <div className="layout">
  {/* ================= HEADER ================= */}
  <header className="header">
    <div className="header-left">
      <button
        ref={menuToggleRef}
        className="menu-toggle"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
      >
        <span className="menu-icon">
          {sidebarOpen ? "✕" : "☰"}
        </span>
      </button>

      <div className="header-logo" onClick={() => navigate("/")}>
        <img src="/images/l3bty.png" alt="L3BTY Store Logo" />
        <h1>L3BTY Store</h1>
      </div>
    </div>

    <div className="header-user">
      <div className="user-info">
        <span className="user-role-icon">
          {getRoleIcon(user?.role)}
        </span>

        <div className="user-detailss">
          <span className="user-namee">
            {user?.name || "مستخدم"}
          </span>
          <span className="user-rolee">
            {getRoleText(user?.role)}
          </span>
        </div>
      </div>

      <button className="btn-logout" onClick={handleLogout}>
        🚪 تسجيل الخروج
      </button>
    </div>
  </header>

  {/* Overlay للموبايل */}
  {isMobile && sidebarOpen && (
    <div
      className="sidebar-overlay"
      onClick={closeSidebar}
    />
  )}

  {/* ================= BODY ================= */}
  <div className="layout-body">
    
    {/* -------- SIDEBAR -------- */}
    <aside
      ref={sidebarRef}
className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
    >
      <div className="sidebar-header">
        {isMobile && (
          <button
            className="sidebar-close"
            onClick={closeSidebar}
          >
            ✕
          </button>
        )}

        <h2>القائمة الرئيسية</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={closeSidebar}
            className={`nav-link ${
              isActive(item.path) ? "active" : ""
            }`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {isActive(item.path) && (
              <span className="nav-indicator">→</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="branch-name">
          {user?.branch_name || "الفرع الرئيسي"}
        </span>

        <div className="branch-status">
          <span className="status-dot active"></span>
          متصل
        </div>
      </div>
    </aside>

    {/* -------- MAIN CONTENT -------- */}
    <main className="main-content">
      {!sidebarOpen && !isMobile && (
        <button
          className="sidebar-toggle-fab"
          onClick={openSidebar}
        >
          ☰
        </button>
      )}

      <div className="content-container">
        {children}
      </div>
    </main>

  </div>
</div>

  );
};

export default Layout;