
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
  const { userId, isSignedIn, getToken } = useClerkAuth();
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
          
        if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
          throw error;
        }
        
        if (data) {
          setProfile(data as UserProfile);
        } else {
          // Créer un nouveau profil si aucun n'existe
          // Récupérer les informations utilisateur depuis Clerk
          const userInfo = await getToken({
            template: "user_metadata"
          });
          
          let userMetadata = {};
          if (userInfo) {
            try {
              userMetadata = JSON.parse(atob(userInfo.split('.')[1]));
            } catch (e) {
              console.error('Erreur lors du décodage des métadonnées utilisateur:', e);
            }
          }
          
          // Construire un profil utilisateur complet avec tous les champs requis
          const newProfile: UserProfile = {
            id: userId,
            full_name: userMetadata?.full_name || userMetadata?.name || userId,
            email: userMetadata?.email || '',
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
          
          // Insérer le nouveau profil dans Supabase
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();
            
          if (createError) throw createError;
          
          setProfile(createdProfile as UserProfile);
          console.log('Nouveau profil utilisateur créé:', createdProfile);
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
  }, [userId, isSignedIn, isAuthenticated, supabaseToken, getToken]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      setLoading(true);
      
      // Vérifier si l'utilisateur est connecté
      if (!isSignedIn || !userId) {
        toast.error('Vous devez être connecté pour mettre à jour votre profil');
        return { success: false };
      }
      
      // S'assurer que les champs requis sont présents
      if (!updates.email && profile?.email) {
        updates.email = profile.email;
      }
      
      if (!updates.full_name && profile?.full_name) {
        updates.full_name = profile.full_name;
      }
      
      // Mise à jour du timestamp
      updates.updated_at = new Date().toISOString();
      
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
