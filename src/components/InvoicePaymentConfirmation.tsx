
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

interface InvoicePaymentConfirmationProps {
  success: boolean;
  error?: string;
  invoice?: {
    id: string;
    invoice_number: string;
    amount?: number;
  };
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
}

export function InvoicePaymentConfirmation({ 
  success, 
  error,
  invoice,
  isOpen,
  onOpenChange,
  onConfirm
}: InvoicePaymentConfirmationProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const dialogTitleId = "payment-confirmation-title";
  
  const handleClose = () => {
    // Simplified closing mechanism without timeouts
    if (onOpenChange) {
      onOpenChange(false);
    }
    
    if (onConfirm) {
      onConfirm();
    }
    
    // Show toast notification after successful payment if needed
    if (success) {
      toast({
        title: t("paymentConfirmed"),
        description: t("invoiceMarkedAsPaid", { number: invoice?.invoice_number || '' }),
        variant: "default",
      });
    }
  };
  
  const content = (
    <Card className="max-w-md mx-auto">
      <CardHeader className={`${success ? 'bg-green-50' : 'bg-red-50'}`}>
        <CardTitle className="flex items-center" id={dialogTitleId}>
          {success ? (
            <>
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <span>{t("paymentConfirmed")}</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
              <span>{t("paymentFailed")}</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        {success ? (
          <div className="space-y-4">
            <p className="text-center">
              {invoice ? t("invoiceMarkedAsPaid", { number: invoice.invoice_number }) : t("paymentSuccessMessage")}
            </p>
            
            <div className="flex justify-center mt-6">
              <Button 
                onClick={handleClose}
                autoFocus
                className="focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {t("ok")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center">
              {error || t("paymentFailureMessage")}
            </p>
            
            {invoice && (
              <div className="bg-red-50 p-3 rounded-md border border-red-100">
                <p>
                  <span className="font-medium">{t("invoiceNumber")}:</span> {invoice.invoice_number}
                </p>
              </div>
            )}
            
            <div className="flex justify-center mt-6">
              <Button 
                onClick={handleClose}
                autoFocus
                className="focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {t("close")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  if (isOpen !== undefined && onOpenChange) {
    return (
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          console.log('Dialog open state changing to:', open);
          if (!open) {
            handleClose();
          } else {
            onOpenChange(open);
          }
        }}
      >
        <DialogContent 
          className="p-0 border-none bg-transparent shadow-none max-w-md" 
          aria-labelledby={dialogTitleId}
        >
          <DialogTitle className="sr-only" id={dialogTitleId}>
            {success ? t("paymentConfirmed") : t("paymentFailed")}
          </DialogTitle>
          {content}
        </DialogContent>
      </Dialog>
    );
  }
  
  return content;
}

export default InvoicePaymentConfirmation;
