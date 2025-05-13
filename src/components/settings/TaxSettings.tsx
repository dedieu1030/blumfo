
import { useState, useEffect } from "react";
import { CompanyProfile } from "@/types/invoice";
import { RegionalTaxSelector } from "./RegionalTaxSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CustomTaxConfiguration, TaxConfiguration } from "@/types/tax";

interface TaxSettingsProps {
  companyProfile: CompanyProfile | null;
  onSave: (updatedProfile: CompanyProfile) => void;
}

export function TaxSettings({ companyProfile, onSave }: TaxSettingsProps) {
  const { toast } = useToast();
  const [taxRate, setTaxRate] = useState<number>(20); // Taux par défaut: 20%
  const [taxRegion, setTaxRegion] = useState<string | undefined>(undefined);
  const [customTax, setCustomTax] = useState<CustomTaxConfiguration | undefined>(undefined);
  
  // Initialiser avec les valeurs existantes si disponibles
  useEffect(() => {
    if (companyProfile?.taxConfiguration) {
      const config = companyProfile.taxConfiguration;
      
      // Récupérer le taux de TVA
      setTaxRate(config.rate !== undefined ? config.rate : 
                (config.defaultTaxRate ? parseFloat(config.defaultTaxRate) : 20));
      
      // Récupérer la région
      setTaxRegion(config.regionKey || config.region);
      
      // Récupérer la configuration personnalisée
      if (config.customConfig || config.customTax) {
        const custom = config.customConfig || config.customTax;
        if (custom) {
          // Ensure the CustomTaxConfiguration has all required fields
          const completeCustomTax: CustomTaxConfiguration = {
            name: custom.name,
            rate: custom.rate,
            country: custom.country,
            countryName: custom.countryName,
            taxType: custom.taxType,
            mainRate: custom.mainRate || custom.rate,
            additionalRates: custom.additionalRates || []
          };
          setCustomTax(completeCustomTax);
        }
      }
    } else if (companyProfile?.taxRate) {
      // Utiliser le taux de TVA existant s'il n'y a pas encore de configuration complète
      setTaxRate(companyProfile.taxRate);
      setTaxRegion(companyProfile.taxRegion);
    }
  }, [companyProfile]);

  // Gérer le changement de taux de TVA
  const handleTaxRateChange = (
    value: number, 
    regionKey?: string, 
    customConfig?: CustomTaxConfiguration
  ) => {
    setTaxRate(value);
    setTaxRegion(regionKey);
    setCustomTax(customConfig);
  };

  // Enregistrer les paramètres de TVA
  const handleSave = () => {
    if (!companyProfile) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord créer un profil avant de configurer la TVA.",
        variant: "destructive",
      });
      return;
    }

    const updatedConfiguration: TaxConfiguration = {
      type: customTax ? 'custom' : 'region',
      regionKey: taxRegion,
      customConfig: customTax,
      rate: taxRate,
      // Rétrocompatibilité pour les fonctions existantes
      defaultTaxRate: taxRate.toString(),
      region: taxRegion || "",
      country: companyProfile.country || "FR",
      customTax: customTax
    };

    const updatedProfile: CompanyProfile = {
      ...companyProfile,
      taxRate: taxRate, // Mise à jour du champ taxRate existant pour la compatibilité
      taxRegion: taxRegion, // Mise à jour du champ taxRegion existant pour la compatibilité
      taxConfiguration: updatedConfiguration, // Nouvelle structure
    };

    onSave(updatedProfile);

    toast({
      title: "Configuration de TVA enregistrée",
      description: `Le taux de TVA par défaut est maintenant ${taxRate}%.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration de la TVA</CardTitle>
        <CardDescription>
          Définissez le taux de TVA par défaut pour vos factures
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <RegionalTaxSelector
            defaultValue={taxRate}
            onChange={handleTaxRateChange}
            defaultRegion={taxRegion}
            defaultCustomTax={customTax}
          />
        </div>

        <Button onClick={handleSave} className="w-full">
          Enregistrer les paramètres de TVA
        </Button>
      </CardContent>
    </Card>
  );
}
