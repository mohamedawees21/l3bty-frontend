// frontend/src/components/admin/GamesManagement.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const GamesManagement = () => {
  const [games, setGames] = useState([]);
  const [branches, setBranches] = useState([]);
  const [newGame, setNewGame] = useState({
    name: '',
    branch_id: '',
    price_per_hour: '',
    deposit_amount: '',
    category: 'ELECTRIC'
  });

  // الألعاب الأساسية
  const defaultGames = [
    { id: 1, name: 'دريفت كار', image: 'drift-car.jpg' },
    { id: 2, name: 'هافر بورد', image: 'hoverboard.jpg' },
    { id: 3, name: 'موتسكل كهربائي', image: 'electric-bike.jpg' },
    { id: 4, name: 'عربيه كهربائيه', image: 'electric-car.jpg' },
    { id: 5, name: 'سكوتر كهربائي', image: 'electric-scooter.jpg' },
    { id: 6, name: 'هارلي', image: 'harley.jpg' },
    { id: 7, name: 'سيجواي', image: 'segway.jpg' },
    { id: 8, name: 'كريزي كار', image: 'crazy-car.jpg' }
  ];

  const loadGames = async () => {
    const response = await adminService.getAllGames();
    if (response.success) setGames(response.data);
  };

  const loadBranches = async () => {
    const response = await adminService.getBranches();
    if (response.success) setBranches(response.data);
  };

  const handleAddGame = async () => {
    if (!newGame.name || !newGame.branch_id || !newGame.price_per_hour) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const response = await adminService.addGame(newGame);
    if (response.success) {
      alert('تمت إضافة اللعبة بنجاح');
      setNewGame({
        name: '',
        branch_id: '',
        price_per_hour: '',
        deposit_amount: '',
        category: 'ELECTRIC'
      });
      loadGames();
    } else {
      alert(response.error);
    }
  };

  return (
    <div className="games-management">
      <h2>إدارة الألعاب</h2>
      
      {/* إضافة لعبة جديدة */}
      <div className="add-game-form card">
        <h4>إضافة لعبة جديدة</h4>
        
        <div className="form-group">
          <label>اختر لعبة أساسية</label>
          <select 
            className="form-control"
            onChange={(e) => {
              const game = defaultGames.find(g => g.id == e.target.value);
              if (game) setNewGame({...newGame, name: game.name});
            }}
          >
            <option value="">اختر لعبة...</option>
            {defaultGames.map(game => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
            <option value="custom">إضافة لعبة جديدة</option>
          </select>
        </div>

        {newGame.name === '' && (
          <div className="form-group">
            <label>اسم اللعبة الجديدة</label>
            <input
              type="text"
              className="form-control"
              placeholder="أدخل اسم اللعبة الجديدة"
              value={newGame.name}
              onChange={(e) => setNewGame({...newGame, name: e.target.value})}
            />
          </div>
        )}

        <div className="form-group">
          <label>الفرع</label>
          <select
            className="form-control"
            value={newGame.branch_id}
            onChange={(e) => setNewGame({...newGame, branch_id: e.target.value})}
          >
            <option value="">اختر فرع...</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>السعر لكل ساعة (ريال)</label>
          <input
            type="number"
            className="form-control"
            value={newGame.price_per_hour}
            onChange={(e) => setNewGame({...newGame, price_per_hour: e.target.value})}
          />
        </div>

        <button className="btn btn-primary" onClick={handleAddGame}>
          إضافة اللعبة
        </button>
      </div>

      {/* قائمة الألعاب */}
      <div className="games-list mt-4">
        <h4>الألعاب المضافة</h4>
        <table className="table">
          <thead>
            <tr>
              <th>الصورة</th>
              <th>الاسم</th>
              <th>الفرع</th>
              <th>السعر/ساعة</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <tr key={game.id}>
                <td>
                  <img 
                    src={`/images/${game.image_url || 'default-game.jpg'}`} 
                    alt={game.name}
                    width="50"
                  />
                </td>
                <td>{game.name}</td>
                <td>{game.Branch?.name}</td>
                <td>{game.price_per_hour} ريال</td>
                <td>
                  <span className={`badge ${game.is_active ? 'bg-success' : 'bg-danger'}`}>
                    {game.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-warning me-2">تعديل</button>
                  <button className="btn btn-sm btn-danger">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};