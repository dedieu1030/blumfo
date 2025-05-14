
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [connectionIssue, setConnectionIssue] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchProfileWithRetry = async (retryCount = 0, maxRetries = 3) => {
      try {
        setLoading(true);
        console.log(`Tentative de chargement du profil ${retryCount + 1}/${maxRetries + 1}`);
        
        // Vérifier si l'utilisateur est connecté via Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          console.log('Aucun utilisateur connecté');
          setLoading(false);
          return;
        }
        
        const userId = session.user.id;
        console.log('User ID:', userId);
        
        // Récupérer le profil de l'utilisateur
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          
          if (error.code === 'PGRST116' || error.code === '42P01') { // No rows found OU table doesn't exist
            console.log('Aucun profil trouvé ou table manquante');
            
            if (error.code === '42P01') {
              console.error('La table profiles n\'existe pas dans la base de données');
              setConnectionIssue(true);
              setError(new Error('La table profiles n\'existe pas dans la base de données'));
              setLoading(false);
              return;
            }
            
            // Créer un profil minimal basé sur les données d'authentification
            const minimalProfile: UserProfile = {
              id: userId,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Utilisateur',
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
            setProfileExists(false);
            setLoading(false);
            
            try {
              // Tenter de créer le profil dans la base de données
              const { error: insertError } = await supabase
                .from('profiles')
                .insert(minimalProfile);
              
              if (insertError) {
                console.warn('Impossible de créer le profil:', insertError);
                toast.error('Impossible de créer votre profil. Certaines fonctionnalités seront limitées.');
              } else {
                console.log('Profil utilisateur créé avec succès');
                toast.success('Profil utilisateur créé avec succès');
                setProfileExists(true);
              }
            } catch (insertErr) {
              console.error('Exception lors de la création du profil:', insertErr);
            }
          } else if (retryCount < maxRetries) {
            console.log(`Erreur lors du chargement du profil, tentative ${retryCount + 1}/${maxRetries}:`, error);
            setTimeout(() => fetchProfileWithRetry(retryCount + 1, maxRetries), 1000);
            return;
          } else {
            console.error('Erreur persistante lors du chargement du profil:', error);
            setError(error);
            setConnectionIssue(true);
            toast.error('Impossible de charger votre profil après plusieurs tentatives.');
          }
        } else if (data) {
          console.log('Profil récupéré avec succès:', data);
          setProfile(data as UserProfile);
          setProfileExists(true);
        }
      } catch (err) {
        console.error('Erreur inattendue:', err);
        setError(err as Error);
        setConnectionIssue(true);
        
        if (retryCount < maxRetries) {
          console.log(`Nouvelle tentative ${retryCount + 1}/${maxRetries} dans 1 seconde...`);
          setTimeout(() => fetchProfileWithRetry(retryCount + 1, maxRetries), 1000);
          return;
        } else {
          toast.error('Erreur de connexion. Veuillez réessayer plus tard.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileWithRetry();
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

  return { 
    profile, 
    loading, 
    error, 
    updateProfile, 
    profileExists, 
    connectionIssue 
  };
}
