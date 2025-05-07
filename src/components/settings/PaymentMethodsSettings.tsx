
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyProfile, PaymentMethodDetails } from "@/types/invoice";
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";
import { getDefaultPaymentMethods, saveDefaultPaymentMethods } from "@/services/invoiceSettingsService";

interface PaymentMethodsSettingsProps {
  companyProfile?: CompanyProfile;
}

export function PaymentMethodsSettings({ companyProfile }: PaymentMethodsSettingsProps) {
  const [defaultPaymentMethods, setDefaultPaymentMethods] = useState<PaymentMethodDetails[]>([]);
  
  useEffect(() => {
    setDefaultPaymentMethods(getDefaultPaymentMethods());
  }, []);
  
  const handleSaveDefaultPaymentMethods = (methods: PaymentMethodDetails[]) => {
    setDefaultPaymentMethods(methods);
    saveDefaultPaymentMethods(methods);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Méthodes de paiement par défaut</CardTitle>
        <CardDescription>Définissez les méthodes de paiement que vous proposez habituellement sur vos factures</CardDescription>
      </CardHeader>
      <CardContent>
        {companyProfile ? (
          <PaymentMethodSelector 
            methods={defaultPaymentMethods}
            onChange={handleSaveDefaultPaymentMethods}
            companyProfile={companyProfile}
            onSaveDefault={handleSaveDefaultPaymentMethods}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Vous devez d'abord créer un profil avant de configurer les méthodes de paiement.
            </p>
            <Button 
              className="mt-4 bg-violet hover:bg-violet/90"
              onClick={() => window.location.href = '/settings?tab=profile'}
            >
              Créer mon profil
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
