
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { InvoiceDialog } from "./InvoiceDialog";

interface HeaderProps {
  title: string;
  description?: string;
  onOpenMobileMenu?: () => void;
}

export function Header({ title, description, onOpenMobileMenu }: HeaderProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="mb-4 -ml-3" 
              onClick={onOpenMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button 
            className="bg-violet hover:bg-violet/90"
            onClick={() => setInvoiceDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      <InvoiceDialog 
        open={invoiceDialogOpen} 
        onOpenChange={setInvoiceDialogOpen} 
      />
    </>
  );
}

export default Header;
