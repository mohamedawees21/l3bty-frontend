// src/pages/Unauthorized.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛔ غير مصرح بالوصول</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
        ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة
      </p>
      <button 
        onClick={() => navigate('/employee/dashboard')}
        style={{
          background: 'white',
          color: '#764ba2',
          border: 'none',
          padding: '12px 30px',
          fontSize: '1.1rem',
          borderRadius: '25px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
      >
        العودة للداشبورد
      </button>
    </div>
  );
};

export default Unauthorized;