
import { useState, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription, 
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { TaxRegion, TaxRegionData } from "@/types/tax";
import { taxRegions, getTaxRegionById } from "@/data/taxData";

interface RegionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: string;
  selectedRegion: string;
  onSelectCountry: (countryId: string) => void;
  onSelectRegion: (regionId: string) => void;
}

export function RegionSelector({
  isOpen,
  onClose,
  selectedCountry,
  selectedRegion,
  onSelectCountry,
  onSelectRegion,
}: RegionSelectorProps) {
  const [step, setStep] = useState<"country" | "region">("country");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCountries, setFilteredCountries] = useState<TaxRegion[]>(taxRegions);
  const [filteredRegions, setFilteredRegions] = useState<TaxRegionData[]>([]);
  const [currentCountry, setCurrentCountry] = useState<TaxRegion | null>(null);

  // Reset to country selection when opened
  useEffect(() => {
    if (isOpen) {
      // If a country is already selected, show its regions
      if (selectedCountry) {
        const country = getTaxRegionById(selectedCountry);
        if (country) {
          setCurrentCountry(country);
          setStep("region");
          setFilteredRegions(country.regions);
        }
      } else {
        setStep("country");
        setFilteredCountries(taxRegions);
      }
      setSearchTerm("");
    }
  }, [isOpen, selectedCountry]);

  // Handle search
  useEffect(() => {
    if (step === "country") {
      const filtered = searchTerm 
        ? taxRegions.filter(country => 
            country.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : taxRegions;
      setFilteredCountries(filtered);
    } else {
      if (!currentCountry) return;
      
      const filtered = searchTerm 
        ? currentCountry.regions.filter(region => 
            region.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : currentCountry.regions;
      setFilteredRegions(filtered);
    }
  }, [searchTerm, step, currentCountry]);

  // Handle country selection
  const handleSelectCountry = (country: TaxRegion) => {
    setCurrentCountry(country);
    setFilteredRegions(country.regions);
    onSelectCountry(country.id);
    setSearchTerm("");
    setStep("region");
  };

  // Handle region selection
  const handleSelectRegion = (region: TaxRegionData) => {
    onSelectRegion(region.id);
    onClose();
  };

  // Go back to country selection
  const handleBackToCountries = () => {
    setStep("country");
    setSearchTerm("");
  };

  // Handle cancel
  const handleCancel = () => {
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col">
        <SheetHeader className="space-y-2">
          <div className="flex items-center justify-between">
            {step === "region" ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-10 p-0"
                onClick={handleBackToCountries}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : (
              <div className="w-10" />
            )}
            
            <SheetTitle>
              {step === "country" ? "Sélectionner un pays" : `Régions: ${currentCountry?.name}`}
            </SheetTitle>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-10 p-0"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={step === "country" ? "Rechercher un pays..." : "Rechercher une région..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <SheetDescription>
            {step === "country" 
              ? "Sélectionnez d'abord le pays ou la région fiscale"
              : "Sélectionnez maintenant la juridiction fiscale spécifique"}
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 px-1 mt-2">
          {step === "country" ? (
            <div className="space-y-3">
              {filteredCountries.map((country) => (
                <button
                  key={country.id}
                  className={`w-full text-left p-3 rounded-lg flex items-center justify-between hover:bg-muted ${
                    selectedCountry === country.id ? "bg-muted" : ""
                  }`}
                  onClick={() => handleSelectCountry(country)}
                >
                  <div>
                    <div className="font-medium">{country.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {country.regions.length} régions fiscales
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
              
              {filteredCountries.length === 0 && (
                <div className="text-center p-4 text-muted-foreground">
                  Aucun pays ne correspond à votre recherche
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRegions.map((region) => (
                <button
                  key={region.id}
                  className={`w-full text-left p-3 rounded-lg hover:bg-muted ${
                    selectedRegion === region.id ? "bg-muted" : ""
                  }`}
                  onClick={() => handleSelectRegion(region)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{region.name}</div>
                    <Badge variant={region.totalRate === 0 ? "outline" : "default"}>
                      {region.totalRate}%
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    {region.code} - {region.notes}
                  </div>
                </button>
              ))}
              
              {filteredRegions.length === 0 && (
                <div className="text-center p-4 text-muted-foreground">
                  Aucune région ne correspond à votre recherche
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        <SheetFooter className="pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCancel}
          >
            Annuler
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
