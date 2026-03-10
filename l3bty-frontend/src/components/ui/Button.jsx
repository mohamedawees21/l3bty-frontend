import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  // تحديد كلاس الـ variant
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    warning: 'btn-warning',
    info: 'btn-info',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    link: 'btn-link'
  };

  // تحديد كلاس الحجم
  const sizeClasses = {
    small: 'btn-sm',
    medium: 'btn-md',
    large: 'btn-lg'
  };

  const buttonClasses = [
    'btn',
    variantClasses[variant] || 'btn-primary',
    sizeClasses[size] || 'btn-md',
    fullWidth ? 'btn-full-width' : '',
    loading ? 'btn-loading' : '',
    disabled ? 'btn-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="spinner" />}
      
      {Icon && iconPosition === 'left' && !loading && (
        <Icon size={16} className="btn-icon" />
      )}
      
      <span className="btn-text">{children}</span>
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon size={16} className="btn-icon" />
      )}
    </button>
  );
};

export default Button;