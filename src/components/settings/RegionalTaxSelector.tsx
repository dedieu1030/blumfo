
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, Settings, Search } from "lucide-react";
import { TaxRegion, TaxRegionData } from "@/types/tax";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { TaxRateSelector } from "./TaxRateSelector";

// Récupération des données de taxe depuis le fichier de types
import { taxRegionsData } from "@/data/taxData";

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
  const [taxRegions] = useState<TaxRegion[]>(taxRegionsData);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  // Initialiser avec la région par défaut si fournie
  useEffect(() => {
    if (defaultRegion) {
      const [countryId, regionId] = defaultRegion.split(":");
      const country = taxRegions.find(c => c.id === countryId);
      if (country) {
        setSelectedCountry(country.id);
        
        // Pour les régions de l'UE, nous devons juste trouver la région dans le tableau des régions
        const region = country.regions.find(r => r.id === regionId);
        if (region) {
          setSelectedRegion(region);
          onChange(region.totalRate, `${country.id}:${region.id}`);
        }
      }
    }
  }, [defaultRegion, taxRegions, onChange]);

  // Déterminer le mode actif (TVA régionale ou personnalisée)
  useEffect(() => {
    // Si une valeur spécifique est définie et qu'aucune région n'est sélectionnée
    if (defaultValue !== undefined && !selectedRegion) {
      const numValue = typeof defaultValue === 'string' ? parseFloat(defaultValue) || 0 : defaultValue;
      
      // Vérifier si la valeur correspond à une région connue
      let found = false;
      taxRegions.forEach(country => {
        country.regions.forEach(region => {
          if (Math.abs(region.totalRate - numValue) < 0.01) {
            setSelectedCountry(country.id);
            setSelectedRegion(region);
            setSelectedOption("region");
            found = true;
          }
        });
      });
      
      // Si aucune correspondance, c'est un taux personnalisé
      if (!found) {
        setSelectedOption("custom");
      }
    }
  }, [defaultValue, taxRegions, selectedRegion]);

  const handleSelectRegion = (regionData: TaxRegionData) => {
    setSelectedRegion(regionData);
    setSelectedOption("region");
    onChange(regionData.totalRate, `${selectedCountry}:${regionData.id}`);
    setIsSheetOpen(false);
  };

  const handleOptionChange = (value: string) => {
    setSelectedOption(value);
    
    if (value === "custom") {
      // Garder la même valeur mais passer en mode personnalisé
      // La valeur sera gérée par le TaxRateSelector
    } else if (value === "region" && selectedRegion) {
      // Utiliser la valeur de la région sélectionnée
      onChange(selectedRegion.totalRate, `${selectedCountry}:${selectedRegion.id}`);
    }
  };

  const getTaxRateColor = (rate: number) => {
    if (rate <= 5) return "bg-green-100 text-green-800 hover:bg-green-200";
    if (rate <= 15) return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    return "bg-amber-100 text-amber-800 hover:bg-amber-200";
  };

  // Définir le titre du pays
  const getCountryTitle = (countryId: string) => {
    const country = taxRegions.find(c => c.id === countryId);
    return country ? country.name : "Sélectionner un pays";
  };

  // Filtrer les régions par recherche
  const filteredRegions = (countryId: string) => {
    const country = taxRegions.find(c => c.id === countryId);
    if (!country) return [];
    
    return country.regions.filter(region => 
      searchValue === "" || 
      region.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      region.code.toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  // Ouvrir le sélecteur
  const openSelector = () => {
    setIsSheetOpen(true);
    setSelectedCountry(null);
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
          ? `${selectedRegion.name} (${selectedRegion.totalRate}%)`
          : "Sélectionner une région fiscale"}
        {selectedRegion && (
          <Badge className={getTaxRateColor(selectedRegion.totalRate)} variant="outline">
            {selectedRegion.totalRate}%
          </Badge>
        )}
      </Button>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[85%] max-h-[85vh]">
          <SheetHeader>
            <SheetTitle>
              {selectedCountry
                ? getCountryTitle(selectedCountry)
                : "Sélectionner une région fiscale"}
            </SheetTitle>
          </SheetHeader>
          
          <div className="py-4 space-y-4">
            {!selectedCountry ? (
              // Étape 1: Sélection du pays/région
              <div className="space-y-2">
                {taxRegions.map(country => (
                  <Button
                    key={country.id}
                    variant="outline"
                    className="w-full justify-start h-12 text-left"
                    onClick={() => setSelectedCountry(country.id)}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    {country.name}
                  </Button>
                ))}
              </div>
            ) : (
              // Étape 2: Sélection de la région spécifique
              <>
                <div className="flex items-center space-x-2 sticky top-0 bg-background pt-2 pb-4">
                  <Button variant="outline" onClick={() => setSelectedCountry(null)}>
                    Retour
                  </Button>
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une région..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <ScrollArea className="h-[50vh]">
                  <div className="space-y-2">
                    {filteredRegions(selectedCountry).length > 0 ? (
                      filteredRegions(selectedCountry).map(region => (
                        <Button
                          key={region.id}
                          variant="outline"
                          className="w-full justify-between h-14 text-left"
                          onClick={() => handleSelectRegion(region)}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{region.name}</span>
                            <span className="text-xs text-muted-foreground">{region.code}</span>
                          </div>
                          <Badge className={getTaxRateColor(region.totalRate)}>
                            {region.totalRate}%
                          </Badge>
                        </Button>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Aucune région trouvée
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
          
          <SheetFooter>
            <Button onClick={() => setIsSheetOpen(false)} variant="outline" className="w-full mt-4">
              Annuler
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
              <div>
                <p className="font-medium">{selectedRegion.name}</p>
                <p className="text-sm text-muted-foreground">{selectedRegion.code}</p>
              </div>
              <Badge className={getTaxRateColor(selectedRegion.totalRate)} variant="outline">
                {selectedRegion.totalRate}%
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
            <SheetTitle>
              {selectedCountry 
                ? getCountryTitle(selectedCountry)
                : "Sélectionner une région fiscale"}
            </SheetTitle>
            <SheetDescription>
              {selectedCountry 
                ? "Choisissez une région pour définir le taux de TVA"
                : "Choisissez un pays ou une zone fiscale"}
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            {!selectedCountry ? (
              // Étape 1: Selection du pays/zone
              <div className="grid grid-cols-1 gap-3">
                {taxRegions.map(country => (
                  <Button
                    key={country.id}
                    variant="outline"
                    className="w-full justify-between h-12 text-left"
                    onClick={() => setSelectedCountry(country.id)}
                  >
                    <span className="font-medium">{country.name}</span>
                    <Globe className="h-4 w-4 opacity-70" />
                  </Button>
                ))}
              </div>
            ) : (
              // Étape 2: Selection de la région spécifique
              <>
                <div className="flex items-center space-x-2 pb-4">
                  <Button variant="outline" size="sm" onClick={() => setSelectedCountry(null)}>
                    Retour
                  </Button>
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une région..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                  {filteredRegions(selectedCountry).length > 0 ? (
                    filteredRegions(selectedCountry).map(region => (
                      <Button
                        key={region.id}
                        variant="outline"
                        className="w-full justify-between h-14 text-left"
                        onClick={() => handleSelectRegion(region)}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{region.name}</span>
                          <span className="text-xs text-muted-foreground">{region.code}</span>
                        </div>
                        <Badge className={getTaxRateColor(region.totalRate)}>
                          {region.totalRate}%
                        </Badge>
                      </Button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucune région trouvée
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsSheetOpen(false)} className="w-full">
              Annuler
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
