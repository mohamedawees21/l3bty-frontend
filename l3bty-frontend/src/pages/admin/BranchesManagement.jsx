import React, { useState, useEffect, useCallback } from 'react';
import authService from '../../services/authService';
import './AdminPages.css';
import api from '../../services/api';

const BranchesManagement = () => {
  // 🔹 States الأساسية
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGamesModal, setShowGamesModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [availableGames, setAvailableGames] = useState([]);
  const [branchGames, setBranchGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [gamesError, setGamesError] = useState('');
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);

  // 🔹 خريطة مسارات الصور
  const GAME_IMAGE_MAP = {
    'Driftcar': '/images/Driftcar.jpg',
    'DriftCar': '/images/Driftcar.jpg',
    'درفت كار': '/images/Driftcar.jpg',
    'دريفت كار': '/images/Driftcar.jpg',
    'Hoverboard': '/images/Hoverboard.jpg',
    'هوفر بورد': '/images/Hoverboard.jpg',
    'هوفربورد': '/images/Hoverboard.jpg',
    'Scooter': '/images/Scooter.jpg',
    'سكوتر': '/images/Scooter.jpg',
    'اسكوتر': '/images/Scooter.jpg',
    'Electric car': '/images/Car.jpg',
    'Electric Car': '/images/Car.jpg',
    'Car': '/images/Car.jpg',
    'سيارة': '/images/Car.jpg',
    'Electric motor': '/images/Motor.jpg',
    'Motor': '/images/Motor.jpg',
    'موتوسيكل': '/images/Motor.jpg',
    'Segway': '/images/Segway.jpg',
    'سجوي': '/images/Segway.jpg',
    'Crazy car': '/images/Ninebot.jpg',
    'Ninebot': '/images/Ninebot.jpg',
    'Skate': '/images/Skate.jpg',
    'سكيت': '/images/Skate.jpg',
    'Trampoline': '/images/Trampoline.jpg',
    'ترامبولين': '/images/Trampoline.jpg',
    'Simulator': '/images/Simulator.jpg',
    'Vediogame': '/images/Simulator.jpg',
    'Harlly': '/images/harley.jpg',
    'Harley': '/images/harley.jpg',
    'هارلي': '/images/harley.jpg',
    'Bike': '/images/wheel.jpg',
    'دراجة': '/images/wheel.jpg',
    'عجلة': '/images/wheel.jpg',
    'Ps5': '/images/playstation.jpg',
    'PS5': '/images/playstation.jpg',
    'بلاي ستيشن': '/images/playstation.jpg',
    'Motorcycle': '/images/motorcycle.jpg',
    'دراجة نارية': '/images/motorcycle.jpg',
    'موتوسيكل كبير': '/images/motorcycle.jpg',
    'ping pong': '/images/pingpong.jpg',
    'بينج بونج': '/images/pingpong.jpg',
    'تنس طاولة': '/images/pingpong.jpg',
    'VR': '/images/vr.jpg',
    'واقع افتراضي': '/images/vr.jpg',
    'Virtual Reality': '/images/vr.jpg',
    'shalal': '/images/waterslide.jpg',
    'شلال': '/images/waterslide.jpg',
    'العاب مائية': '/images/waterslide.jpg',
    'زحليقة مائية': '/images/waterslide.jpg',
    'Waterslide': '/images/waterslide.jpg'
  };

  const DEFAULT_IMAGES = {
    defaultGameImg: '/images/default-game.jpg',
    driftCarImg: '/images/Driftcar.jpg',
    carImg: '/images/Car.jpg',
    hoverboardImg: '/images/Hoverboard.jpg',
    motorImg: '/images/Motor.jpg',
    scooterImg: '/images/Scooter.jpg',
    harleyImg: '/images/harley.jpg',
    segwayImg: '/images/Segway.jpg',
    ninebotImg: '/images/Ninebot.jpg',
    skateImg: '/images/Skate.jpg',
    trampolineImg: '/images/Trampoline.jpg',
    simulatorImg: '/images/Simulator.jpg',
    bikeImg: '/images/wheel.jpg',
    ps5Img: '/images/playstation.jpg',
    motorcycleImg: '/images/motorcycle.jpg',
    pingpongImg: '/images/pingpong.jpg',
    vrImg: '/images/vr.jpg',
    waterslideImg: '/images/waterslide.jpg',
    logo: '/images/logo.png',
    defaultGameLoading: '/images/default-game-loading.gif'
  };

  // 🔹 بيانات الفرع الجديد
  const [newBranch, setNewBranch] = useState({
    name: '',
    location: '',
    city: 'القاهرة',
    contact_phone: '',
    contact_email: '',
    opening_time: '10:00:00',
    closing_time: '22:00:00'
  });

  // 🔹 بيانات تعديل الفرع
  const [editBranch, setEditBranch] = useState({
    id: '',
    name: '',
    location: '',
    city: '',
    contact_phone: '',
    contact_email: '',
    opening_time: '',
    closing_time: '',
    is_active: true
  });

  // 🔹 قائمة الألعاب الافتراضية
  const defaultGamesList = [
    { id: 1, name: 'Driftcar', category: 'سيارات', suggestedPricePer15min: 50, image: 'Driftcar.jpg', imagePath: '/images/Driftcar.jpg' },
    { id: 2, name: 'Hoverboard', category: 'كهربائية', suggestedPricePer15min: 50, image: 'Hoverboard.jpg', imagePath: '/images/Hoverboard.jpg' },
    { id: 3, name: 'Motor', category: 'دراجات نارية', suggestedPricePer15min: 50, image: 'Motor.jpg', imagePath: '/images/Motor.jpg' },
    { id: 4, name: 'Car', category: 'سيارات', suggestedPricePer15min: 50, image: 'Car.jpg', imagePath: '/images/Car.jpg' },
    { id: 5, name: 'Scooter', category: 'كهربائية', suggestedPricePer15min: 70, image: 'Scooter.jpg', imagePath: '/images/Scooter.jpg' },
    { id: 6, name: 'Harlly', category: 'دراجات نارية', suggestedPricePer15min: 60, image: 'harley.jpg', imagePath: '/images/harley.jpg' },
    { id: 7, name: 'Segway', category: 'كهربائية', suggestedPricePer15min: 60, image: 'Segway.jpg', imagePath: '/images/Segway.jpg' },
    { id: 8, name: 'Crazycar', category: 'سيارات', suggestedPricePer15min: 70, image: 'Ninebot.jpg', imagePath: '/images/Ninebot.jpg' },
    { id: 9, name: 'Skeet', category: 'كهربائية', suggestedPricePer15min: 40, image: 'Skate.jpg', imagePath: '/images/Skate.jpg' },
    { id: 10, name: 'Tramploine', category: 'ترفيه', suggestedPricePer15min: 30, image: 'Trampoline.jpg', imagePath: '/images/Trampoline.jpg' },
    { id: 11, name: 'Vediogame', category: 'ترفيه', suggestedPricePer15min: 90, image: 'Simulator.jpg', imagePath: '/images/Simulator.jpg' },
    { id: 12, name: 'Bike', category: 'دراجات', suggestedPricePer15min: 45, image: 'wheel.jpg', imagePath: '/images/wheel.jpg' },
    { id: 13, name: 'Ps5', category: 'ألعاب فيديو', suggestedPricePer15min: 60, image: 'playstation.jpg', imagePath: '/images/playstation.jpg' },
    { id: 14, name: 'Motorcycle', category: 'دراجات نارية', suggestedPricePer15min: 55, image: 'motorcycle.jpg', imagePath: '/images/motorcycle.jpg' },
    { id: 15, name: 'ping pong', category: 'رياضة', suggestedPricePer15min: 40, image: 'pingpong.jpg', imagePath: '/images/pingpong.jpg' },
    { id: 16, name: 'VR', category: 'واقع افتراضي', suggestedPricePer15min: 100, image: 'vr.jpg', imagePath: '/images/vr.jpg' },
    { id: 17, name: 'shalal', category: 'العاب مائية', suggestedPricePer15min: 35, image: 'waterslide.jpg', imagePath: '/images/waterslide.jpg' }
  ];

  // 🔹 دوال التنسيق
  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ar-SA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'تاريخ غير معروف';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const showNotification = useCallback((type, message) => {
    const oldNotifications = document.querySelectorAll('.custom-notification');
    oldNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }, []);

  const getGameImage = useCallback((game) => {
    if (!game || typeof game !== 'object') return DEFAULT_IMAGES.defaultGameImg;
    
    const safeGame = {
      name: game?.name ? String(game.name).trim() : '',
      image_url: game?.image_url || '',
      display_image: game?.display_image || '',
      image_status: game?.image_status || 'completed',
      category: game?.category || ''
    };

    const gameNameLower = safeGame.name.toLowerCase();
    
    if (gameNameLower === 'car' || gameNameLower === 'سيارة') return DEFAULT_IMAGES.carImg;
    if (gameNameLower.includes('drift')) return DEFAULT_IMAGES.driftCarImg;
    
    if (safeGame.name) {
      const gameName = safeGame.name.trim();
      if (GAME_IMAGE_MAP[gameName]) return GAME_IMAGE_MAP[gameName];
      
      for (const [key, imagePath] of Object.entries(GAME_IMAGE_MAP)) {
        if (gameName.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(gameName.toLowerCase())) {
          return imagePath;
        }
      }
    }
    
    if (safeGame.display_image && safeGame.display_image !== '/images/default-game.jpg') {
      return safeGame.display_image.startsWith('/images/') ? safeGame.display_image : `/images/${safeGame.display_image}`;
    }
    
    if (safeGame.image_url && safeGame.image_status === 'completed') {
      let cleanUrl = String(safeGame.image_url).trim();
      if (cleanUrl.startsWith('/images/')) return cleanUrl;
      if (!cleanUrl.startsWith('http') && !cleanUrl.startsWith('/')) return `/images/${cleanUrl}`;
      return cleanUrl;
    }
    
    if (safeGame.image_status === 'processing') return DEFAULT_IMAGES.defaultGameLoading;
    
    return DEFAULT_IMAGES.defaultGameImg;
  }, []);

  // 🔹 تحميل الفروع
  const loadBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authService.getBranches();
      
      if (response.success) {
        const branchesWithGames = await Promise.all(
          response.data.map(async (branch) => {
            try {
              const gamesResponse = await api.get('/games', { params: { branch_id: branch.id } });
              return { ...branch, total_games: gamesResponse.success ? gamesResponse.data?.length || 0 : 0 };
            } catch {
              return { ...branch, total_games: 0 };
            }
          })
        );
        setBranches(branchesWithGames);
      } else {
        setError(response.message || 'فشل في تحميل الفروع');
      }
    } catch (error) {
      setError('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBranchGames = useCallback(async (branchId) => {
    try {
      setLoadingGames(true);
      setGamesError('');
      
      let response;
      try {
        response = await authService.get(`/api/branches/${branchId}/games`);
      } catch {
        response = await api.get('/games', { params: { branch_id: branchId } });
      }
      
      if (response.success) {
        const branchSpecificGames = (response.data || []).filter(g => parseInt(g.branch_id) === parseInt(branchId));
        setBranchGames(branchSpecificGames);
      } else {
        setGamesError(response.message || 'فشل في جلب ألعاب الفرع');
        setBranchGames([]);
      }
    } catch (error) {
      setGamesError('تعذر الاتصال بالخادم');
      setBranchGames([]);
    } finally {
      setLoadingGames(false);
    }
  }, []);

  const handleOpenGamesModal = async (branch) => {
    setSelectedBranch(branch);
    setAvailableGames(defaultGamesList);
    setGamesError('');
    await loadBranchGames(branch.id);
    setShowGamesModal(true);
  };

  const handleAddBranch = async () => {
    if (!newBranch.name || !newBranch.location) {
      alert('❌ اسم الفرع والموقع مطلوبان');
      return;
    }

    try {
      const response = await authService.createBranch({
        name: newBranch.name,
        location: newBranch.location,
        city: newBranch.city,
        contact_phone: newBranch.contact_phone || '',
        contact_email: newBranch.contact_email || '',
        opening_time: newBranch.opening_time,
        closing_time: newBranch.closing_time
      });

      if (response.success) {
        alert('✅ تم إنشاء الفرع بنجاح');
        setShowAddModal(false);
        setNewBranch({
          name: '',
          location: '',
          city: 'القاهرة',
          contact_phone: '',
          contact_email: '',
          opening_time: '10:00:00',
          closing_time: '22:00:00'
        });
        await loadBranches();
      } else {
        alert(`❌ فشل إنشاء الفرع: ${response.message}`);
      }
    } catch (error) {
      alert('❌ فشل الاتصال بالسيرفر: ' + error.message);
    }
  };

  const handleEditBranch = async () => {
    if (!editBranch.name || !editBranch.location) {
      alert('اسم الفرع والموقع مطلوبان');
      return;
    }

    try {
      const response = await authService.updateBranch(editBranch.id, {
        name: editBranch.name,
        location: editBranch.location,
        city: editBranch.city,
        contact_phone: editBranch.contact_phone,
        contact_email: editBranch.contact_email,
        opening_time: editBranch.opening_time,
        closing_time: editBranch.closing_time,
        is_active: editBranch.is_active ? 1 : 0
      });
      
      if (response.success) {
        alert('✅ تم تحديث الفرع بنجاح');
        setShowEditModal(false);
        loadBranches();
      } else {
        alert(response.message || 'فشل في تحديث الفرع');
      }
    } catch (error) {
      alert('تعذر الاتصال بالخادم');
    }
  };

  const handleDeleteBranch = async (branch) => {
    if (!window.confirm(`هل تريد حذف الفرع "${branch.name}" نهائياً؟`)) return;
    try {
      const response = await authService.deleteBranchPermanent(branch.id);
      if (response.success) {
        setBranches(prev => prev.filter(b => b.id !== branch.id));
        alert('✅ تم حذف الفرع بنجاح');
      }
    } catch (error) {
      alert('❌ تعذر الاتصال بالخادم');
    }
  };

