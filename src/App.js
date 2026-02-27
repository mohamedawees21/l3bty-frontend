// src/App.js
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { RentalProvider } from './context/RentalContext';
import AppRoutes from './AppRoutes';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <RentalProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </RentalProvider>
    </AuthProvider>
  );
}

export default App;