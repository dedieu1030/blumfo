import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarCheck, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

// Types pour les méthodes de paiement
type PaymentMethod = "bank_transfer" | "check" | "cash" | "stripe" | "other";

interface InvoicePaymentConfirmationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    number: string;
    amount: string;
    dueDate?: string;
    status: "paid" | "pending" | "overdue" | "draft";
    stripeInvoiceId?: string;
    stripeCusomerId?: string;
  };
  onConfirm: () => void;
}

export function InvoicePaymentConfirmation({ 
  isOpen, 
  onOpenChange, 
  invoice, 
  onConfirm 
}: InvoicePaymentConfirmationProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [reference, setReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!paymentDate) {
      toast({
        title: t("error", "Erreur"),
        description: t("selectPaymentDate", "Veuillez sélectionner une date de paiement"),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mettre à jour le statut de la facture dans Supabase
      const updateData = {
        status: 'paid',
        paid_date: paymentDate.toISOString(),
        amount_paid: parseInt(invoice.amount.replace(/[^0-9]/g, '')), 
        metadata: {
          payment_method: paymentMethod,
          reference: reference,
          manually_confirmed: true,
          confirmed_at: new Date().toISOString()
        }
      };
      
      // Using "as any" to bypass type checking issues with Supabase client
      const { error } = await (supabase as any)
        .from('stripe_invoices')
        .update(updateData)
        .eq('stripe_invoice_id', invoice.stripeInvoiceId)
        .eq('id', invoice.id);

      if (error) throw error;
      
      toast({
        title: t("paymentConfirmed", "Paiement confirmé"),
        description: t("invoiceMarkedAsPaid", "La facture {{number}} a été marquée comme payée", { number: invoice.number }),
      });
      
      onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la confirmation du paiement:", error);
      toast({
        title: t("error", "Erreur"),
        description: t("paymentConfirmError", "Erreur lors de la confirmation du paiement"),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" /> 
            {t("confirmPayment")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <p className="mb-2 font-medium">{t("invoice")}: {invoice.number}</p>
            <p className="text-sm text-muted-foreground mb-4">{t("amount")}: {invoice.amount}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("paymentDate")}</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "PPP", { locale: fr }) : t("selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={(date) => setPaymentDate(date || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("paymentMethod")}</p>
            <Select 
              defaultValue={paymentMethod} 
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectPaymentMethod")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">{t("bankTransfer")}</SelectItem>
                <SelectItem value="check">{t("check")}</SelectItem>
                <SelectItem value="cash">{t("cash")}</SelectItem>
                <SelectItem value="stripe">{t("stripeOffPlatform")}</SelectItem>
                <SelectItem value="other">{t("other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("paymentReference")}</p>
            <Input
              placeholder={t("referenceExample")}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("referenceHelp")}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-violet hover:bg-violet/90"
          >
            {isSubmitting ? t("confirming") : t("confirmPaymentButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InvoicePaymentConfirmation;
