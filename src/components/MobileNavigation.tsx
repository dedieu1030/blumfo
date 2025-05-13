
import { Drawer, DrawerClose, DrawerContent } from "@/components/ui/drawer";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Icon } from "@/components/ui/icon";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "./LanguageSelector";

interface MobileNavigationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNavigation({ isOpen, onOpenChange }: MobileNavigationProps) {
  const location = useLocation();
  const { t } = useTranslation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navigationItems = [
    { icon: "BarChart2", name: t('dashboard'), path: "/" },
    { icon: "CreditCard", name: t('invoicing'), path: "/invoicing" },
    { icon: "FileText", name: t('invoices'), path: "/invoices" },
    { icon: "FileEdit", name: "Devis", path: "/quotes" },
    { icon: "LayoutGrid", name: t('templates'), path: "/templates" },
    { icon: "Users", name: t('clients'), path: "/clients" },
    { icon: "Package", name: t('products'), path: "/products" },
    { icon: "Settings", name: t('settings'), path: "/settings" }
  ];

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="h-[85vh] p-0 border-t border-sidebar-border bg-gradient-to-b from-[#003427] to-[#004E37]">
        <div className="flex flex-col h-full relative">
          {/* Overlay semi-transparent */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
          
          {/* Contenu au-dessus de l'overlay */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Indicateur de défilement - petite barre au centre en haut */}
            <div className="w-full flex justify-center pt-2 pb-2">
              <div className="w-12 h-1 bg-white/30 rounded-full"></div>
            </div>

            <div className="flex-1 overflow-auto py-6 px-4">
              {/* Ajout d'un padding-top supplémentaire pour commencer le menu plus bas */}
              <div className="px-4 space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => onOpenChange(false)}
                    className={`flex items-center px-4 py-3 rounded-md text-base font-medium ${
                      isActive(item.path)
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon 
                      name={item.icon}
                      className={`h-5 w-5 mr-3 ${isActive(item.path) ? "text-white" : "text-white/80"}`} 
                    />
                    {item.name}
                  </Link>
                ))}
                
                {/* Sélecteur de langue dans le menu de navigation mobile */}
                <div className="px-4 py-3 mt-4">
                  <p className="text-sm font-medium text-white/80 mb-2">{t('language')}</p>
                  <LanguageSelector />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-white/20">
              <Link to="/profile" className="flex items-center" onClick={() => onOpenChange(false)}>
                <div className="w-10 h-10 bg-[#E5FC37] rounded-full flex items-center justify-center">
                  <span className="text-[#003427] font-medium">MD</span>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-white">Mon profil</div>
                  <div className="text-xs text-white/70">Paramètres du compte</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default MobileNavigation;
