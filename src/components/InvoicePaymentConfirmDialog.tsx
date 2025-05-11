
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

interface Invoice {
  id: string;
  invoice_number: string;
  amount?: number;
}

interface InvoicePaymentConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onConfirm: () => void;
}

export function InvoicePaymentConfirmDialog({
  isOpen,
  onOpenChange,
  invoice,
  onConfirm
}: InvoicePaymentConfirmDialogProps) {
  const { t } = useTranslation();
  
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("confirmPayment", "Confirmer le paiement")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("confirmPaymentDesc", "Êtes-vous sûr de vouloir marquer cette facture comme payée ?")}
            <div className="mt-2 p-3 bg-muted rounded-md">
              <p className="font-medium">{t("invoice")}: {invoice.invoice_number}</p>
              {invoice.amount && (
                <p className="text-sm text-muted-foreground">
                  {t("amount")}: {invoice.amount.toLocaleString(undefined, {
                    style: 'currency',
                    currency: 'EUR'
                  })}
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel", "Annuler")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-success hover:bg-success/90">
            {t("confirmPayment", "Confirmer le paiement")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default InvoicePaymentConfirmDialog;
