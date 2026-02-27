// src/components/common/Timer.jsx
import React, { useState, useEffect } from 'react';

const Timer = ({ initialTime, onTimeEnd, rentalId }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeEnd(rentalId);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 60000); // كل دقيقة

    return () => clearInterval(timer);
  }, [timeLeft, rentalId, onTimeEnd]);

  // التنسيق مع WebSocket للتحديث الحي
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000/rental-timers');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.rentalId === rentalId) {
        setTimeLeft(data.timeLeft);
      }
    };

    return () => ws.close();
  }, [rentalId]);

  return (
    <div className="timer">
      ⏰ {timeLeft} دقيقة متبقية
      {timeLeft <= 5 && <span className="warning"> ⚠️ تنبيه</span>}
    </div>
  );
};