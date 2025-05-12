
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { useClerkSupabase } from './use-clerk-supabase';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { userId, isSignedIn } = useClerkAuth();
  const { isAuthenticated, supabaseToken } = useClerkSupabase();

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        
        // Vérifier si l'utilisateur est connecté via Clerk
        if (!isSignedIn || !userId || !isAuthenticated) {
          setLoading(false);
          return;
        }
        
        // Récupérer le profil de l'utilisateur
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setProfile(data as UserProfile);
        } else {
          // Créer un nouveau profil si aucun n'existe
          const { data: userData } = await supabase.auth.getUser();
          const userEmail = userData?.user?.email || '';
          
          // Définir les champs requis explicitement
          const newProfile = {
            id: userId,
            full_name: userData?.user?.user_metadata?.full_name || userId,
            email: userEmail,
            language: 'fr',
            timezone: 'Europe/Paris',
            notification_settings: {
              email: true,
              push: false,
              sms: false
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();
            
          if (createError) throw createError;
          
          setProfile(createdProfile as UserProfile);
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement du profil:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (isAuthenticated && supabaseToken) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [userId, isSignedIn, isAuthenticated, supabaseToken]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      
      // Vérifier si l'utilisateur est connecté
      if (!isSignedIn || !userId) {
        toast.error('Vous devez être connecté pour mettre à jour votre profil');
        return { success: false };
      }
      
      // Mettre à jour le profil
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw error;
      
      setProfile(data as UserProfile);
      toast.success('Profil mis à jour avec succès');
      return { success: true, data };
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
