
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, NotificationSettings } from '@/types/user';
import { toast } from 'sonner';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        
        // Vérifier si l'utilisateur est connecté via Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          setLoading(false);
          return;
        }
        
        const userId = session.user.id;
        
        // Récupérer le profil de l'utilisateur
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
          throw error;
        }
        
        if (data) {
          // Convert the JSON notification settings to the required shape
          const notificationSettings: NotificationSettings = {
            email: data.notification_settings?.email === true,
            push: data.notification_settings?.push === true,
            sms: data.notification_settings?.sms === true,
          };

          const userProfile: UserProfile = {
            id: data.id,
            full_name: data.full_name,
            email: data.email,
            avatar_url: data.avatar_url,
            phone: data.phone,
            language: data.language,
            timezone: data.timezone,
            username: data.username,
            notification_settings: notificationSettings,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
          
          setProfile(userProfile);
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement du profil:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
    
    // Configurer un listener pour les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN') {
          fetchProfile();
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      
      // Vérifier si l'utilisateur est connecté
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        toast.error('Vous devez être connecté pour mettre à jour votre profil');
        return { success: false };
      }
      
      const userId = session.user.id;
      
      // S'assurer que les champs requis sont présents
      if (!updates.email && profile?.email) {
        updates.email = profile.email;
      }
      
      if (!updates.full_name && profile?.full_name) {
        updates.full_name = profile.full_name;
      }
      
      // Mise à jour du timestamp
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString(),
        // Convert NotificationSettings to JSON compatible format
        notification_settings: updates.notification_settings ? {
          email: updates.notification_settings.email,
          push: updates.notification_settings.push,
          sms: updates.notification_settings.sms
        } : undefined
      };
      
      // Mettre à jour le profil
      const { data, error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Convert the notification settings back to our type
      const notificationSettings: NotificationSettings = {
        email: data.notification_settings?.email === true,
        push: data.notification_settings?.push === true,
        sms: data.notification_settings?.sms === true,
      };

      const updatedProfile: UserProfile = {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        avatar_url: data.avatar_url,
        phone: data.phone,
        language: data.language,
        timezone: data.timezone,
        username: data.username,
        notification_settings: notificationSettings,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setProfile(updatedProfile);
      toast.success('Profil mis à jour avec succès');
      return { success: true, data: updatedProfile };
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setError(err);
      toast.error(err.message || 'Erreur lors de la mise à jour du profil');
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, updateProfile };
}
