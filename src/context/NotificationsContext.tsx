
import React, { createContext, useContext, useEffect, useState } from "react";
import { Notification } from "@/types/notification";
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  subscribeToNotifications
} from "@/services/notificationService";
import { supabase } from "@/integrations/supabase/client";

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  // Fetch notifications on mount and when user auth state changes
  const loadNotifications = async () => {
    setIsLoading(true);
    const data = await fetchNotifications();
    setNotifications(data);
    setIsLoading(false);
  };
  
  useEffect(() => {
    loadNotifications();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadNotifications();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Subscribe to real-time notifications
  useEffect(() => {
    const cleanup = subscribeToNotifications((notification) => {
      setNotifications(prev => [notification, ...prev]);
    });
    
    return () => {
      cleanup();
    };
  }, []);
  
  // Mark a notification as read
  const markAsRead = async (id: string) => {
    const success = await markNotificationAsRead(id);
    if (success) {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    const success = await markAllNotificationsAsRead();
    if (success) {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    }
  };
  
  // Manually refresh notifications
  const refreshNotifications = async () => {
    await loadNotifications();
  };
  
  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  };
  
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
