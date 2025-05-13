
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CurrencyFormat } from "@/components/ui/number-format";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface InvoicePaymentStatusProps {
  totalAmount: number;
  amountPaid: number;
  currency?: string;
  className?: string;
  showProgress?: boolean;
  variant?: "default" | "compact";
}

export function InvoicePaymentStatus({
  totalAmount,
  amountPaid,
  currency = "EUR",
  className = "",
  showProgress = true,
  variant = "default"
}: InvoicePaymentStatusProps) {
  const amountDue = totalAmount - amountPaid;
  const isFullyPaid = amountPaid >= totalAmount;
  const isPartiallyPaid = amountPaid > 0 && amountPaid < totalAmount;
  const isNotPaid = amountPaid === 0;
  const paymentProgress = totalAmount > 0 ? Math.min(100, (amountPaid / totalAmount) * 100) : 0;
  
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {isFullyPaid && (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-800">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Payée
          </Badge>
        )}
        
        {isPartiallyPaid && (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 hover:text-amber-800">
            <Clock className="mr-1 h-3 w-3" /> Paiement partiel ({Math.round(paymentProgress)}%)
          </Badge>
        )}
        
        {isNotPaid && (
          <Badge variant="outline" className="bg-gray-100">
            <AlertCircle className="mr-1 h-3 w-3" /> Non payée
          </Badge>
        )}
      </div>
    );
  }
  
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Montant total</p>
            <p className="text-base font-medium">
              <CurrencyFormat 
                value={totalAmount} 
                options={{ currency }}
              />
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Montant payé</p>
            <p className={`text-base font-medium ${isFullyPaid ? 'text-green-600' : ''}`}>
              <CurrencyFormat 
                value={amountPaid} 
                options={{ currency }}
              />
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Montant restant</p>
            <p className={`text-base font-medium ${isFullyPaid ? 'text-green-600' : isPartiallyPaid ? 'text-amber-600' : ''}`}>
              <CurrencyFormat 
                value={amountDue} 
                options={{ currency }}
              />
            </p>
          </div>
        </div>
        
        {showProgress && (
          <div className="mt-3">
            <div className="flex justify-between mb-1 text-xs">
              <span>Progrès du paiement</span>
              <span>{Math.round(paymentProgress)}%</span>
            </div>
            <Progress value={paymentProgress} className="h-2" />
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 px-4 pb-4">
        <div className="w-full flex items-center">
          {isFullyPaid && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" /> Facture entièrement payée
            </div>
          )}
          
          {isPartiallyPaid && (
            <div className="flex items-center gap-1 text-sm text-amber-600">
              <Clock className="h-4 w-4" /> Paiement partiel reçu
            </div>
          )}
          
          {isNotPaid && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" /> Aucun paiement reçu
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
