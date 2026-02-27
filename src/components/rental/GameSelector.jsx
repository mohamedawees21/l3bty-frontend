import React from 'react';
import GameCard from './GameCard';

const GameSelector = ({ games, selectedGame, onSelectGame }) => {
  return (
    <div className="game-selector">
      <h2>اختر اللعبة</h2>
      <div className="games-grid">
        {games.map(game => (
          <GameCard
            key={game.id}
            game={game}
            isSelected={selectedGame?.id === game.id}
            onSelect={() => onSelectGame(game)}
          />
        ))}
      </div>
    </div>
  );
};

// ⚠️ مهم: تأكد من التصدير الصحيح
export default GameSelector;