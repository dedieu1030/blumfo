
import { supabase } from "@/integrations/supabase/client";
import { TaxConfiguration, TaxRate, TaxType } from "@/types/tax";
import { toast } from "sonner";

// Récupérer toutes les configurations fiscales de l'utilisateur
export const getTaxConfigurations = async (): Promise<TaxConfiguration[]> => {
  try {
    const { data: configurations, error: configError } = await supabase
      .from("tax_configurations")
      .select("*")
      .order("is_default", { ascending: false })
      .order("name");
    
    if (configError) throw configError;
    
    const taxConfigs: TaxConfiguration[] = [];
    
    for (const config of configurations) {
      // Pour chaque configuration, récupérer les taux de taxe associés
      const { data: taxRates, error: ratesError } = await supabase
        .from("tax_rates")
        .select("*")
        .eq("configuration_id", config.id)
        .order("display_order");
      
      if (ratesError) throw ratesError;
      
      taxConfigs.push({
        id: config.id,
        name: config.name,
        description: config.description,
        countryCode: config.country_code,
        regionCode: config.region_code,
        isDefault: config.is_default,
        taxRates: taxRates.map(rate => ({
          id: rate.id,
          name: rate.name,
          // Convert the string from DB to number for our code
          rate: parseFloat(rate.rate),
          taxType: rate.tax_type as TaxType,
          taxCode: rate.tax_code,
          description: rate.description,
          isCompound: rate.is_compound,
          displayOrder: rate.display_order
        }))
      });
    }
    
    return taxConfigs;
  } catch (error) {
    console.error("Erreur lors de la récupération des configurations fiscales:", error);
    toast.error("Impossible de charger les configurations fiscales");
    return [];
  }
};

// Récupérer une configuration fiscale spécifique
export const getTaxConfiguration = async (id: string): Promise<TaxConfiguration | null> => {
  try {
    const { data: config, error: configError } = await supabase
      .from("tax_configurations")
      .select("*")
      .eq("id", id)
      .single();
    
    if (configError) throw configError;
    
    const { data: taxRates, error: ratesError } = await supabase
      .from("tax_rates")
      .select("*")
      .eq("configuration_id", id)
      .order("display_order");
    
    if (ratesError) throw ratesError;
    
    return {
      id: config.id,
      name: config.name,
      description: config.description,
      countryCode: config.country_code,
      regionCode: config.region_code,
      isDefault: config.is_default,
      taxRates: taxRates.map(rate => ({
        id: rate.id,
        name: rate.name,
        // Convert the string from DB to number for our code
        rate: parseFloat(rate.rate),
        taxType: rate.tax_type as TaxType,
        taxCode: rate.tax_code,
        description: rate.description,
        isCompound: rate.is_compound,
        displayOrder: rate.display_order
      }))
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la configuration fiscale:", error);
    toast.error("Impossible de charger la configuration fiscale");
    return null;
  }
};

// Créer une nouvelle configuration fiscale
export const createTaxConfiguration = async (config: Omit<TaxConfiguration, 'id'>): Promise<string | null> => {
  try {
    // Insérer la configuration
    const { data, error } = await supabase
      .from("tax_configurations")
      .insert({
        name: config.name,
        description: config.description,
        country_code: config.countryCode,
        region_code: config.regionCode,
        is_default: config.isDefault
      })
      .select("id")
      .single();
    
    if (error) throw error;
    
    // Insérer les taux de taxe associés
    if (config.taxRates?.length > 0) {
      // Create properly typed array for database insertion
      const taxRatesData = config.taxRates.map(rate => ({
        configuration_id: data.id,
        name: rate.name,
        // Convert number to string for DB - this is the key fix
        rate: rate.rate.toString(),
        tax_type: rate.taxType,
        tax_code: rate.taxCode,
        description: rate.description,
        is_compound: rate.isCompound,
        display_order: rate.displayOrder
      }));
      
      // Convert to type expected by Supabase
      const { error: ratesError } = await supabase
        .from("tax_rates")
        .insert(taxRatesData as any);
      
      if (ratesError) throw ratesError;
    }
    
    toast.success("Configuration fiscale créée avec succès");
    return data.id;
  } catch (error) {
    console.error("Erreur lors de la création de la configuration fiscale:", error);
    toast.error("Erreur lors de la création de la configuration fiscale");
    return null;
  }
};

// Mettre à jour une configuration fiscale existante
export const updateTaxConfiguration = async (config: TaxConfiguration): Promise<boolean> => {
  try {
    // Mettre à jour la configuration
    const { error } = await supabase
      .from("tax_configurations")
      .update({
        name: config.name,
        description: config.description,
        country_code: config.countryCode,
        region_code: config.regionCode,
        is_default: config.isDefault,
        updated_at: new Date().toISOString()
      })
      .eq("id", config.id);
    
    if (error) throw error;
    
    // Supprimer les anciens taux de taxe
    const { error: deleteError } = await supabase
      .from("tax_rates")
      .delete()
      .eq("configuration_id", config.id);
    
    if (deleteError) throw deleteError;
    
    // Insérer les nouveaux taux de taxe
    if (config.taxRates?.length > 0) {
      // Create properly typed array for database insertion
      const taxRatesData = config.taxRates.map(rate => ({
        configuration_id: config.id,
        name: rate.name,
        // Convert number to string for DB - this is the key fix
        rate: rate.rate.toString(),
        tax_type: rate.taxType,
        tax_code: rate.taxCode,
        description: rate.description,
        is_compound: rate.isCompound,
        display_order: rate.displayOrder
      }));
      
      // Convert to type expected by Supabase
      const { error: insertError } = await supabase
        .from("tax_rates")
        .insert(taxRatesData as any);
      
      if (insertError) throw insertError;
    }
    
    toast.success("Configuration fiscale mise à jour avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la configuration fiscale:", error);
    toast.error("Erreur lors de la mise à jour de la configuration fiscale");
    return false;
  }
};

// Supprimer une configuration fiscale
export const deleteTaxConfiguration = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("tax_configurations")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
    
    toast.success("Configuration fiscale supprimée avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de la configuration fiscale:", error);
    toast.error("Erreur lors de la suppression de la configuration fiscale");
    return false;
  }
};

