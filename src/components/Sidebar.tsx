
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon, IconName } from "@/components/ui/icon";

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
    { icon: "PieChart" as IconName, name: t('dashboard'), path: "/" },
    { icon: "CreditCard" as IconName, name: t('invoicing'), path: "/invoicing" },
    { icon: "FileText" as IconName, name: t('invoices'), path: "/invoices" },
    { icon: "FileEdit" as IconName, name: "Devis", path: "/quotes" },
    { icon: "LayoutGrid" as IconName, name: t('templates'), path: "/templates" },
    { icon: "Users" as IconName, name: t('clients'), path: "/clients" },
    { icon: "Package" as IconName, name: t('products'), path: "/products" },
    { icon: "Settings" as IconName, name: t('settings'), path: "/settings" }
  ];

  // Obtention des initiales de l'utilisateur pour l'avatar
  const initials = user?.full_name 
    ? user.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
    : "MD";

  return (
    <div className={`fixed hidden md:flex flex-col bg-gradient-to-b from-[#003427] via-[#004E37] to-[#F0EBE7] text-gray-800 w-64 h-screen relative ${className}`}>
      {/* Overlay semi-transparent pour améliorer la lisibilité du texte */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
      
      {/* Contenu de la sidebar au-dessus de l'overlay */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="p-8 flex justify-center items-center">
          <h1 className="font-['Space_Mono'] font-bold text-3xl tracking-tighter text-white">
            blumfo<span className="inline-flex items-center">
              <span className="h-1.5 w-1.5 ml-0.5 rounded-full bg-[#E5FC37]"></span>
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
                  ? "bg-white/20 text-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon 
                name={item.icon} 
                size={20} 
                className={`mr-3 ${isActive(item.path) ? "text-white" : "text-white/80"}`} 
              />
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="p-4 border-t border-white/20">
          <Link 
            to="/profile" 
            className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
              isActive("/profile")
                ? "bg-white/20 text-white"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Avatar className="h-8 w-8 mr-3">
              <AvatarFallback className="bg-[#E5FC37] text-[#003427] text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">Mon profil</div>
              <div className="text-xs text-white/70">Paramètres du compte</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
