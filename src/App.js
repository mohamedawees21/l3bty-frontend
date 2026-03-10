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
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <ShiftProvider>
          <RentalProvider>
            <div className="App">
              <AppRoutes /> {/* ✅ يحتوي فقط على <Routes> وليس <BrowserRouter> */}
            </div>
          </RentalProvider>
        </ShiftProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;