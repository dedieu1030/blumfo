
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { markInvoiceAsPaid, PaymentDetails } from '@/services/invoiceApiClient';
import { useToast } from "@/hooks/use-toast";

interface InvoiceMarkAsPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    invoice_number: string;
    amount?: number;
  };
  onSuccess?: () => void;
}

export function InvoiceMarkAsPaidDialog({
  open,
  onOpenChange,
  invoice,
  onSuccess
}: InvoiceMarkAsPaidDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<string>('bankTransfer');
  const [paymentReference, setPaymentReference] = useState<string>('');
  
  const handleConfirm = async () => {
    if (!invoice.id || isProcessing) return;
    
    setIsProcessing(true);
    
    const paymentDetails: PaymentDetails = {
      date: paymentDate,
      method: paymentMethod,
      reference: paymentReference
    };
    
    try {
      const response = await markInvoiceAsPaid(invoice.id, paymentDetails);
      
      if (response.success) {
        toast({
          title: t("paymentConfirmed", "Paiement confirmé"),
          description: t(
            "invoiceMarkedAsPaid", 
            "La facture {{number}} a été marquée comme payée", 
            { number: invoice.invoice_number }
          ),
        });
        
        if (onSuccess) {
          onSuccess();
        }
        
        onOpenChange(false);
      } else {
        toast({
          title: t("error", "Erreur"),
          description: response.error || t("markAsPaidError", "Une erreur s'est produite lors du marquage du paiement"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors du marquage du paiement:", error);
      toast({
        title: t("error", "Erreur"),
        description: t("unexpectedError", "Une erreur inattendue s'est produite"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isProcessing) {
          onOpenChange(isOpen);
        }
      }}
    >
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("markAsPaid", "Marquer comme payée")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("confirmMarkInvoiceAsPaid", "Confirmez-vous que cette facture a été payée ?")}
            
            <div className="mt-2 p-3 bg-muted rounded-md">
              <p className="font-medium">{t("invoice", "Facture")}: {invoice.invoice_number}</p>
              {invoice.amount && (
                <p className="text-sm text-muted-foreground">
                  {t("amount", "Montant")}: {invoice.amount.toLocaleString(undefined, {
                    style: 'currency',
                    currency: 'EUR'
                  })}
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="payment-date">{t("paymentDate", "Date du paiement")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="payment-date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !paymentDate && "text-muted-foreground"
                  )}
                  disabled={isProcessing}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "PPP", { locale: fr }) : <span>Sélectionner une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={(date) => {
                    if (date) {
                      setPaymentDate(date);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-method">{t("paymentMethod", "Méthode de paiement")}</Label>
            <Select 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
              disabled={isProcessing}
            >
              <SelectTrigger id="payment-method" className="w-full">
                <SelectValue placeholder={t("selectPaymentMethod", "Sélectionner une méthode")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bankTransfer">{t("bankTransfer", "Virement bancaire")}</SelectItem>
                <SelectItem value="check">{t("check", "Chèque")}</SelectItem>
                <SelectItem value="cash">{t("cash", "Espèces")}</SelectItem>
                <SelectItem value="creditCard">{t("creditCard", "Carte de crédit")}</SelectItem>
                <SelectItem value="paypal">{t("paypal", "PayPal")}</SelectItem>
                <SelectItem value="other">{t("other", "Autre")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-reference">{t("paymentReference", "Référence de paiement")}</Label>
            <Input
              id="payment-reference"
              placeholder={t("referenceExample", "e.g., VIR-25052023-XYZ")}
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground">
              {t("optionalField", "Champ facultatif")}
            </p>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>{t("cancel", "Annuler")}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            className="bg-success hover:bg-success/90"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("processing", "Traitement en cours...")}
              </>
            ) : (
              t("confirm", "Confirmer")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
