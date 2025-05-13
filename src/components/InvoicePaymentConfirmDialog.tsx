
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Check, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { markInvoiceAsPaid, PaymentDetails } from "@/services/paymentService";
import { useToast } from "@/hooks/use-toast";

interface InvoicePaymentConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceNumber: string;
  onConfirm?: (success: boolean) => void;
}

export function InvoicePaymentConfirmDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceNumber,
  onConfirm
}: InvoicePaymentConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer");
  const [reference, setReference] = useState<string>("");
  const { toast } = useToast();

  async function handleConfirm() {
    if (!invoiceId) return;
    
    setIsSubmitting(true);
    
    try {
      const paymentDetails: PaymentDetails = {
        date: paymentDate,
        method: paymentMethod,
        reference: reference.trim() || undefined
      };
      
      const result = await markInvoiceAsPaid(invoiceId, paymentDetails);
      
      if (result.success) {
        toast({
          title: "Paiement enregistré",
          description: `La facture ${invoiceNumber} a été marquée comme payée.`,
          variant: "default",
        });
        
        onOpenChange(false);
        if (onConfirm) onConfirm(true);
      } else if (result.warning) {
        toast({
          title: "Avertissement",
          description: result.warning,
          variant: "destructive",
        });
        
        onOpenChange(false);
      } else {
        throw new Error(result.error || "Échec de l'enregistrement du paiement");
      }
    } catch (error) {
      console.error("Erreur lors du marquage de la facture comme payée:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors du traitement du paiement",
        variant: "destructive",
      });
      
      if (onConfirm) onConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmer le paiement</DialogTitle>
          <DialogDescription>
            Enregistrez les informations de paiement pour la facture {invoiceNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="payment-date">Date du paiement</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="payment-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !paymentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? format(paymentDate, "PPP", { locale: fr }) : "Sélectionnez une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={setPaymentDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="payment-method">Méthode de paiement</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Sélectionnez une méthode de paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                <SelectItem value="credit_card">Carte bancaire</SelectItem>
                <SelectItem value="check">Chèque</SelectItem>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="payment-reference">
              Référence du paiement
              <span className="text-muted-foreground text-xs ml-1">(optionnel)</span>
            </Label>
            <Input
              id="payment-reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="N° de transaction, chèque..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Confirmer le paiement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
