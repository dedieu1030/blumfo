
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
                className="mr-2" 
                onClick={onOpenMobileMenu}
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            
            <div className="flex items-center gap-2">
              <LanguageSelector />
              
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setInvoiceDialogOpen(true)}
                className="gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                {t('newInvoice')}
              </Button>
            </div>
            
            <div className="flex-1 mx-4">
              <SearchBar />
            </div>
            
            <div className="flex items-center">
              <NotificationBell />
            </div>
          </div>
        </div>
        
        {/* Titre de la page */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
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
