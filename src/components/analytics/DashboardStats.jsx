import React, { useEffect, useState } from 'react';
import analyticsService from '../../services/analyticsService';

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getDashboardStats();
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>جاري تحميل الإحصائيات...</div>;
  }

  if (!stats) {
    return <div>لا توجد بيانات</div>;
  }

  return (
    <div className="dashboard-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>إجمالي الإيرادات</h3>
          <p className="stat-value">{stats.summary.total_revenue} ج.م</p>
        </div>
        
        <div className="stat-card">
          <h3>إجمالي التأجيرات</h3>
          <p className="stat-value">{stats.summary.total_rentals}</p>
        </div>
        
        <div className="stat-card">
          <h3>تأجيرات نشطة</h3>
          <p className="stat-value">{stats.summary.active_rentals}</p>
        </div>
        
        <div className="stat-card">
          <h3>ألعاب متاحة</h3>
          <p className="stat-value">{stats.summary.available_games}</p>
        </div>
      </div>

      {/* عرض أفضل الألعاب */}
      <div className="top-games-section">
        <h3>أفضل الألعاب</h3>
        <ul>
          {stats.topGames.map((game, index) => (
            <li key={game.id}>
              <span>{index + 1}. {game.name}</span>
              <span>{game.rental_count} تأجير</span>
              <span>{game.total_revenue} ج.م</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardStats;