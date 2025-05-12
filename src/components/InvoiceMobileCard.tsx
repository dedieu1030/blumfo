
import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Download, Send, Copy, QrCode, ExternalLink, Check, Calendar, Hash } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Invoice } from "@/types/invoice"; 

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
  const formatAmount = (amount: string) => {
    if (!amount) return '0,00 €';
    
    // Si le montant a déjà un symbole de devise, le retourner tel quel
    if (amount.includes('€')) return amount;
    
    // Sinon, formater le montant avec le symbole de devise
    const numAmount = parseFloat(amount.replace(/[^\d.,]/g, '').replace(',', '.'));
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(numAmount);
  };

  // Helper pour obtenir la classe CSS appropriée pour le badge de statut
  const getStatusBadgeVariant = (status: string): "pending" | "paid" | "overdue" | "draft" => {
    return status as "pending" | "paid" | "overdue" | "draft";
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
              <Hash className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="font-medium text-sm">{invoice.number}</p>
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
          <div className="text-base font-medium">{formatAmount(invoice.amount)}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {invoice.date}
          </div>
        </div>
      </CardContent>
      
      {expanded && (
        <div className="px-3 py-2 bg-secondary/10 text-sm space-y-1.5 animate-accordion-down">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("dueDate")}</span>
            <span>{invoice.dueDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("invoiceNumber")}</span>
            <span>{invoice.invoice_number}</span>
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
              <ChevronUp className="h-3.5 w-3.5 mr-1" />
              {t("showLess")}
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5 mr-1" />
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
              <Download className="h-4 w-4 mr-2" />
              <span>{t("downloadInvoice")}</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => {}}>
              <Send className="h-4 w-4 mr-2" />
              <span>{t("sendByEmail")}</span>
            </DropdownMenuItem>
            
            {invoice.paymentUrl && (
              <>
                <DropdownMenuItem onClick={() => onCopyLink(invoice.paymentUrl!)}>
                  <Copy className="h-4 w-4 mr-2" />
                  <span>{t("copyPaymentLink")}</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => window.open(invoice.paymentUrl, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <span>{t("openPaymentLink")}</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => {}}>
                  <QrCode className="h-4 w-4 mr-2" />
                  <span>{t("showQrCode")}</span>
                </DropdownMenuItem>
              </>
            )}
            
            {(invoice.status === "pending" || invoice.status === "overdue") && (
              <DropdownMenuItem 
                onClick={() => onConfirmPayment(invoice)}
                className="text-success"
              >
                <Check className="h-4 w-4 mr-2" />
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
