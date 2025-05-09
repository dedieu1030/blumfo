
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification";
import { toast } from "sonner";

// Nous devons contourner les limites du typage généré par Supabase
// qui ne contient pas encore la table notifications
type PostgrestResponse<T> = {
  data: T | null;
  error: Error | null;
};

/**
 * Fetches all notifications for the current user
 */
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    // Utiliser any temporairement pour contourner le problème de typage
    const response = await (supabase as any)
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    const { data, error } = response as PostgrestResponse<Notification[]>;
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

/**
 * Marks a notification as read
 */
export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  try {
    // Utiliser any temporairement pour contourner le problème de typage
    const response = await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    const { error } = response as PostgrestResponse<unknown>;
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

/**
 * Marks all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    // Utiliser any temporairement pour contourner le problème de typage
    const response = await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    
    const { error } = response as PostgrestResponse<unknown>;
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

/**
 * Subscribes to real-time notifications
 */
export const subscribeToNotifications = (
  onNotification: (notification: Notification) => void
) => {
  // Utiliser une assertion de type ici également
  const channel = (supabase as any)
    .channel('notification-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      },
      (payload: any) => {
        const newNotification = payload.new as Notification;
        
        // Show toast notification
        toast(newNotification.title, {
          description: newNotification.message,
          duration: 5000
        });
        
        // Call the callback with the new notification
        onNotification(newNotification);
      }
    )
    .subscribe();
    
  // Return a cleanup function
  return () => {
    supabase.removeChannel(channel);
  };
};
