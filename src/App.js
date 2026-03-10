import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RentalProvider } from './context/RentalContext';
import { ShiftProvider } from './context/ShiftContext'; // ✅ إضافة ShiftProvider
import AppRoutes from './AppRoutes';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ShiftProvider> {/* ✅ ShiftProvider للتعامل مع الشيفتات */}
          <RentalProvider> {/* ✅ RentalProvider للتعامل مع التأجيرات */}
            <div className="App">
              <AppRoutes />
            </div>
          </RentalProvider>
        </ShiftProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;