import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { api } from "../config/api";

interface Notification {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  receivers: {
    userId: string;
    receivingData: {
      channel: string;
      status: string;
      read: boolean;
      readAt: string | null;
    }[];
  }[];
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem("adminToken");
      if (!token) return;

      // Get current user ID from the token or user context
      const user = JSON.parse(sessionStorage.getItem("adminUser") || "{}");
      const userId = user._id;

      if (!userId) return;

      // Fetch unread notifications count
      const countResponse = await axios.get(
        `${api.endpoints.notifications.getAll}/unread/count/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (countResponse.data.success) {
        setUnreadCount(countResponse.data.count);
      }

      // Fetch unread notifications
      const response = await axios.get(
        `${api.endpoints.notifications.getAll}/unread/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = sessionStorage.getItem("adminToken");
      if (!token) return;

      await axios.post(
        `${api.endpoints.notifications.getAll}/read/${id}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => {
          if (notification._id === id) {
            return {
              ...notification,
              receivers: notification.receivers.map((receiver) => ({
                ...receiver,
                receivingData: receiver.receivingData.map((data) => ({
                  ...data,
                  read: true,
                  readAt: new Date().toISOString(),
                })),
              })),
            };
          }
          return notification;
        })
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem("adminToken");
      if (!token) return;

      // Get current user ID
      const user = JSON.parse(sessionStorage.getItem("adminUser") || "{}");
      const userId = user._id;

      if (!userId) return;

      // Mark all notifications as read
      for (const notification of notifications) {
        await axios.post(
          `${api.endpoints.notifications.getAll}/read/${notification._id}`,
          null,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          receivers: notification.receivers.map((receiver) => ({
            ...receiver,
            receivingData: receiver.receivingData.map((data) => ({
              ...data,
              read: true,
              readAt: new Date().toISOString(),
            })),
          })),
        }))
      );

      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Fetch notifications on mount and every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
