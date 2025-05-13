
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

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
  
  useEffect(() => {
    const numValue = typeof defaultValue === 'string' ? parseFloat(defaultValue) || 0 : defaultValue;
    setTaxRate(numValue);
  }, [defaultValue]);

  const handleTaxRateChange = (value: number[]) => {
    const newValue = value[0];
    setTaxRate(newValue);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueStr = e.target.value;
    const value = valueStr === '' ? 0 : parseFloat(valueStr);
    
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setTaxRate(value);
      onChange(value);
    }
  };

  return (
    <div className="space-y-4">
      {showLabel && (
        <Label htmlFor="tax-rate" className="text-base font-medium">Taux de TVA</Label>
      )}
      
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
  );
}