// BranchesManagement.jsx

const handleOpenEditModal = (branch) => {
  setEditBranch({
    id: branch.id,
    name: branch.name || '',
    location: branch.location || '',
    city: branch.city || 'القاهرة',
    contact_phone: branch.contact_phone || '',
    contact_email: branch.contact_email || '',
    opening_time: branch.opening_time?.substring(0, 5) + ':00' || '10:00:00',
    closing_time: branch.closing_time?.substring(0, 5) + ':00' || '22:00:00',
    is_active: branch.is_active === 1
  });
  setShowEditModal(true);
};

  const handleAddGameToBranch = async (game) => {
    if (!selectedBranch) return;
    
    const gameName = game.name.trim();
    const branchId = parseInt(selectedBranch.id);
    
    const existingGame = branchGames.find(g => 
      g.name?.trim().toLowerCase() === gameName.toLowerCase() && 
      parseInt(g.branch_id) === branchId
    );
    
    if (existingGame) {
      if (window.confirm(`⚠️ اللعبة موجودة بالفعل. هل تريد تحديث السعر؟`)) {
        const newPrice = prompt('أدخل السعر الجديد:', existingGame.price_per_15min);
        if (newPrice && !isNaN(newPrice) && parseFloat(newPrice) > 0) {
          try {
            await authService.updateGame(existingGame.id, { price_per_15min: parseFloat(newPrice) });
            showNotification('success', '✅ تم تحديث السعر بنجاح');
            await loadBranchGames(branchId);
          } catch (error) {
            alert('❌ فشل تحديث السعر');
          }
        }
      }
      return;
    }
    
    const pricePer15Min = prompt(`أدخل سعر الـ 15 دقيقة للعبة "${gameName}":`, game.suggestedPricePer15min || 50);
    if (!pricePer15Min || isNaN(pricePer15Min) || parseFloat(pricePer15Min) <= 0) return;
    
    try {
      const gameData = {
        name: gameName,
        category: game.category || 'سيارات',
        price_per_15min: parseFloat(pricePer15Min),
        branch_id: branchId,
        image_url: game.imagePath?.replace('/images/', '') || 'default-game.jpg'
      };
      
      let response;
      try {
        response = await authService.post(`/api/branches/${branchId}/add-game`, gameData);
      } catch {
        response = await authService.createGameUnbreakable(gameData);
      }
      
      if (response.success) {
        showNotification('success', `✅ تم إضافة "${gameName}" للفرع`);
        await loadBranchGames(branchId);
        await loadBranches();
      }
    } catch (error) {
      alert('❌ فشل إضافة اللعبة');
    }
  };

  const handleDeleteGameFromBranch = async (gameId) => {
    if (!window.confirm('هل تريد حذف هذه اللعبة نهائياً؟')) return;
    try {
      const response = await authService.deleteGame(gameId, 'true');
      if (response.success) {
        alert('✅ تم حذف اللعبة');
        await loadBranchGames(selectedBranch.id);
        await loadBranches();
      }
    } catch (error) {
      alert('تعذر الاتصال بالخادم');
    }
  };

  const handleUpdateGamePrice = async (gameId, currentPrice) => {
    const newPrice = prompt('أدخل السعر الجديد:', currentPrice);
    if (!newPrice || isNaN(newPrice) || parseFloat(newPrice) <= 0) return;
    
    try {
      const response = await authService.updateGame(gameId, { price_per_15min: parseFloat(newPrice) });
      if (response.success) {
        alert('✅ تم تحديث السعر');
        await loadBranchGames(selectedBranch.id);
      }
    } catch (error) {
      alert('تعذر الاتصال بالخادم');
    }
  };

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>جاري تحميل الفروع...</p>
      </div>
    );
  }

  return (
    <div className="branches-management">
      {/* رأس الصفحة */}
      <div className="page-header">
        <div className="header-title">
          <h1>🏬 إدارة الفروع</h1>
          <p>إدارة وتنظيم جميع فروع المنشأة</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <span>+</span> إضافة فرع جديد
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* إحصائيات سريعة */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <span className="stat-value">{branches.length}</span>
            <span className="stat-label">إجمالي الفروع</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎮</div>
          <div className="stat-info">
            <span className="stat-value">{branches.reduce((sum, b) => sum + (b.total_games || 0), 0)}</span>
            <span className="stat-label">إجمالي الألعاب</span>
          </div>
        </div>
      </div>

      {/* شبكة الفروع مع Scrollbar */}
      <div className="branches-grid-container">
        <div className="branches-grid">
          {branches.map(branch => (
            <div key={branch.id} className={`branch-card`}>
              <div className="branch-card-header">
                <div className="branch-title">
                  <h3>{branch.name}</h3>
                  <span className="branch-id">#{branch.id}</span>
                </div>
              </div>

              <div className="branch-card-body">
                <div className="branch-info">
                  <div className="info-item">
                    <span className="info-icon">📍</span>
                    <span className="info-text">{branch.location || 'لا يوجد عنوان'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">📞</span>
                    <span className="info-text">{branch.contact_phone || 'لا يوجد هاتف'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">⏰</span>
                    <span className="info-text">
                      {branch.opening_time?.substring(0, 5)} - {branch.closing_time?.substring(0, 5)}
                    </span>
                  </div>
                </div>

                <div className="branch-stats">
                  <div className="stat-item">
                    <span className="stat-number">{branch.total_games || 0}</span>
                    <span className="stat-label">لعبة</span>
                  </div>
                </div>
              </div>

              <div className="branch-card-footer">
                <div className="action-group">
                  <button className="btn-icon" onClick={() => handleOpenEditModal(branch)} title="تعديل">
                    ✏️
                  </button>
                  <button className="btn-icon" onClick={() => handleOpenGamesModal(branch)} title="إدارة الألعاب">
                    🎮
                  </button>
                </div>
                <div className="action-group">
                  <button className="btn-icon danger" onClick={() => handleDeleteBranch(branch)} title="حذف">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* مودال إضافة فرع */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ إضافة فرع جديد</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body with-scrollbar">
              <div className="form-group">
                <label>اسم الفرع <span className="required">*</span></label>
                <input
                  type="text"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                  placeholder="أدخل اسم الفرع"
                />
              </div>
              <div className="form-group">
                <label>العنوان <span className="required">*</span></label>
                <input
                  type="text"
                  value={newBranch.location}
                  onChange={(e) => setNewBranch({...newBranch, location: e.target.value})}
                  placeholder="أدخل العنوان بالتفصيل"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>المدينة</label>
                  <input
                    type="text"
                    value={newBranch.city}
                    onChange={(e) => setNewBranch({...newBranch, city: e.target.value})}
                    placeholder="المدينة"
                  />
                </div>
                <div className="form-group">
                  <label>الهاتف</label>
                  <input
                    type="tel"
                    value={newBranch.contact_phone}
                    onChange={(e) => setNewBranch({...newBranch, contact_phone: e.target.value})}
                    placeholder="رقم الهاتف"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>وقت الفتح</label>
                  <input
                    type="time"
                    value={newBranch.opening_time?.substring(0, 5)}
                    onChange={(e) => setNewBranch({...newBranch, opening_time: e.target.value + ':00'})}
                  />
                </div>
                <div className="form-group">
                  <label>وقت الإغلاق</label>
                  <input
                    type="time"
                    value={newBranch.closing_time?.substring(0, 5)}
                    onChange={(e) => setNewBranch({...newBranch, closing_time: e.target.value + ':00'})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  value={newBranch.contact_email}
                  onChange={(e) => setNewBranch({...newBranch, contact_email: e.target.value})}
                  placeholder="example@domain.com"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>إلغاء</button>
              <button className="btn-primary" onClick={handleAddBranch}>إضافة الفرع</button>
            </div>
          </div>
        </div>
      )}

      {/* مودال تعديل فرع */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ تعديل الفرع</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body with-scrollbar">
              <div className="form-group">
                <label>اسم الفرع <span className="required">*</span></label>
                <input
                  type="text"
                  value={editBranch.name}
                  onChange={(e) => setEditBranch({...editBranch, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>العنوان <span className="required">*</span></label>
                <input
                  type="text"
                  value={editBranch.location}
                  onChange={(e) => setEditBranch({...editBranch, location: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>المدينة</label>
                  <input
                    type="text"
                    value={editBranch.city}
                    onChange={(e) => setEditBranch({...editBranch, city: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>الهاتف</label>
                  <input
                    type="tel"
                    value={editBranch.contact_phone}
                    onChange={(e) => setEditBranch({...editBranch, contact_phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>وقت الفتح</label>
                  <input
                    type="time"
                    value={editBranch.opening_time?.substring(0, 5)}
                    onChange={(e) => setEditBranch({...editBranch, opening_time: e.target.value + ':00'})}
                  />
                </div>
                <div className="form-group">
                  <label>وقت الإغلاق</label>
                  <input
                    type="time"
                    value={editBranch.closing_time?.substring(0, 5)}
                    onChange={(e) => setEditBranch({...editBranch, closing_time: e.target.value + ':00'})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  value={editBranch.contact_email}
                  onChange={(e) => setEditBranch({...editBranch, contact_email: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>إلغاء</button>
              <button className="btn-primary" onClick={handleEditBranch}>حفظ التعديلات</button>
            </div>
          </div>
        </div>
      )}

{showGamesModal && selectedBranch && (
  <div className="modal-overlay" onClick={() => setShowGamesModal(false)}>
    <div className="modal modal-xl" onClick={e => e.stopPropagation()}> {/* تغيير من modal-lg إلى modal-xl */}
      <div className="modal-header">
        <h2>🎮 إدارة ألعاب {selectedBranch.name}</h2>
        <button className="close-btn" onClick={() => setShowGamesModal(false)}>×</button>
      </div>
      <div className="modal-body with-scrollbar">
        {/* قسم إضافة ألعاب جديدة */}
        <div className="games-section">
          <h3>➕ إضافة ألعاب للفرع</h3>
          <div className="games-grid-container">
            <div className="games-grid games-grid-large"> {/* إضافة كلاس جديد */}
              {availableGames.map(game => (
                <div key={game.id} className="game-card game-card-large"> {/* تكبير بطاقات الألعاب */}
                  <div className="game-card-image game-card-image-large">
                    <img 
                      src={game.imagePath || getGameImage(game)}
                      alt={game.name}
                      onError={(e) => e.target.src = DEFAULT_IMAGES.defaultGameImg}
                    />
                  </div>
                  <div className="game-card-info">
                    <h4>{game.name}</h4>
                    <span className="game-category">{game.category}</span>
                    <span className="game-price">{game.suggestedPricePer15min} ج</span>
                  </div>
                  <button 
                    className="btn-add-game btn-add-game-large"
                    onClick={() => handleAddGameToBranch(game)}
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* قسم ألعاب الفرع الحالية */}
        <div className="games-section">
          <h3>📋 ألعاب الفرع الحالية ({branchGames.length})</h3>
          {loadingGames ? (
            <div className="loading-small">جاري التحميل...</div>
          ) : gamesError ? (
            <div className="error-message">{gamesError}</div>
          ) : branchGames.length === 0 ? (
            <div className="empty-state">لا توجد ألعاب في هذا الفرع</div>
          ) : (
            <div className="games-table-container games-table-container-large"> {/* تكبير حاوية الجدول */}
             <div className="games-table with-scrollbar">
  <table className="games-table-large">
    <thead>
      <tr>
        <th>اللعبة</th>
        <th>التصنيف</th>
        <th>السعر</th>
        <th>الإجراءات</th>
      </tr>
    </thead>
    <tbody>
      {branchGames.map(game => (
        <tr key={game.id}>
          <td>
            <div className="game-info game-info-large">
              <img 
                src={getGameImage(game)}
                alt={game.name}
                onError={(e) => e.target.src = DEFAULT_IMAGES.defaultGameImg}
                className="game-thumb game-thumb-large"
              />
              <span className="game-name-large">{game.name}</span>
            </div>
          </td>
          <td>
            <span className="category-tag category-tag-large">{game.category}</span>
          </td>
          <td>
            <span className="price-tag price-tag-large">{formatCurrency(game.price_per_15min)}</span>
          </td>
          <td>
            <div className="action-buttons action-buttons-large">
              <button 
                className="btn-icon btn-icon-large"
                onClick={() => handleUpdateGamePrice(game.id, game.price_per_15min)}
                title="تعديل السعر"
              >
                ✏️
              </button>
              <button 
                className="btn-icon btn-icon-large danger"
                onClick={() => handleDeleteGameFromBranch(game.id)}
                title="حذف"
              >
                🗑️
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default BranchesManagement;