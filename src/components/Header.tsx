
import { Button } from "@/components/ui/button";
import { useIsToplevel } from "@/hooks/use-is-toplevel";
import { useWindowSize } from "@/hooks/use-window-size";
import { ChevronLeft, FilePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { InvoiceDialog } from "./InvoiceDialog";

interface HeaderProps {
  title: string;
  description?: string;
  onOpenMobileMenu: () => void;
  actions?: React.ReactNode;
}

export const Header = ({ 
  title, 
  description, 
  onOpenMobileMenu,
  actions,
}: HeaderProps) => {
  const { t } = useTranslation();
  const isTopLevel = useIsToplevel();
  const { width } = useWindowSize();
  const isMobile = useIsMobile();
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  const renderBackButton = () => {
    if (isMobile || isTopLevel) return null;
    
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className="mr-2" 
        onClick={() => window.history.back()}
      >
        <ChevronLeft className="h-5 w-5 mr-1" /> {t('back')}
      </Button>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {!isMobile ? (
            <>
              {renderBackButton()}
              <div>
                <h1 className="text-2xl font-semibold">{title}</h1>
                {description && <p className="text-muted-foreground mt-1">{description}</p>}
              </div>
            </>
          ) : (
            <div className="flex items-center">
              {/* Bouton de création de facture en version mobile, avant le titre */}
              <Button 
                onClick={() => setInvoiceDialogOpen(true)}
                size="sm"
                className="bg-violet hover:bg-violet/90 mr-3"
              >
                <FilePlus className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-semibold">{title}</h1>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      </div>

      {/* Invoice Dialog */}
      <InvoiceDialog 
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
      />
    </>
  );
};
