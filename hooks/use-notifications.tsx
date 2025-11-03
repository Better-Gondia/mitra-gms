"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import type { UserRole } from "@/lib/types";

export type AppNotification = {
  id: number;
  title?: string;
  type?: "REMARK" | "STATUS_CHANGE" | "TAG" | "ASSIGNMENT";
  message: string;
  timestamp: Date;
  read: boolean;
  targetRole?: UserRole;
  // Numeric complaint id as string for search; derived by parsing message
  complaintId?: string;
};

type NotificationContextType = {
  notifications: AppNotification[];
  unreadCount: number;
  hasNotifications: boolean;
  markAsRead: (id: number) => void;
  markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [hasNotifications, setHasNotifications] = useState<boolean>(false);

  const fetchRoleAndHasNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/check-role", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setHasNotifications(Boolean(data?.hasNotifications));
    } catch {}
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const items: Array<{
        id: number;
        title: string;
        type?: "REMARK" | "STATUS_CHANGE" | "TAG" | "ASSIGNMENT";
        message?: string;
        createdAt: string;
      }> = await res.json();
      const mapped: AppNotification[] = items.map((n) => {
        // Try to extract a numeric complaint id from the message text
        const maybeId = n.message?.match(/\b(\d{1,})\b/);
        const complaintId = maybeId?.[1];
        return {
          id: n.id,
          title: n.title,
          type: n.type,
          message: n.message || n.title,
          timestamp: new Date(n.createdAt),
          read: false,
          complaintId,
        };
      });
      setNotifications(mapped);
    } catch {}
  }, []);

  useEffect(() => {
    // Initial load
    fetchRoleAndHasNotifications();
    fetchNotifications();
    // Poll occasionally for updates
    const interval = setInterval(() => {
      fetchRoleAndHasNotifications();
      fetchNotifications();
    }, 60_000);
    return () => clearInterval(interval);
  }, [fetchRoleAndHasNotifications, fetchNotifications]);

  const markAsRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Immediately update local state for instant UI feedback
    setHasNotifications(false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAsRead" }),
      });
      // Refresh hasNotifications state from server to ensure consistency
      await fetchRoleAndHasNotifications();
    } catch {
      // If API call fails, revert the optimistic update
      await fetchRoleAndHasNotifications();
    }
  }, [fetchRoleAndHasNotifications]);

  const unreadCount = useMemo(
    () => (hasNotifications ? 1 : 0),
    [hasNotifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      hasNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [notifications, unreadCount, hasNotifications, markAsRead, markAllAsRead]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
