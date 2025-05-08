
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { 
  BarChart2, 
  FileText, 
  Users, 
  Settings, 
  CreditCard,
  Package,
  LayoutTemplate
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { RoleGuard } from "./auth/RoleGuard";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
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
    { icon: CreditCard, name: t('invoicing'), path: "/invoicing" },
    { icon: LayoutTemplate, name: t('templates'), path: "/templates" },
    { icon: Package, name: t('products'), path: "/products" },
  ];
  
  const allNavigationItems = [...baseNavigationItems];
  
  // For rendering later - we don't filter based on roles,
  // instead we'll conditionally render using the RoleGuard component
  // This way the navigation structure stays consistent
  const navigationItems = [...baseNavigationItems, ...managerNavigationItems];

  return (
    <div className={`fixed hidden md:flex flex-col bg-[#F0EBE7] text-gray-800 w-64 h-screen ${className}`}>
      <div className="p-8 flex justify-center items-center">
        <h1 className="font-['Space_Mono'] font-bold text-3xl tracking-tighter text-[#003427]">
          blumfo<span className="inline-flex items-center">
            <span className="h-1.5 w-1.5 ml-0.5 rounded-full bg-[#FA7043]"></span>
          </span>
        </h1>
      </div>

      <div className="flex-1 px-4 py-6 space-y-1">
        {/* Base items always visible */}
        {baseNavigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
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
              className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
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
      
      <div className="p-4 border-t border-gray-200">
        {user ? (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#003427] rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
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
  );
}

export default Sidebar;
