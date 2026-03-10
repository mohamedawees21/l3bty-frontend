import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  closeOnClickOutside = true,
  showCloseButton = true,
  className = ''
}) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  // تحديد حجم المودال
  const sizeClasses = {
    small: 'modal-sm',
    medium: 'modal-md',
    large: 'modal-lg',
    full: 'modal-full'
  };

  // إغلاق المودال عند الضغط على ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // إغلاق المودال عند الضغط خارج المحتوى
  const handleOverlayClick = (e) => {
    if (closeOnClickOutside && e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div 
        className={`modal-container ${sizeClasses[size]} ${className}`}
        ref={modalRef}
      >
        {/* رأس المودال */}
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          {showCloseButton && (
            <button onClick={onClose} className="modal-close-btn">
              <X size={20} />
            </button>
          )}
        </div>

        {/* جسم المودال */}
        <div className="modal-body">
          {children}
        </div>

        {/* تذييل المودال */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;