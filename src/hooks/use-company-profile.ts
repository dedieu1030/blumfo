
import { useState, useEffect } from 'react';
import { CompanyProfile } from '@/types/invoice';
import { supabase } from '@/integrations/supabase/client';

export function useCompanyProfile() {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les données du profil d'entreprise depuis localStorage ou Supabase
  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      // Tenter d'abord de récupérer depuis localStorage pour la compatibilité
      const savedProfile = localStorage.getItem('companyProfile');
      
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile);
        setCompanyProfile(profileData);
      } else {
        // Si pas dans localStorage, essayer Supabase
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .limit(1)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Construire l'objet CompanyProfile à partir des données Supabase
          const profile: CompanyProfile = {
            id: data.id,
            name: data.company_name,
            address: data.address || '',
            email: data.email || '',
            phone: data.phone || '',
            // Conversion du tax_configuration en structure attendue par le front-end
            taxRate: data.tax_configuration?.defaultTaxRate ? parseFloat(data.tax_configuration.defaultTaxRate) : 20,
            taxRegion: data.tax_configuration?.region || '',
            taxConfiguration: data.tax_configuration,
            // Autres champs existants
            // ... garder le reste du code de conversion
          };
          
          setCompanyProfile(profile);
          // Stocker aussi dans localStorage pour une utilisation plus rapide
          localStorage.setItem('companyProfile', JSON.stringify(profile));
        }
      }
    } catch (e) {
      console.error("Erreur lors du chargement du profil:", e);
      setError(`Une erreur s'est produite lors du chargement du profil.`);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder le profil d'entreprise dans localStorage et Supabase
  const saveProfile = async (profile: CompanyProfile) => {
    try {
      // Sauvegarder dans localStorage
      localStorage.setItem('companyProfile', JSON.stringify(profile));
      
      // Préparer les données pour Supabase
      const companyData = {
        company_name: profile.name,
        address: profile.address,
        email: profile.email,
        phone: profile.phone,
        // Stocker la configuration de taxe dans le champ JSONB
        tax_configuration: profile.taxConfiguration || {
          defaultTaxRate: profile.taxRate.toString(),
          region: profile.taxRegion || '',
          customTax: profile.taxConfiguration?.customTax
        }
        // Autres champs à synchroniser...
      };
      
      // Mettre à jour dans Supabase si un ID existe
      if (profile.id) {
        await supabase
          .from('companies')
          .update(companyData)
          .eq('id', profile.id);
      } else {
        // Créer un nouveau profil si aucun ID n'existe
        const { data, error } = await supabase
          .from('companies')
          .insert([companyData])
          .select();
          
        if (error) throw error;
        
        // Mettre à jour l'ID local si un nouveau profil a été créé
        if (data && data.length > 0) {
          const updatedProfile = { ...profile, id: data[0].id };
          setCompanyProfile(updatedProfile);
          localStorage.setItem('companyProfile', JSON.stringify(updatedProfile));
        }
      }
      
      // Mettre à jour l'état local
      setCompanyProfile(profile);
      return { success: true };
    } catch (e) {
      console.error("Erreur lors de la sauvegarde du profil:", e);
      return { 
        success: false, 
        error: `Une erreur s'est produite lors de la sauvegarde du profil.`
      };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    companyProfile,
    loading,
    error,
    fetchProfile,
    saveProfile
  };
}
