import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { playNotificationSound, preloadNotificationSound } from '../utils/SoundUtils';
import { Order } from '../types/order.types';

// Define the notification type
export interface Notification {
  id: string;
  type: 'new-order' | 'order-status-update' | 'info';
  message: string;
  timestamp: Date;
  orderId?: string;
  read: boolean;
  data?: any;
}

// Define the context type
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  socket: Socket | null;
}

// Create the context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Custom hook for using the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  // Provide a fallback to prevent crashing if used outside provider
  if (!context) {
    console.warn('useNotifications is being used outside of NotificationProvider');
    // Return a fallback with empty data and no-op functions
    return {
      notifications: [],
      unreadCount: 0,
      addNotification: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      clearNotifications: () => {},
      socket: null
    };
  }
  
  return context;
};

// Props for the provider component
interface NotificationProviderProps {
  children: ReactNode;
}

// Get socket.io server URL from environment variable or use a default
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5003';

// Provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Preload notification sound
  useEffect(() => {
    preloadNotificationSound();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!user || !user._id) return;

    const socketInstance = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      
      // Join restaurant-specific room
      if (user._id) {
        socketInstance.emit('join-restaurant', user._id);
        console.log('Joined restaurant room:', user._id);
      }
    });
    
    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
    
    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket reconnection attempt ${attemptNumber}`);
    });
    
    socketInstance.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  // Listen for new order notifications
  useEffect(() => {
    if (!socket) return;

    // Handle new order notifications
    socket.on('new-order', (data) => {
      // Only add notification if the order is for this restaurant
      if (data.orderData.restaurant && data.orderData.restaurant._id === user?._id) {
        addNotification({
          type: 'new-order',
          message: data.message || 'New order received!',
          orderId: data.orderId,
          data: data.orderData
        });
      }
    });

    // Handle order status update notifications
    socket.on('order-status-update', (data) => {
      // Only add notification if the order is for this restaurant
      if (data.orderData.restaurant && data.orderData.restaurant._id === user?._id) {
        addNotification({
          type: 'order-status-update',
          message: data.message || `Order ${data.orderId} status updated to ${data.status}`,
          orderId: data.orderId,
          data: data.orderData
        });
      }
    });

    return () => {
      socket.off('new-order');
      socket.off('order-status-update');
    };
  }, [socket, user]);

  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Play notification sound
    playNotificationSound();
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        socket
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 