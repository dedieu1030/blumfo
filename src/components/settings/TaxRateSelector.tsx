
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { taxRegionsData } from "@/data/taxData";

interface TaxRateSelectorProps {
  defaultValue: number | string;
  onChange: (value: number) => void;
  showLabel?: boolean;
}

export function TaxRateSelector({
  defaultValue = 20,
  onChange,
  showLabel = true
}: TaxRateSelectorProps) {
  const [taxRate, setTaxRate] = useState<number>(
    typeof defaultValue === 'string' ? parseFloat(defaultValue) || 0 : defaultValue
  );
  
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  useEffect(() => {
    const numValue = typeof defaultValue === 'string' ? parseFloat(defaultValue) || 0 : defaultValue;
    setTaxRate(numValue);
    
    // Essayer de trouver une région correspondant au taux défini
    if (numValue) {
      for (const country of taxRegionsData) {
        for (const region of country.regions) {
          if (Math.abs(region.totalRate - numValue) < 0.1) {
            setSelectedRegion(`${country.id}:${region.id}`);
            break;
          }
        }
      }
    }
  }, [defaultValue]);

  const handleTaxRateChange = (value: number[]) => {
    const newValue = value[0];
    setTaxRate(newValue);
    setSelectedRegion(null); // Réinitialiser la région sélectionnée quand l'utilisateur ajuste manuellement
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueStr = e.target.value;
    const value = valueStr === '' ? 0 : parseFloat(valueStr);
    
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setTaxRate(value);
      setSelectedRegion(null); // Réinitialiser la région sélectionnée
      onChange(value);
    }
  };
  
  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    
    if (value) {
      const [countryId, regionId] = value.split(":");
      const country = taxRegionsData.find(c => c.id === countryId);
      if (country) {
        const region = country.regions.find(r => r.id === regionId);
        if (region) {
          setTaxRate(region.totalRate);
          onChange(region.totalRate);
        }
      }
    }
  };

  // Générer les options de taux de TVA par région
  const renderRegionOptions = () => {
    return taxRegionsData.map(country => (
      <SelectItem key={country.id} value={country.id} disabled className="font-semibold py-1.5 pl-2 pr-2 bg-muted/50">
        {country.name}
      </SelectItem>
    )).concat(
      taxRegionsData.flatMap(country => 
        country.regions.map(region => (
          <SelectItem key={`${country.id}:${region.id}`} value={`${country.id}:${region.id}`}>
            {`${country.name} - ${region.name} (${region.totalRate}%)`}
          </SelectItem>
        ))
      )
    );
  };

  return (
    <div className="space-y-4">
      {showLabel && (
        <Label htmlFor="tax-rate" className="text-base font-medium">Taux de TVA</Label>
      )}
      
      <div className="space-y-4">
        <Select value={selectedRegion || ""} onValueChange={handleRegionChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionnez une région fiscale" />
          </SelectTrigger>
          <SelectContent>
            {renderRegionOptions()}
          </SelectContent>
        </Select>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Slider
              id="tax-rate-slider"
              defaultValue={[taxRate]}
              value={[taxRate]}
              max={50}
              step={0.1}
              onValueChange={handleTaxRateChange}
            />
          </div>
          <div className="w-20">
            <Input
              id="tax-rate-input"
              type="number"
              value={taxRate}
              min={0}
              max={100}
              step={0.1}
              onChange={handleInputChange}
              className="text-right"
            />
          </div>
          <span className="text-sm font-medium">%</span>
        </div>
      </div>
    </div>
  );
}
