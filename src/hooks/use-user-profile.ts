
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, NotificationSettings } from '@/types/user';
import { Json } from '@/integrations/supabase/types';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Profile not found');
      }

      // Safe conversion of notification_settings from Json to NotificationSettings
      const notificationSettings: NotificationSettings = {
        email: (data.notification_settings as any)?.email || false,
        push: (data.notification_settings as any)?.push || false,
        sms: (data.notification_settings as any)?.sms || false,
      };

      // Cast the data to UserProfile type
      const userProfile: UserProfile = {
        ...data,
        notification_settings: notificationSettings
      } as UserProfile;

      setUserProfile(userProfile);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Convert NotificationSettings to Json compatible format
      const profileUpdates = {
        ...updates,
        notification_settings: updates.notification_settings ? {
          ...updates.notification_settings
        } : undefined,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdates as any)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Safe conversion of notification_settings from Json to NotificationSettings
      const notificationSettings: NotificationSettings = {
        email: (data.notification_settings as any)?.email || false,
        push: (data.notification_settings as any)?.push || false,
        sms: (data.notification_settings as any)?.sms || false,
      };

      // Cast the data to UserProfile type
      const updatedProfile: UserProfile = {
        ...data,
        notification_settings: notificationSettings
      } as UserProfile;

      setUserProfile(updatedProfile);
      return { success: true, data: updatedProfile };
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    userProfile,
    loading,
    error,
    fetchUserProfile,
    updateUserProfile
  };
};
