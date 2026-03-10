import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, Grid, List, Package, X, Gamepad2,
  Lock, Grid as GridIcon, List as ListIcon,
  Maximize2, ChevronDown
} from 'lucide-react';
import GameImage from './GameImage';
import { GAME_CATEGORIES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

const GamesDropdown = ({
  games = [],
  onSelectGame,
  onClose,
  isOpen,
  currentShift,
  userRole,
  branchId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const dropdownRef = useRef(null);

  // تصفية الألعاب حسب الفرع
  const branchGames = useMemo(() => {
    if (!games?.length || !branchId) return [];
    return games.filter(game =>
      game &&
      game.branch_id === branchId &&
      game.is_active !== false
    );
  }, [games, branchId]);

  // تطبيق البحث والتصنيف
  const filteredGames = useMemo(() => {
    if (!branchGames.length) return [];

    return branchGames.filter(game => {
      const matchesSearch = !searchTerm ||
        game.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' ||
        game.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        game.type?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [branchGames, searchTerm, selectedCategory]);

  // إغلاق عند الضغط خارج القائمة
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // إغلاق عند الضغط على ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEmployee = userRole === 'employee';
  const canAddGames = currentShift || !isEmployee;

  const handleGameClick = (game) => {
    if (!canAddGames) {
      alert('❌ يجب فتح شيفت أولاً لإضافة ألعاب');
      return;
    }
    onSelectGame(game);
    onClose();
  };

  return (
    <div className="games-dropdown-overlay">
      <div className="games-dropdown-container" ref={dropdownRef}>
        {/* رأس القائمة */}
        <div className="dropdown-header">
          <div className="header-title">
            <Gamepad2 size={20} />
            <h3>اختر لعبة</h3>
          </div>
          <div className="header-actions">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="عرض شبكي"
            >
              <GridIcon size={16} />
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="عرض قائمة"
            >
              <ListIcon size={16} />
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* شريط البحث */}
        <div className="dropdown-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="ابحث عن لعبة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* التصنيفات */}
        <div className="dropdown-categories">
          {GAME_CATEGORIES.map(cat => {
            const Icon = cat.icon === 'Grid' ? GridIcon :
                        cat.icon === 'Gamepad2' ? Gamepad2 :
                        cat.icon === 'Eye' ? Eye :
                        cat.icon === 'Zap' ? Zap :
                        cat.icon === 'Activity' ? Activity :
                        cat.icon === 'Table' ? GridIcon : Gamepad2;
            
            return (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* قائمة الألعاب */}
        {!canAddGames ? (
          <div className="dropdown-disabled">
            <Lock size={32} />
            <p>يجب فتح شيفت أولاً لإضافة ألعاب</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="dropdown-empty">
            <Package size={48} />
            <h3>لا توجد ألعاب متاحة</h3>
            <p>لم يتم العثور على ألعاب تطابق بحثك</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-search-btn">
                مسح البحث
              </button>
            )}
          </div>
        ) : (
          <div className={`dropdown-games ${viewMode}`}>
            {filteredGames.map(game => (
              <div
                key={game.id}
                className={`game-item ${viewMode}`}
                onClick={() => handleGameClick(game)}
              >
                <GameImage
                  src={game.image_url}
                  alt={game.name}
                  size={viewMode === 'grid' ? 'medium' : 'small'}
                />
                <div className="game-item-info">
                  <span className="game-name">{game.name}</span>
                  <span className="game-price">{formatCurrency(game.price_per_15min)}</span>
                  {game.category && (
                    <span className="game-category">{game.category}</span>
                  )}
                </div>
                <button className="add-game-btn">
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* تذييل القائمة */}
        <div className="dropdown-footer">
          <span>إجمالي الألعاب: {filteredGames.length}</span>
          <button onClick={onClose} className="close-footer-btn">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamesDropdown;