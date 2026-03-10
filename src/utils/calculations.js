// ==================== دوال الحسابات ====================

/**
 * حساب سعر التأجير بناءً على المدة
 * @param {number} pricePer15Min - سعر الـ 15 دقيقة
 * @param {number} minutes - المدة بالدقائق
 * @returns {number} السعر الإجمالي
 */
export const calculateRentalPrice = (pricePer15Min, minutes) => {
  if (!pricePer15Min || !minutes) return 0;
  
  // حساب عدد وحدات الـ 15 دقيقة (تقريب لأعلى)
  const units = Math.ceil(minutes / 15);
  return pricePer15Min * units;
};

/**
 * حساب المبلغ المسترد عند الإلغاء
 * @param {Object} rental - بيانات التأجير
 * @param {number} elapsedMinutes - الدقائق المنقضية
 * @returns {number} المبلغ المسترد
 */
export const calculateRefundAmount = (rental, elapsedMinutes) => {
  if (!rental) return 0;
  
  const totalAmount = rental.total_amount || 0;
  
  // إذا مر أقل من 3 دقائق، استرداد كامل
  if (elapsedMinutes < 3) {
    return totalAmount;
  }
  
  // خصم أول 15 دقيقة
  const fifteenMinPrice = totalAmount / Math.ceil((rental.duration_minutes || 15) / 15);
  return Math.max(0, totalAmount - fifteenMinPrice);
};

/**
 * حساب إيرادات الشيفت
 * @param {Array} completedRentals - التأجيرات المكتملة
 * @returns {Object} إحصائيات الإيرادات
 */
export const calculateShiftRevenue = (completedRentals) => {
  if (!completedRentals || !completedRentals.length) {
    return {
      total: 0,
      cash: 0,
      card: 0,
      wallet: 0,
      points: 0,
      count: 0
    };
  }
  
  return completedRentals.reduce((stats, rental) => {
    if (rental.status === 'completed' && !rental.is_refunded) {
      const amount = rental.final_amount || rental.total_amount || 0;
      stats.total += amount;
      stats[rental.payment_method || 'cash'] += amount;
      stats.count += 1;
    }
    return stats;
  }, {
    total: 0,
    cash: 0,
    card: 0,
    wallet: 0,
    points: 0,
    count: 0
  });
};

/**
 * حساب النسبة المئوية
 * @param {number} value - القيمة
 * @param {number} total - الإجمالي
 * @returns {number} النسبة المئوية
 */
export const calculatePercentage = (value, total) => {
  if (!total) return 0;
  return (value / total) * 100;
};

/**
 * حساب متوسط مدة التأجير
 * @param {Array} rentals - التأجيرات
 * @returns {number} متوسط المدة
 */
export const calculateAverageDuration = (rentals) => {
  if (!rentals || !rentals.length) return 0;
  
  const totalDuration = rentals.reduce((sum, rental) => {
    return sum + (rental.duration_minutes || 15);
  }, 0);
  
  return Math.round(totalDuration / rentals.length);
};

/**
 * حساب أكثر الألعاب تأجيراً
 * @param {Array} items - عناصر التأجير
 * @returns {Array} قائمة الألعاب الأكثر تأجيراً
 */
export const getMostRentedGames = (items, limit = 5) => {
  if (!items || !items.length) return [];
  
  const gameCounts = items.reduce((counts, item) => {
    const gameId = item.game_id;
    const gameName = item.game_name;
    
    if (!counts[gameId]) {
      counts[gameId] = {
        id: gameId,
        name: gameName,
        count: 0,
        revenue: 0
      };
    }
    
    counts[gameId].count += item.quantity || 1;
    counts[gameId].revenue += item.total_price || 0;
    
    return counts;
  }, {});
  
  return Object.values(gameCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

/**
 * حساب ضريبة القيمة المضافة
 * @param {number} amount - المبلغ
 * @param {number} taxRate - نسبة الضريبة
 * @returns {Object} تفاصيل الضريبة
 */
export const calculateVAT = (amount, taxRate = 14) => {
  const tax = (amount * taxRate) / 100;
  return {
    subtotal: amount - tax,
    tax: tax,
    total: amount,
    taxRate: taxRate
  };
};

/**
 * حساب الخصم
 * @param {number} amount - المبلغ
 * @param {number} discountPercent - نسبة الخصم
 * @returns {Object} تفاصيل الخصم
 */
export const calculateDiscount = (amount, discountPercent) => {
  const discount = (amount * discountPercent) / 100;
  return {
    original: amount,
    discount: discount,
    discountPercent: discountPercent,
    final: amount - discount
  };
};

/**
 * حساب وقت الذروة
 * @param {Array} rentals - التأجيرات
 * @returns {Object} إحصائيات أوقات الذروة
 */
export const calculatePeakHours = (rentals) => {
  if (!rentals || !rentals.length) return {};
  
  const hourCounts = {};
  
  rentals.forEach(rental => {
    if (rental.start_time) {
      const hour = new Date(rental.start_time).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });
  
  const peakHour = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)[0];
  
  return {
    hourly: hourCounts,
    peakHour: peakHour ? parseInt(peakHour[0]) : null,
    peakCount: peakHour ? peakHour[1] : 0
  };
};