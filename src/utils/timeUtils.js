export const getEgyptTime = () => {
  const now = new Date();
  const egyptOffset = 2 * 60; // UTC+2
  const localOffset = now.getTimezoneOffset();
  const egyptTime = new Date(now.getTime() + (egyptOffset + localOffset) * 60000);
  return egyptTime;
};

export const formatEgyptTime = (date) => {
  return date.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Africa/Cairo'
  });
};

export const formatEgyptDate = (date) => {
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Africa/Cairo'
  });
};

// تحقق من وقت العمل (12 ظهراً إلى 4 فجراً)
export const isWithinWorkingHours = () => {
  const egyptTime = getEgyptTime();
  const hour = egyptTime.getHours();
  // من 12:00 إلى 04:00 (24 ساعة)
  return (hour >= 12 && hour <= 23) || (hour >= 0 && hour <= 4);
};

// حساب سعر التأجير
export const calculatePrice = (pricePer15min, durationMinutes) => {
  const units = Math.ceil(durationMinutes / 15);
  return pricePer15min * units;
};

// حساب الوقت المتبقي
export const getRemainingTime = (startTimeISO, durationMinutes) => {
  const startTime = new Date(startTimeISO);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
  const now = getEgyptTime();
  const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
  return remainingSeconds;
};

// تنسيق الوقت
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};