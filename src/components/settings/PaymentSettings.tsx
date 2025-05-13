
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyProfile } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";
import { CreditCard } from "lucide-react";

interface PaymentSettingsProps {
  companyProfile: CompanyProfile | null;
}

export function PaymentSettings({ companyProfile }: PaymentSettingsProps) {
  const { toast } = useToast();
  const [isStripeConnected, setIsStripeConnected] = useState<boolean>(false);

  // Mettre à jour l'état en fonction du profil d'entreprise
  useEffect(() => {
    if (companyProfile) {
      setIsStripeConnected(companyProfile.stripe_connected || false);
    }
  }, [companyProfile]);

  const handleConnectStripe = () => {
    if (!companyProfile) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord créer un profil d'entreprise",
        variant: "destructive"
      });
      return;
    }

    // Rediriger vers la page de connexion Stripe
    window.location.href = `/api/initiate-stripe-connect?company_id=${companyProfile.id}`;
  };

  const handleDisconnectStripe = () => {
    // Implémenter la logique pour déconnecter le compte Stripe
    toast({
      title: "Information",
      description: "Cette fonctionnalité sera bientôt disponible"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres de paiement</CardTitle>
        <CardDescription>
          Configurez la façon dont vous recevez les paiements de vos clients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-primary/10 rounded-md">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium">Stripe Connect</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Connectez votre compte Stripe pour accepter les paiements par carte bancaire directement sur vos factures.
              </p>
              {isStripeConnected ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Compte Stripe connecté</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDisconnectStripe}
                  >
                    Déconnecter Stripe
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleConnectStripe}
                >
                  Connecter avec Stripe
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
