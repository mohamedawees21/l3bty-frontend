import React, { useEffect } from 'react';
import { 
  CheckCircle, AlertCircle, AlertTriangle, 
  Info, X 
} from 'lucide-react';

const Toast = ({
  type = 'info',
  message,
  duration = 3000,
  onClose,
  position = 'top-left'
}) => {
  // تحديد الأيقونة واللون حسب النوع
  const toastConfig = {
    success: {
      icon: CheckCircle,
      color: '#2ecc71',
      bgColor: 'rgba(46, 204, 113, 0.1)'
    },
    error: {
      icon: AlertCircle,
      color: '#e74c3c',
      bgColor: 'rgba(231, 76, 60, 0.1)'
    },
    warning: {
      icon: AlertTriangle,
      color: '#f39c12',
      bgColor: 'rgba(243, 156, 18, 0.1)'
    },
    info: {
      icon: Info,
      color: '#3498db',
      bgColor: 'rgba(52, 152, 219, 0.1)'
    }
  };

  const { icon: Icon, color, bgColor } = toastConfig[type] || toastConfig.info;

  // تحديد موقع التوست
  const positionClasses = {
    'top-left': 'toast-top-left',
    'top-right': 'toast-top-right',
    'bottom-left': 'toast-bottom-left',
    'bottom-right': 'toast-bottom-right',
    'top-center': 'toast-top-center',
    'bottom-center': 'toast-bottom-center'
  };

  // إغلاق تلقائي بعد المدة المحددة
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`toast-container ${positionClasses[position]}`}>
      <div 
        className="toast-content"
        style={{ backgroundColor: bgColor, borderRightColor: color }}
      >
        <div className="toast-icon" style={{ color }}>
          <Icon size={20} />
        </div>
        <div className="toast-message">
          {message}
        </div>
        <button onClick={onClose} className="toast-close">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;