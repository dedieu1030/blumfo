
import React from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface InvoicePaymentLinkProps {
  paymentUrl: string;
  qrCodeUrl: string;
}

export function InvoicePaymentLink({ paymentUrl, qrCodeUrl }: InvoicePaymentLinkProps) {
  return (
    <div className="mt-6 p-4 border rounded-md bg-gray-50">
      <h3 className="font-medium mb-2">Lien de paiement Stripe généré</h3>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-shrink-0">
          <img 
            src={qrCodeUrl} 
            alt="QR Code de paiement" 
            className="w-32 h-32 border"
          />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">
            Scannez ce QR code ou utilisez le lien ci-dessous pour effectuer le paiement:
          </p>
          <div className="flex items-center gap-2">
            <Input 
              value={paymentUrl} 
              readOnly 
              className="text-xs"
            />
            <Button 
              size="sm" 
              onClick={() => window.open(paymentUrl, '_blank')}
            >
              Ouvrir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePaymentLink;
