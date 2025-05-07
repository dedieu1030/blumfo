
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
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [reference, setReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!paymentDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date de paiement",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mettre à jour le statut de la facture dans Supabase
      const { error } = await supabase
        .from('stripe_invoices')
        .update({
          status: 'paid',
          paid_date: paymentDate.toISOString(),
          amount_paid: parseInt(invoice.amount.replace(/[^0-9]/g, '')), 
          metadata: {
            payment_method: paymentMethod,
            reference: reference,
            manually_confirmed: true,
            confirmed_at: new Date().toISOString()
          }
        })
        .eq('stripe_invoice_id', invoice.stripeInvoiceId)
        .eq('id', invoice.id);

      if (error) throw error;
      
      toast({
        title: "Paiement confirmé",
        description: `La facture ${invoice.number} a été marquée comme payée.`,
      });
      
      onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la confirmation du paiement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de confirmer le paiement. Veuillez réessayer.",
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
            Confirmer le paiement
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <p className="mb-2 font-medium">Facture: {invoice.number}</p>
            <p className="text-sm text-muted-foreground mb-4">Montant: {invoice.amount}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Date de paiement</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "PPP", { locale: fr }) : "Sélectionner une date"}
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
            <p className="text-sm font-medium">Méthode de paiement</p>
            <Select 
              defaultValue={paymentMethod} 
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                <SelectItem value="check">Chèque</SelectItem>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="stripe">Stripe (hors plateforme)</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Référence de paiement (optionnel)</p>
            <Input
              placeholder="Ex: N° de chèque, référence de virement..."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Ajoutez une référence pour mieux identifier ce paiement ultérieurement.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-violet hover:bg-violet/90"
          >
            {isSubmitting ? "Confirmation..." : "Confirmer le paiement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InvoicePaymentConfirmation;
