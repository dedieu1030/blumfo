import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Menu, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { InvoiceDialog } from "./InvoiceDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { checkStripeConnection } from "@/services/stripeConnectClient";
import { SearchBar } from "./SearchBar";

interface HeaderProps {
  title: string;
  description?: string;
  onOpenMobileMenu?: () => void;
}

export function Header({ title, description, onOpenMobileMenu }: HeaderProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [stripeConnectionStatus, setStripeConnectionStatus] = useState<{
    isChecking: boolean;
    isConnected: boolean;
  }>({
    isChecking: true,
    isConnected: false,
  });

  // Check Stripe connection status on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const status = await checkStripeConnection();
        setStripeConnectionStatus({
          isChecking: false,
          isConnected: status.connected
        });
      } catch (error) {
        console.error("Error checking Stripe connection:", error);
        setStripeConnectionStatus({
          isChecking: false,
          isConnected: false
        });
      }
    };

    checkConnection();
  }, []);

  return (
    <>
      <div className="mb-8">
        {/* Barre de recherche universelle */}
        <div className="mb-4">
          <div className="flex items-center">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2" 
                onClick={onOpenMobileMenu}
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <SearchBar />
          </div>
        </div>
        
        {/* Titre de la page et boutons d'action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            {stripeConnectionStatus.isChecking ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center text-sm text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full">
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      <span>Vérification Stripe...</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Vérification de la connexion avec Stripe</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : stripeConnectionStatus.isConnected ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      <span>Stripe connecté</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Votre compte Stripe est connecté et prêt à recevoir des paiements</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full cursor-pointer"
                      onClick={() => navigate('/settings?tab=stripe')}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      <span>Stripe non connecté</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Connectez votre compte Stripe pour recevoir des paiements</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <Button 
              className="bg-violet hover:bg-violet/90"
              onClick={() => setInvoiceDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouvelle facture
            </Button>
          </div>
        </div>
      </div>

      <InvoiceDialog 
        open={invoiceDialogOpen} 
        onOpenChange={setInvoiceDialogOpen} 
      />
    </>
  );
}

export default Header;
