import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// إنشاء Context
const WebSocketContext = createContext(null);

// ⚠️ تصدير مخصص الاستخدام
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

// ⚠️ تصدير Provider
export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user && !socket) {
      // محاكاة WebSocket (في الإصدار الحقيقي ستستخدم socket.io)
      const mockSocket = {
        on: (event, callback) => console.log(`Listening to ${event}`),
        emit: (event, data) => console.log(`Emitting ${event}:`, data),
        disconnect: () => console.log('Disconnected'),
      };
      
      setSocket(mockSocket);
      
      // تنظيف عند الخروج
      return () => {
        mockSocket.disconnect();
      };
    }
  }, [user]);

  const sendMessage = (type, data) => {
    if (socket) {
      socket.emit(type, data);
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// لا حاجة لتصدير WebSocketContext نفسه





















































