
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [sessionChecked, setSessionChecked] = useState<boolean>(false);

  // Fonction pour récupérer le profil utilisateur
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Vérifier si l'utilisateur est connecté via Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Gestion des erreurs de session
      if (sessionError) {
        console.error('Erreur de session:', sessionError);
        setError(sessionError);
        setSessionChecked(true);
        return;
      }

      // Si pas de session, on arrête
      if (!session || !session.user) {
        console.log('Aucune session utilisateur active');
        setSessionChecked(true);
        setLoading(false);
        return;
      }
      
      const userId = session.user.id;
      console.log('Session utilisateur trouvée avec ID:', userId);
      
      // Récupérer le profil de l'utilisateur
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
          
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Profil non trouvé, création possible nécessaire');
        } else {
          console.error('Erreur lors de la récupération du profil:', error);
          setError(error);
        }
      } else if (data) {
        console.log('Profil récupéré avec succès');
        setProfile(data as UserProfile);
      }
    } catch (err: any) {
      console.error('Exception lors du chargement du profil:', err);
      setError(err);
    } finally {
      setSessionChecked(true);
      setLoading(false);
    }
  };
  
  // Effet pour configurer les listeners et charger le profil
  useEffect(() => {
    console.log('Initialisation du hook useUserProfile');

    // Configurer un listener pour les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Événement auth détecté:', event);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('Utilisateur connecté ou token rafraîchi, chargement du profil');
          fetchProfile();
        } else if (event === 'SIGNED_OUT') {
          console.log('Utilisateur déconnecté');
          setProfile(null);
          setSessionChecked(true);
        }
      }
    );
    
    // Charger le profil au montage
    fetchProfile();
    
    return () => {
      console.log('Nettoyage du hook useUserProfile');
      subscription.unsubscribe();
    };
  }, []);

  // Fonction pour mettre à jour le profil utilisateur
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

  // On expose également si la session a été vérifiée pour aider à la gestion des états
  return { profile, loading, error, updateProfile, sessionChecked };
}
