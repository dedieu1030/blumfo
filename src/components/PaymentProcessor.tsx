
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethodChooser } from "@/components/PaymentMethodChooser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PaymentMethod, processPayment } from "@/services/paymentService";
import { useToast } from "@/hooks/use-toast";
import { CurrencyFormat } from "@/components/ui/number-format";
import { Loader2, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentProcessorProps {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  amountPaid?: number;
  amountDue?: number;
  currency?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  returnUrl?: string;
}

export function PaymentProcessor({
  invoiceId,
  invoiceNumber,
  amount,
  amountPaid = 0,
  amountDue,
  currency = "EUR",
  onSuccess,
  onError,
  returnUrl
}: PaymentProcessorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [partialAmount, setPartialAmount] = useState<number | undefined>(undefined);
  const { toast } = useToast();
  
  const actualAmountDue = amountDue !== undefined ? amountDue : amount - amountPaid;
  
  // Si la facture est déjà partiellement payée, activer par défaut le mode paiement partiel
  useEffect(() => {
    if (amountPaid > 0 && amountPaid < amount) {
      setIsPartialPayment(true);
      setPartialAmount(actualAmountDue);
    }
  }, [amountPaid, amount, actualAmountDue]);

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setError(null);
  };

  const handlePartialAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setPartialAmount(Math.min(value, actualAmountDue));
    } else {
      setPartialAmount(undefined);
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedMethod) {
      setError("Veuillez sélectionner une méthode de paiement");
      return;
    }
    
    if (isPartialPayment && (!partialAmount || partialAmount <= 0)) {
      setError("Veuillez saisir un montant valide pour le paiement partiel");
      return;
    }
    
    // Vérifier que le montant partiel ne dépasse pas le montant dû
    if (isPartialPayment && partialAmount && partialAmount > actualAmountDue) {
      setPartialAmount(actualAmountDue);
      toast({
        title: "Montant ajusté",
        description: `Le montant a été ajusté au solde restant dû (${formatCurrency(actualAmountDue, { currency })})`,
      });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const successUrl = returnUrl ? `${window.location.origin}${returnUrl}?success=true` : undefined;
      const cancelUrl = returnUrl ? `${window.location.origin}${returnUrl}?cancelled=true` : undefined;
      
      const paymentAmount = isPartialPayment ? partialAmount : actualAmountDue;

      const response = await processPayment({
        invoiceId,
        paymentMethodCode: selectedMethod.code,
        amount: paymentAmount,
        currency,
        successUrl,
        cancelUrl,
        is_partial: isPartialPayment,
        metadata: {
          invoiceNumber,
          is_partial: isPartialPayment
        }
      });

      if (response.success) {
        if (response.requiresRedirect && response.paymentUrl) {
          // Rediriger vers la page de paiement externe
          window.location.href = response.paymentUrl;
        } else {
          // Paiement traité avec succès (méthode manuelle comme virement bancaire)
          setSuccess(true);
          toast({
            title: "Paiement initié",
            description: response.message || `Le paiement via ${selectedMethod.name} a été initié avec succès.`,
          });
          
          if (onSuccess && response.payment) {
            onSuccess(response.payment.id);
          }
        }
      } else if (response.warning) {
        toast({
          title: "Avertissement",
          description: response.warning,
          variant: "destructive",
        });
        if (onError) onError(response.warning);
      } else {
        setError(response.error || "Une erreur est survenue lors du traitement du paiement");
        if (onError) onError(response.error || "Erreur de paiement");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Paiement initié</CardTitle>
          <CardDescription>
            Votre demande de paiement a été enregistrée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Paiement en attente de confirmation</AlertTitle>
            <AlertDescription>
              Votre paiement de {' '}
              <strong><CurrencyFormat value={isPartialPayment ? partialAmount : actualAmountDue} options={{ currency }} /></strong>
              {' '} a été initié via {selectedMethod?.name}.
              {isPartialPayment && (
                <p className="mt-2">
                  Il s'agit d'un paiement partiel. Montant restant à payer : {' '}
                  <strong><CurrencyFormat value={actualAmountDue - (partialAmount || 0)} options={{ currency }} /></strong>
                </p>
              )}
              <p className="mt-2">Vous recevrez une confirmation une fois le paiement traité.</p>
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-end">
          {returnUrl && (
            <Button onClick={() => window.location.href = returnUrl}>
              Retour
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  const isFullyPaid = amountPaid >= amount;
  
  if (isFullyPaid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Facture payée</CardTitle>
          <CardDescription>
            Cette facture a été entièrement réglée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Paiement complet</AlertTitle>
            <AlertDescription>
              La facture {invoiceNumber} d'un montant de <strong><CurrencyFormat value={amount} options={{ currency }} /></strong> a été entièrement payée.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paiement</CardTitle>
        <CardDescription>
          Paiement de la facture {invoiceNumber}
          {amountPaid > 0 && (
            <> (montant restant : <CurrencyFormat value={actualAmountDue} options={{ currency }} />)</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {amountPaid > 0 && (
          <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 bg-muted rounded-md mb-4">
            <div>
              <p className="text-sm font-medium">Montant total</p>
              <p className="text-lg"><CurrencyFormat value={amount} options={{ currency }} /></p>
            </div>
            <div>
              <p className="text-sm font-medium">Déjà payé</p>
              <p className="text-lg text-green-600"><CurrencyFormat value={amountPaid} options={{ currency }} /></p>
            </div>
            <div>
              <p className="text-sm font-medium">Reste à payer</p>
              <p className="text-lg font-bold"><CurrencyFormat value={actualAmountDue} options={{ currency }} /></p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <PaymentMethodChooser 
            onSelectPaymentMethod={handleSelectPaymentMethod}
            disabled={isProcessing}
            hideTitle
          />
          
          {actualAmountDue > 0 && selectedMethod && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="partial-payment" 
                  checked={isPartialPayment}
                  onCheckedChange={(checked) => setIsPartialPayment(checked === true)}
                />
                <Label 
                  htmlFor="partial-payment" 
                  className="font-medium cursor-pointer"
                >
                  Effectuer un paiement partiel
                </Label>
              </div>
              
              {isPartialPayment && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="partial-amount">Montant à payer</Label>
                  <div className="flex gap-4 items-center">
                    <Input
                      id="partial-amount"
                      type="number"
                      placeholder="Montant"
                      value={partialAmount || ''}
                      onChange={handlePartialAmountChange}
                      min={1}
                      max={actualAmountDue}
                      step={0.01}
                      className="max-w-[150px]"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">sur</span>
                      <strong><CurrencyFormat value={actualAmountDue} options={{ currency }} /></strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {isPartialPayment ? (
            <>Montant à payer: <strong><CurrencyFormat value={partialAmount || 0} options={{ currency }} /></strong></>
          ) : (
            <>Montant total: <strong><CurrencyFormat value={actualAmountDue} options={{ currency }} /></strong></>
          )}
        </div>
        <Button 
          onClick={handleProcessPayment} 
          disabled={!selectedMethod || isProcessing || (isPartialPayment && (!partialAmount || partialAmount <= 0))}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              Procéder au paiement
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
