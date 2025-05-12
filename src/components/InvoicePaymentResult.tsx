
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

interface InvoicePaymentResultProps {
  success: boolean;
  error?: string;
  invoice?: {
    id: string;
    invoice_number: string;
    amount?: number;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss?: () => void;
}

export function InvoicePaymentResult({ 
  success, 
  error,
  invoice,
  isOpen,
  onOpenChange,
  onDismiss
}: InvoicePaymentResultProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const handleClose = () => {
    onOpenChange(false);
    
    if (onDismiss) {
      onDismiss();
    }
    
    if (success) {
      toast({
        title: t("paymentConfirmed", "Paiement confirmé"),
        description: invoice 
          ? t("invoiceMarkedAsPaid", "La facture {{number}} a été marquée comme payée", { number: invoice.invoice_number }) 
          : t("paymentSuccessMessage", "Le paiement a été enregistré avec succès"),
        variant: "default",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md">
        <DialogTitle className="sr-only">
          {success ? t("paymentConfirmed", "Paiement confirmé") : t("paymentFailed", "Échec du paiement")}
        </DialogTitle>
        <Card className="max-w-md mx-auto">
          <CardHeader className={success ? 'bg-green-50' : 'bg-red-50'}>
            <CardTitle className="flex items-center">
              {success ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <span>{t("paymentConfirmed", "Paiement confirmé")}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                  <span>{t("paymentFailed", "Échec du paiement")}</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6">
            {success ? (
              <div className="space-y-4">
                <p className="text-center">
                  {invoice 
                    ? t("invoiceMarkedAsPaid", "La facture {{number}} a été marquée comme payée", { number: invoice.invoice_number }) 
                    : t("paymentSuccessMessage", "Le paiement a été enregistré avec succès")}
                </p>
                
                <div className="flex justify-center mt-6">
                  <Button 
                    onClick={handleClose}
                    autoFocus
                    className="focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {t("ok", "OK")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center">
                  {error || t("paymentFailureMessage", "Une erreur s'est produite lors du traitement du paiement")}
                </p>
                
                {invoice && (
                  <div className="bg-red-50 p-3 rounded-md border border-red-100">
                    <p>
                      <span className="font-medium">{t("invoiceNumber", "Numéro de facture")}:</span> {invoice.invoice_number}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-center mt-6">
                  <Button 
                    onClick={handleClose}
                    autoFocus
                    className="focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {t("close", "Fermer")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
