// frontend/src/components/rental/RentalTimer.jsx
import React, { useState, useEffect } from 'react';

const RentalTimer = ({ rentalId, expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!expiresAt) return 0;
      
      const now = new Date();
      const expireTime = new Date(expiresAt);
      const diff = expireTime - now;
      
      if (diff <= 0) {
        setIsExpired(true);
        onExpire?.();
        return 0;
      }
      
      return Math.floor(diff / 1000);
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const minutes = Math.floor(timeLeft / 60);
    if (isExpired) return '#dc3545';
    if (minutes < 5) return '#ffc107';
    if (minutes < 10) return '#ff9800';
    return '#28a745';
  };

  return (
    <div className="rental-timer" style={{
      padding: '0.75rem',
      backgroundColor: isExpired ? '#f8d7da' : '#f8f9fa',
      border: `2px solid ${getTimerColor()}`,
      borderRadius: '8px',
      textAlign: 'center',
      margin: '1rem 0'
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getTimerColor() }}>
        {isExpired ? '⏰ انتهى الوقت!' : formatTime(timeLeft)}
      </div>
      {!isExpired && (
        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.5rem' }}>
          متبقي حتى انتهاء التأجير
        </div>
      )}
    </div>
  );
};

// تأكد من التصدير كـ default
export default RentalTimer;