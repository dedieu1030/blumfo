
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Notification } from "@/types/invoice";

// Fetch notifications for the current user
export const fetchNotifications = async (limit: number = 10, offset: number = 0) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await (supabase as any)
      .from('notifications')
      .select('*')
      .eq('user_id', session?.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data as Notification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { error } = await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', session.user.id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { error } = await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

// Count unread notifications
export const countUnreadNotifications = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return 0;

    const { count, error } = await (supabase as any)
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('is_read', false);
    
    if (error) throw error;
    return count;
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    return 0;
  }
};

// Subscribe to real-time notifications
export const subscribeToNotifications = (callback: (notification: Notification) => void) => {
  // Use async IIFE to handle the promise from getSession
  const session = supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) return () => {}; // Return empty cleanup function if no session
    
    // Subscribe to notifications table changes for the current user
    const subscription = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Show toast notification
          toast(`New notification: ${newNotification.title}`, {
            description: newNotification.message,
            duration: 5000,
          });
          
          // Execute callback with the new notification
          callback(newNotification);
        }
      )
      .subscribe();
    
    // Return cleanup function
    return () => {
      supabase.removeChannel(subscription);
    };
  });

  // Return a generic cleanup function that does nothing
  // The actual cleanup will be handled by the Promise
  return () => {};
};
