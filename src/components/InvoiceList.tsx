
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { InvoiceStatus } from "./InvoiceStatus";
import { Download, Send, Copy, QrCode, ExternalLink, CheckCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InvoicePaymentConfirmation } from "./InvoicePaymentConfirmation";
import { InvoicePaymentAlert } from "./InvoicePaymentAlert";

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: string;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "draft";
  paymentUrl?: string;
  metadata?: any;
}

interface InvoiceListProps {
  title: string;
  invoices: Invoice[];
  limit?: number;
  showViewAll?: boolean;
  onInvoiceUpdated?: () => void;
}

export function InvoiceList({ 
  title, 
  invoices, 
  limit, 
  showViewAll = false,
  onInvoiceUpdated
}: InvoiceListProps) {
  const displayedInvoices = limit ? invoices.slice(0, limit) : invoices;
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  const handleCopyLink = (paymentUrl: string) => {
    navigator.clipboard.writeText(paymentUrl);
    // In a real app, you would show a toast notification here
    console.log("Payment link copied to clipboard");
  };
  
  const openPaymentConfirmation = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };
  
  const handlePaymentConfirmed = () => {
    if (onInvoiceUpdated) {
      onInvoiceUpdated();
    }
  };
  
  // Fonction pour déterminer la couleur de fond de la ligne en fonction du statut et de la date d'échéance
  const getRowClassName = (invoice: Invoice) => {
    if (invoice.status === "paid") return "";
    if (invoice.status === "overdue") return "bg-red-50";
    
    // Vérifier si l'échéance est proche (moins de 3 jours)
    const today = new Date();
    const dueDate = new Date(invoice.dueDate.split("/").reverse().join("-"));
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3 && diffDays >= 0) return "bg-yellow-50";
    return "";
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        {showViewAll && (
          <Button variant="link" className="text-violet">
            Voir toutes
          </Button>
        )}
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Facture</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedInvoices.map((invoice) => (
              <>
                <TableRow key={invoice.id} className={getRowClassName(invoice)}>
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
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
                          <p>Télécharger la facture</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Send className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Envoyer par email</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      {invoice.status !== "paid" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openPaymentConfirmation(invoice)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Confirmer le paiement</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      
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
                              <p>Copier le lien de paiement</p>
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
                              <p>Ouvrir le lien de paiement</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <QrCode className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Afficher le QR code</p>
                            </TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <InvoicePaymentAlert 
                      dueDate={invoice.dueDate} 
                      status={invoice.status} 
                    />
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {selectedInvoice && (
        <InvoicePaymentConfirmation
          isOpen={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          invoice={selectedInvoice}
          onPaymentConfirmed={handlePaymentConfirmed}
        />
      )}
    </div>
  );
}

export default InvoiceList;
