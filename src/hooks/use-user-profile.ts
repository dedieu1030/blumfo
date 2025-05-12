
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export function useUserProfile() {
  const { userProfile, isLoading, error, refreshUserProfile } = useAuth();
  const [updating, setUpdating] = useState<boolean>(false);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      setUpdating(true);
      
      // Vérifier si l'utilisateur est connecté
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Vous devez être connecté pour mettre à jour votre profil');
        return { success: false };
      }
      
      // Mettre à jour le profil
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Rafraîchir les données du profil dans le contexte
      await refreshUserProfile();
      
      toast.success('Profil mis à jour avec succès');
      return { success: true, data };
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      toast.error(err.message || 'Erreur lors de la mise à jour du profil');
      return { success: false, error: err };
    } finally {
      setUpdating(false);
    }
  }, [refreshUserProfile]);

  return { 
    profile: userProfile, 
    loading: isLoading, 
    error, 
    updateProfile,
    refreshUserProfile
  };
}
