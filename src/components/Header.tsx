
import { Button } from "@/components/ui/button";
import { useIsToplevel } from "@/hooks/use-is-toplevel";
import { useWindowSize } from "@/hooks/use-window-size";
import { ChevronLeft, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const isMobileScreen = width < 768;

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
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        {!isMobileScreen ? (
          <>
            {renderBackButton()}
            <div>
              <h1 className="text-2xl font-semibold">{title}</h1>
              {description && <p className="text-muted-foreground mt-1">{description}</p>}
            </div>
          </>
        ) : (
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onOpenMobileMenu} className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {actions}
      </div>
    </div>
  );
};
