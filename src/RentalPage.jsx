import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import './RentalPage.css';

const RentalPage = () => {
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user') || '{"name": "مستخدم", "role": "EMPLOYEE"}');
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('تم تسجيل الخروج');
    navigate('/login');
  };

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      direction: 'rtl'
    }}>
      <Toaster position="top-center" />
      
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        marginBottom: '25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ color: '#333', marginBottom: '10px' }}>🎮 نظام تأجير الألعاب</h1>
          <p style={{ color: '#666' }}>
            {user.name} - {user.role === 'ADMIN' ? '👑 مدير' : '👨‍💼 موظف'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: '#f44336',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          🚪 تسجيل الخروج
        </button>
      </div>
      
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>🎉 نظام تأجير الألعاب يعمل!</h2>
        <p style={{ color: '#666', fontSize: '18px', marginBottom: '15px' }}>
          تم تحميل صفحة RentalPage بنجاح
        </p>
        <p style={{ color: '#4caf50', fontSize: '24px', fontWeight: 'bold' }}>
          ✅ التطبيق جاهز للعمل
        </p>
      </div>
    </div>
  );
};

export default RentalPage;
