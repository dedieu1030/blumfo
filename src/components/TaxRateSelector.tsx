
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TaxRegionData } from "@/types/tax";
import { getRegionData, getTaxRegionById } from "@/data/taxData";
import { Button } from "@/components/ui/button";
import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaxRateSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
}

export function TaxRateSelector({ value, onChange, className, label = "Taux de TVA par défaut (%)" }: TaxRateSelectorProps) {
  const [customRate, setCustomRate] = useState<string>(value);
  const [selectedRate, setSelectedRate] = useState<string>("custom");
  const [savedTaxRates, setSavedTaxRates] = useState<{ id: string, label: string, rate: string }[]>([]);

  // Charger les taux de TVA sauvegardés à partir de localStorage
  useEffect(() => {
    // Récupérer la configuration fiscale
    const savedTaxConfig = localStorage.getItem('taxConfiguration');
    if (savedTaxConfig) {
      try {
        const config = JSON.parse(savedTaxConfig);
        if (config.country && config.region) {
          const regionData = getRegionData(config.country, config.region);
          if (regionData) {
            // Ajouter le taux de la région actuellement configurée
            addSavedRate(regionData, config.country, config.region);
          }
        }
      } catch (e) {
        console.error("Erreur lors du parsing de la configuration fiscale", e);
      }
    }

    // Initialiser l'état en fonction de la valeur actuelle
    setCustomRate(value);
    
    // Si la valeur correspond à un taux sauvegardé, sélectionner ce taux
    const matchingRate = savedTaxRates.find(rate => rate.rate === value);
    if (matchingRate) {
      setSelectedRate(matchingRate.id);
    } else {
      setSelectedRate("custom");
    }
  }, [value]);

  // Ajouter un taux de TVA sauvegardé à la liste des taux disponibles
  const addSavedRate = (regionData: TaxRegionData, countryId: string, regionId: string) => {
    const country = getTaxRegionById(countryId);
    if (!country) return;

    const regionName = regionData.name;
    const countryName = country.name;
    const taxRate = regionData.totalRate.toString();
    const newRate = {
      id: `${countryId}-${regionId}`,
      label: `${regionName} (${countryName}) - ${taxRate}%`,
      rate: taxRate
    };

    // Vérifier si ce taux existe déjà dans la liste
    setSavedTaxRates(prev => {
      if (!prev.some(rate => rate.id === newRate.id)) {
        return [...prev, newRate];
      }
      return prev;
    });
  };

  // Gérer le changement de sélection
  const handleSelectChange = (selected: string) => {
    setSelectedRate(selected);
    
    if (selected === "custom") {
      // Si "Custom" est sélectionné, utiliser la valeur actuelle du champ personnalisé
      onChange(customRate);
    } else {
      // Sinon, trouver le taux correspondant dans la liste des taux sauvegardés
      const selectedSavedRate = savedTaxRates.find(rate => rate.id === selected);
      if (selectedSavedRate) {
        onChange(selectedSavedRate.rate);
        setCustomRate(selectedSavedRate.rate);
      }
    }
  };

  // Gérer le changement de taux personnalisé
  const handleCustomRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomRate(newValue);
    onChange(newValue);
    setSelectedRate("custom"); // Basculer vers l'option personnalisée
  };

  return (
    <div className={className}>
      <div className="space-y-2">
        <Label htmlFor="tax-rate" className="flex items-center gap-2">
          {label}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                Ce taux sera appliqué par défaut sur vos nouvelles factures.
                {savedTaxRates.length > 0 && " Vous pouvez sélectionner un taux de TVA pré-configuré ou entrer un taux personnalisé."}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>

        {savedTaxRates.length > 0 ? (
          <div className="space-y-2">
            <Select value={selectedRate} onValueChange={handleSelectChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un taux de TVA" />
              </SelectTrigger>
              <SelectContent>
                {savedTaxRates.map((rate) => (
                  <SelectItem key={rate.id} value={rate.id}>
                    {rate.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Personnalisé</SelectItem>
              </SelectContent>
            </Select>
            
            {selectedRate === "custom" && (
              <Input
                id="tax-rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={customRate}
                onChange={handleCustomRateChange}
                className="mt-2"
              />
            )}
          </div>
        ) : (
          <Input
            id="tax-rate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={customRate}
            onChange={handleCustomRateChange}
          />
        )}
      </div>
    </div>
  );
}
