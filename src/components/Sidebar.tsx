
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";

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
  
  const navigationItems = [
    { icon: "PieChart", name: t('dashboard'), path: "/" },
    { icon: "CreditCard", name: t('invoicing'), path: "/invoicing" },
    { icon: "FileText", name: t('invoices'), path: "/invoices" },
    { icon: "FileEdit", name: "Devis", path: "/quotes" },
    { icon: "LayoutGrid", name: t('templates'), path: "/templates" },
    { icon: "Users", name: t('clients'), path: "/clients" },
    { icon: "Package", name: t('products'), path: "/products" },
    { icon: "Settings", name: t('settings'), path: "/settings" }
  ];

  // Obtention des initiales de l'utilisateur pour l'avatar
  const initials = user?.full_name 
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
    : "MD";

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
            <Icon 
              name={item.icon} 
              size={20} 
              className={`mr-3 ${isActive(item.path) ? "text-[#003427]" : ""}`} 
            />
            {item.name}
          </Link>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <Link 
          to="/profile" 
          className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
            isActive("/profile")
              ? "bg-white/50 text-[#003427]"
              : "text-gray-700 hover:text-gray-900 hover:bg-white/20"
          }`}
        >
          <Avatar className="h-8 w-8 mr-3">
            <AvatarFallback className="bg-[#003427] text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium">Mon profil</div>
            <div className="text-xs text-gray-600">Paramètres du compte</div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
