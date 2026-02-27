import React from 'react';

const StatsCard = ({ icon, title, value, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500'
  };

  return (
    <div className="stats-card">
      <div className={`icon-container ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="stats-info">
        <h3>{title}</h3>
        <p className="stats-value">{value}</p>
      </div>
    </div>
  );
};

// ⚠️ مهم: تأكد من التصدير الصحيح
export default StatsCard;