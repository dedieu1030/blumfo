
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { 
  BarChart2, 
  FileText, 
  Users, 
  Settings, 
  PlusCircle,
  Package,
  LayoutTemplate,
  X
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "./LanguageSelector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    { icon: BarChart2, name: t('dashboard'), path: "/" },
    { icon: PlusCircle, name: t('invoicing'), path: "/invoicing" },
    { icon: FileText, name: t('invoices'), path: "/invoices" },
    { icon: LayoutTemplate, name: t('templates'), path: "/templates" },
    { icon: Users, name: t('clients'), path: "/clients" },
    { icon: Package, name: t('products'), path: "/products" },
    { icon: Settings, name: t('settings'), path: "/settings" }
  ];

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-[#003427] text-white flex flex-col",
        "animate-fade-in"
      )}
    >
      {/* Close button in top right corner */}
      <Button 
        onClick={() => onOpenChange(false)}
        variant="ghost" 
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/10"
      >
        <X className="h-6 w-6" />
      </Button>
      
      <div className="flex flex-col h-full pt-16">
        <div className="flex-1 overflow-auto py-4">
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
                <item.icon className="h-5 w-5 mr-3" />
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
        
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">MD</span>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-white">Me Dupont</div>
              <div className="text-xs text-white/70">Cabinet Dupont</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileNavigation;
