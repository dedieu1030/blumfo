
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { CompanyProfile } from "@/types/invoice";
import { TaxConfiguration, TaxRegionData } from "@/types/tax";
import { canadaTaxRegions, taxRegions, getTaxRegionById, getRegionData, getTaxTypeLabel } from "@/data/taxData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

interface TaxSettingsProps {
  companyProfile?: CompanyProfile;
}

interface TaxFormValues {
  country: string;
  region?: string;
  defaultTaxRate: string;
}

export function TaxSettings({ companyProfile }: TaxSettingsProps) {
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState<string>("none");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(
    companyProfile?.taxRate ? parseFloat(companyProfile.taxRate) : 20
  );

  // Récupérer les configurations fiscales du localStorage
  useEffect(() => {
    const savedTaxConfig = localStorage.getItem('taxConfiguration');
    if (savedTaxConfig) {
      try {
        const config = JSON.parse(savedTaxConfig) as TaxConfiguration;
        setSelectedCountry(config.country || "none");
        setSelectedRegion(config.region || "");
        
        // Si une région est sélectionnée, mettre à jour le taux de taxe par défaut
        if (config.country && config.region) {
          const regionData = getRegionData(config.country, config.region);
          if (regionData) {
            // Utiliser le taux de la région s'il est disponible
            setDefaultTaxRate(regionData.totalRate);
          }
        }
        
        // Toujours conserver la valeur explicite sauvegardée si elle existe
        if (config.defaultTaxRate) {
          setDefaultTaxRate(parseFloat(config.defaultTaxRate));
        }
      } catch (e) {
        console.error("Erreur lors du parsing de la configuration fiscale", e);
      }
    }
  }, []);

  const form = useForm<TaxFormValues>({
    defaultValues: {
      country: selectedCountry,
      region: selectedRegion,
      defaultTaxRate: defaultTaxRate.toString()
    }
  });

  // Mettre à jour les valeurs du formulaire quand les états changent
  useEffect(() => {
    form.setValue("country", selectedCountry);
    form.setValue("region", selectedRegion);
    form.setValue("defaultTaxRate", defaultTaxRate.toString());
  }, [selectedCountry, selectedRegion, defaultTaxRate, form]);

  const onSubmit = (data: TaxFormValues) => {
    // Convertir string en number pour le taux de taxe
    const numericTaxRate = parseFloat(data.defaultTaxRate);
    
    // Vérifier si la valeur est un nombre valide
    if (isNaN(numericTaxRate)) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un taux de TVA valide"
      });
      return;
    }
    
    // Mettre à jour l'état avec la valeur numérique
    setDefaultTaxRate(numericTaxRate);
    
    // Sauvegarder la configuration fiscale
    const taxConfig: TaxConfiguration = {
      country: data.country,
      region: data.region,
      defaultTaxRate: numericTaxRate.toString()
    };
    
    localStorage.setItem('taxConfiguration', JSON.stringify(taxConfig));
    
    // Mettre à jour le profil de l'entreprise si disponible
    if (companyProfile) {
      localStorage.setItem('companyProfile', JSON.stringify({
        ...companyProfile,
        taxRate: numericTaxRate.toString()
      }));
    }
    
    toast({
      title: "Succès",
      description: "Configuration fiscale enregistrée"
    });
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedRegion(""); // Réinitialiser la région lorsqu'on change de pays
    
    // Réinitialiser le taux de taxe par défaut à la valeur générique
    if (value === "none") {
      setDefaultTaxRate(companyProfile?.taxRate ? parseFloat(companyProfile.taxRate) : 20);
    }
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    
    // Mettre à jour le taux de taxe basé sur la région sélectionnée
    if (selectedCountry && value) {
      const regionData = getRegionData(selectedCountry, value);
      if (regionData) {
        setDefaultTaxRate(regionData.totalRate);
      }
    }
  };

  // Obtenir les données de région pour le pays sélectionné
  const countryData = selectedCountry !== "none" ? getTaxRegionById(selectedCountry) : undefined;

  // Déterminer le libellé de la région en fonction du pays sélectionné
  const getRegionLabel = () => {
    switch (selectedCountry) {
      case 'canada':
        return 'Province / Territoire';
      case 'usa':
        return 'État';
      case 'mexico':
        return 'Type d\'IVA';
      case 'eu':
        return 'Pays membre';
      default:
        return 'Région';
    }
  };

  // Obtenir le texte du placeholder pour la sélection de région
  const getRegionPlaceholder = () => {
    switch (selectedCountry) {
      case 'canada':
        return 'Sélectionnez une province';
      case 'usa':
        return 'Sélectionnez un état';
      case 'mexico':
        return 'Sélectionnez un taux d\'IVA';
      case 'eu':
        return 'Sélectionnez un pays membre';
      default:
        return 'Sélectionnez une région';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres de TVA</CardTitle>
        <CardDescription>Configurez vos paramètres de taxe par défaut selon votre région</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pays</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleCountryChange(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un pays" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Personnalisé (configurer manuellement)</SelectItem>
                        <SelectItem value="canada">Canada 🇨🇦</SelectItem>
                        <SelectItem value="usa">États-Unis 🇺🇸</SelectItem>
                        <SelectItem value="mexico">Mexique 🇲🇽</SelectItem>
                        <SelectItem value="eu">Union Européenne 🇪🇺</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Sélectionnez votre pays pour appliquer automatiquement les taxes appropriées.
                  </FormDescription>
                </FormItem>
              )}
            />

            {selectedCountry !== "none" && countryData && (
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getRegionLabel()}</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleRegionChange(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={getRegionPlaceholder()} />
                        </SelectTrigger>
                        <SelectContent>
                          {countryData.regions.map((region) => (
                            <SelectItem key={region.id} value={region.id}>
                              {region.name} ({region.code}) - {region.totalRate}%
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      {selectedCountry === 'canada' ? 'Sélectionnez votre province ou territoire.' : 
                       selectedCountry === 'usa' ? "Sélectionnez votre état." : 
                       selectedCountry === 'mexico' ? "Sélectionnez le type d'IVA applicable." :
                       selectedCountry === 'eu' ? "Sélectionnez votre pays membre de l'UE." :
                       'Sélectionnez votre région.'}
                    </FormDescription>
                  </FormItem>
                )}
              />
            )}

            {selectedRegion && selectedCountry !== "none" && (
              <div className="rounded-md bg-slate-50 p-4 my-4">
                <h4 className="font-medium mb-2">Détails du système fiscal</h4>
                {(() => {
                  const region = getRegionData(selectedCountry, selectedRegion);
                  if (!region) return null;
                  
                  return (
                    <div className="space-y-2 text-sm">
                      <p><strong>Système: </strong> {getTaxTypeLabel(region.taxType)}</p>
                      
                      {/* Canadian tax rates */}
                      {region.gstRate !== undefined && (
                        <p><strong>TPS/GST: </strong> {region.gstRate}%</p>
                      )}
                      
                      {region.pstRate !== undefined && (
                        <p><strong>TVP/PST: </strong> {region.pstRate}%</p>
                      )}
                      
                      {region.qstRate !== undefined && (
                        <p><strong>TVQ/QST: </strong> {region.qstRate}%</p>
                      )}
                      
                      {region.hstRate !== undefined && (
                        <p><strong>TVH/HST: </strong> {region.hstRate}%</p>
                      )}
                      
                      {/* US tax rates */}
                      {region.stateTaxRate !== undefined && (
                        <p><strong>Taxe d'État: </strong> {region.stateTaxRate}%</p>
                      )}
                      
                      {region.localTaxRate !== undefined && region.localTaxRate > 0 && (
                        <p><strong>Taxe locale (moyenne): </strong> {region.localTaxRate}%</p>
                      )}
                      
                      {/* Mexican IVA tax rate */}
                      {region.ivaRate !== undefined && (
                        <p><strong>IVA: </strong> {region.ivaRate}%</p>
                      )}
                      
                      {/* EU VAT rates */}
                      {region.vatStandardRate !== undefined && (
                        <p><strong>TVA standard: </strong> {region.vatStandardRate}%</p>
                      )}
                      
                      {region.vatReducedRates && region.vatReducedRates.length > 0 && (
                        <p>
                          <strong>TVA réduite: </strong>
                          {region.vatReducedRates.join('%, ')}%
                        </p>
                      )}
                      
                      {region.vatSuperReducedRate !== undefined && (
                        <p><strong>TVA super-réduite: </strong> {region.vatSuperReducedRate}%</p>
                      )}
                      
                      {region.vatParkingRate !== undefined && (
                        <p><strong>TVA parking: </strong> {region.vatParkingRate}%</p>
                      )}
                      
                      <p><strong>Taux total: </strong> {region.totalRate}%</p>
                      
                      {region.notes && (
                        <p className="text-gray-500 italic">{region.notes}</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            <FormField
              control={form.control}
              name="defaultTaxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Taux de taxe par défaut (%)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="h-4 w-4 text-slate-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          {selectedCountry !== "none" && selectedRegion
                            ? "Ce taux est automatiquement configuré selon votre région. Vous pouvez le personnaliser si nécessaire."
                            : "Ce taux sera appliqué par défaut sur vos nouvelles factures."
                          }
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      min="0"
                      max="100"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Ce taux sera appliqué par défaut sur vos nouvelles factures.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="bg-violet hover:bg-violet/90">
              Enregistrer
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
