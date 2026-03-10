import React, { useState, useMemo } from 'react';
import { 
  Edit, X, Gamepad2, DollarSign, Info,
  ArrowLeftRight, Loader2
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

const ModifyRentalModal = ({ show, onClose, rental, items, games, onConfirm }) => {
  const [newGame, setNewGame] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priceDiff, setPriceDiff] = useState(0);

  // الحصول على items التأجير
  const rentalItems = useMemo(() => {
    if (!items || !rental) return [];
    return items.filter(item => item && item.rental_id === rental.id);
  }, [rental, items]);

  // اللعبة الحالية
  const currentGame = useMemo(() => {
    if (!rentalItems.length) return null;
    const item = rentalItems[0];
    return item ? {
      id: item.game_id,
      name: item.game_name,
      price: item.price_per_15min
    } : null;
  }, [rentalItems]);

  // عند تغيير اللعبة
  const handleGameChange = (gameId) => {
    const game = games.find(g => g.id === parseInt(gameId));
    setNewGame(game);
    if (currentGame && game) {
      const diff = (game.price_per_15min || 0) - (currentGame.price || 0);
      setPriceDiff(diff);
    }
  };

  const handleConfirm = async () => {
    if (!newGame) return;
    setIsSubmitting(true);
    try {
      await onConfirm(rental, {
        old_game_id: currentGame?.id,
        new_game_id: newGame.id,
        price_difference: priceDiff
      });
      onClose();
    } catch (error) {
      console.error('خطأ في تعديل التأجير:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show || !rental) return null;

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      title="تعديل التأجير"
      size="medium"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm} 
            loading={isSubmitting}
            icon={Edit}
            disabled={!newGame}
          >
            تأكيد التعديل
          </Button>
        </>
      }
    >
      <div className="modify-rental-modal">
        {/* معلومات العميل */}
        <div className="info-card">
          <Info size={16} />
          <div className="info-content">
            <strong>العميل: {rental.customer_name}</strong>
            <p>رقم التأجير: {rental.rental_number || rental.id}</p>
          </div>
        </div>

        <div className="modify-section">
          {/* اللعبة الحالية */}
          {currentGame && (
            <div className="current-game">
              <h4>اللعبة الحالية</h4>
              <div className="game-box">
                <Gamepad2 size={18} />
                <span className="game-name">{currentGame.name}</span>
                <span className="game-price">{formatCurrency(currentGame.price)}</span>
              </div>
            </div>
          )}

          {/* أيقونة التغيير */}
          <div className="change-icon">
            <ArrowLeftRight size={20} />
          </div>

          {/* اللعبة الجديدة */}
          <div className="new-game">
            <h4>اللعبة الجديدة</h4>
            <select
              onChange={(e) => handleGameChange(e.target.value)}
              className="game-select"
              value={newGame?.id || ''}
            >
              <option value="">اختر لعبة...</option>
              {games && games.map(game => (
                <option key={game.id} value={game.id}>
                  {game.name} - {formatCurrency(game.price_per_15min)}
                </option>
              ))}
            </select>
          </div>

          {/* فرق السعر */}
          {newGame && currentGame && (
            <div className="price-difference">
              <h4>فرق السعر</h4>
              <div className="diff-row">
                <span>اللعبة الحالية:</span>
                <span>{formatCurrency(currentGame.price)}</span>
              </div>
              <div className="diff-row">
                <span>اللعبة الجديدة:</span>
                <span>{formatCurrency(newGame.price_per_15min)}</span>
              </div>
              <div className={`diff-row total ${priceDiff > 0 ? 'positive' : priceDiff < 0 ? 'negative' : ''}`}>
                <span>الفرق:</span>
                <span>{priceDiff > 0 ? '+' : ''}{formatCurrency(priceDiff)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModifyRentalModal;