import React from 'react';
import { Calendar, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      icon: Calendar,
      label: 'إجمالي التأجيرات',
      value: stats.totalRentals,
      color: '#3498db',
      bgColor: 'rgba(52, 152, 219, 0.1)'
    },
    {
      icon: DollarSign,
      label: 'إجمالي الإيرادات',
      value: formatCurrency(stats.totalRevenue),
      color: '#27ae60',
      bgColor: 'rgba(39, 174, 96, 0.1)'
    },
    {
      icon: TrendingUp,
      label: 'متوسط التأجير',
      value: formatCurrency(stats.averagePerRental),
      color: '#f39c12',
      bgColor: 'rgba(243, 156, 18, 0.1)'
    },
    {
      icon: Activity,
      label: 'نشط حالياً',
      value: stats.activeCount,
      color: '#e74c3c',
      bgColor: 'rgba(231, 76, 60, 0.1)'
    }
  ];

  return (
    <div className="stats-cards">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="stat-card" style={{ backgroundColor: card.bgColor }}>
            <div className="stat-icon" style={{ color: card.color }}>
              <Icon size={24} />
            </div>
            <div className="stat-content">
              <span className="stat-label">{card.label}</span>
              <span className="stat-value">{card.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;