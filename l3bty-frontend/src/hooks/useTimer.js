import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateRemainingTime, formatRemainingTime, isTimeExpired } from '../utils/formatters';

export const useTimer = (startTime, duration = 15, onExpire) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const timerRef = useRef(null);
  const expiredRef = useRef(false);

  // تحديث الوقت المتبقي
  const updateTimeLeft = useCallback(() => {
    if (!startTime || !isRunning) return;

    const remaining = calculateRemainingTime(startTime, duration);
    setTimeLeft({ minutes: remaining.minutes, seconds: remaining.seconds });

    const expired = remaining.total <= 0;
    
    if (expired && !expiredRef.current) {
      setIsExpired(true);
      expiredRef.current = true;
      if (onExpire) onExpire();
    }
  }, [startTime, duration, isRunning, onExpire]);

  // بدء المؤقت
  useEffect(() => {
    if (!startTime) return;

    // تحديث فوري
    updateTimeLeft();

    // تحديث كل ثانية
    timerRef.current = setInterval(updateTimeLeft, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime, duration, updateTimeLeft]);

  // إيقاف المؤقت
  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  // بدء المؤقت
  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  // إعادة ضبط المؤقت
  const resetTimer = useCallback((newStartTime, newDuration) => {
    stopTimer();
    expiredRef.current = false;
    setIsExpired(false);
    setIsRunning(true);
    
    if (newStartTime) {
      const remaining = calculateRemainingTime(newStartTime, newDuration || duration);
      setTimeLeft({ minutes: remaining.minutes, seconds: remaining.seconds });
    }
  }, [duration, stopTimer]);

  // تنسيق الوقت للعرض
  const formattedTime = useCallback(() => {
    return formatRemainingTime(timeLeft.minutes, timeLeft.seconds);
  }, [timeLeft]);

  // التحقق من انتهاء الوقت
  const checkExpired = useCallback(() => {
    return isTimeExpired(startTime, duration);
  }, [startTime, duration]);

  return {
    timeLeft,
    formattedTime: formattedTime(),
    isExpired,
    isRunning,
    stopTimer,
    startTimer,
    resetTimer,
    checkExpired
  };
};