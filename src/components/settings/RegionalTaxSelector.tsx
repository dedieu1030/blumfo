import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, Settings, Search, ArrowLeft } from "lucide-react";
import { TaxZone, TaxCountry, TaxRegionData } from "@/types/tax";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { TaxRateSelector } from "./TaxRateSelector";
import { formatTaxRate } from "@/lib/utils";

// Récupération des données de taxe depuis le fichier de données
import { taxZonesData } from "@/data/taxData";

// Définir les niveaux de navigation possibles
type NavigationLevel = "zones" | "countries" | "regions";

interface RegionalTaxSelectorProps {
  defaultValue: number | string;
  onChange: (value: number, regionKey?: string) => void;
  showLabel?: boolean;
  defaultRegion?: string;
}

export function RegionalTaxSelector({
  defaultValue = 20,
  onChange,
  showLabel = true,
  defaultRegion
}: RegionalTaxSelectorProps) {
  const isMobile = useIsMobile();
  const [selectedOption, setSelectedOption] = useState<string>("region");
  const [selectedRegion, setSelectedRegion] = useState<TaxRegionData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  // État pour la navigation hiérarchique
  const [navigationLevel, setNavigationLevel] = useState<NavigationLevel>("zones");
  const [selectedZone, setSelectedZone] = useState<TaxZone | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<TaxCountry | null>(null);
  
  // Initialiser avec la région par défaut si fournie
  useEffect(() => {
    if (defaultRegion) {
      const [zoneId, countryId, regionId] = defaultRegion.split(":");
      
      const zone = taxZonesData.find(z => z.id === zoneId);
      if (zone) {
        setSelectedZone(zone);
        
        const country = zone.countries.find(c => c.id === countryId);
        if (country) {
          setSelectedCountry(country);
          
          const region = country.regions.find(r => r.id === regionId);
          if (region) {
            setSelectedRegion(region);
            onChange(region.totalRate, `${zoneId}:${countryId}:${regionId}`);
          }
        }
      }
    }
  }, [defaultRegion, onChange]);

  // Déterminer le mode actif (TVA régionale ou personnalisée)
  useEffect(() => {
    // Si une valeur spécifique est définie et qu'aucune région n'est sélectionnée
    if (defaultValue !== undefined && !selectedRegion) {
      const numValue = typeof defaultValue === 'string' ? parseFloat(defaultValue) || 0 : defaultValue;
      
      // Vérifier si la valeur correspond à une région connue
      let found = false;
      taxZonesData.forEach(zone => {
        zone.countries.forEach(country => {
          country.regions.forEach(region => {
            if (Math.abs(region.totalRate - numValue) < 0.01) {
              setSelectedZone(zone);
              setSelectedCountry(country);
              setSelectedRegion(region);
              setSelectedOption("region");
              found = true;
            }
          });
        });
      });
      
      // Si aucune correspondance, c'est un taux personnalisé
      if (!found) {
        setSelectedOption("custom");
      }
    }
  }, [defaultValue, selectedRegion]);

  // Fonction pour gérer la sélection d'une zone fiscale
  const handleSelectZone = (zone: TaxZone) => {
    setSelectedZone(zone);
    setNavigationLevel("countries");
    setSearchValue("");
  };

  // Fonction pour gérer la sélection d'un pays
  const handleSelectCountry = (country: TaxCountry) => {
    setSelectedCountry(country);
    setNavigationLevel("regions");
    setSearchValue("");
  };

  // Fonction pour gérer la sélection d'une région fiscale
  const handleSelectRegion = (region: TaxRegionData) => {
    setSelectedRegion(region);
    setSelectedOption("region");
    
    if (selectedZone && selectedCountry) {
      onChange(region.totalRate, `${selectedZone.id}:${selectedCountry.id}:${region.id}`);
    }
    
    setIsSheetOpen(false);
  };

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    
    if (value === "custom") {
      // Garder la même valeur mais passer en mode personnalisé
      // La valeur sera gérée par le TaxRateSelector
    } else if (value === "region" && selectedRegion) {
      // Utiliser la valeur de la région sélectionnée
      if (selectedZone && selectedCountry) {
        onChange(selectedRegion.totalRate, `${selectedZone.id}:${selectedCountry.id}:${selectedRegion.id}`);
      }
    }
  };

  // Fonction pour fermer le sélecteur et réinitialiser l'état
  const closeSelector = () => {
    setIsSheetOpen(false);
    resetNavigation();
  };

  // Fonction pour réinitialiser la navigation
  const resetNavigation = () => {
    setNavigationLevel("zones");
    setSearchValue("");
  };

  // Fonction pour revenir au niveau précédent
  const navigateBack = () => {
    if (navigationLevel === "regions") {
      setNavigationLevel("countries");
      setSelectedCountry(null);
    } else if (navigationLevel === "countries") {
      setNavigationLevel("zones");
      setSelectedZone(null);
    }
    setSearchValue("");
  };

  const getTaxRateColor = (rate: number) => {
    if (rate <= 5) return "bg-green-100 text-green-800 hover:bg-green-200";
    if (rate <= 15) return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    return "bg-amber-100 text-amber-800 hover:bg-amber-200";
  };

  // Obtenir le titre en fonction du niveau de navigation
  const getNavigationTitle = () => {
    if (navigationLevel === "regions" && selectedCountry) {
      return selectedCountry.name;
    } else if (navigationLevel === "countries" && selectedZone) {
      return selectedZone.name;
    } else {
      return "Sélectionner une région fiscale";
    }
  };

  // Filtrer les éléments par recherche
  const getFilteredItems = () => {
    const searchLower = searchValue.toLowerCase();
    
    if (navigationLevel === "zones") {
      return taxZonesData.filter(zone => 
        searchValue === "" || zone.name.toLowerCase().includes(searchLower)
      );
    } else if (navigationLevel === "countries" && selectedZone) {
      return selectedZone.countries.filter(country => 
        searchValue === "" || country.name.toLowerCase().includes(searchLower)
      );
    } else if (navigationLevel === "regions" && selectedCountry) {
      return selectedCountry.regions.filter(region => 
        searchValue === "" || 
        region.name.toLowerCase().includes(searchLower) ||
        region.code.toLowerCase().includes(searchLower)
      );
    }
    
    return [];
  };

  // Ouvrir le sélecteur
  const openSelector = () => {
    setIsSheetOpen(true);
    resetNavigation();
  };

  // Rendu pour la version mobile
  const renderMobileSelector = () => (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        className="w-full justify-between"
        onClick={openSelector}
      >
        {selectedRegion 
          ? `${selectedRegion.name}`
          : "Sélectionner une région fiscale"}
        {selectedRegion && (
          <Badge className={`${getTaxRateColor(selectedRegion.totalRate)} ml-2 px-2 min-w-[50px] text-center`} variant="outline">
            {formatTaxRate(selectedRegion.totalRate)}%
          </Badge>
        )}
      </Button>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent 
          side="bottom" 
          className="h-[85%] max-h-[85vh]"
          hideCloseButton={navigationLevel !== "zones"}
        >
          <SheetHeader>
            <SheetTitle className="pr-8 text-lg flex justify-between items-center">
              {getNavigationTitle()}
              
              {navigationLevel !== "zones" && (
                <Button variant="ghost" size="sm" onClick={navigateBack}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Retour
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>
          
          <div className="py-4 space-y-4">
            {navigationLevel !== "zones" && (
              <div className="flex items-center space-x-2 sticky top-0 bg-background pt-2 pb-4 z-10">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            )}
            
            <ScrollArea className="h-[45vh]">
              <div className="space-y-2">
                {getFilteredItems().length > 0 ? (
                  navigationLevel === "zones" ? (
                    // Affichage des zones fiscales
                    getFilteredItems().map((zone) => (
                      <Button
                        key={zone.id}
                        variant="outline"
                        className="w-full justify-start h-12 text-left"
                        onClick={() => handleSelectZone(zone as TaxZone)}
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        {(zone as TaxZone).name}
                      </Button>
                    ))
                  ) : navigationLevel === "countries" ? (
                    // Affichage des pays d'une zone
                    getFilteredItems().map((country) => (
                      <Button
                        key={country.id}
                        variant="outline"
                        className="w-full justify-between h-12 text-left"
                        onClick={() => handleSelectCountry(country as TaxCountry)}
                      >
                        <span className="font-medium">{(country as TaxCountry).name}</span>
                        <span className="text-muted-foreground">{(country as TaxCountry).countryCode}</span>
                      </Button>
                    ))
                  ) : (
                    // Affichage des régions d'un pays
                    getFilteredItems().map((region) => (
                      <Button
                        key={region.id}
                        variant="outline"
                        className="w-full justify-between h-14 text-left"
                        onClick={() => handleSelectRegion(region as TaxRegionData)}
                      >
                        <span className="font-medium truncate mr-2 max-w-[65%]">{(region as TaxRegionData).name}</span>
                        <Badge className={`${getTaxRateColor((region as TaxRegionData).totalRate)} px-2 min-w-[50px] text-center`} variant="outline">
                          {formatTaxRate((region as TaxRegionData).totalRate)}%
                        </Badge>
                      </Button>
                    ))
                  )
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Aucun résultat trouvé
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          <SheetFooter className="pt-4">
            <Button onClick={closeSelector} variant="default" className="w-full">
              Fermer
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );

  // Rendu pour la version desktop
  const renderDesktopSelector = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          {selectedRegion ? (
            <div className="border rounded-md p-4 flex items-center justify-between">
              <div className="max-w-[60%]">
                <p className="font-medium truncate">{selectedRegion.name}</p>
                <p className="text-sm text-muted-foreground">{selectedRegion.code}</p>
              </div>
              <Badge className={`${getTaxRateColor(selectedRegion.totalRate)} px-2 min-w-[50px] text-center`} variant="outline">
                {formatTaxRate(selectedRegion.totalRate)}%
              </Badge>
              <Button variant="ghost" size="sm" onClick={openSelector}>
                Changer
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline"
              onClick={openSelector}
              className="w-full justify-center h-12"
            >
              Sélectionner une région fiscale
            </Button>
          )}
        </div>
      </div>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-lg flex justify-between items-center">
              {getNavigationTitle()}
              
              {navigationLevel !== "zones" && (
                <Button variant="ghost" size="sm" onClick={navigateBack}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Retour
                </Button>
              )}
            </SheetTitle>
            <SheetDescription>
              {navigationLevel === "zones" 
                ? "Choisissez une zone fiscale"
                : navigationLevel === "countries"
                ? "Sélectionnez un pays"
                : "Choisissez une région pour définir le taux de TVA"}
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            {navigationLevel !== "zones" && (
              <div className="flex items-center space-x-2 pb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={navigationLevel === "countries" ? "Rechercher un pays..." : "Rechercher une région..."}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {getFilteredItems().length > 0 ? (
                navigationLevel === "zones" ? (
                  // Affichage des zones fiscales
                  getFilteredItems().map((zone) => (
                    <Button
                      key={zone.id}
                      variant="outline"
                      className="w-full justify-between h-12 text-left"
                      onClick={() => handleSelectZone(zone as TaxZone)}
                    >
                      <span className="font-medium">{(zone as TaxZone).name}</span>
                      <Globe className="h-4 w-4 opacity-70" />
                    </Button>
                  ))
                ) : navigationLevel === "countries" ? (
                  // Affichage des pays d'une zone
                  getFilteredItems().map((country) => (
                    <Button
                      key={country.id}
                      variant="outline"
                      className="w-full justify-between h-12 text-left"
                      onClick={() => handleSelectCountry(country as TaxCountry)}
                    >
                      <div className="flex items-center">
                        <span className="font-medium">{(country as TaxCountry).name}</span>
                      </div>
                      <span className="text-xs font-medium bg-muted px-2 py-1 rounded">
                        {(country as TaxCountry).countryCode}
                      </span>
                    </Button>
                  ))
                ) : (
                  // Affichage des régions d'un pays
                  getFilteredItems().map((region) => (
                    <Button
                      key={region.id}
                      variant="outline"
                      className="w-full justify-between h-14 text-left"
                      onClick={() => handleSelectRegion(region as TaxRegionData)}
                    >
                      <div className="flex flex-col items-start max-w-[65%]">
                        <span className="font-medium truncate">{(region as TaxRegionData).name}</span>
                        <span className="text-xs text-muted-foreground truncate">{(region as TaxRegionData).code}</span>
                      </div>
                      <Badge className={`${getTaxRateColor((region as TaxRegionData).totalRate)} px-2 min-w-[50px] text-center`}>
                        {formatTaxRate((region as TaxRegionData).totalRate)}%
                      </Badge>
                    </Button>
                  ))
                )
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Aucun résultat trouvé
                </div>
              )}
            </div>
          </div>
          
          <SheetFooter>
            <Button variant="default" onClick={closeSelector} className="w-full">
              Fermer
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <div className="space-y-4">
      {showLabel && (
        <Label htmlFor="tax-rate" className="text-base font-medium">Taux de TVA</Label>
      )}

      <RadioGroup 
        value={selectedOption} 
        onValueChange={handleOptionChange}
        className="flex flex-col space-y-4"
      >
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="region" id="tax-region" />
            <Label htmlFor="tax-region" className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              TVA par région
            </Label>
          </div>
          
          {selectedOption === "region" && (
            <div className="ml-6 mt-2">
              {isMobile ? renderMobileSelector() : renderDesktopSelector()}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="custom" id="tax-custom" />
            <Label htmlFor="tax-custom" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              TVA personnalisée
            </Label>
          </div>
          
          {selectedOption === "custom" && (
            <div className="ml-6 mt-2">
              <TaxRateSelector 
                defaultValue={defaultValue}
                onChange={onChange}
                showLabel={false}
              />
            </div>
          )}
        </div>
      </RadioGroup>
    </div>
  );
}
