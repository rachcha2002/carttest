import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "react-hot-toast";

// Define the notification type
export interface Notification {
  id: string;
  type: "order-status-update" | "info";
  message: string;
  timestamp: Date;
  orderId?: string;
  read: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  socket: Socket | null;
  clearNotifications: () => void;
}

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

// Get socket.io server URL from environment variable or use a default
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5005";

// Provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Initialize socket connection
  useEffect(() => {
    if (!user || !user.id) {
      console.log("No user or user ID available for socket connection");
      return;
    }

    console.log("Attempting to connect to socket server at:", SOCKET_URL);
    const socketInstance = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to socket server successfully");

      // Join customer-specific room
      if (user.id) {
        console.log("Joining customer room with ID:", user.id);
        socketInstance.emit("join-customer", user.id);
      }
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    socketInstance.on("reconnect_attempt", (attemptNumber) => {
      console.log(`Socket reconnection attempt ${attemptNumber}`);
    });

    socketInstance.on("reconnect_failed", () => {
      console.error("Socket reconnection failed");
    });

    // Listen for notifications
    socketInstance.on("notification", (data) => {
      console.log("Received notification:", data);
      addNotification({
        type: data.type || "info",
        message: data.message,
        orderId: data.orderId,
        data: data.data,
      });
    });

    // Cleanup on unmount
    return () => {
      console.log("Disconnecting socket");
      socketInstance.disconnect();
    };
  }, [user]);

  // Listen for order status update notifications
  useEffect(() => {
    if (!socket) return;

    // Handle order status update notifications
    socket.on("order-status-update", (data) => {
      // Only add notification if the order is for this customer
      if (data.orderData.user && data.orderData.user.id === user?.id) {
        addNotification({
          type: "order-status-update",
          message:
            data.message ||
            `Order ${data.orderId} status updated to ${data.status}`,
          orderId: data.orderId,
          data: data.orderData,
        });

        // Show toast notification
        toast.success(data.message || `Order status updated to ${data.status}`);
      }
    });

    return () => {
      socket.off("order-status-update");
    };
  }, [socket, user]);

  // Add a new notification
  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
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
        markAsRead,
        markAllAsRead,
        socket,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
