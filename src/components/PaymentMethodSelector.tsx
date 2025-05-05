
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PaymentMethod, PaymentMethodDetails } from "@/types/invoice";

interface PaymentMethodSelectorProps {
  methods: PaymentMethodDetails[];
  onChange: (methods: PaymentMethodDetails[]) => void;
  companyProfile: any;
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  card: "Carte bancaire (Stripe)",
  transfer: "Virement bancaire",
  paypal: "PayPal",
  check: "Chèque",
  cash: "Espèces",
  payoneer: "Payoneer (bientôt disponible)",
  other: "Autre"
};

export function PaymentMethodSelector({ 
  methods, 
  onChange,
  companyProfile
}: PaymentMethodSelectorProps) {
  const updateMethod = (type: PaymentMethod, enabled: boolean, details?: string) => {
    const existingIndex = methods.findIndex(m => m.type === type);
    const updatedMethods = [...methods];
    
    if (existingIndex >= 0) {
      if (enabled) {
        updatedMethods[existingIndex] = { 
          ...updatedMethods[existingIndex], 
          enabled,
          ...(details !== undefined ? { details } : {})
        };
      } else {
        updatedMethods.splice(existingIndex, 1);
      }
    } else if (enabled) {
      updatedMethods.push({ type, enabled, details });
    }
    
    onChange(updatedMethods);
  };

  const getMethodStatus = (type: PaymentMethod): { enabled: boolean, details?: string } => {
    const method = methods.find(m => m.type === type);
    return method ? { enabled: method.enabled, details: method.details } : { enabled: false };
  };

  // Conditions pour afficher ou non certaines méthodes
  const showPaypal = !!companyProfile?.paypal;
  const showPayoneer = !!companyProfile?.payoneer;
  const showBankTransfer = !!(companyProfile?.bankName && companyProfile?.bankAccount);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Méthodes de paiement acceptées</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="payment-card" 
            checked={getMethodStatus('card').enabled}
            onCheckedChange={(checked) => updateMethod('card', checked as boolean)}
          />
          <Label htmlFor="payment-card">{paymentMethodLabels.card}</Label>
        </div>
        
        {showBankTransfer && (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="payment-transfer" 
              checked={getMethodStatus('transfer').enabled}
              onCheckedChange={(checked) => updateMethod('transfer', checked as boolean)}
            />
            <Label htmlFor="payment-transfer">{paymentMethodLabels.transfer}</Label>
          </div>
        )}
        
        {showPaypal && (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="payment-paypal" 
              checked={getMethodStatus('paypal').enabled}
              onCheckedChange={(checked) => updateMethod('paypal', checked as boolean)}
            />
            <Label htmlFor="payment-paypal">{paymentMethodLabels.paypal}</Label>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="payment-check" 
            checked={getMethodStatus('check').enabled}
            onCheckedChange={(checked) => updateMethod('check', checked as boolean)}
          />
          <Label htmlFor="payment-check">{paymentMethodLabels.check}</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="payment-cash" 
            checked={getMethodStatus('cash').enabled}
            onCheckedChange={(checked) => updateMethod('cash', checked as boolean)}
          />
          <Label htmlFor="payment-cash">{paymentMethodLabels.cash}</Label>
        </div>
        
        {showPayoneer && (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="payment-payoneer" 
              checked={getMethodStatus('payoneer').enabled}
              onCheckedChange={(checked) => updateMethod('payoneer', checked as boolean)}
              disabled={true}
            />
            <Label htmlFor="payment-payoneer" className="text-muted-foreground">
              {paymentMethodLabels.payoneer}
            </Label>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="payment-other" 
            checked={getMethodStatus('other').enabled}
            onCheckedChange={(checked) => updateMethod('other', checked as boolean)}
          />
          <Label htmlFor="payment-other">{paymentMethodLabels.other}</Label>
        </div>
      </div>
      
      {getMethodStatus('other').enabled && (
        <Card className="mt-4">
          <CardContent className="pt-4">
            <Label htmlFor="other-payment-details" className="mb-2 block">Précisez les autres méthodes de paiement</Label>
            <Textarea 
              id="other-payment-details" 
              placeholder="Exemple: Paiement par SEPA à l'ordre de..." 
              value={getMethodStatus('other').details || ''}
              onChange={(e) => updateMethod('other', true, e.target.value)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PaymentMethodSelector;
