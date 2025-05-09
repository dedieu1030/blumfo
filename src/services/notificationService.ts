
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification";
import { toast } from "sonner";

/**
 * Fetches all notifications for the current user
 */
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return (data as unknown as Notification[]) || [];
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
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
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
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    
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
  const channel = supabase
    .channel('notification-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      },
      (payload) => {
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
