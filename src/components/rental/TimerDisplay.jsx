import React, { useState, useEffect } from 'react';
import { useRental } from '../../context/RentalContext';
import { formatTime, getRemainingTime, getTimerColor } from '../../utils/timeUtils';
import toast from 'react-hot-toast';
import { FaPlay, FaPause, FaStop, FaTimes, FaPlus } from 'react-icons/fa';
import '../../styles/rental.css';

const TimerDisplay = ({ rental }) => {
  const { cancelRental, extendRental } = useRental();
  const [remaining, setRemaining] = useState(0);
  const [canCancel, setCanCancel] = useState(true);
  const [showExtend, setShowExtend] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const remainingTime = getRemainingTime(rental.start_time, rental.duration);
      setRemaining(remainingTime);
      
      // Check if can cancel (first 3 minutes only)
      const elapsedMinutes = (rental.duration * 60 - remainingTime) / 60;
      setCanCancel(elapsedMinutes <= 3);
      
      // Show extend option when less than 5 minutes remaining
      setShowExtend(remainingTime <= 300); // 5 minutes in seconds
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    // Play sound when time is up
    if (remaining <= 0) {
      const audio = new Audio('/sounds/alert.mp3');
      audio.play();
      toast.error(`انتهى وقت تأجير ${rental.game_name}`);
    }

    return () => clearInterval(interval);
  }, [rental, remaining]);

  const handleCancel = async () => {
    if (!canCancel) {
      toast.error('لا يمكن الإلغاء بعد مرور 3 دقائق');
      return;
    }

    const reason = prompt('سبب الإلغاء (اختياري):');
    const result = await cancelRental(rental.id, reason);
    
    if (result.success) {
      toast.success('تم إلغاء التأجير');
    }
  };

  const handleExtend = async () => {
    const result = await extendRental(rental.id, 15);
    
    if (result.success) {
      toast.success('تم تمديد التأجير 15 دقيقة');
      setShowExtend(false);
    }
  };

  const handleComplete = async () => {
    // Implementation for completing rental
    toast.success('تم إنهاء التأجير');
  };

  const timerColor = getTimerColor(remaining);

  return (
    <div className={`timer-card ${timerColor}`}>
      <div className="timer-header">
        <h4>{rental.game_name}</h4>
        <span className="child-name">{rental.child_name}</span>
      </div>
      
      <div className="timer-display">
        <div className="time-remaining">
          {formatTime(remaining)}
        </div>
        <div className="timer-status">
          {remaining > 0 ? 'نشط' : 'منتهي'}
        </div>
      </div>

      <div className="timer-info">
        <div className="info-item">
          <span>بداية:</span>
          <span>{new Date(rental.start_time).toLocaleTimeString()}</span>
        </div>
        <div className="info-item">
          <span>نهاية:</span>
          <span>{new Date(rental.end_time).toLocaleTimeString()}</span>
        </div>
        <div className="info-item">
          <span>المبلغ:</span>
          <span className="price">{rental.total_price} ريال</span>
        </div>
      </div>

      <div className="timer-actions">
        {remaining > 0 && canCancel && (
          <button 
            onClick={handleCancel}
            className="btn-cancel"
            title="إلغاء (3 دقائق فقط)"
          >
            <FaTimes /> إلغاء
          </button>
        )}
        
        {showExtend && remaining > 0 && (
          <button 
            onClick={handleExtend}
            className="btn-extend"
          >
            <FaPlus /> تمديد 15 دقيقة
          </button>
        )}
        
        {remaining <= 0 && (
          <button 
            onClick={handleComplete}
            className="btn-complete"
          >
            <FaStop /> إنهاء
          </button>
        )}
      </div>
    </div>
  );
};

export default TimerDisplay;