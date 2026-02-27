import { useContext } from 'react';
import { WebSocketContext } from '../context/WebSocketContext';

// ⚠️ استخدام التصدير الصحيح من Context
const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export default useWebSocket;