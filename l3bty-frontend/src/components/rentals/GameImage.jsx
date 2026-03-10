import React, { useState, useCallback, useMemo } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { DEFAULT_GAME_IMAGES } from '../../utils/constants';

const GameImage = ({ src, alt, className, size = 'medium', onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // الحصول على مسار الصورة المناسب
  const getImagePath = useCallback((gameName, imageUrl) => {
    if (imageUrl) {
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      if (imageUrl.includes('.')) {
        return `/images/${imageUrl}`;
      }
    }

    if (gameName) {
      const gameNameLower = gameName.toLowerCase();
      for (const [key, value] of Object.entries(DEFAULT_GAME_IMAGES)) {
        if (gameNameLower.includes(key.toLowerCase())) {
          return value;
        }
      }
    }

    return '/images/playstation.jpg';
  }, []);

  const currentSrc = useMemo(() => getImagePath(alt, src), [alt, src, getImagePath]);

  // تحديد حجم الصورة
  const sizeClasses = {
    small: 'image-small',
    medium: 'image-medium',
    large: 'image-large'
  };

  return (
    <div 
      className={`game-image-container ${sizeClasses[size]} ${className || ''} ${imageLoaded ? 'loaded' : 'loading'}`}
      onClick={onClick}
    >
      {!imageLoaded && !imageError && (
        <div className="image-placeholder">
          <ImageIcon size={size === 'large' ? 48 : 24} />
        </div>
      )}
      
      {imageError ? (
        <div className="image-error">
          <ImageIcon size={size === 'large' ? 32 : 16} />
          <span>{alt || 'لا توجد صورة'}</span>
        </div>
      ) : (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={alt || 'صورة اللعبة'}
          className={`game-image ${imageLoaded ? 'visible' : 'hidden'}`}
          onLoad={() => {
            setImageLoaded(true);
            setImageError(false);
          }}
          onError={() => {
            setImageError(true);
            setImageLoaded(false);
          }}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default GameImage;