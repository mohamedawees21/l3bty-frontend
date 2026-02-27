import { useEffect } from 'react';

/**
 * Hook للكشف عن النقر خارج العنصر
 * @param {React.RefObject} ref - مرجع العنصر
 * @param {Function} handler - الدالة التي ستُنفذ عند النقر خارج العنصر
 */
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    /**
     * معالجة حدث النقر
     * @param {MouseEvent} event - حدث الفأرة
     */
    const handleClickOutside = (event) => {
      // إذا كان العنصر موجوداً ولم يتم النقر عليه
      if (ref.current && !ref.current.contains(event.target)) {
        handler(event);
      }
    };

    // إضافة مستمع الحدث
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    // تنظيف مستمع الحدث
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, handler]);
};

export default useClickOutside;