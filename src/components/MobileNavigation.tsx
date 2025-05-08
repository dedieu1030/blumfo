
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { 
  BarChart2, 
  FileText, 
  Users, 
  Settings, 
  PlusCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { RoleGuard } from "./auth/RoleGuard";

interface MobileNavigationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNavigation({ isOpen, onOpenChange }: MobileNavigationProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Base navigation items always visible to authenticated users
  const baseNavigationItems = [
    { icon: BarChart2, name: t('dashboard'), path: "/" },
    { icon: FileText, name: t('invoices'), path: "/invoices" },
    { icon: Users, name: t('clients'), path: "/clients" },
    { icon: Settings, name: t('settings'), path: "/settings" }
  ];
  
  // Items available only to managers and admins
  const managerNavigationItems = [
    { icon: PlusCircle, name: t('invoicing'), path: "/invoicing" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-[10px] bg-[#F0EBE7] border-t border-sidebar-border p-0">
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center justify-center">
            <h1 className="font-['Space_Mono'] font-bold text-3xl tracking-tighter text-[#003427]">
              blumfoo
            </h1>
          </div>
          
          <div className="flex-1 overflow-auto py-4">
            <div className="px-4 space-y-1">
              {/* Base items always visible */}
              {baseNavigationItems.map((item) => (
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
              
              {/* Manager/Admin only items with RoleGuard */}
              <RoleGuard role={["manager", "admin"]}>
                {managerNavigationItems.map((item) => (
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
              </RoleGuard>
            </div>
          </div>
          
          <div className="p-4 border-t border-taupe/30">
            {user ? (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-[#003427] rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user.email ? user.email.substring(0, 2).toUpperCase() : 'UN'}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-800">
                    {user.email || 'User'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {user.roles?.includes('admin') ? 'Administrateur' : 
                     user.roles?.includes('manager') ? 'Gestionnaire' : 'Utilisateur'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Non connecté</div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNavigation;
