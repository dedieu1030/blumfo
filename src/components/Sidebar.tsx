
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { 
  BarChart2, 
  FileText, 
  Users, 
  Settings, 
  CreditCard,
  Package,
  LayoutTemplate,
  LogIn
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const { isAuthenticated, userProfile } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navigationItems = [
    { icon: BarChart2, name: t('dashboard'), path: "/" },
    { icon: CreditCard, name: t('invoicing'), path: "/invoicing" },
    { icon: FileText, name: t('invoices'), path: "/invoices" },
    { icon: LayoutTemplate, name: t('templates'), path: "/templates" },
    { icon: Users, name: t('clients'), path: "/clients" },
    { icon: Package, name: t('products'), path: "/products" },
    { icon: Settings, name: t('settings'), path: "/settings" }
  ];

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
        {navigationItems.map((item) => (
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
        
        {!isAuthenticated && (
          <Link
            to="/auth"
            className="flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-gray-700 hover:text-gray-900 hover:bg-white/20"
          >
            <LogIn className="h-5 w-5 mr-3" />
            {t('login')}
          </Link>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        {isAuthenticated && userProfile ? (
          <Link to="/profile" className="flex items-center">
            <div className="w-8 h-8 bg-[#003427] rounded-full flex items-center justify-center">
              {userProfile.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt={userProfile.full_name} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-medium text-sm">
                  {userProfile.full_name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-800">{userProfile.full_name}</div>
              <div className="text-xs text-gray-600">{userProfile.email}</div>
            </div>
          </Link>
        ) : (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-800">Invité</div>
              <div className="text-xs text-gray-600">Non connecté</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
