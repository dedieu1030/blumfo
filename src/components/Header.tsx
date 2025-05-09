
import { Button } from "@/components/ui/button";
import { useIsToplevel } from "@/hooks/use-is-toplevel";
import { useWindowSize } from "@/hooks/use-window-size";
import { ChevronLeft, Menu, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NotificationBell } from "./NotificationBell";
import { SearchBar } from "./SearchBar";
import { LanguageSelector } from "./LanguageSelector";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  description?: string;
  onOpenMobileMenu: () => void;
  actions?: React.ReactNode;
  showNewInvoiceButton?: boolean;
}

export const Header = ({ 
  title, 
  description, 
  onOpenMobileMenu,
  actions,
  showNewInvoiceButton = true,
}: HeaderProps) => {
  const { t } = useTranslation();
  const isTopLevel = useIsToplevel();
  const { width } = useWindowSize();
  const isMobileScreen = width < 768;
  const navigate = useNavigate();

  const renderBackButton = () => {
    if (isMobileScreen || isTopLevel) return null;
    
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
    <div className="flex flex-col">
      {/* Barre principale avec recherche et actions */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {isMobileScreen && (
          <Button variant="ghost" size="icon" onClick={onOpenMobileMenu} className="mr-2">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Section de recherche centrée */}
        <div className="flex-1 max-w-2xl mx-4">
          <SearchBar />
        </div>
        
        {/* Section de droite avec les boutons d'action */}
        <div className="flex items-center gap-2">
          {showNewInvoiceButton && (
            <Button 
              onClick={() => navigate("/invoicing")} 
              className="bg-primary text-white hover:bg-primary/90 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('newInvoice')}</span>
            </Button>
          )}
          
          <LanguageSelector />
          <NotificationBell />
          {actions}
        </div>
      </div>
      
      {/* Titre et description sous le header (seulement en vue desktop) */}
      {!isMobileScreen && (
        <div className="py-6 px-4">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      
      {/* Titre sur mobile */}
      {isMobileScreen && (
        <div className="p-4">
          <h1 className="text-xl font-semibold">{title}</h1>
          {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
        </div>
      )}
    </div>
  );
};
