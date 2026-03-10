// src/App.js
import React from 'react';
import { BrowserRouter } from 'react-router-dom'; // ✅ مرة واحدة فقط هنا
import { AuthProvider } from './context/AuthContext';
import { RentalProvider } from './context/RentalContext';
import { ShiftProvider } from './context/ShiftContext';
import AppRoutes from './AppRoutes';
import './App.css';

function App() {
  return (
    <BrowserRouter> {/* ✅ الراوتر الرئيسي مرة واحدة */}
      <AuthProvider>
        <ShiftProvider>
          <RentalProvider>
            <div className="App">
              <AppRoutes /> {/* ✅ هذا المكون يستخدم <Routes> فقط وليس <BrowserRouter> */}
            </div>
          </RentalProvider>
        </ShiftProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;