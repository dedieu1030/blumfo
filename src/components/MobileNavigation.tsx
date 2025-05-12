
import { Drawer, DrawerClose, DrawerContent } from "@/components/ui/drawer";
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
  User
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "./LanguageSelector";
import { Button } from "./ui/button";
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { toast } from "sonner";

interface MobileNavigationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNavigation({ isOpen, onOpenChange }: MobileNavigationProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const { signOut } = useClerkAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Vous avez été déconnecté avec succès');
      onOpenChange(false);
    } catch (error) {
      toast.error('Une erreur est survenue lors de la déconnexion');
      console.error('Erreur de déconnexion:', error);
    }
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

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} shouldScaleBackground={false}>
      <DrawerContent className="h-[85vh] p-0 border-t border-sidebar-border">
        <div className="flex flex-col h-full relative">
          {/* Indicateur de défilement - petite barre au centre en haut */}
          <div className="w-full flex justify-center pt-2 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
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
                      ? "bg-secondary/80 text-foreground"
                      : "text-foreground/80 hover:text-foreground hover:bg-accent/10"
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${isActive(item.path) ? "text-primary" : "text-foreground/80"}`} />
                  {item.name}
                </Link>
              ))}
              
              {/* Lien vers la page profil */}
              <Link
                to="/profile"
                onClick={() => onOpenChange(false)}
                className={`flex items-center px-4 py-3 rounded-md text-base font-medium ${
                  isActive("/profile")
                    ? "bg-secondary/80 text-foreground"
                    : "text-foreground/80 hover:text-foreground hover:bg-accent/10"
                }`}
              >
                <User className={`h-5 w-5 mr-3 ${isActive("/profile") ? "text-primary" : "text-foreground/80"}`} />
                {t('profile', 'Profil')}
              </Link>
              
              {/* Sélecteur de langue dans le menu de navigation mobile */}
              <div className="px-4 py-3 mt-4">
                <p className="text-sm font-medium text-foreground/80 mb-2">{t('language')}</p>
                <LanguageSelector />
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-medium">MD</span>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium">Me Dupont</div>
                  <div className="text-xs text-muted-foreground">Cabinet Dupont</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive">
                Déconnecter
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default MobileNavigation;
