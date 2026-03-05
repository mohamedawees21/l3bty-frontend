import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

// ================= CONSTANTS =================
const MOBILE_BREAKPOINT = 768;

const ROLES = {
  ADMIN: "admin",
  BRANCH_MANAGER: "branch_manager",
  EMPLOYEE: "employee"
};

const ROLE_CONFIG = {
  [ROLES.ADMIN]: { label: "المدير العام", icon: "👑", arabicLabel: "مدير عام" },
  [ROLES.BRANCH_MANAGER]: { label: "مدير فرع", icon: "🏢", arabicLabel: "مدير فرع" },
  [ROLES.EMPLOYEE]: { label: "موظف", icon: "👤", arabicLabel: "موظف" },
};

const MENU_CONFIG = {
  [ROLES.ADMIN]: [
    { path: "/admin/dashboard", icon: "📊", label: "لوحة التحكم" },
    { path: "/admin/users", icon: "👥", label: "المستخدمين" },
    { path: "/admin/branches", icon: "🏬", label: "الفروع" },
    { path: "/admin/games", icon: "🎮", label: "الألعاب" },
    { path: "/admin/rentals", icon: "📋", label: "التأجيرات" },
    { path: "/admin/revenue-analysis", icon: "💰", label: "تحليل الإيرادات" },
    { path: "/admin/settings", icon: "⚙️", label: "الإعدادات" },
  ],
  [ROLES.BRANCH_MANAGER]: [
    { path: "/branch/dashboard", icon: "📊", label: "لوحة التحكم" },
    { path: "/branch/employees", icon: "👥", label: "الموظفين" },
    { path: "/branch/rentals", icon: "📋", label: "التأجيرات" },
    { path: "/branch/reports", icon: "📈", label: "التقارير" },
  ],
  [ROLES.EMPLOYEE]: [
    { path: "/employee/rentals", icon: "📋", label: "التأجيرات" },
    { path: "/employee/customers", icon: "👤", label: "العملاء" },
  ],
};

// ================= COMPONENT =================
const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Refs
  const sidebarRef = useRef(null);
  const toggleRef = useRef(null);

  // State
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= MOBILE_BREAKPOINT
  );
  const [sidebarOpen, setSidebarOpen] = useState(
    window.innerWidth > MOBILE_BREAKPOINT
  );

  // ================= Responsive Logic =================
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ================= Close sidebar on route change (mobile) =================
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  // ================= Close on outside click (mobile) =================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobile &&
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);

  // ================= Close with ESC key =================
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [sidebarOpen]);

  // ================= Derived Values =================
  const roleConfig = useMemo(
    () => ROLE_CONFIG[user?.role] || ROLE_CONFIG[ROLES.EMPLOYEE],
    [user?.role]
  );

  const menuItems = useMemo(
    () => MENU_CONFIG[user?.role] || MENU_CONFIG[ROLES.EMPLOYEE],
    [user?.role]
  );

  const isActive = useCallback(
    (path) => location.pathname.startsWith(path),
    [location.pathname]
  );

  // ================= Actions =================
  const handleLogout = useCallback(() => {
    if (window.confirm("هل تريد تسجيل الخروج؟")) {
      logout();
      navigate("/login");
    }
  }, [logout, navigate]);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // ================= Render =================
  return (
    <div className="layout" dir="rtl">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button
            ref={toggleRef}
            className="menu-toggle"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>

          <div 
            className="header-logo" 
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && navigate("/")}
          >
            <img src="/images/l3bty.png" alt="L3BTY Store" />
            <h1>متجر لعبتي</h1>
          </div>
        </div>

        <div className="header-user">
          <div className="user-info">
            <span className="user-icon" aria-hidden="true">
              {roleConfig.icon}
            </span>
            <div className="user-details">
              <strong className="user-name">
                {user?.name || "مستخدم"}
              </strong>
              <span className="user-role">
                {roleConfig.arabicLabel}
              </span>
            </div>
          </div>

          <button 
            className="btn-logout" 
            onClick={handleLogout}
            aria-label="تسجيل الخروج"
          >
            <span aria-hidden="true">🚪</span>
            <span className="logout-text">تسجيل الخروج</span>
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main Body */}
      <div className="layout-body">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`sidebar ${sidebarOpen ? "open" : "closed"}`}
          aria-label="القائمة الجانبية"
          aria-hidden={!sidebarOpen && isMobile}
        >
          <nav className="sidebar-nav" aria-label="روابط التنقل">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${
                  isActive(item.path) ? "active" : ""
                }`}
                onClick={() => isMobile && closeSidebar()}
              >
                <span className="nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="nav-label">{item.label}</span>
                {isActive(item.path) && (
                  <span className="active-indicator" aria-hidden="true" />
                )}
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="branch-info">
              <span className="branch-name">
                {user?.branch_name || "الفرع الرئيسي"}
              </span>
              <div className="branch-status">
                <span className="status-dot active" aria-hidden="true" />
                <span className="status-text">متصل</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;