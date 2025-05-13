
import { CalendarPlus, FileText, Share2, Send, Wallet, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { InvoiceData } from "@/types/invoice";
import { useState } from "react";
import { InvoiceDialog } from "./InvoiceDialog";

interface QuickActionProps {
  title: string;
  icon: JSX.Element;
  action: () => void | Promise<void>;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

function ActionButton({ title, icon, action, variant = "outline" }: QuickActionProps) {
  return (
    <Button
      variant={variant}
      className="flex flex-col items-center justify-center h-24 gap-2"
      onClick={action}
    >
      {icon}
      <span className="text-sm">{title}</span>
    </Button>
  );
}

export function QuickAction() {
  const navigate = useNavigate();
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateInvoice = async (invoiceData: InvoiceData): Promise<void> => {
    setIsGenerating(true);
    
    try {
      // Simuler un délai pour la génération
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Naviguer vers la page des factures après la génération
      navigate("/invoices");
    } catch (error) {
      console.error("Error generating invoice:", error);
    } finally {
      setIsGenerating(false);
      setInvoiceDialogOpen(false);
    }
    
    return Promise.resolve();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-3">
          <ActionButton
            title="Nouvelle facture"
            icon={<FileText className="h-6 w-6" />}
            action={() => setInvoiceDialogOpen(true)}
          />
          <ActionButton
            title="Devis"
            icon={<CalendarPlus className="h-6 w-6" />}
            action={() => navigate("/quotes")}
          />
          <ActionButton
            title="Partager"
            icon={<Share2 className="h-6 w-6" />}
            action={() => navigate("/invoices")}
          />
          <ActionButton
            title="Relances"
            icon={<Send className="h-6 w-6" />}
            action={() => navigate("/invoicing")}
          />
          <ActionButton
            title="Paiements"
            icon={<Wallet className="h-6 w-6" />}
            action={() => navigate("/settings")}
          />
          <ActionButton
            title="Rapports"
            icon={<BarChart3 className="h-6 w-6" />}
            action={() => navigate("/invoices")}
          />
        </div>
      </CardContent>
      
      <InvoiceDialog 
        open={invoiceDialogOpen} 
        onOpenChange={setInvoiceDialogOpen}
        onGenerateInvoice={handleGenerateInvoice} 
        isGenerating={isGenerating}
      />
    </Card>
  );
}
