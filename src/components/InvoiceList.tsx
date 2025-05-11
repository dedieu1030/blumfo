
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { InvoiceStatus } from "./InvoiceStatus";
import { Download, Send, Copy, QrCode, ExternalLink, Check, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InvoicePaymentConfirmation } from "./InvoicePaymentConfirmation";
import { InvoicePaymentConfirmDialog } from "./InvoicePaymentConfirmDialog";
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

interface InvoiceListProps {
  title: string;
  invoices: Invoice[];
  limit?: number;
  showViewAll?: boolean;
  onInvoiceStatusChanged?: () => void;
}

export function InvoiceList({ 
  title, 
  invoices, 
  limit, 
  showViewAll = false,
  onInvoiceStatusChanged
}: InvoiceListProps) {
  const displayedInvoices = limit ? invoices.slice(0, limit) : invoices;
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleCopyLink = (paymentUrl: string) => {
    navigator.clipboard.writeText(paymentUrl);
    toast({
      title: t("linkCopied"),
      description: t("paymentLinkCopiedToClipboard")
    });
  };

  const handleConfirmPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsConfirmDialogOpen(true);
  };
  
  const handlePaymentConfirmed = () => {
    setIsConfirmDialogOpen(false);
    setIsPaymentDialogOpen(true);
  };
  
  // Function to close dialogs and refresh data - optimized version
  const handleDialogClose = () => {
    setIsPaymentDialogOpen(false);
    setSelectedInvoice(null);
    
    // Only refresh data if callback is provided
    if (onInvoiceStatusChanged) {
      setIsProcessing(true);
      
      try {
        onInvoiceStatusChanged();
      } catch (error) {
        console.error("Error refreshing invoice data:", error);
        toast({
          title: t("refreshError", "Erreur de rafraîchissement"),
          description: t("errorRefreshingData", "Erreur lors du rafraîchissement des données. Veuillez réessayer."),
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        {showViewAll && (
          <Button variant="link" className="text-violet">
            {t("viewAll")}
          </Button>
        )}
      </div>
      
      <div className="border rounded-lg overflow-hidden relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm">{t("refreshing", "Actualisation...")}</span>
            </div>
          </div>
        )}
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("invoice")}</TableHead>
              <TableHead>{t("client")}</TableHead>
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("amount")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedInvoices.map((invoice) => (
              <TableRow 
                key={invoice.id}
                className={invoice.status === "overdue" ? "bg-amber-50" : ""}
              >
                <TableCell className="font-medium">{invoice.number}</TableCell>
                <TableCell>{invoice.client}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>{invoice.amount}</TableCell>
                <TableCell>
                  <InvoiceStatus status={invoice.status} />
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("downloadInvoice")}</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Send className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("sendByEmail")}</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    {invoice.paymentUrl && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleCopyLink(invoice.paymentUrl!)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("copyPaymentLink")}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => window.open(invoice.paymentUrl, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("openPaymentLink")}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("showQrCode")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </>
                    )}

                    {/* Bouton pour marquer la facture comme payée */}
                    {(invoice.status === "pending" || invoice.status === "overdue") && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-success hover:bg-success/10"
                            onClick={() => handleConfirmPayment(invoice)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("markAsPaid")}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Dialogue de confirmation préalable */}
      {selectedInvoice && (
        <InvoicePaymentConfirmDialog
          isOpen={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          invoice={{
            id: selectedInvoice.id,
            invoice_number: selectedInvoice.invoice_number,
            amount: parseFloat(selectedInvoice.amount.replace(/[^\d.-]/g, ''))
          }}
          onConfirm={handlePaymentConfirmed}
        />
      )}
      
      {/* Dialogue de confirmation de réussite du paiement */}
      {selectedInvoice && (
        <InvoicePaymentConfirmation
          isOpen={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          invoice={{
            id: selectedInvoice.id,
            invoice_number: selectedInvoice.invoice_number,
            amount: parseFloat(selectedInvoice.amount.replace(/[^\d.-]/g, ''))
          }}
          success={true}
          onConfirm={handleDialogClose}
        />
      )}
    </div>
  );
}

export default InvoiceList;
