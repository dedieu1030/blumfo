
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { 
  BarChart2, 
  FileText, 
  Users, 
  Settings, 
  PlusCircle,
  Package,
  LayoutTemplate
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "./LanguageSelector";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";

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
  
  // Updated navigationItems to match the ones in Sidebar.tsx
  const navigationItems = [
    { icon: BarChart2, name: t('dashboard'), path: "/" },
    { icon: PlusCircle, name: t('invoicing'), path: "/invoicing" },
    { icon: FileText, name: t('invoices'), path: "/invoices" },
    { icon: LayoutTemplate, name: t('templates'), path: "/templates" },
    { icon: Users, name: t('clients'), path: "/clients" },
    { icon: Package, name: t('products'), path: "/products" },
    { icon: Settings, name: t('settings'), path: "/settings" }
  ];

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] bg-[#F0EBE7] border-t border-sidebar-border">
        <div className="flex flex-col h-full pt-2">
          {/* La barre de défilement est automatiquement ajoutée par le composant Drawer */}
          
          <div className="flex-1 overflow-auto py-4">
            <div className="px-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onOpenChange(false)}
                  className={`flex items-center px-4 py-3 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? "bg-white/50 text-[#003427]"
                      : "text-gray-700 hover:text-gray-900 hover:bg-white/20"
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${isActive(item.path) ? "text-[#003427]" : ""}`} />
                  {item.name}
                </Link>
              ))}
              
              {/* Sélecteur de langue dans le menu de navigation mobile */}
              <div className="px-4 py-3 mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">{t('language')}</p>
                <LanguageSelector />
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-taupe/30">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#003427] rounded-full flex items-center justify-center">
                <span className="text-white font-medium">MD</span>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-800">Me Dupont</div>
                <div className="text-xs text-gray-600">Cabinet Dupont</div>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default MobileNavigation;
