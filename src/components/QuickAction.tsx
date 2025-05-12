
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { InvoiceDialog } from "./InvoiceDialog";
import { QuoteDialog } from "./QuoteDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Icon } from "@/components/ui/icon";

export const QuickAction = () => {
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Gestion propre de l'ouverture des dialogues
  const handleOpenInvoiceDialog = () => {
    setInvoiceDialogOpen(true);
  };

  const handleOpenQuoteDialog = () => {
    setQuoteDialogOpen(true);
  };

  // Gestion propre de la fermeture des dialogues
  const handleInvoiceDialogChange = (open: boolean) => {
    if (!open) {
      // Un petit délai pour éviter les problèmes de focus
      setTimeout(() => {
        setInvoiceDialogOpen(false);
      }, 0);
    } else {
      setInvoiceDialogOpen(true);
    }
  };

  const handleQuoteDialogChange = (open: boolean) => {
    if (!open) {
      // Un petit délai pour éviter les problèmes de focus
      setTimeout(() => {
        setQuoteDialogOpen(false);
      }, 0);
    } else {
      setQuoteDialogOpen(true);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size={isMobile ? "sm" : "default"}
            className="bg-violet hover:bg-violet/90 whitespace-nowrap"
          >
            {isMobile ? (
              <Icon 
                name="interface-essential-add" 
                isStreamline={true} 
                size={16} 
              />
            ) : (
              <>
                <Icon 
                  name="interface-essential-add" 
                  isStreamline={true} 
                  size={16}
                  className="mr-1" 
                /> Créer
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleOpenInvoiceDialog}>
            <Icon 
              name="files-document-file-text-1" 
              isStreamline={true} 
              size={16}
              className="mr-2" 
            /> Nouvelle facture
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenQuoteDialog}>
            <Icon 
              name="files-document-file-add-1" 
              isStreamline={true} 
              size={16} 
              className="mr-2"
            /> Nouveau devis
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <InvoiceDialog 
        open={invoiceDialogOpen}
        onOpenChange={handleInvoiceDialogChange}
      />
      
      <QuoteDialog
        open={quoteDialogOpen}
        onOpenChange={handleQuoteDialogChange}
      />
    </>
  );
};
