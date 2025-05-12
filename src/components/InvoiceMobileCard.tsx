
import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Invoice } from "@/types/invoice"; 
import { Icon } from "@/components/ui/icon";

interface InvoiceMobileCardProps {
  invoice: Invoice;
  onCopyLink: (url: string) => void;
  onConfirmPayment: (invoice: Invoice) => void;
}

export function InvoiceMobileCard({ invoice, onCopyLink, onConfirmPayment }: InvoiceMobileCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Helper function to get client name safely
  const getClientName = () => {
    if (typeof invoice.client === 'string') {
      return invoice.client;
    }
    return invoice.client?.client_name || invoice.client_name || "Client inconnu";
  };

  // Méthode pour formater le montant avec le symbole de devise
  const formatAmount = (amount: string | number) => {
    if (!amount) return '0,00 €';
    
    // Si le montant est déjà une chaîne et contient un symbole de devise, le retourner tel quel
    if (typeof amount === 'string' && amount.includes('€')) return amount;
    
    // Sinon, formater le montant avec le symbole de devise
    const numAmount = typeof amount === 'number' 
      ? amount 
      : parseFloat(amount.replace(/[^\d.,]/g, '').replace(',', '.'));
    
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(numAmount);
  };

  // Helper pour obtenir la classe CSS appropriée pour le badge de statut
  const getStatusBadgeVariant = (status: string): "pending" | "paid" | "overdue" | "draft" => {
    if (status === "pending" || status === "paid" || status === "overdue" || status === "draft") {
      return status;
    }
    // Valeur par défaut si le statut ne correspond pas aux variantes prédéfinies
    return "pending";
  };
  
  return (
    <Card className={`mb-3 relative overflow-hidden ${invoice.status === "overdue" ? "border-red-200" : ""}`}>
      {invoice.status === "overdue" && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-400" />
      )}
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Icon name="Hash" size={14} className="text-muted-foreground" />
              <p className="font-medium text-sm">{invoice.number || invoice.invoice_number}</p>
            </div>
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{getClientName()}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(invoice.status)} className="capitalize">
            {t(invoice.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 pb-1">
        <div className="flex justify-between items-center">
          <div className="text-base font-medium">{formatAmount(invoice.amount || invoice.total_amount)}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Icon name="Calendar" size={14} />
            {invoice.date || invoice.issue_date}
          </div>
        </div>
      </CardContent>
      
      {expanded && (
        <div className="px-3 py-2 bg-secondary/10 text-sm space-y-1.5 animate-accordion-down">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("dueDate")}</span>
            <span>{invoice.dueDate || invoice.due_date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("invoiceNumber")}</span>
            <span>{invoice.invoice_number || invoice.number}</span>
          </div>
        </div>
      )}
      
      <CardFooter className="p-3 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs h-8 px-2"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <Icon name="ArrowUp" size={14} className="mr-1" />
              {t("showLess")}
            </>
          ) : (
            <>
              <Icon name="ArrowDown" size={14} className="mr-1" />
              {t("showMore")}
            </>
          )}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              {t("actions")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => {}}>
              <Icon name="Download" size={16} className="mr-2" />
              <span>{t("downloadInvoice")}</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => {}}>
              <Icon name="Send" size={16} className="mr-2" />
              <span>{t("sendByEmail")}</span>
            </DropdownMenuItem>
            
            {(invoice.paymentUrl) && (
              <>
                <DropdownMenuItem onClick={() => onCopyLink(invoice.paymentUrl || '')}>
                  <Icon name="Copy" size={16} className="mr-2" />
                  <span>{t("copyPaymentLink")}</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => window.open(invoice.paymentUrl, '_blank')}>
                  <Icon name="ExternalLink" size={16} className="mr-2" />
                  <span>{t("openPaymentLink")}</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => {}}>
                  <Icon name="QrCode" size={16} className="mr-2" />
                  <span>{t("showQrCode")}</span>
                </DropdownMenuItem>
              </>
            )}
            
            {(invoice.status === "pending" || invoice.status === "overdue") && (
              <DropdownMenuItem 
                onClick={() => onConfirmPayment(invoice)}
                className="text-success"
              >
                <Icon name="Check" size={16} className="mr-2" />
                <span>{t("markAsPaid")}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}

export default InvoiceMobileCard;
