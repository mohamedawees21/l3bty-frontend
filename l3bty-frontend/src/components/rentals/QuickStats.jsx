import React from 'react';
import { Activity, History, DollarSign, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const QuickStats = ({ stats }) => {
  const statCards = [
    {
      icon: Activity,
      label: 'تأجيرات نشطة',
      value: stats.activeCount,
      color: '#3498db',
      bgColor: 'rgba(52, 152, 219, 0.1)'
    },
    {
      icon: History,
      label: 'مكتملة اليوم',
      value: stats.completedCount,
      color: '#2ecc71',
      bgColor: 'rgba(46, 204, 113, 0.1)'
    },
    {
      icon: DollarSign,
      label: 'إيرادات اليوم',
      value: formatCurrency(stats.totalRevenue),
      color: '#f39c12',
      bgColor: 'rgba(243, 156, 18, 0.1)'
    },
    {
      icon: ShoppingCart,
      label: 'في السلة',
      value: stats.itemsInCart,
      color: '#9b59b6',
      bgColor: 'rgba(155, 89, 182, 0.1)'
    }
  ];

  return (
    <div className="quick-stats">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="stat-card" style={{ backgroundColor: stat.bgColor }}>
            <div className="stat-icon" style={{ color: stat.color }}>
              <Icon size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickStats;