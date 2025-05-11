
import React, { useState, useRef, useEffect } from 'react';
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
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fr } from 'date-fns/locale';

interface Invoice {
  id: string;
  invoice_number: string;
  amount?: number;
}

interface PaymentDetails {
  date: Date;
  method: string;
  reference?: string;
}

interface InvoicePaymentConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onConfirm: (paymentDetails: PaymentDetails) => void;
  isProcessing?: boolean;
}

export function InvoicePaymentConfirmDialog({
  isOpen,
  onOpenChange,
  invoice,
  onConfirm,
  isProcessing = false
}: InvoicePaymentConfirmDialogProps) {
  const { t } = useTranslation();
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<string>('bankTransfer');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const isMounted = useRef(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // Track if component is mounted to prevent state updates after unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Reset form when the dialog opens
  useEffect(() => {
    if (isOpen && isMounted.current) {
      setPaymentDate(new Date());
      setPaymentMethod('bankTransfer');
      setPaymentReference('');
    }
  }, [isOpen]);
  
  const handleConfirm = () => {
    if (isMounted.current) {
      onConfirm({
        date: paymentDate,
        method: paymentMethod,
        reference: paymentReference
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("confirmPayment")}</AlertDialogTitle>
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
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="payment-date">{t("paymentDate")}</Label>
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
                      ref={buttonRef}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, "PPP", { locale: fr }) : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div ref={calendarRef}>
                      <Calendar
                        mode="single"
                        selected={paymentDate}
                        onSelect={(date) => date && setPaymentDate(date)}
                        initialFocus
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-method">{t("paymentMethod")}</Label>
                <Select 
                  value={paymentMethod} 
                  onValueChange={setPaymentMethod}
                  disabled={isProcessing}
                >
                  <SelectTrigger id="payment-method" className="w-full">
                    <SelectValue placeholder={t("selectPaymentMethod")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bankTransfer">{t("bankTransfer")}</SelectItem>
                    <SelectItem value="check">{t("check")}</SelectItem>
                    <SelectItem value="cash">{t("cash")}</SelectItem>
                    <SelectItem value="stripeOffPlatform">{t("stripeOffPlatform")}</SelectItem>
                    <SelectItem value="other">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-reference">
                  {t("paymentReference")}
                </Label>
                <Input
                  id="payment-reference"
                  placeholder={t("referenceExample")}
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  disabled={isProcessing}
                />
                <p className="text-xs text-muted-foreground">
                  {t("referenceHelp")}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm} 
            className="bg-success hover:bg-success/90"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("confirming")}
              </>
            ) : (
              t("confirmPaymentButton")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default InvoicePaymentConfirmDialog;
