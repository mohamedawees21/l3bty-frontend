import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ 
  size = 'medium', 
  color = '#3498db',
  fullScreen = false,
  text = 'جاري التحميل...',
  className = ''
}) => {
  // تحديد حجم السبينر
  const sizeMap = {
    small: 20,
    medium: 32,
    large: 48,
    xlarge: 64
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;

  if (fullScreen) {
    return (
      <div className="spinner-fullscreen">
        <div className="spinner-container">
          <Loader2 size={spinnerSize} color={color} className="spinner rotating" />
          {text && <p className="spinner-text">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`spinner-wrapper ${className}`}>
      <Loader2 size={spinnerSize} color={color} className="spinner rotating" />
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
};

export default Spinner;