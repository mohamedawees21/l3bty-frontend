// frontend/src/pages/TestApi.jsx
import React, { useState, useEffect } from 'react';
import unifiedService from '../services/unifiedService';

const TestApi = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAllEndpoints = async () => {
    setLoading(true);
    const testResults = {};

    try {
      // 1. Health Check
      testResults.health = await unifiedService.checkHealth();
    } catch (error) {
      testResults.health = { error: error.message };
    }

    try {
      // 2. Users
      testResults.users = await unifiedService.getUsers();
    } catch (error) {
      testResults.users = { error: error.message };
    }

    try {
      // 3. Games
      testResults.games = await unifiedService.getGames();
    } catch (error) {
      testResults.games = { error: error.message };
    }

    try {
      // 4. Branches
      testResults.branches = await unifiedService.getBranches();
    } catch (error) {
      testResults.branches = { error: error.message };
    }

    try {
      // 5. Dashboard Stats
      testResults.stats = await unifiedService.getDashboardStats();
    } catch (error) {
      testResults.stats = { error: error.message };
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    testAllEndpoints();
  }, []);

  const renderResult = (key, data) => {
    if (data.error) {
      return <div style={{ color: 'red' }}>❌ {data.error}</div>;
    }
    
    if (data.success === false) {
      return <div style={{ color: 'orange' }}>⚠️ {data.message}</div>;
    }
    
    return (
      <div style={{ color: 'green' }}>
        ✅ Success - Data: {JSON.stringify(data.data?.length || data.data)}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🔧 اختبار اتصال API</h1>
      
      <button onClick={testAllEndpoints} disabled={loading}>
        {loading ? 'جاري الاختبار...' : 'تشغيل جميع الاختبارات'}
      </button>

      <div style={{ marginTop: '20px' }}>
        <h2>النتائج:</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <h3>🏥 Health Check</h3>
            {renderResult('health', results.health || {})}
          </div>
          
          <div>
            <h3>👥 المستخدمين</h3>
            {renderResult('users', results.users || {})}
          </div>
          
          <div>
            <h3>🎮 الألعاب</h3>
            {renderResult('games', results.games || {})}
          </div>
          
          <div>
            <h3>🏬 الفروع</h3>
            {renderResult('branches', results.branches || {})}
          </div>
          
          <div>
            <h3>📊 إحصائيات Dashboard</h3>
            {renderResult('stats', results.stats || {})}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', background: '#f0f0f0' }}>
        <h3>🔍 معلومات التصحيح:</h3>
        <p>Token: {localStorage.getItem('token') ? '✅ موجود' : '❌ غير موجود'}</p>
        <p>User: {localStorage.getItem('user') ? '✅ موجود' : '❌ غير موجود'}</p>
        <p>Backend URL: http://localhost:5000</p>
      </div>
    </div>
  );
};

export default TestApi;