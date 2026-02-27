// frontend/src/pages/RentalPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './RentalPage.css';

const RentalPage = () => {
  const navigate = useNavigate();
  const [availableGames, setAvailableGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rentalData, setRentalData] = useState({
    game_id: '',
    customer_name: '',
    customer_phone: '',
    duration_minutes: 30
  });

  const durationOptions = [
    { value: 15, label: '15 دقيقة' },
    { value: 30, label: '30 دقيقة' },
    { value: 60, label: 'ساعة واحدة' },
    { value: 90, label: 'ساعة ونصف' },
    { value: 120, label: 'ساعتين' }
  ];

  const loadAvailableGames = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authService.getAvailableGames();
      
      if (response.success) {
        setAvailableGames(response.data);
      } else {
        setError(response.error || 'فشل في تحميل الألعاب');
      }
    } catch (error) {
      setError('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailableGames();
  }, []);

  const handleStartRental = async () => {
    if (!rentalData.game_id || !rentalData.customer_name) {
      alert('يرجى اختيار لعبة وإدخال اسم العميل');
      return;
    }

    if (rentalData.customer_phone && !/^[0-9]{10,15}$/.test(rentalData.customer_phone)) {
      alert('رقم الهاتف غير صحيح');
      return;
    }

    try {
      setLoading(true);
      
      const response = await authService.startRental(rentalData);
      
      if (response.success) {
        alert('تم بدء التأجير بنجاح!');
        navigate('/employee/dashboard');
      } else {
        alert(response.error || 'فشل في بدء التأجير');
      }
    } catch (error) {
      alert('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const selectedGame = availableGames.find(game => game.id == rentalData.game_id);

  return (
    <div className="rental-page">
      <div className="rental-header">
        <h1>تأجير جديد</h1>
        <p>ابدأ تأجيراً جديداً للعميل</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="rental-container">
        <div className="rental-form">
          <div className="form-section">
            <h3>اختر اللعبة</h3>
            <div className="games-selection">
              {availableGames.map(game => (
                <div 
                  key={game.id}
                  className={`game-option ${rentalData.game_id == game.id ? 'selected' : ''}`}
                  onClick={() => setRentalData({...rentalData, game_id: game.id})}
                >
                  <div className="game-option-image">
                    <img 
                      src={`/images/${game.image_url || 'default-game.jpg'}`}
                      alt={game.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/100x100?text=" + game.name;
                      }}
                    />
                  </div>
                  <div className="game-option-info">
                    <h4>{game.name}</h4>
                    <p className="game-category">{game.category}</p>
                    {game.description && (
                      <p className="game-description">{game.description}</p>
                    )}
                    {game.minimum_age && (
                      <p className="game-spec">الحد الأدنى للعمر: {game.minimum_age} سنة</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>معلومات العميل</h3>
            <div className="form-row">
              <div className="form-group">
                <label>اسم العميل *</label>
                <input
                  type="text"
                  value={rentalData.customer_name}
                  onChange={(e) => setRentalData({...rentalData, customer_name: e.target.value})}
                  placeholder="أدخل اسم العميل"
                />
              </div>
              <div className="form-group">
                <label>رقم الهاتف</label>
                <input
                  type="tel"
                  value={rentalData.customer_phone}
                  onChange={(e) => setRentalData({...rentalData, customer_phone: e.target.value})}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>مدة التأجير</h3>
            <div className="duration-options">
              {durationOptions.map(option => (
                <button
                  key={option.value}
                  className={`duration-option ${rentalData.duration_minutes == option.value ? 'selected' : ''}`}
                  onClick={() => setRentalData({...rentalData, duration_minutes: option.value})}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {selectedGame && (
            <div className="rental-summary">
              <h3>ملخص التأجير</h3>
              <div className="summary-content">
                <div className="summary-item">
                  <span>اللعبة:</span>
                  <strong>{selectedGame.name}</strong>
                </div>
                <div className="summary-item">
                  <span>اسم العميل:</span>
                  <strong>{rentalData.customer_name}</strong>
                </div>
                <div className="summary-item">
                  <span>المدة:</span>
                  <strong>{rentalData.duration_minutes} دقيقة</strong>
                </div>
                {rentalData.customer_phone && (
                  <div className="summary-item">
                    <span>رقم الهاتف:</span>
                    <strong>{rentalData.customer_phone}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button 
              className="btn-cancel"
              onClick={() => navigate('/employee/dashboard')}
            >
              إلغاء
            </button>
            <button 
              className="btn-start"
              onClick={handleStartRental}
              disabled={loading || !rentalData.game_id || !rentalData.customer_name}
            >
              {loading ? 'جاري البدء...' : 'بدء التأجير'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalPage;