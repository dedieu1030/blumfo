
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PaymentTermsSelectorProps {
  paymentDelay: string;
  onPaymentDelayChange: (value: string) => void;
  dueDate: string;
  onDueDateChange: (value: string) => void;
  useDueDate: boolean;
  onUseDueDateChange: (value: boolean) => void;
  customTerms: string;
  onCustomTermsChange: (value: string) => void;
  useCustomTerms: boolean;
  onUseCustomTermsChange: (value: boolean) => void;
  defaultTerms: string;
}

export function PaymentTermsSelector({
  paymentDelay,
  onPaymentDelayChange,
  dueDate,
  onDueDateChange,
  useDueDate,
  onUseDueDateChange,
  customTerms,
  onCustomTermsChange,
  useCustomTerms,
  onUseCustomTermsChange,
  defaultTerms
}: PaymentTermsSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="payment-delay">Délai de paiement</Label>
          <Select value={paymentDelay} onValueChange={onPaymentDelayChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un délai" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Paiement immédiat</SelectItem>
              <SelectItem value="7">7 jours</SelectItem>
              <SelectItem value="15">15 jours</SelectItem>
              <SelectItem value="30">30 jours</SelectItem>
              <SelectItem value="45">45 jours</SelectItem>
              <SelectItem value="60">60 jours</SelectItem>
              <SelectItem value="custom">Date spécifique</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {paymentDelay === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="due-date">Date d'échéance</Label>
            <Input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
            />
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="use-custom-terms"
            checked={useCustomTerms}
            onCheckedChange={onUseCustomTermsChange}
          />
          <Label htmlFor="use-custom-terms">Utiliser des conditions personnalisées pour cette facture</Label>
        </div>
        
        {useCustomTerms ? (
          <div className="space-y-2">
            <Label htmlFor="custom-terms">Conditions de paiement personnalisées</Label>
            <Textarea
              id="custom-terms"
              placeholder="Exemple: Paiement à réception de facture. Pénalité de 1.5% par mois de retard."
              value={customTerms}
              onChange={(e) => onCustomTermsChange(e.target.value)}
            />
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-md text-sm text-muted-foreground">
            <p>Conditions par défaut utilisées :</p>
            <p className="mt-1 font-medium text-foreground">{defaultTerms}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentTermsSelector;
