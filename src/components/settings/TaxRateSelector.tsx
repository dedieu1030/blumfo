
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaxRegionData } from "@/types/tax";
import { InfoIcon, EuroIcon, DollarSign } from "lucide-react";
import { getTaxRegionById, getRegionData, taxRegions } from "@/data/taxData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaxRateSelectorProps {
  defaultValue?: string;
  onChange: (value: string) => void;
  showLabel?: boolean;
  className?: string;
}

export function TaxRateSelector({ 
  defaultValue = "20", 
  onChange, 
  showLabel = true,
  className = ""
}: TaxRateSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<"manual" | "region">("manual");
  const [manualRate, setManualRate] = useState(defaultValue);
  const [selectedCountry, setSelectedCountry] = useState<string>("none");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [appliedRate, setAppliedRate] = useState(defaultValue);

  // Récupérer la configuration fiscale du localStorage au chargement
  useEffect(() => {
    const savedTaxConfig = localStorage.getItem('taxConfiguration');
    if (savedTaxConfig) {
      try {
        const config = JSON.parse(savedTaxConfig);
        if (config.country && config.country !== "none") {
          setSelectedCountry(config.country);
          setSelectedMode("region");
          
          if (config.region) {
            setSelectedRegion(config.region);
            const regionData = getRegionData(config.country, config.region);
            if (regionData) {
              setAppliedRate(regionData.totalRate.toString());
              onChange(regionData.totalRate.toString());
            }
          }
        }
      } catch (e) {
        console.error("Erreur lors du parsing de la configuration fiscale", e);
      }
    }
  }, [onChange]);

  useEffect(() => {
    // Mise à jour du taux uniquement si on est en mode manuel
    if (selectedMode === "manual") {
      setAppliedRate(manualRate);
      onChange(manualRate);
    }
  }, [manualRate, selectedMode, onChange]);

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedRegion(""); // Réinitialiser la région
    
    if (value === "none") {
      setSelectedMode("manual");
      setAppliedRate(manualRate);
      onChange(manualRate);
    }
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    
    if (selectedCountry && value) {
      const regionData = getRegionData(selectedCountry, value);
      if (regionData) {
        setAppliedRate(regionData.totalRate.toString());
        onChange(regionData.totalRate.toString());
      }
    }
  };

  const handleModeChange = (mode: "manual" | "region") => {
    setSelectedMode(mode);
    
    if (mode === "manual") {
      setAppliedRate(manualRate);
      onChange(manualRate);
    } else if (selectedCountry !== "none" && selectedRegion) {
      const regionData = getRegionData(selectedCountry, selectedRegion);
      if (regionData) {
        setAppliedRate(regionData.totalRate.toString());
        onChange(regionData.totalRate.toString());
      }
    }
  };

  // Obtenir les données de région pour le pays sélectionné
  const countryData = selectedCountry !== "none" ? getTaxRegionById(selectedCountry) : undefined;

  // Déterminer le libellé de la région en fonction du pays sélectionné
  const getRegionLabel = () => {
    switch (selectedCountry) {
      case 'canada': return 'Province';
      case 'usa': return 'État';
      case 'mexico': return 'Taux IVA';
      case 'eu': return 'Pays membre';
      default: return 'Région';
    }
  };

  // Obtenir le texte du placeholder pour la sélection de région
  const getRegionPlaceholder = () => {
    switch (selectedCountry) {
      case 'canada': return 'Sélectionnez une province';
      case 'usa': return 'Sélectionnez un état';
      case 'mexico': return 'Sélectionnez un taux d\'IVA';
      case 'eu': return 'Sélectionnez un pays membre';
      default: return 'Sélectionnez une région';
    }
  };

  // Obtenir le symbole de devise approprié en fonction du pays sélectionné
  const getCurrencyIcon = () => {
    switch (selectedCountry) {
      case 'usa':
        return <DollarSign className="h-4 w-4 mr-1 text-gray-500" />;
      case 'eu':
      case 'none':
      default:
        return <EuroIcon className="h-4 w-4 mr-1 text-gray-500" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showLabel && (
        <div className="flex items-center space-x-2">
          <Label htmlFor="tax-rate-selector" className="flex items-center gap-2">
            Taux de TVA par défaut (%)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  Ce taux sera appliqué par défaut sur vos nouvelles factures
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge 
          variant={selectedMode === "manual" ? "default" : "outline"} 
          className="cursor-pointer"
          onClick={() => handleModeChange("manual")}
        >
          Taux manuel
        </Badge>
        <Badge 
          variant={selectedMode === "region" ? "default" : "outline"} 
          className="cursor-pointer"
          onClick={() => handleModeChange("region")}
        >
          Par région
        </Badge>
      </div>

      {selectedMode === "manual" ? (
        <div className="flex items-center">
          <Input
            id="tax-rate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={manualRate}
            onChange={(e) => setManualRate(e.target.value)}
            className="w-full"
            placeholder="Exemple: 20"
          />
        </div>
      ) : (
        <Card className="p-4 border border-gray-200 bg-slate-50">
          <div className="space-y-4">
            <div>
              <Label htmlFor="tax-country">Pays</Label>
              <Select
                value={selectedCountry}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger id="tax-country">
                  <SelectValue placeholder="Sélectionnez un pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Personnalisé</SelectItem>
                  <SelectItem value="canada">Canada 🇨🇦</SelectItem>
                  <SelectItem value="usa">États-Unis 🇺🇸</SelectItem>
                  <SelectItem value="mexico">Mexique 🇲🇽</SelectItem>
                  <SelectItem value="eu">Union Européenne 🇪🇺</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedCountry !== "none" && countryData && (
              <div>
                <Label htmlFor="tax-region">{getRegionLabel()}</Label>
                <Select
                  value={selectedRegion}
                  onValueChange={handleRegionChange}
                >
                  <SelectTrigger id="tax-region">
                    <SelectValue placeholder={getRegionPlaceholder()} />
                  </SelectTrigger>
                  <SelectContent>
                    {countryData.regions.map((region: TaxRegionData) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name} ({region.code}) - {region.totalRate}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-600">Taux appliqué:</span>
              <span className="font-medium flex items-center">
                {getCurrencyIcon()}
                {appliedRate}%
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
