
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
    <div className="flex flex-col mb-6">
      <div className="flex items-center justify-between py-2 border-b">
        {/* Section de gauche: Bouton menu (mobile) ou bouton retour + titre */}
        <div className="flex items-center">
          {isMobileScreen ? (
            <Button variant="ghost" size="icon" onClick={onOpenMobileMenu}>
              <Menu className="h-5 w-5" />
            </Button>
          ) : (
            renderBackButton()
          )}
          
          {/* Sur mobile, afficher le titre près du menu */}
          {isMobileScreen && (
            <h1 className="text-xl font-semibold ml-2">{title}</h1>
          )}
        </div>
        
        {/* Section centrale: barre de recherche */}
        <div className="flex-1 mx-4 max-w-2xl hidden md:block">
          <SearchBar />
        </div>
        
        {/* Section de droite: Boutons d'action */}
        <div className="flex items-center gap-2">
          {showNewInvoiceButton && (
            <Button onClick={() => navigate("/invoicing")} className="hidden sm:flex" variant="default">
              <Plus className="h-4 w-4 mr-1" />
              {t('newInvoice')}
            </Button>
          )}
          
          <LanguageSelector />
          <NotificationBell />
          {actions}
        </div>
      </div>
      
      {/* Titre et description (desktop seulement) */}
      {!isMobileScreen && (
        <div className="mt-6">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      
      {/* Barre de recherche sur mobile */}
      {isMobileScreen && (
        <div className="mt-4">
          <SearchBar />
        </div>
      )}
    </div>
  );
};
