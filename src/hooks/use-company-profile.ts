
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyProfile } from '@/types/invoice';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export function useCompanyProfile() {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { isAuthenticated, user } = useAuth();

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setCompanyProfile(data as CompanyProfile);
        
        // Mise à jour du localStorage pour maintenir la compatibilité avec le reste de l'app
        localStorage.setItem('companyProfile', JSON.stringify(data));
      } else {
        // Si aucun profil n'existe dans la base de données, vérifier s'il y en a un en local
        const localProfile = localStorage.getItem('companyProfile');
        if (localProfile) {
          // Profil local trouvé, essayer de le sauvegarder en base de données
          const parsedProfile = JSON.parse(localProfile);
          
          if (!parsedProfile.user_id) {
            parsedProfile.user_id = user.id;
          }
          
          await saveCompanyProfile(parsedProfile);
        }
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement du profil d\'entreprise:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const saveCompanyProfile = async (profile: CompanyProfile) => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated || !user?.id) {
        throw new Error('Vous devez être connecté pour enregistrer un profil d\'entreprise');
      }

      // S'assurer que le profil est associé à l'utilisateur actuel
      profile.user_id = user.id;
      
      let result;
      if (profile.id) {
        // Mise à jour d'un profil existant
        const { data, error: updateError } = await supabase
          .from('companies')
          .update(profile)
          .eq('id', profile.id)
          .eq('user_id', user.id) // S'assurer que l'utilisateur ne modifie que son propre profil
          .select()
          .single();

        if (updateError) throw updateError;
        result = data;
      } else {
        // Création d'un nouveau profil
        const { data, error: insertError } = await supabase
          .from('companies')
          .insert(profile)
          .select()
          .single();

        if (insertError) throw insertError;
        result = data;
      }

      // Mettre à jour l'état local et le localStorage
      setCompanyProfile(result as CompanyProfile);
      localStorage.setItem('companyProfile', JSON.stringify(result));
      
      return { success: true, data: result };
    } catch (err: any) {
      console.error('Erreur lors de l\'enregistrement du profil d\'entreprise:', err);
      setError(err);
      
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCompanyProfile();
    }
  }, [isAuthenticated, user?.id]);

  return { 
    companyProfile, 
    loading, 
    error, 
    saveCompanyProfile,
    refreshProfile: fetchCompanyProfile 
  };
}
