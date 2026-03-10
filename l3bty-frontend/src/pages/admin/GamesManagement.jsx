import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import './GamesManagement.css';
import api from '../../services/api';

const GamesManagement = () => {
  const { user } = useAuth();
  const [allGames, setAllGames] = useState([]); // جميع الألعاب من جميع الفروع
  const [currentGames, setCurrentGames] = useState([]); // الألعاب المعروضة حالياً
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBranch, setLoadingBranch] = useState(false);
  const [error, setError] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [branchStats, setBranchStats] = useState({});
  const [gamesLoaded, setGamesLoaded] = useState(false); // تتبع حالة تحميل الألعاب

  useEffect(() => {
    loadGamesData();
  }, []);

  // ✅ دالة محسنة لتحميل البيانات مع تحديث تلقائي
  const loadGamesData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError('');

      console.log('🔄 بدء تحميل بيانات الألعاب والفروع...');

      // ✅ جلب الفروع أولاً
      const branchesResponse = await authService.getBranches();
      
      if (!branchesResponse.success) {
        throw new Error(branchesResponse.message || 'فشل في تحميل الفروع');
      }
      
      const branchesData = branchesResponse.data || [];
      console.log('🏬 عدد الفروع المحملة:', branchesData.length);
      setBranches(branchesData);
      
      // ✅ تهيئة الإحصائيات لكل فرع
      const initialStats = {};
      branchesData.forEach(branch => {
        initialStats[branch.id] = {
          branch_id: branch.id,
          branch_name: branch.name,
          total_games: 0,
          gamesList: [] // تخزين قائمة الألعاب لكل فرع
        };
      });
      
      setBranchStats(initialStats);
      
      // ✅ جلب الألعاب
      console.log('🎮 جلب الألعاب...');
      let allGamesData = [];
      
      try {
        // محاولة جلب جميع الألعاب مرة واحدة
        const gamesResponse = await api.get('/games', {
          params: { include_branch_info: 'true' }
        });
        
        if (gamesResponse.success) {
          allGamesData = gamesResponse.data || [];
          console.log(`✅ تم جلب ${allGamesData.length} لعبة من جميع الفروع`);
          setGamesLoaded(true); // تم تحميل الألعاب بنجاح
        } else {
          console.warn('⚠️ فشل جلب الألعاب دفعة واحدة:', gamesResponse.message);
          allGamesData = [];
        }
      } catch (gamesError) {
        console.error('❌ خطأ في جلب الألعاب:', gamesError);
        allGamesData = [];
      }
      
      console.log('🎮 إجمالي الألعاب المحملة:', allGamesData.length);
      
      // ✅ حساب الإحصائيات النهائية
      const finalStats = { ...initialStats };
      let totalCount = 0;
      
      // حساب الألعاب لكل فرع
      allGamesData.forEach(game => {
        const branchId = game.branch_id;
        if (finalStats[branchId]) {
          finalStats[branchId].total_games++;
          finalStats[branchId].gamesList.push(game);
          totalCount++;
        } else {
          console.warn(`⚠️ لعبة مرتبطة بفرع غير موجود: ${game.name} - فرع ID: ${branchId}`);
          
          // إنشاء إدخال للفرع غير الموجود
          if (!finalStats[branchId]) {
            finalStats[branchId] = {
              branch_id: branchId,
              branch_name: `فرع ${branchId}`,
              total_games: 0,
              gamesList: []
            };
          }
          
          finalStats[branchId].total_games++;
          finalStats[branchId].gamesList.push(game);
          totalCount++;
        }
      });
      
      // ✅ تحديث الحالة
      setAllGames(allGamesData);
      setCurrentGames(allGamesData); // عرض جميع الألعاب تلقائياً عند التحميل الأول
      setBranchStats(finalStats);
      
      console.log('📊 الإحصائيات النهائية:', {
        totalBranches: branchesData.length,
        totalGames: totalCount,
        branchStats: Object.keys(finalStats).map(id => ({
          branchId: id,
          branchName: finalStats[id].branch_name,
          totalGames: finalStats[id].total_games
        }))
      });
      
    } catch (error) {
      console.error('❌ خطأ شامل في تحميل بيانات الألعاب:', error);
      setError('تعذر تحميل بيانات الألعاب. يرجى المحاولة مرة أخرى.');
      setAllGames([]);
      setCurrentGames([]);
      setBranches([]);
      setBranchStats({});
    } finally {
      setLoading(false);
    }
  };

  // ✅ دالة محسنة لجلب ألعاب فرع معين
  const loadBranchGamesOnly = useCallback(async (branchId) => {
    try {
      setLoadingBranch(true);
      console.log(`🔄 جلب ألعاب الفرع ${branchId} فقط...`);
      
      const response = await api.get('/games', {
        params: {
          branch_id: branchId,
          include_branch_info: 'true'
        }
      });
      
      if (response.success) {
        const branchGames = response.data || [];
        console.log(`✅ تم جلب ${branchGames.length} لعبة للفرع ${branchId}`);
        
        // ✅ تحديث إحصائيات الفرع
        setBranchStats(prev => {
          const newStats = { ...prev };
          if (newStats[branchId]) {
            newStats[branchId].total_games = branchGames.length;
            newStats[branchId].gamesList = branchGames;
          }
          return newStats;
        });
        
        setCurrentGames(branchGames);
      } else {
        console.warn('⚠️ استخدام البيانات المحلية كبديل');
        const branchGames = allGames.filter(game => game.branch_id == branchId);
        setCurrentGames(branchGames);
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل ألعاب الفرع:', error);
      // استخدام البيانات المحلية كبديل
      const branchGames = allGames.filter(game => game.branch_id == branchId);
      setCurrentGames(branchGames);
    } finally {
      setLoadingBranch(false);
    }
  }, [allGames]);

  // ✅ عند اختيار فرع معين - يتم عرض الألعاب تلقائياً
  const handleSelectBranch = useCallback((branchId) => {
    setSelectedBranch(branchId);
    
    if (branchId === 'all') {
      // عرض جميع الألعاب تلقائياً
      setCurrentGames(allGames);
    } else {
      // تحميل وعرض ألعاب الفرع المحدد تلقائياً
      loadBranchGamesOnly(branchId);
    }
  }, [allGames, loadBranchGamesOnly]);

  // ✅ تحميل تلقائي عند تغيير selectedBranch
  useEffect(() => {
    if (selectedBranch !== 'all') {
      loadBranchGamesOnly(selectedBranch);
    }
  }, [selectedBranch, loadBranchGamesOnly]);

  // ✅ عند تحميل الألعاب لأول مرة، عرضها تلقائياً
  useEffect(() => {
    if (allGames.length > 0 && !gamesLoaded) {
      setCurrentGames(allGames);
      setGamesLoaded(true);
    }
  }, [allGames, gamesLoaded]);

  // ✅ حساب الإحصائيات الإجمالية بشكل صحيح
  const calculateTotalStats = () => {
    // حساب إجمالي الألعاب من إحصائيات الفروع
    let totalGamesCount = 0;
    Object.values(branchStats).forEach(stat => {
      totalGamesCount += stat.total_games || 0;
    });
    
    return {
      totalGames: totalGamesCount,
      totalBranches: branches.length
    };
  };

  // ✅ دالة لعرض تفاصيل إجمالي الألعاب
  const showTotalGamesDetails = () => {
    const totals = calculateTotalStats();
    let details = `📊 إجمالي الألعاب في جميع الفروع\n\n`;
    details += `إجمالي الألعاب: ${totals.totalGames}\n`;
    details += `عدد الفروع: ${totals.totalBranches}\n\n`;
    
    // إضافة تفاصيل كل فرع
    Object.values(branchStats).forEach(stat => {
      if (stat.total_games > 0) {
        details += `🏬 ${stat.branch_name}: ${stat.total_games} لعبة\n`;
      }
    });
    
    alert(details);
  };

  if (loading) {
    return (
      <div className="games-management-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>جاري تحميل بيانات الألعاب من جميع الفروع...</p>
        </div>
      </div>
    );
  }

  const totals = calculateTotalStats();
  const selectedBranchData = selectedBranch !== 'all' ? branchStats[selectedBranch] : null;

  return (
    <div className="games-management-page">
      {/* رأس الصفحة */}
      <div className="page-header">
        <div className="header-left">
          <h1>🎮 إدارة الألعاب</h1>
          <p className="page-description">عرض ومراقبة الألعاب في جميع الفروع</p>
        </div>
        <div className="header-right">
          <button
            className="btn btn-secondary"
            onClick={() => loadGamesData(true)}
            disabled={loading}
          >
            {loading ? '⏳ جاري التحديث...' : '🔄 تحديث البيانات'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
          <button onClick={() => loadGamesData(true)}>إعادة المحاولة</button>
        </div>
      )}

      {/* إحصائيات إجمالية مبسطة */}
      <div className="total-stats">
        <h2>📊 الإحصائيات الإجمالية</h2>
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">🏬</div>
            <div className="stat-content">
              <h3>عدد الفروع</h3>
              <p className="stat-value">{totals.totalBranches}</p>
              <p className="stat-subtext">فروع نشطة</p>
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon">🎮</div>
            <div className="stat-content">
              <h3>إجمالي الألعاب</h3>
              <p className="stat-value">{totals.totalGames}</p>
              <p className="stat-subtext">قطعة في جميع الفروع</p>
              <button 
                className="btn-details"
                onClick={showTotalGamesDetails}
                style={{ 
                  marginTop: '5px', 
                  padding: '2px 8px', 
                  fontSize: '12px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white'
                }}
              >
                عرض التفاصيل
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* عرض ملخص سريع للألعاب في كل فرع */}
      <div className="branches-overview">
        <h2>🏬 نظرة عامة على الألعاب في الفروع</h2>
        <div className="overview-grid">
          {branches.map(branch => {
            const stats = branchStats[branch.id] || {};
            const gameCount = stats.total_games || 0;
            
            return (
              <div key={branch.id} className="overview-card">
                <div className="overview-header">
                  <h3>{branch.name}</h3>
                  <span className="branch-id">ID: {branch.id}</span>
                </div>
                <div className="overview-body">
                  <div className="games-count-display">
                    <span className="count-number">{gameCount}</span>
                    <span className="count-label">لعبة</span>
                  </div>
                  <button
                    className="btn-view-games"
                    onClick={() => handleSelectBranch(branch.id)}
                    disabled={loadingBranch}
                  >
                    {selectedBranch === branch.id ? '👁️ معروض حالياً' : '👁️ عرض الألعاب'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

  

      {/* جدول الألعاب - يتم عرضه تلقائياً بدون الحاجة لزر */}
      <div className="games-table-section">
        <div className="section-header">
          <h2>
            📋 {selectedBranch !== 'all' ?
              `قائمة الألعاب في ${selectedBranchData?.branch_name}` :
              'قائمة جميع الألعاب في جميع الفروع'}
          </h2>
          <span className="section-subtitle">
            {currentGames.length} لعبة
            {loadingBranch && ' ⏳ جاري التحميل...'}
          </span>
        </div>

        {currentGames.length > 0 ? (
          <div className="games-table-container">
            <table className="games-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>اللعبة</th>
                  <th>الفئة</th>
                  <th>الفرع</th>
                  <th>السعر / ساعة</th>
                </tr>
              </thead>
              <tbody>
                {currentGames.map((game, index) => (
                  <tr key={game.id || index}>
                    <td className="text-center">{index + 1}</td>
                    <td>
                      <div className="game-info">
                        <div className="game-name">{game.name}</div>
                        {game.description && (
                          <div className="game-description">{game.description}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {game.category || 'غير مصنف'}
                      </span>
                    </td>
                    <td>
                      <div className="branch-info">
                        <span className="branch-name">
                          {game.branch_name || branchStats[game.branch_id]?.branch_name || `فرع ${game.branch_id}`}
                        </span>
                        <span className="branch-id">ID: {game.branch_id}</span>
                      </div>
                    </td>
                    <td className="text-right">{game.price_per_hour || Math.ceil((game.price_per_15min || 0) * 4)} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🎮</div>
            <h3>لا توجد ألعاب</h3>
            <p>{selectedBranch !== 'all' ?
              `لم يتم إضافة أي ألعاب في ${selectedBranchData?.branch_name}` :
              'لم يتم إضافة أي ألعاب بعد'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamesManagement;