
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethodChooser } from "@/components/PaymentMethodChooser";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PaymentMethod, processPayment } from "@/services/paymentService";
import { useToast } from "@/hooks/use-toast";
import { CurrencyFormat } from "@/components/ui/number-format";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface PaymentProcessorProps {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  returnUrl?: string;
}

export function PaymentProcessor({
  invoiceId,
  invoiceNumber,
  amount,
  currency = "EUR",
  onSuccess,
  onError,
  returnUrl
}: PaymentProcessorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setError(null);
  };

  const handleProcessPayment = async () => {
    if (!selectedMethod) {
      setError("Veuillez sélectionner une méthode de paiement");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const successUrl = returnUrl ? `${window.location.origin}${returnUrl}?success=true` : undefined;
      const cancelUrl = returnUrl ? `${window.location.origin}${returnUrl}?cancelled=true` : undefined;

      const response = await processPayment({
        invoiceId,
        paymentMethodCode: selectedMethod.code,
        amount,
        currency,
        successUrl,
        cancelUrl,
        metadata: {
          invoiceNumber
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
              Votre paiement a été initié via {selectedMethod?.name}. Vous recevrez une confirmation une fois le paiement traité.
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paiement</CardTitle>
        <CardDescription>
          Paiement de la facture {invoiceNumber} pour un montant de{" "}
          <CurrencyFormat value={amount} options={{ currency }} />
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

        <PaymentMethodChooser 
          onSelectPaymentMethod={handleSelectPaymentMethod}
          disabled={isProcessing}
          hideTitle
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleProcessPayment} 
          disabled={!selectedMethod || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            "Procéder au paiement"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
