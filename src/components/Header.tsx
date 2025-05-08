
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Menu, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { InvoiceDialog } from "./InvoiceDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { checkStripeConnection } from "@/services/stripeConnectClient";
import { SearchBar } from "./SearchBar";
import { NotificationBell } from "./NotificationBell";

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
      {/* Header navigation bar with logo, search and actions */}
      <div className="flex items-center justify-between py-4 mb-8">
        {/* Left side - Mobile menu button or title */}
        <div className="flex-shrink-0">
          {isMobile ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="-ml-3" 
              onClick={onOpenMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>
          ) : (
            <h1 className="text-2xl font-bold">{title}</h1>
          )}
        </div>
        
        {/* Center - Search bar */}
        <div className="flex-1 flex justify-center max-w-3xl mx-auto px-4">
          <SearchBar />
        </div>
        
        {/* Right side - Status indicators and actions */}
        <div className="flex items-center gap-3">
          {/* Stripe connection status indicators */}
          {stripeConnectionStatus.isChecking ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-sm text-zinc-600 bg-zinc-100 px-3 py-1 rounded-full">
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    <span className="hidden md:inline">Vérification Stripe...</span>
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
                    <span className="hidden md:inline">Stripe connecté</span>
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
                    <span className="hidden md:inline">Stripe non connecté</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Connectez votre compte Stripe pour recevoir des paiements</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Notification Bell */}
          <NotificationBell />
          
          {/* New Invoice Button - only icon */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  className="bg-violet hover:bg-violet/90 h-10 w-10 p-0 rounded-full"
                  onClick={() => setInvoiceDialogOpen(true)}
                >
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Nouvelle facture</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Page description shown below the header */}
      {!isMobile && description && (
        <div className="mb-8">
          <p className="text-muted-foreground">{description}</p>
        </div>
      )}

      <InvoiceDialog 
        open={invoiceDialogOpen} 
        onOpenChange={setInvoiceDialogOpen} 
      />
    </>
  );
}

export default Header;
