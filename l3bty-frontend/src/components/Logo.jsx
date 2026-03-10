import React from 'react';

const Logo = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: { width: 40, height: 40 },
    md: { width: 60, height: 60 },
    lg: { width: 100, height: 100 },
    xl: { width: 150, height: 150 }
  };

  const { width, height } = sizes[size] || sizes.md;

  return (
    <div className={`logo-container ${className}`}>
      <img 
        src="/images/logol3bty.jpg" 
        alt="L3BTY Rental System Logo" 
        width={width}
        height={height}
        className="logo-image"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/images/logo-placeholder.png';
        }}
      />
      <span className="logo-text" style={{ fontSize: size === 'sm' ? '14px' : '18px' }}>
        L3BTY Rental
      </span>
    </div>
  );
};

export default Logo;