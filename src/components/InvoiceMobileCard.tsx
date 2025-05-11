
import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InvoiceStatus } from "./InvoiceStatus";
import { ChevronDown, ChevronUp, Download, Send, Copy, QrCode, ExternalLink, Check } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface Invoice {
  id: string;
  number: string;
  invoice_number: string;
  client: string;
  amount: string;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "draft";
  paymentUrl?: string;
  stripeInvoiceId?: string;
}

interface InvoiceMobileCardProps {
  invoice: Invoice;
  onCopyLink: (url: string) => void;
  onConfirmPayment: (invoice: Invoice) => void;
}

export function InvoiceMobileCard({ invoice, onCopyLink, onConfirmPayment }: InvoiceMobileCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  
  return (
    <Card className={`mb-3 ${invoice.status === "overdue" ? "bg-amber-50" : ""}`}>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-sm">{invoice.number}</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{invoice.client}</p>
          </div>
          <InvoiceStatus status={invoice.status} />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pb-0">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">{invoice.amount}</div>
          <div className="text-sm text-muted-foreground">{invoice.date}</div>
        </div>
      </CardContent>
      
      {expanded && (
        <div className="px-4 py-2 bg-secondary/10 text-sm space-y-1 animate-accordion-down">
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
          className="text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              {t("showLess")}
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              {t("showMore")}
            </>
          )}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
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
