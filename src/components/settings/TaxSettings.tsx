
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CompanyProfile } from "@/types/invoice";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { TaxRegion, TaxRegionData } from "@/types/tax";
import { Badge } from "@/components/ui/badge";
import { Check, Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

// Exemple de données fiscales (à remplacer par des données réelles)
const mockTaxRegions: TaxRegion[] = [
  {
    id: "france",
    name: "France",
    countryCode: "FR",
    regions: [
      {
        id: "fr-standard",
        name: "Taux Standard",
        code: "FR-STD",
        taxType: "vat-standard",
        vatStandardRate: 20,
        totalRate: 20,
      },
      {
        id: "fr-reduced",
        name: "Taux Réduit",
        code: "FR-RED",
        taxType: "vat-reduced",
        vatReducedRates: [5.5, 10],
        totalRate: 5.5,
      }
    ]
  },
  {
    id: "germany",
    name: "Allemagne",
    countryCode: "DE",
    regions: [
      {
        id: "de-standard",
        name: "Taux Standard",
        code: "DE-STD",
        taxType: "vat-standard",
        vatStandardRate: 19,
        totalRate: 19,
      },
      {
        id: "de-reduced",
        name: "Taux Réduit",
        code: "DE-RED",
        taxType: "vat-reduced",
        vatReducedRates: [7],
        totalRate: 7,
      }
    ]
  }
];

interface TaxSettingsProps {
  companyProfile: CompanyProfile | null;
  onSave: (data: CompanyProfile) => void;
}

export function TaxSettings({ companyProfile, onSave }: TaxSettingsProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState<Partial<CompanyProfile>>({
    taxRate: 20,
  });
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<TaxRegionData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [taxRegions] = useState<TaxRegion[]>(mockTaxRegions);

  useEffect(() => {
    if (companyProfile) {
      // Ensure taxRate is a number
      const taxRate = typeof companyProfile.taxRate === 'string' 
        ? parseFloat(companyProfile.taxRate)
        : companyProfile.taxRate;
      
      setFormData({ taxRate });
    }
  }, [companyProfile]);

  const handleUpdate = async () => {
    if (!companyProfile) return;
    
    onSave({
      ...companyProfile,
      taxRate: formData.taxRate as number
    });
    
    toast({
      title: "Taux de TVA enregistré",
      description: "Le taux de TVA a été mis à jour avec succès."
    });
  };
  
  const updateTaxRate = (value: string) => {
    // Convert the string value to a number for the form state
    setFormData(prev => ({
      ...prev,
      taxRate: parseFloat(value) || 0
    }));
  };
  
  const getTaxRateColor = (rate: number) => {
    if (rate <= 5) return "bg-green-100 text-green-800 hover:bg-green-200";
    if (rate <= 15) return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    return "bg-amber-100 text-amber-800 hover:bg-amber-200";
  };

  const handleSelectRegion = (regionData: TaxRegionData) => {
    setSelectedRegion(regionData);
    setFormData(prev => ({
      ...prev,
      taxRate: regionData.totalRate
    }));
    setIsSheetOpen(false);
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
          ? `${selectedRegion.name} - ${selectedRegion.totalRate}%` 
          : "Sélectionner une région fiscale"}
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

  // Rendu pour la version desktop (Select)
  const renderDesktopSelector = () => (
    <div className="space-y-2">
      <Select 
        onValueChange={(value) => {
          const [countryId, regionId] = value.split(":");
          const country = taxRegions.find(c => c.id === countryId);
          if (country) {
            const region = country.regions.find(r => r.id === regionId);
            if (region) {
              handleSelectRegion(region);
            }
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez une région fiscale" />
        </SelectTrigger>
        <SelectContent>
          {taxRegions.map(country => (
            <div key={country.id} className="mb-2">
              <div className="px-2 py-1.5 text-sm font-semibold bg-muted/50">
                {country.name}
              </div>
              {country.regions.map(region => (
                <SelectItem key={region.id} value={`${country.id}:${region.id}`}>
                  <div className="flex items-center justify-between w-full">
                    <span>{region.name}</span>
                    <Badge className={getTaxRateColor(region.totalRate)}>
                      {region.totalRate}%
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Taux de TVA par défaut</CardTitle>
        <CardDescription>
          Ce taux sera appliqué par défaut à toutes vos factures.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sélecteur de région fiscale adaptatif */}
        <div className="space-y-2 mb-4">
          <Label>Région fiscale</Label>
          {isMobile ? renderMobileSelector() : renderDesktopSelector()}
        </div>

        {/* Input pour saisie directe du taux */}
        <div className="space-y-2">
          <Label htmlFor="tax-rate">Taux de TVA (%)</Label>
          <Input
            id="tax-rate"
            placeholder="20"
            value={formData.taxRate?.toString() || ""}
            onChange={(e) => updateTaxRate(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpdate}>
          Enregistrer
        </Button>
      </CardFooter>
    </Card>
  );
}
