
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DiscountInfo } from "@/types/invoice";

interface DiscountSelectorProps {
  discount: DiscountInfo | undefined;
  onDiscountChange: (discount: DiscountInfo | undefined) => void;
  baseAmount?: number;
  label?: string;
  compact?: boolean;
}

export function DiscountSelector({
  discount,
  onDiscountChange,
  baseAmount = 0,
  label = "Réduction",
  compact = false
}: DiscountSelectorProps) {
  const handleTypeChange = (type: 'percentage' | 'fixed') => {
    if (!discount) {
      onDiscountChange({ type, value: 0 });
    } else {
      onDiscountChange({ ...discount, type });
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    if (!discount) {
      onDiscountChange({ type: 'percentage', value });
    } else {
      // Calculate discount amount based on type and base amount
      const amount = discount.type === 'percentage' 
        ? (baseAmount * value / 100) 
        : value;
      
      onDiscountChange({ 
        ...discount, 
        value, 
        amount: Number(amount.toFixed(2))
      });
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!discount) return;
    onDiscountChange({ ...discount, description: e.target.value });
  };

  // Calculate display values
  const discountValue = discount?.value || 0;
  const discountType = discount?.type || 'percentage';
  const discountDescription = discount?.description || '';
  
  // Calculate amount if base amount is provided
  const discountAmount = discountType === 'percentage'
    ? (baseAmount * discountValue / 100)
    : discountValue;

  return (
    <div className={compact ? "flex items-end gap-2" : "space-y-2"}>
      {!compact && <Label>{label}</Label>}
      
      <div className="flex gap-2">
        <Input
          type="number"
          min="0"
          step={discountType === 'percentage' ? "0.01" : "0.01"}
          value={discountValue || ''}
          onChange={handleValueChange}
          className={compact ? "w-20" : "w-24"}
          placeholder="0"
        />
        
        <Select 
          value={discountType} 
          onValueChange={(value) => handleTypeChange(value as 'percentage' | 'fixed')}
        >
          <SelectTrigger className={compact ? "w-24" : "w-32"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">%</SelectItem>
            <SelectItem value="fixed">€</SelectItem>
          </SelectContent>
        </Select>
        
        {!compact && (
          <Input
            placeholder="Description (optionnel)"
            value={discountDescription}
            onChange={handleDescriptionChange}
            className="flex-1"
          />
        )}
      </div>
      
      {baseAmount > 0 && discountValue > 0 && !compact && (
        <div className="text-sm text-muted-foreground">
          Montant de la réduction: {discountAmount.toFixed(2)} €
        </div>
      )}
    </div>
  );
}
