
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { 
  BarChart2, 
  FileText, 
  Users, 
  Settings, 
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
    { icon: Settings, name: "Paramètres", path: "/settings" }
  ];

  return (
    <div className={`fixed hidden md:flex flex-col bg-credornoir text-white w-64 h-screen ${className}`}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">LexFacture</h1>
        <div className="mt-1 text-sm text-gray-400">Facturez sans friction</div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-1">
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              isActive(item.path)
                ? "bg-white/10 text-vertlime"
                : "text-white/80 hover:text-white hover:bg-white/5"
            }`}
          >
            <item.icon className={`h-5 w-5 mr-3 ${isActive(item.path) ? "text-vertlime" : ""}`} />
            {item.name}
          </Link>
        ))}
      </div>
      
      <div className="p-4 border-t border-[#2a2a2a]">
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
