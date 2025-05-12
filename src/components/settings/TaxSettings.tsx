
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CompanyProfile } from "@/types/invoice";
import { TaxRateSelector } from "@/components/settings/TaxRateSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { taxRegions, getTaxRegionById, getRegionData } from "@/data/taxData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { RegionSelector } from "@/components/settings/RegionSelector";
import { ChevronRight } from "lucide-react";

interface TaxSettingsProps {
  companyProfile: CompanyProfile | null;
  onSave: (data: CompanyProfile) => void;
}

export function TaxSettings({ companyProfile, onSave }: TaxSettingsProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<"manual" | "region">("manual");
  const [isRegionSelectorOpen, setIsRegionSelectorOpen] = useState(false);
  
  // Taxe manuelle
  const [manualTaxRate, setManualTaxRate] = useState<number>(20);
  
  // Taxe par région
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [availableRegions, setAvailableRegions] = useState<any[]>([]);
  const [regionTaxRate, setRegionTaxRate] = useState<number | null>(null);

  useEffect(() => {
    if (companyProfile) {
      // Ensure taxRate is a number
      const taxRate = typeof companyProfile.taxRate === 'string' 
        ? parseFloat(companyProfile.taxRate)
        : companyProfile.taxRate;
      
      setManualTaxRate(taxRate);
      
      // Si des informations fiscales par région sont déjà configurées
      if (companyProfile.taxRegion && companyProfile.taxRegionCode) {
        setSelectedCountry(companyProfile.taxRegion);
        setSelectedRegion(companyProfile.taxRegionCode);
        setActiveTab("region");
        
        // Charger les régions disponibles
        const country = getTaxRegionById(companyProfile.taxRegion);
        if (country) {
          setAvailableRegions(country.regions);
          
          // Trouver le taux pour cette région
          const regionData = getRegionData(companyProfile.taxRegion, companyProfile.taxRegionCode);
          if (regionData) {
            setRegionTaxRate(regionData.totalRate);
          }
        }
      }
    }
  }, [companyProfile]);

  // Mettre à jour les régions disponibles lorsque le pays change
  useEffect(() => {
    if (selectedCountry) {
      const country = getTaxRegionById(selectedCountry);
      if (country) {
        setAvailableRegions(country.regions);
        setSelectedRegion(""); // Réinitialiser la région sélectionnée
        setRegionTaxRate(null);
      }
    } else {
      setAvailableRegions([]);
      setSelectedRegion("");
      setRegionTaxRate(null);
    }
  }, [selectedCountry]);

  // Mettre à jour le taux de taxe lorsque la région change
  useEffect(() => {
    if (selectedCountry && selectedRegion) {
      const regionData = getRegionData(selectedCountry, selectedRegion);
      if (regionData) {
        setRegionTaxRate(regionData.totalRate);
      }
    }
  }, [selectedRegion, selectedCountry]);

  // Gestion du select du pays
  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedRegion("");
    setRegionTaxRate(null);
  };

  // Gestion du select de la région
  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
  };

  // Ouvrir le sélecteur de régions (mobile)
  const openRegionSelector = () => {
    setIsRegionSelectorOpen(true);
  };

  const handleUpdate = async () => {
    if (!companyProfile) return;
    
    let updatedProfile: CompanyProfile;
    
    if (activeTab === "manual") {
      updatedProfile = {
        ...companyProfile,
        taxRate: manualTaxRate,
        // Supprimer les informations de région si on utilise le mode manuel
        taxRegion: undefined,
        taxRegionCode: undefined
      };
    } else {
      if (!selectedCountry || !selectedRegion || regionTaxRate === null) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner une région fiscale complète.",
          variant: "destructive"
        });
        return;
      }
      
      updatedProfile = {
        ...companyProfile,
        taxRate: regionTaxRate,
        taxRegion: selectedCountry,
        taxRegionCode: selectedRegion
      };
    }
    
    onSave(updatedProfile);
    
    toast({
      title: "Taux de TVA enregistré",
      description: "Le taux de TVA a été mis à jour avec succès."
    });
  };
  
  // Obtenir le nom de la région sélectionnée pour l'affichage mobile
  const getSelectedRegionName = () => {
    if (!selectedCountry) return "Sélectionnez un pays";
    
    const country = getTaxRegionById(selectedCountry);
    if (!country) return "Sélectionnez un pays";
    
    if (!selectedRegion) return country.name;
    
    const region = getRegionData(selectedCountry, selectedRegion);
    return region ? `${country.name} - ${region.name}` : country.name;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Taux de TVA par défaut</CardTitle>
        <CardDescription>
          Ce taux sera appliqué par défaut à toutes vos factures.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs 
          defaultValue={activeTab} 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as "manual" | "region")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="manual">Saisie manuelle</TabsTrigger>
            <TabsTrigger value="region">Par région</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="pt-4">
            <div className="space-y-2">
              <TaxRateSelector
                defaultValue={manualTaxRate}
                onChange={setManualTaxRate}
                showLabel={true}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="region" className="space-y-4 pt-4">
            {isMobile ? (
              // Version mobile
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile-tax-region">Région fiscale</Label>
                  <Button 
                    variant="outline" 
                    className="w-full flex justify-between items-center h-10 px-3 py-2"
                    onClick={openRegionSelector}
                    id="mobile-tax-region"
                  >
                    <span className="text-left truncate">
                      {getSelectedRegionName()}
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Button>
                </div>
                
                <RegionSelector 
                  isOpen={isRegionSelectorOpen}
                  onClose={() => setIsRegionSelectorOpen(false)}
                  selectedCountry={selectedCountry}
                  selectedRegion={selectedRegion}
                  onSelectCountry={handleCountryChange}
                  onSelectRegion={handleRegionChange}
                />
              </div>
            ) : (
              // Version desktop
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-country">Pays / Région fiscale</Label>
                  <Select 
                    value={selectedCountry} 
                    onValueChange={handleCountryChange}
                  >
                    <SelectTrigger id="tax-country">
                      <SelectValue placeholder="Sélectionnez un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {taxRegions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedCountry && availableRegions.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="tax-region">Juridiction fiscale</Label>
                    <Select 
                      value={selectedRegion} 
                      onValueChange={handleRegionChange}
                      disabled={!selectedCountry}
                    >
                      <SelectTrigger id="tax-region">
                        <SelectValue placeholder="Sélectionnez une région" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {availableRegions.map((region) => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name} ({region.totalRate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
            
            {regionTaxRate !== null && (
              <div className="pt-2 pb-2">
                <div className="bg-muted p-4 rounded-md">
                  <p className="font-medium">Taux de TVA appliqué: {regionTaxRate}%</p>
                  {selectedRegion && selectedCountry && getRegionData(selectedCountry, selectedRegion)?.notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {getRegionData(selectedCountry, selectedRegion)?.notes}
                    </p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate}>
          Enregistrer
        </Button>
      </CardFooter>
    </Card>
  );
}
