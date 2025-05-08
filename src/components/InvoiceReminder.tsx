
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendInvoiceReminder } from "@/services/reminderService";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InvoiceReminderProps {
  invoiceId: string;
  stripeInvoiceId?: string;
  clientEmail?: string;
  disabled?: boolean;
  variant?: "outline" | "default";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onReminderSent?: () => void;
}

export function InvoiceReminder({ 
  invoiceId, 
  stripeInvoiceId, 
  clientEmail,
  disabled,
  variant = "outline",
  size = "default",
  className = "",
  onReminderSent
}: InvoiceReminderProps) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  if (!stripeInvoiceId) {
    return null; // Ne pas afficher le bouton si pas d'ID de facture Stripe
  }

  const handleSendReminder = async () => {
    setShowConfirm(false);
    setIsSending(true);
    
    try {
      const result = await sendInvoiceReminder(stripeInvoiceId);
      
      if (result.success) {
        toast({
          title: "Rappel envoyé",
          description: `Un rappel a été envoyé pour la facture #${invoiceId}`,
        });
        
        if (onReminderSent) {
          onReminderSent();
        }
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors de l'envoi du rappel",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du rappel:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={disabled || isSending}
        onClick={() => setShowConfirm(true)}
      >
        {isSending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        Envoyer un rappel
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Envoyer un rappel de facture</DialogTitle>
            <DialogDescription>
              {clientEmail 
                ? `Un email de rappel sera envoyé à ${clientEmail}.` 
                : "Un email de rappel sera envoyé au client."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[200px] mt-2">
            <div className="text-sm">
              <p className="mb-2">
                Cette action enverra un rappel au client concernant la facture en attente de paiement. 
                Le rappel inclura:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Les détails de la facture</li>
                <li>Le montant dû</li>
                <li>Le lien de paiement</li>
              </ul>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Annuler
            </Button>
            <Button onClick={handleSendReminder} disabled={isSending}>
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Envoyer le rappel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default InvoiceReminder;