// Définir une configuration comme celle par défaut
export const setDefaultTaxConfiguration = async (id: string): Promise<boolean> => {
  try {
    // D'abord, mettre tous les isDefault à false
    const { error: resetError } = await supabase
      .from("tax_configurations")
      .update({ is_default: false, updated_at: new Date().toISOString() })
      .neq("id", id);
    
    if (resetError) throw resetError;
    
    // Ensuite, définir celui-ci comme défaut
    const { error } = await supabase
      .from("tax_configurations")
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq("id", id);
    
    if (error) throw error;
    
    toast.success("Configuration fiscale définie par défaut");
    return true;
  } catch (error) {
    console.error("Erreur lors de la définition de la configuration par défaut:", error);
    toast.error("Erreur lors de la mise à jour de la configuration par défaut");
    return false;
  }
};

// Récupérer la configuration fiscale par défaut
export const getDefaultTaxConfiguration = async (): Promise<TaxConfiguration | null> => {
  try {
    const { data, error } = await supabase
      .from("tax_configurations")
      .select("*")
      .eq("is_default", true)
      .single();
    
    if (error) throw error;
    
    const { data: taxRates, error: ratesError } = await supabase
      .from("tax_rates")
      .select("*")
      .eq("configuration_id", data.id)
      .order("display_order");
    
    if (ratesError) throw ratesError;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      countryCode: data.country_code,
      regionCode: data.region_code,
      isDefault: data.is_default,
      taxRates: taxRates.map(rate => ({
        id: rate.id,
        name: rate.name,
        // Convert the string from DB to number for our code
        rate: parseFloat(rate.rate),
        taxType: rate.tax_type as TaxType,
        taxCode: rate.tax_code,
        description: rate.description,
        isCompound: rate.is_compound,
        displayOrder: rate.display_order
      }))
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la configuration fiscale par défaut:", error);
    // Ne pas afficher de toast ici, car cela pourrait être une action attendue
    return null;
  }
};

// Récupérer les configurations fiscales par pays
export const getTaxConfigurationsByCountry = async (countryCode: string): Promise<TaxConfiguration[]> => {
  try {
    const { data: configurations, error } = await supabase
      .from("tax_configurations")
      .select("*")
      .eq("country_code", countryCode)
      .order("region_code");
    
    if (error) throw error;
    
    const taxConfigs: TaxConfiguration[] = [];
    
    for (const config of configurations) {
      const { data: taxRates, error: ratesError } = await supabase
        .from("tax_rates")
        .select("*")
        .eq("configuration_id", config.id)
        .order("display_order");
      
      if (ratesError) throw ratesError;
      
      taxConfigs.push({
        id: config.id,
        name: config.name,
        description: config.description,
        countryCode: config.country_code,
        regionCode: config.region_code,
        isDefault: config.is_default,
        taxRates: taxRates.map(rate => ({
          id: rate.id,
          name: rate.name,
          // Convert the string from DB to number for our code
          rate: parseFloat(rate.rate),
          taxType: rate.tax_type as TaxType,
          taxCode: rate.tax_code,
          description: rate.description,
          isCompound: rate.is_compound,
          displayOrder: rate.display_order
        }))
      });
    }
    
    return taxConfigs;
  } catch (error) {
    console.error("Erreur lors de la récupération des configurations fiscales par pays:", error);
    return [];
  }
};
