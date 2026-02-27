// src/hooks/useNotifications.js
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const useNotifications = () => {
  const playSound = (soundFile) => {
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.play();
  };

  const showNotification = (title, options) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  };

  const notifyRentalEnding = (rentalId, gameName, timeLeft) => {
    if (timeLeft === 5) {
      toast.custom((t) => (
        <div className="alert-warning">
          ⏰ تنبيه: {gameName} سينتهي خلال {timeLeft} دقائق
          <button onClick={() => toast.dismiss(t.id)}>✕</button>
        </div>
      ));
      playSound('alert.mp3');
      showNotification('تنبيه انتهاء الوقت', {
        body: `${gameName} سينتهي خلال ${timeLeft} دقائق`,
        icon: '/favicon.ico'
      });
    }
  };

  return { notifyRentalEnding, playSound, showNotification };
};