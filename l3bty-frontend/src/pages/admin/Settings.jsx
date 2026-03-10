import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import './AdminPages.css';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // تغيير التبويب الافتراضي إلى الملف الشخصي
  
  // إعدادات المتجر الأساسية
  const [storeSettings, setStoreSettings] = useState({
    company_name: 'l3bty store',
    company_phone: '01016904292',
    tax_rate: 14,
    currency_symbol: 'ج',
    reservation_duration: 60,
    late_fee_per_hour: 20,
    deposit_amount: 500
  });

  // إعدادات المستخدم
  const [userSettings, setUserSettings] = useState({
    name: '',
    email: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // جلب بيانات المستخدم الحالي
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUserSettings(prev => ({
            ...prev,
            name: currentUser.name || '',
            email: currentUser.email || '',
            phone: currentUser.phone || ''
          }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setErrorMessage('❌ حدث خطأ في تحميل الإعدادات');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // حفظ إعدادات المتجر
  const handleSaveStoreSettings = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSuccessMessage('✅ تم حفظ الإعدادات بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('❌ حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  // تحديث بيانات المستخدم
  const handleUpdateProfile = async () => {
    try {
      if (!userSettings.name || !userSettings.email) {
        setErrorMessage('❌ الاسم والبريد الإلكتروني مطلوبان');
        return;
      }

      setSaving(true);
      setErrorMessage('');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSuccessMessage('✅ تم تحديث الملف الشخصي بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('❌ حدث خطأ أثناء تحديث البيانات');
    } finally {
      setSaving(false);
    }
  };

  // تغيير كلمة المرور
  const handleChangePassword = async () => {
    try {
      if (!userSettings.current_password) {
        setErrorMessage('❌ كلمة المرور الحالية مطلوبة');
        return;
      }

      if (!userSettings.new_password || userSettings.new_password.length < 6) {
        setErrorMessage('❌ كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
        return;
      }

      if (userSettings.new_password !== userSettings.confirm_password) {
        setErrorMessage('❌ كلمة المرور الجديدة غير متطابقة');
        return;
      }

      setSaving(true);
      setErrorMessage('');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSuccessMessage('✅ تم تغيير كلمة المرور بنجاح');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setUserSettings(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
    } catch (error) {
      setErrorMessage('❌ حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>جاري تحميل الإعدادات...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      {/* رأس الصفحة */}
      <div className="settings-header">
        <h1>⚙️ الإعدادات</h1>
        <p>إدارة إعدادات النظام والملف الشخصي</p>
      </div>

      {/* رسائل التنبيه */}
      {successMessage && (
        <div className="settings-alert success">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')}>✕</button>
        </div>
      )}
      
      {errorMessage && (
        <div className="settings-alert error">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')}>✕</button>
        </div>
      )}

      {/* التبويبات المبسطة */}
      <div className="settings-tabs-simple">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 الملف الشخصي
        </button>
        <button 
          className={`tab-btn ${activeTab === 'store' ? 'active' : ''}`}
          onClick={() => setActiveTab('store')}
        >
          🏢 إعدادات المتجر
        </button>
        <button 
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔐 الأمان
        </button>
      </div>

      {/* محتوى الإعدادات المبسط */}
      <div className="settings-content-simple">
        
        {/* الملف الشخصي */}
        {activeTab === 'profile' && (
          <div className="settings-card">
            <div className="card-header">
              <h2>👤 معلوماتك الشخصية</h2>
            </div>
            
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>الاسم الكامل</label>
                  <input
                    type="text"
                    value={userSettings.name}
                    onChange={(e) => setUserSettings({...userSettings, name: e.target.value})}
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
                
                <div className="form-group">
                  <label>البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={userSettings.email}
                    onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
                    placeholder="بريدك الإلكتروني"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input
                    type="tel"
                    value={userSettings.phone}
                    onChange={(e) => setUserSettings({...userSettings, phone: e.target.value})}
                    placeholder="رقم هاتفك"
                  />
                </div>
              </div>
            </div>
            
            <div className="card-footer">
              <button 
                className="btn-save"
                onClick={handleUpdateProfile}
                disabled={saving}
              >
                {saving ? '🔄 جاري الحفظ...' : '💾 حفظ التغييرات'}
              </button>
            </div>
          </div>
        )}

        {/* إعدادات المتجر */}
        {activeTab === 'store' && (
          <div className="settings-card">
            <div className="card-header">
              <h2>🏢 إعدادات المتجر الأساسية</h2>
            </div>
            
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>اسم المتجر</label>
                  <input
                    type="text"
                    value={storeSettings.company_name}
                    onChange={(e) => setStoreSettings({...storeSettings, company_name: e.target.value})}
                    placeholder="اسم المتجر"
                  />
                </div>
                
                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input
                    type="tel"
                    value={storeSettings.company_phone}
                    onChange={(e) => setStoreSettings({...storeSettings, company_phone: e.target.value})}
                    placeholder="رقم هاتف المتجر"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>نسبة الضريبة (%)</label>
                  <input
                    type="number"
                    value={storeSettings.tax_rate}
                    onChange={(e) => setStoreSettings({...storeSettings, tax_rate: parseFloat(e.target.value) || 0})}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                
                <div className="form-group">
                  <label>رمز العملة</label>
                  <input
                    type="text"
                    value={storeSettings.currency_symbol}
                    onChange={(e) => setStoreSettings({...storeSettings, currency_symbol: e.target.value})}
                    maxLength="3"
                    placeholder="ج"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>مدة الحجز (دقيقة)</label>
                  <input
                    type="number"
                    value={storeSettings.reservation_duration}
                    onChange={(e) => setStoreSettings({...storeSettings, reservation_duration: parseInt(e.target.value) || 60})}
                    min="15"
                    max="1440"
                    step="15"
                  />
                </div>
                
                <div className="form-group">
                  <label>رسوم التأخير/الساعة</label>
                  <input
                    type="number"
                    value={storeSettings.late_fee_per_hour}
                    onChange={(e) => setStoreSettings({...storeSettings, late_fee_per_hour: parseInt(e.target.value) || 0})}
                    min="0"
                    step="5"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>مبلغ الضمان</label>
                  <input
                    type="number"
                    value={storeSettings.deposit_amount}
                    onChange={(e) => setStoreSettings({...storeSettings, deposit_amount: parseInt(e.target.value) || 0})}
                    min="0"
                    step="50"
                  />
                </div>
              </div>
            </div>
            
            <div className="card-footer">
              <button 
                className="btn-save"
                onClick={handleSaveStoreSettings}
                disabled={saving}
              >
                {saving ? '🔄 جاري الحفظ...' : '💾 حفظ إعدادات المتجر'}
              </button>
            </div>
          </div>
        )}

        {/* الأمان */}
        {activeTab === 'security' && (
          <div className="settings-card">
            <div className="card-header">
              <h2>🔐 تغيير كلمة المرور</h2>
            </div>
            
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>كلمة المرور الحالية</label>
                  <input
                    type="password"
                    value={userSettings.current_password}
                    onChange={(e) => setUserSettings({...userSettings, current_password: e.target.value})}
                    placeholder="أدخل كلمة المرور الحالية"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={userSettings.new_password}
                    onChange={(e) => setUserSettings({...userSettings, new_password: e.target.value})}
                    placeholder="أدخل كلمة المرور الجديدة"
                  />
                  <small>يجب أن تكون 6 أحرف على الأقل</small>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    value={userSettings.confirm_password}
                    onChange={(e) => setUserSettings({...userSettings, confirm_password: e.target.value})}
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                  />
                </div>
              </div>
            </div>
            
            <div className="card-footer">
              <button 
                className="btn-save"
                onClick={handleChangePassword}
                disabled={saving}
              >
                {saving ? '🔄 جاري التغيير...' : '🔐 تغيير كلمة المرور'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;