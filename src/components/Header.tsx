
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { InvoiceDialog } from "./InvoiceDialog";
import { SearchBar } from "./SearchBar";
import { NotificationBell } from "./NotificationBell";
import { LanguageSelector } from "./LanguageSelector";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  title: string;
  description?: string;
  onOpenMobileMenu?: () => void;
}

export function Header({ title, description, onOpenMobileMenu }: HeaderProps) {
  const isMobile = useIsMobile();
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-8">
        {/* Barre supérieure avec recherche, boutons d'action et notifications */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-1" 
                onClick={onOpenMobileMenu}
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            
            {/* Barre de recherche - plus étroite sur mobile */}
            <div className={`${isMobile ? 'flex-1 max-w-[180px]' : 'flex-1 mr-4'}`}>
              <SearchBar />
            </div>
            
            {/* En version desktop: boutons d'action + langue au milieu */}
            {!isMobile && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => setInvoiceDialogOpen(true)}
                  className="gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  {t('newInvoice')}
                </Button>
                
                {/* Sélecteur de langue juste après le bouton nouvelle facture */}
                <LanguageSelector />
              </div>
            )}
            
            {/* Cloche de notification tout à droite */}
            <div className={`flex items-center ${isMobile ? 'ml-1' : 'ml-4'}`}>
              {/* En version mobile, le sélecteur de langue avant la cloche */}
              {isMobile && <LanguageSelector />}
              <NotificationBell />
            </div>
          </div>
        </div>
        
        {/* Titre de la page */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className={`${isMobile ? 'w-full' : ''}`}>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
          
          {/* Bouton "Nouvelle facture" sous le titre en version mobile */}
          {isMobile && (
            <Button 
              variant="default"
              size="sm"
              onClick={() => setInvoiceDialogOpen(true)}
              className="mt-3 w-full flex items-center justify-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              {t('newInvoice')}
            </Button>
          )}
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
