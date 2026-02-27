import { useState, useEffect, useCallback } from 'react';

export const useTimer = (initialSeconds, onExpire, autoStart = true) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const [isExpiring, setIsExpiring] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (seconds <= 300 && seconds > 0) {
      setIsExpiring(true);
    } else {
      setIsExpiring(false);
    }
    
    if (seconds <= 0) {
      setIsExpired(true);
      if (onExpire) {
        onExpire();
      }
    } else {
      setIsExpired(false);
    }
  }, [seconds, onExpire]);

  useEffect(() => {
    let interval = null;
    
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds <= 1) {
            setIsActive(false);
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback((newSeconds) => {
    setIsActive(false);
    setSeconds(newSeconds || initialSeconds);
    setIsExpired(false);
    setIsExpiring(false);
  }, [initialSeconds]);

  const extend = useCallback((additionalSeconds) => {
    setSeconds(prev => prev + additionalSeconds);
    setIsExpired(false);
    setIsExpiring(prev => prev && seconds + additionalSeconds > 300);
  }, [seconds]);

  const formatTime = useCallback(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      minutes: mins,
      seconds: secs,
      formatted: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      totalSeconds: seconds
    };
  }, [seconds]);

  const getStatus = useCallback(() => {
    if (seconds <= 0) return 'expired';
    if (seconds <= 60) return 'critical';
    if (seconds <= 300) return 'warning';
    return 'normal';
  }, [seconds]);

  const getStatusColor = useCallback(() => {
    const status = getStatus();
    switch (status) {
      case 'expired': return '#dc3545';
      case 'critical': return '#ffc107';
      case 'warning': return '#fd7e14';
      default: return '#28a745';
    }
  }, [getStatus]);

  const canCancel = useCallback((totalDurationSeconds) => {
    // يمكن الإلغاء فقط في أول 3 دقائق
    const minutesUsed = (totalDurationSeconds - seconds) / 60;
    return minutesUsed <= 3;
  }, [seconds]);

  return {
    seconds,
    isActive,
    isExpiring,
    isExpired,
    start,
    pause,
    reset,
    extend,
    formatTime,
    getStatus,
    getStatusColor,
    canCancel,
    toggle: () => setIsActive(!isActive)
  };
};