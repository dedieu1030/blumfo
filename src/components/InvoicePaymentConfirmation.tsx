
import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface InvoicePaymentConfirmationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    number: string;
    amount: string;
    dueDate: string;
    status: "paid" | "pending" | "overdue" | "draft";
  };
  onPaymentConfirmed: () => void;
}

export function InvoicePaymentConfirmation({
  isOpen,
  onOpenChange,
  invoice,
  onPaymentConfirmed
}: InvoicePaymentConfirmationProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");
  const [paymentDate, setPaymentDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Si nous avons un ID Stripe pour cette facture, nous mettons à jour via l'API Stripe
      if (invoice.id.startsWith("stripe_")) {
        const { error } = await supabase.functions.invoke('update-invoice-status', {
          body: {
            invoiceId: invoice.id.replace("stripe_", ""),
            status: "paid",
            paymentMethod,
            paymentDate,
            paymentReference
          }
        });
        
        if (error) throw new Error(error.message);
      } else {
        // Sinon, nous mettons simplement à jour le statut dans notre base de données locale
        const { error } = await supabase
          .from('stripe_invoices')
          .update({
            status: 'paid',
            paid_date: new Date(paymentDate).toISOString(),
            metadata: {
              ...invoice.metadata,
              payment_method: paymentMethod,
              payment_reference: paymentReference
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', invoice.id);
          
        if (error) throw new Error(error.message);
      }
      
      toast.success("Paiement confirmé avec succès");
      onPaymentConfirmed();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la confirmation du paiement:", error);
      toast.error("Impossible de confirmer le paiement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Confirmer le paiement de la facture
          </DialogTitle>
          <DialogDescription>
            Facture #{invoice.number} - Montant: {invoice.amount}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Date du paiement</Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Méthode de paiement</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                <Label htmlFor="bank_transfer">Virement bancaire</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="check" id="check" />
                <Label htmlFor="check">Chèque</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Espèces</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Autre</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentReference">Référence de paiement (optionnel)</Label>
            <Input
              id="paymentReference"
              placeholder="N° de chèque, référence de virement..."
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Confirmation..." : "Confirmer le paiement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
