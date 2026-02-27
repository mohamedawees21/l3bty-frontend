// src/utils/gameImages.js
export const getGameImage = (game) => {
  if (!game) return getDefaultImage();
  
  // صور محلية
  const localImages = {
    'دريفت كار': 'Driftcar.jpg',
    'هافر بورد': 'Hoverboard.jpg',
    'سكوتر': 'Scooter.jpg',
    'عربة كهربائية': 'Car.jpg',
    'موتوسيكل كهربائي': 'Motor.jpg',
    'هارلي': 'harley.jpg',
    'سيجواي': 'Segway.jpg',
    'كرازي كار': 'Ninebot.jpg',
    'سكيت كهربائي': 'Skate.jpg',
    'ترامبولين': 'Trampoline.jpg',
    'محاكي': 'Simulator.jpg'
  };
  
  // صور احتياطية من الإنترنت
  const fallbackImages = {
    'دريفت كار': 'https://images.unsplash.com/photo-1565689221354-d87f85d4bee6?w=400&h=300&fit=crop',
    'هافر بورد': 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400&h=300&fit=crop',
    'سكوتر': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    'عربة كهربائية': 'https://images.unsplash.com/photo-1563720223481-8f2f62a6e71a?w=400&h=300&fit=crop',
    'موتوسيكل كهربائي': 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=400&h=300&fit=crop',
    'هارلي': 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=400&h=300&fit=crop',
    'سيجواي': 'https://images.unsplash.com/photo-1593941707882-a5bba5338fe2?w=400&h=300&fit=crop'
  };
  
  // 1. محاولة الصورة من قاعدة البيانات
  if (game.image_url) {
    if (game.image_url.startsWith('http')) return game.image_url;
    if (game.image_url.startsWith('/')) return game.image_url;
    return `/images/${game.image_url}`;
  }
  
  // 2. محاولة الصورة المحلية
  const localImage = localImages[game.name];
  if (localImage) {
    const localPath = `/images/${localImage}`;
    // يمكن إضافة تحقق هنا إذا كانت الصورة موجودة
    return localPath;
  }
  
  // 3. استخدام صورة احتياطية من الإنترنت
  return fallbackImages[game.name] || getDefaultImage();
};

export const getDefaultImage = () => {
  return 'https://via.placeholder.com/400x300/1e3a8a/ffffff?text=🎮+لعبة';
};

// مصفوفة أسماء الصور المطلوبة
export const requiredImages = [
  'Driftcar.jpg',
  'Hoverboard.jpg',
  'Scooter.jpg',
  'Car.jpg',
  'Motor.jpg',
  'harley.jpg',
  'Segway.jpg',
  'Ninebot.jpg',
  'Skate.jpg',
  'Trampoline.jpg',
  'Simulator.jpg',
  'default-game.jpg'
];