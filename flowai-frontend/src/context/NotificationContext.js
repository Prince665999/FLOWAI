import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getApprovals } from '../api/approvals';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  const refreshCounts = useCallback(async () => {
    if (!user) return;
    try {
      const pending = await getApprovals('pending');
      setPendingApprovalsCount(Array.isArray(pending) ? pending.length : 0);
    } catch (e) {
      // Ignored for offline/initial state
    }
  }, [user]);

  useEffect(() => {
    refreshCounts();
    const interval = setInterval(refreshCounts, 15000); // 15s polling fallback
    return () => clearInterval(interval);
  }, [refreshCounts]);

  const addNotification = (notif) => {
    setNotifications((prev) => [
      { id: Date.now(), timestamp: new Date().toISOString(), is_read: false, ...notif },
      ...prev,
    ]);
    setUnreadCount((prev) => prev + 1);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        pendingApprovalsCount,
        addNotification,
        markAllAsRead,
        refreshCounts,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationsContext = () => useContext(NotificationContext);
