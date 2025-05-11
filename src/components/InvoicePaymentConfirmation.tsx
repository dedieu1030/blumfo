
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Link } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
  
  const content = (
    <Card className="max-w-md mx-auto">
      <CardHeader className={`${success ? 'bg-green-50' : 'bg-red-50'}`}>
        <CardTitle className="flex items-center">
          {success ? (
            <>
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <span>Paiement réussi</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
              <span>Paiement échoué</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        {success ? (
          <div className="space-y-4">
            <p className="text-center">
              Merci pour votre paiement. Votre facture a été réglée avec succès.
            </p>
            
            {invoice && (
              <div className="bg-green-50 p-3 rounded-md border border-green-100">
                <p>
                  <span className="font-medium">Numéro de facture:</span> {invoice.invoice_number}
                </p>
              </div>
            )}
            
            <div className="flex justify-center mt-6 space-x-4">
              <Button asChild variant="outline">
                <Link to={`/invoices${invoice ? `/${invoice.id}` : ''}`}>
                  Voir la facture
                </Link>
              </Button>
              <Button asChild>
                <Link to="/invoices">
                  Retour aux factures
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center">
              Nous n'avons pas pu traiter votre paiement.
            </p>
            
            {error && (
              <div className="bg-red-50 p-3 rounded-md border border-red-100">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            <div className="flex justify-center mt-6 space-x-4">
              <Button asChild variant="outline">
                <Link to={`/invoices${invoice ? `/${invoice.id}` : ''}`}>
                  Retour à la facture
                </Link>
              </Button>
              <Button asChild>
                <Link to="/invoices">
                  Toutes les factures
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  if (isOpen !== undefined && onOpenChange) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md">
          {content}
        </DialogContent>
      </Dialog>
    );
  }
  
  return content;
}

export default InvoicePaymentConfirmation;
