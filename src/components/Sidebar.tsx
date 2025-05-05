
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { 
  BarChart2, 
  FileText, 
  Users, 
  Settings as SettingsIcon, 
  PlusCircle
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navigationItems = [
    { icon: BarChart2, name: "Dashboard", path: "/" },
    { icon: PlusCircle, name: "Facturation", path: "/invoicing" },
    { icon: FileText, name: "Mes factures", path: "/invoices" },
    { icon: Users, name: "Clients", path: "/clients" },
    { icon: SettingsIcon, name: "Paramètres", path: "/settings" }
  ];

  return (
    <div className={`fixed hidden md:flex flex-col bg-credornoir text-white w-64 h-svh ${className}`}>
      <div className="h-[72px] p-6 border-b border-[#2a2a2a]">
        <h1 className="text-lg font-bold text-white">INVOICE MAKER</h1>
      </div>

      <div className="flex-1 px-4 py-6 space-y-1 overflow-auto hide-scrollbar">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-5 py-3.5 rounded-md text-sm transition-colors ${
              isActive(item.path)
                ? "bg-white/10 border-l-2 border-vertlime font-medium text-white"
                : "text-white/80 hover:bg-white/10 active:bg-white/20"
            }`}
          >
            <item.icon className={`h-[18px] w-[18px] mr-4 ${isActive(item.path) ? "text-vertlime" : ""}`} />
            {item.name}
          </Link>
        ))}
      </div>
      
      <div className="mt-auto mb-6 p-4 border-t border-[#2a2a2a]">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-violet rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">MD</span>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium">Me Dupont</div>
            <div className="text-xs text-white/60">Cabinet Dupont</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
