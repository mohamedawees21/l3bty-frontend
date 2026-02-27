import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaHome, FaCog } from 'react-icons/fa';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* الشريط الجانبي */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <h2>🎮 L3BTY</h2>
          <p>نظام تأجير الألعاب</p>
        </div>
        
        <nav style={styles.nav}>
          <Link to="/rental" style={styles.navLink}>
            <FaHome /> التأجير
          </Link>
          
          {user?.role === 'ADMIN' && (
            <Link to="/admin" style={styles.navLink}>
              <FaCog /> الإدارة
            </Link>
          )}
          
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <FaSignOutAlt /> تسجيل الخروج
          </button>
        </nav>
        
        <div style={styles.userInfo}>
          <h4>{user?.name}</h4>
          <p>{user?.branch_name}</p>
          <p>{user?.role === 'ADMIN' ? '👑 مدير' : '👨‍💼 موظف'}</p>
        </div>
      </aside>
      
      {/* المحتوى الرئيسي */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    direction: 'rtl',
  },
  sidebar: {
    width: '250px',
    background: '#1a237e',
    color: 'white',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  logo: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    padding: '12px 15px',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'background 0.3s',
  },
  navLinkHover: {
    background: '#283593',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'white',
    padding: '12px 15px',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: 'auto',
  },
  userInfo: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255,255,255,0.2)',
  },
  main: {
    flex: 1,
    background: '#f5f7fa',
    padding: '20px',
    overflowY: 'auto',
  },
};

export default Layout;