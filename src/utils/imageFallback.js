// frontend/src/utils/imageFallback.js
export const handleImageError = (e, fallbackText = 'Game') => {
  e.target.onerror = null;
  
  // حاول استخدام الصورة الافتراضية المحلية
  e.target.src = '/images/default-game.jpg';
  
  // إذا فشلت الصورة المحلية أيضاً، أنشئ صورة باستخدام canvas
  e.target.onerror = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    // خلفية
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, 100, 100);
    
    // نص
    ctx.fillStyle = '#6c757d';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fallbackText, 50, 50);
    
    e.target.src = canvas.toDataURL();
  };
};