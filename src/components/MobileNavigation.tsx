
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
      <SheetContent side="bottom" className="h-[85vh] rounded-t-[10px] bg-[#F0EBE7] border-t border-sidebar-border p-0">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-taupe/30">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/6db1c939-3330-41a4-84da-a0d8cce560c1.png" 
                alt="LexFacture Logo" 
                className="h-8 mr-2"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">LexFacture</h1>
                <p className="text-sm text-gray-600">Facturez sans friction</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto py-4">
            <div className="px-4 space-y-1">
              {navigationItems.map((item) => (
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
            </div>
          </div>
          
          <div className="p-4 border-t border-taupe/30">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-violet rounded-full flex items-center justify-center">
                <span className="text-white font-medium">MD</span>
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-800">Me Dupont</div>
                <div className="text-xs text-gray-600">Cabinet Dupont</div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNavigation;
