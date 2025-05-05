
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { 
  BarChart2, 
  FileText, 
  Users, 
  Settings, 
  PlusCircle
} from "lucide-react";

interface MobileNavigationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNavigation({ isOpen, onOpenChange }: MobileNavigationProps) {
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
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-[10px] bg-credornoir border-t border-[#2a2a2a] p-0">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-[#2a2a2a]">
            <h1 className="text-xl font-bold text-white">INVOICE MAKER</h1>
            <p className="text-sm text-white/60">Facturez sans friction</p>
          </div>
          
          <div className="flex-1 overflow-auto py-4">
            <div className="px-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onOpenChange(false)}
                  className={`flex items-center px-5 py-3.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-white/10 border-l-2 border-vertlime text-white"
                      : "text-white/80 hover:bg-white/10 active:bg-white/20"
                  }`}
                >
                  <item.icon className={`h-[18px] w-[18px] mr-4 ${isActive(item.path) ? "text-vertlime" : ""}`} />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="mt-auto mb-6 p-4 border-t border-[#2a2a2a]">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-violet rounded-full flex items-center justify-center">
                <span className="text-white font-medium">MD</span>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-white">Me Dupont</div>
                <div className="text-xs text-white/60">Cabinet Dupont</div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNavigation;
