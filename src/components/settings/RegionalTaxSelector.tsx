
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Flag, Globe, Settings } from "lucide-react";
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
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<TaxRegionData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [taxRegions] = useState<TaxRegion[]>(taxRegionsData);
  
  // Initialiser avec la région par défaut si fournie
  useEffect(() => {
    if (defaultRegion) {
      const [countryId, regionId] = defaultRegion.split(":");
      const country = taxRegions.find(c => c.id === countryId);
      if (country) {
        setSelectedCountry(country.id);
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

  const handleCountryChange = (countryId: string) => {
    setSelectedCountry(countryId);
    setSelectedRegion(null);
    setSearchValue("");
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

  const filteredRegions = selectedCountry 
    ? taxRegions.find(country => country.id === selectedCountry)?.regions.filter(
        region => searchValue === "" || 
        region.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        region.code.toLowerCase().includes(searchValue.toLowerCase())
      )
    : [];

  // Rendu pour la version mobile (Sheet)
  const renderMobileSelector = () => (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        className="w-full justify-between"
        onClick={() => setIsSheetOpen(true)}
      >
        {selectedRegion 
          ? `${selectedRegion.name} (${selectedRegion.totalRate}%)`
          : "Sélectionner une région fiscale"}
        <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
      </Button>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[85%] max-h-[85vh]">
          <SheetHeader>
            <SheetTitle>Sélection de région fiscale</SheetTitle>
            <SheetDescription>
              Choisissez votre pays puis la région pour définir le taux de TVA
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-4 space-y-4">
            {!selectedCountry ? (
              // Étape 1: Sélection du pays
              <>
                <div className="mb-4 text-sm font-medium">
                  Choisissez un pays
                </div>
                <div className="space-y-2">
                  {taxRegions.map(country => (
                    <Button
                      key={country.id}
                      variant="outline"
                      className="w-full justify-start h-12 text-left"
                      onClick={() => setSelectedCountry(country.id)}
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      {country.name}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              // Étape 2: Sélection de la région
              <>
                <div className="flex items-center space-x-2 sticky top-0 bg-background pt-2 pb-4">
                  <Button variant="outline" onClick={() => setSelectedCountry(null)}>
                    Retour aux pays
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
                    {filteredRegions && filteredRegions.length > 0 ? (
                      filteredRegions.map(region => (
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
            <Button onClick={() => setIsSheetOpen(false)} variant="outline" className="w-full">
              Annuler
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );

  // Rendu pour la version desktop (Select en deux étapes)
  const renderDesktopSelector = () => (
    <div className="space-y-4">
      {/* Étape 1: Sélection du pays */}
      <div>
        <Label htmlFor="country-select" className="text-sm mb-1 block">Pays</Label>
        <Select
          value={selectedCountry || ""}
          onValueChange={handleCountryChange}
        >
          <SelectTrigger id="country-select" className="w-full">
            <SelectValue placeholder="Sélectionnez un pays" />
          </SelectTrigger>
          <SelectContent>
            {taxRegions.map(country => (
              <SelectItem key={country.id} value={country.id}>
                <div className="flex items-center">
                  <Flag className="mr-2 h-4 w-4" />
                  {country.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Étape 2: Sélection de la région (visible uniquement quand un pays est sélectionné) */}
      {selectedCountry && (
        <div>
          <Label htmlFor="region-select" className="text-sm mb-1 block">Région</Label>
          <Select
            value={selectedRegion ? selectedRegion.id : ""}
            onValueChange={(regionId) => {
              const country = taxRegions.find(c => c.id === selectedCountry);
              if (country) {
                const region = country.regions.find(r => r.id === regionId);
                if (region) {
                  handleSelectRegion(region);
                }
              }
            }}
          >
            <SelectTrigger id="region-select" className="w-full">
              <SelectValue placeholder="Sélectionnez une région" />
            </SelectTrigger>
            <SelectContent>
              {filteredRegions && filteredRegions.map(region => (
                <SelectItem key={region.id} value={region.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{region.name}</span>
                    <Badge className={getTaxRateColor(region.totalRate)}>
                      {region.totalRate}%
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedRegion && (
        <div className="text-sm text-muted-foreground">
          Taux appliqué: {selectedRegion.totalRate}%
        </div>
      )}
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

// Importation manquante pour la recherche
import { Search } from "lucide-react";

