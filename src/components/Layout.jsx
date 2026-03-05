import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

const MOBILE_BREAKPOINT = 768;

const ROLE_CONFIG = {
  admin: { label: "المدير العام", icon: "👑" },
  branch_manager: { label: "مدير فرع", icon: "🏢" },
  employee: { label: "موظف", icon: "👤" },
};

const MENU_CONFIG = {
  admin: [
    { path: "/admin/dashboard", icon: "📊", label: "لوحة التحكم" },
    { path: "/admin/users", icon: "👥", label: "المستخدمين" },
    { path: "/admin/branches", icon: "🏬", label: "الفروع" },
    { path: "/admin/games", icon: "🎮", label: "الألعاب" },
    { path: "/admin/rentals", icon: "📋", label: "التأجيرات" },
    { path: "/admin/revenue-analysis", icon: "💰", label: "تحليل الإيرادات" },
    { path: "/admin/settings", icon: "⚙️", label: "الإعدادات" },
  ],
  employee: [{ path: "/employee/rentals", icon: "📋", label: "التأجيرات" }],
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarRef = useRef(null);
  const toggleRef = useRef(null);

  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= MOBILE_BREAKPOINT
  );
  const [sidebarOpen, setSidebarOpen] = useState(
    window.innerWidth > MOBILE_BREAKPOINT
  );

  /* ================= Responsive Logic ================= */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= Close on Route Change (Mobile) ================= */
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  /* ================= Close on Outside Click ================= */
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

  /* ================= Close with ESC ================= */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  /* ================= Derived Values ================= */
  const roleConfig = ROLE_CONFIG[user?.role] || {
    label: "مستخدم",
    icon: "❓",
  };

  const menuItems = useMemo(() => {
    return MENU_CONFIG[user?.role] || MENU_CONFIG.employee;
  }, [user?.role]);

  const isActive = (path) => location.pathname.startsWith(path);

  /* ================= Actions ================= */
  const handleLogout = () => {
    if (window.confirm("هل تريد تسجيل الخروج؟")) {
      logout();
      navigate("/login");
    }
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  /* ================= UI ================= */
  return (
    <div className="layout">
      {/* ================= HEADER ================= */}
      <header className="header">
        <div className="header-left">
          <button
            ref={toggleRef}
            className="menu-toggle"
            onClick={toggleSidebar}
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>

          <div className="header-logo" onClick={() => navigate("/")}>
            <img src="/images/l3bty.png" alt="L3BTY Logo" />
            <h1>L3BTY Store</h1>
          </div>
        </div>
<div className="header-user">
  <div className="user-info">
    <span>{roleConfig.icon}</span>
    <div>
      <strong>{user?.name || "مستخدم"}</strong>
      <small>{roleConfig.label}</small>
    </div>
  </div>

  <button className="btn-logout" onClick={handleLogout}>
    🚪 تسجيل الخروج
  </button>
</div>
      </header>

      {/* Overlay Mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= BODY ================= */}
      <div className="layout-body">
        <aside
          ref={sidebarRef}
          className={`sidebar ${sidebarOpen ? "open" : "closed"}`}
        >
          <nav>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${
                  isActive(item.path) ? "active" : ""
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <span>{user?.branch_name || "الفرع الرئيسي"}</span>
            <div className="branch-status">
              <span className="status-dot active" />
              متصل
            </div>
          </div>
        </aside>

        <main className="main-content">
          <div className="content-container">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;