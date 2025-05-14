
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);

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
        
        try {
          // Vérifier si la table profiles existe
          const { error: tableCheckError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1)
            .single();
            
          if (tableCheckError && tableCheckError.code === '42P01') {
            // La table n'existe pas
            console.log('La table profiles n\'existe pas encore');
            setProfileExists(false);
            
            // Créer un profil minimal basé sur les données d'authentification
            const minimalProfile: UserProfile = {
              id: userId,
              full_name: session.user.user_metadata?.full_name || 'Utilisateur',
              email: session.user.email || '',
              language: 'fr',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              notification_settings: {
                email: true,
                push: true,
                sms: false
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            setProfile(minimalProfile);
            setLoading(false);
            return;
          }
          
          setProfileExists(true);
          
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
          }
        } catch (err) {
          console.error('Erreur lors du chargement du profil:', err);
          setError(err as Error);
        }
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
      updates.updated_at = new Date().toISOString();
      
      // Si la table profiles n'existe pas, on met à jour le profil local uniquement
      if (profileExists === false) {
        const updatedProfile = { ...profile, ...updates } as UserProfile;
        setProfile(updatedProfile);
        toast.success('Profil mis à jour avec succès');
        return { success: true, data: updatedProfile };
      }
      
      // Mettre à jour le profil dans la base de données
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

  return { profile, loading, error, updateProfile, profileExists };
}
