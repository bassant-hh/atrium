import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getCustomerNotifications } from '../services/notification.service';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await getCustomerNotifications();
      if (data?.unreadCount != null) {
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // Non-blocking notice
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const value = {
    unreadCount,
    setUnreadCount,
    fetchUnreadCount,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
