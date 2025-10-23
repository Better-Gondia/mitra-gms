

'use client';

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { UserRole } from '@/lib/types';

export type AppNotification = {
  id: number;
  message: string;
  timestamp: Date;
  read: boolean;
  targetRole?: UserRole;
  complaintId?: string;
};

type NotificationContextType = {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: { message: string, targetRole?: UserRole, complaintId?: string }) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let notificationId = 0;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback(({ message, targetRole, complaintId }: { message: string, targetRole?: UserRole, complaintId?: string }) => {
    const newNotification: AppNotification = {
      id: notificationId++,
      message,
      timestamp: new Date(),
      read: false,
      targetRole,
      complaintId,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
  }), [notifications, unreadCount, addNotification, markAsRead, markAllAsRead]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
