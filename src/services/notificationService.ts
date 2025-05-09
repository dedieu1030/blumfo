
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types/notification";
import { toast } from "sonner";

/**
 * Fetches all notifications for the current user
 */
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    // Comme la table notifications n'existe peut-être pas encore, 
    // retournons un tableau vide pour éviter les erreurs
    // TODO: Implémenter la récupération des notifications une fois la table créée
    // const { data, error } = await supabase
    //  .from('notifications')
    //  .select('*')
    //  .order('created_at', { ascending: false });
    
    // if (error) {
    //   throw error;
    // }
    
    // return (data as unknown as Notification[]) || [];
    
    return [];
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
    // Comme la table notifications n'existe peut-être pas encore,
    // simulons une réussite pour éviter les erreurs
    // TODO: Implémenter la mise à jour des notifications une fois la table créée
    // const { error } = await supabase
    //  .from('notifications')
    //  .update({ is_read: true })
    //  .eq('id', id);
    
    // if (error) {
    //   throw error;
    // }
    
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
    // Comme la table notifications n'existe peut-être pas encore,
    // simulons une réussite pour éviter les erreurs
    // TODO: Implémenter la mise à jour de toutes les notifications une fois la table créée
    // const { error } = await supabase
    //  .from('notifications')
    //  .update({ is_read: true })
    //  .eq('is_read', false);
    
    // if (error) {
    //  throw error;
    // }
    
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
  // Comme la table notifications n'existe peut-être pas encore,
  // retournons une fonction de nettoyage vide
  // TODO: Implémenter l'abonnement aux notifications une fois la table créée
  /*
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
  */
  
  // Return dummy cleanup function
  return () => {};
};
