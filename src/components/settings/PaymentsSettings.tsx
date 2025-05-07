
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { RefreshCw, AlertTriangle, CheckCircle2, XCircle, Loader2, CreditCard, ExternalLink } from "lucide-react";
import { 
  checkStripeConnection, 
  initiateStripeConnect, 
  disconnectStripeAccount 
} from "@/services/stripeConnectClient";

export function PaymentsSettings() {
  const [stripeConnection, setStripeConnection] = useState<{
    isLoading: boolean;
    isConnected: boolean;
    accountDetails?: any;
    accountId?: string;
    error?: string;
  }>({
    isLoading: true,
    isConnected: false
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isConfirmingDisconnect, setIsConfirmingDisconnect] = useState(false);

  // Vérifier la connexion Stripe au chargement du composant
  useEffect(() => {
    checkStripeConnectionStatus();
  }, []);

  const checkStripeConnectionStatus = async () => {
    setStripeConnection(prev => ({ ...prev, isLoading: true }));
    
    try {
      const status = await checkStripeConnection();
      
      setStripeConnection({
        isLoading: false,
        isConnected: status.connected,
        accountId: status.accountId,
        accountDetails: status.details,
        error: status.message
      });
    } catch (error) {
      console.error("Error checking Stripe connection:", error);
      setStripeConnection({
        isLoading: false,
        isConnected: false,
        error: "Erreur lors de la vérification de la connexion Stripe"
      });
    }
  };

  const handleConnectWithStripe = async () => {
    setIsConnecting(true);
    
    try {
      // Create the redirect URL for after OAuth
      const redirectUrl = `${window.location.origin}/stripe/callback`;
      
      // Call the edge function to initiate the connection
      const response = await initiateStripeConnect(redirectUrl);
      
      if (response && response.url) {
        // Redirect the user to the Stripe OAuth page
        window.location.href = response.url;
      } else {
        toast.error("Impossible d'initialiser la connexion avec Stripe");
      }
    } catch (error) {
      console.error("Error connecting with Stripe:", error);
      toast.error("Erreur lors de la connexion avec Stripe");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectStripe = async () => {
    if (!stripeConnection.accountId) {
      toast.error("Aucun compte Stripe connecté");
      return;
    }
    
    setIsDisconnecting(true);
    
    try {
      const success = await disconnectStripeAccount(stripeConnection.accountId);
      
      if (success) {
        setStripeConnection({
          isLoading: false,
          isConnected: false,
          accountDetails: undefined,
          accountId: undefined
        });
        
        setIsConfirmingDisconnect(false);
      }
    } catch (error) {
      console.error("Error disconnecting Stripe account:", error);
      toast.error("Erreur lors de la déconnexion de votre compte Stripe");
    } finally {
      setIsDisconnecting(false);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Configuration Stripe Connect</CardTitle>
          <CardDescription>
            Connectez votre compte Stripe pour recevoir directement les paiements de vos clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {stripeConnection.isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 text-violet animate-spin mb-4" />
              <p className="text-muted-foreground">Vérification de la connexion Stripe...</p>
            </div>
          ) : stripeConnection.isConnected ? (
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-green-50 rounded-md">
                <CheckCircle2 className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <h3 className="font-medium">Compte Stripe connecté</h3>
                  <p className="text-sm text-muted-foreground">
                    Votre compte est connecté et prêt à recevoir des paiements
                  </p>
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Détails du compte</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nom de l'entreprise</p>
                    <p className="font-medium">{stripeConnection.accountDetails?.business_name || "Non spécifié"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ID du compte</p>
                    <p className="font-medium">{stripeConnection.accountId || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type d'entreprise</p>
                    <p className="font-medium">{stripeConnection.accountDetails?.business_type || "Non spécifié"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mode</p>
                    <p className="font-medium">{stripeConnection.accountDetails?.livemode ? "Production" : "Test"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Paiements activés</p>
                    <div className="flex items-center">
                      {stripeConnection.accountDetails?.charges_enabled ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <p className="font-medium">
                        {stripeConnection.accountDetails?.charges_enabled ? "Oui" : "Non"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Versements activés</p>
                    <div className="flex items-center">
                      {stripeConnection.accountDetails?.payouts_enabled ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <p className="font-medium">
                        {stripeConnection.accountDetails?.payouts_enabled ? "Oui" : "Non"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {(!stripeConnection.accountDetails?.charges_enabled || !stripeConnection.accountDetails?.payouts_enabled) && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800">Configuration incomplète</p>
                      <p className="text-sm text-amber-700">
                        Votre compte Stripe nécessite une configuration supplémentaire pour être pleinement opérationnel.
                        Veuillez compléter les informations manquantes dans votre tableau de bord Stripe.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => window.open('https://dashboard.stripe.com/account', '_blank')}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Compléter dans Stripe
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  onClick={checkStripeConnectionStatus}
                  disabled={stripeConnection.isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser le statut
                </Button>
                <Button 
                  variant="outline"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setIsConfirmingDisconnect(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Déconnecter le compte
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-amber-50 rounded-md">
                <AlertTriangle className="h-8 w-8 text-amber-500 mr-4" />
                <div>
                  <h3 className="font-medium">Connectez votre compte Stripe</h3>
                  <p className="text-sm text-muted-foreground">
                    Pour recevoir les paiements directement sur votre compte bancaire, vous devez connecter votre compte Stripe.
                  </p>
                </div>
              </div>
              
              <div className="border rounded-md p-6 space-y-4">
                <div className="text-center max-w-xl mx-auto">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-violet" />
                  <h3 className="text-lg font-medium mb-2">Acceptez des paiements en ligne</h3>
                  <p className="text-muted-foreground mb-6">
                    Grâce à Stripe Connect, vos clients peuvent payer vos factures en ligne directement sur votre compte bancaire. 
                    Les paiements sont sécurisés et rapides.
                  </p>
                  
                  <Button 
                    className="bg-violet hover:bg-violet/90"
                    onClick={handleConnectWithStripe}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                             alt="Stripe" 
                             className="h-4 mr-2" />
                        Connecter avec Stripe
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="mt-8 border-t pt-6">
                  <h4 className="text-sm font-medium mb-3">Pourquoi utiliser Stripe ?</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Acceptez les cartes bancaires et autres moyens de paiement</span>
                    </li>
                    <li className="flex">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Recevez les fonds directement sur votre compte bancaire</span>
                    </li>
                    <li className="flex">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Gérez les factures et les paiements depuis votre tableau de bord</span>
                    </li>
                    <li className="flex">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Protection contre les fraudes et gestion des litiges</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation de déconnexion Stripe */}
      <Dialog open={isConfirmingDisconnect} onOpenChange={setIsConfirmingDisconnect}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Déconnecter votre compte Stripe</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir déconnecter votre compte Stripe ? Les paiements en ligne ne seront plus disponibles pour vos clients.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Cette action supprimera l'association entre votre compte Stripe et cette application, mais n'affectera pas votre compte Stripe lui-même.
            </p>
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConfirmingDisconnect(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDisconnectStripe}
              disabled={isDisconnecting}
            >
              {isDisconnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Déconnexion...
                </>
              ) : (
                "Confirmer la déconnexion"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
