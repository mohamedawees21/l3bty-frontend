import React from 'react';
import { 
  FaGamepad, 
  FaCar, 
  FaMotorcycle, 
  FaBicycle,
  FaBolt,
  FaShoppingCart
} from 'react-icons/fa';

const getGameIcon = (gameName) => {
  const name = gameName.toLowerCase();
  if (name.includes('كار') || name.includes('عربيه')) return <FaCar />;
  if (name.includes('موتسك') || name.includes('هارلي')) return <FaMotorcycle />;
  if (name.includes('سكوتر') || name.includes('بورد')) return <FaBicycle />;
  if (name.includes('دريفت') || name.includes('كريزي')) return <FaShoppingCart />;
  if (name.includes('سيجواي') || name.includes('هافر')) return <FaBolt />;
  return <FaGamepad />;
};

const getGameColor = (gameCode) => {
  const code = gameCode.toLowerCase();
  if (code.includes('drift')) return '#3498db';
  if (code.includes('hover')) return '#2ecc71';
  if (code.includes('ecar')) return '#e74c3c';
  if (code.includes('emoto')) return '#f39c12';
  if (code.includes('escoot')) return '#9b59b6';
  if (code.includes('harley')) return '#34495e';
  if (code.includes('segway')) return '#1abc9c';
  if (code.includes('crazy')) return '#e67e22';
  return '#95a5a6';
};

const GameCard = ({ game, isSelected, onSelect }) => {
  const gameColor = getGameColor(game.code);

  return (
    <div 
      className={`game-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{ borderLeftColor: gameColor }}
    >
      <div className="game-card-header">
        <div className="game-icon" style={{ backgroundColor: gameColor }}>
          {getGameIcon(game.name)}
        </div>
        <div className="game-info">
          <h3 className="game-name">{game.name}</h3>
          <span className="game-code">{game.code}</span>
        </div>
        <div className="game-status">
          {game.quantity > 0 ? (
            <span className="status-available">متاح ({game.quantity})</span>
          ) : (
            <span className="status-unavailable">غير متاح</span>
          )}
        </div>
      </div>
      
      <div className="game-card-body">
        <p className="game-description">{game.description}</p>
        
        <div className="game-details">
          <div className="detail-item">
            <span className="detail-label">السعر:</span>
<span className="detail-value price">{game.price_per_15min} جنيه/15 د</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">الفرع:</span>
            <span className="detail-value">سكوير مول</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">النوع:</span>
            <span className="detail-value">كهربائية</span>
          </div>
        </div>
        
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">التأجيرات اليوم:</span>
            <span className="stat-value">8</span>
          </div>
          <div className="stat">
            <span className="stat-label">الإيرادات:</span>
            <span className="stat-value">200 ريال</span>
          </div>
          <div className="stat">
            <span className="stat-label">متوسط الوقت:</span>
            <span className="stat-value">25 د</span>
          </div>
        </div>
      </div>
      
      <div className="game-card-footer">
        <button className="btn-select" disabled={game.quantity === 0}>
          {game.quantity === 0 ? 'غير متاح' : (isSelected ? 'تم التحديد' : 'اختيار للتأجير')}
        </button>
      </div>
    </div>
  );
};

export default GameCard;