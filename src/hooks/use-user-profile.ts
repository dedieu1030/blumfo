
import { useState, useEffect } from 'react';
import { supabase, tableExists } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw sessionError;
        }

        if (!session || !session.user) {
          console.log("Aucun utilisateur connecté");
          setLoading(false);
          return;
        }
        
        const userId = session.user.id;
        
        // Vérifier si la table profiles existe avant de faire la requête
        const profilesExist = await tableExists('profiles');
        if (!profilesExist) {
          console.error("La table profiles n'existe pas ou n'est pas accessible");
          setLoading(false);
          return;
        }

        // Récupérer le profil de l'utilisateur
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = No rows found
          throw profileError;
        }
        
        if (data) {
          setProfile(data as UserProfile);
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw sessionError;
      }

      if (!session || !session.user) {
        toast.error('Vous devez être connecté pour mettre à jour votre profil');
        return { success: false };
      }
      
      const userId = session.user.id;
      
      // Vérifier si la table profiles existe avant de faire la requête
      const profilesExist = await tableExists('profiles');
      if (!profilesExist) {
        toast.error("Impossible d'accéder à votre profil");
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
