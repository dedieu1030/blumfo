
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";

interface InvoicePaymentAlertProps {
  overdueCount: number;
  nearDueCount?: number;
  onViewOverdue: () => void;
  onViewNearDue?: () => void;
  className?: string;
}

export function InvoicePaymentAlert({
  overdueCount,
  nearDueCount = 0,
  onViewOverdue,
  onViewNearDue,
  className = "",
}: InvoicePaymentAlertProps) {
  // Ne pas afficher si aucune facture n'est en retard ou proche de l'échéance
  if (overdueCount === 0 && nearDueCount === 0) {
    return null;
  }

  return (
    <Alert 
      variant="default"
      className={`border-l-4 ${overdueCount > 0 ? 'border-l-amber-500' : 'border-l-blue-500'} ${className}`}
    >
      <CalendarCheck className="h-4 w-4" />
      <AlertTitle>
        {overdueCount > 0 
          ? "Factures nécessitant une vérification" 
          : "Factures proches de l'échéance"}
      </AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          {overdueCount > 0 ? (
            <p>
              <strong>{overdueCount}</strong> facture{overdueCount > 1 ? "s" : ""} {' '}
              avec date d'échéance dépassée nécessite{overdueCount > 1 ? "nt" : ""} une vérification de paiement.
            </p>
          ) : nearDueCount > 0 ? (
            <p>
              <strong>{nearDueCount}</strong> facture{nearDueCount > 1 ? "s" : ""} {' '}
              arrive{nearDueCount > 1 ? "nt" : ""} bientôt à échéance.
            </p>
          ) : null}
        </div>
        
        <div className="flex gap-2">
          {overdueCount > 0 && (
            <Button 
              size="sm" 
              onClick={onViewOverdue}
              className="whitespace-nowrap"
            >
              Voir les factures en retard
            </Button>
          )}
          
          {nearDueCount > 0 && onViewNearDue && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={onViewNearDue}
              className="whitespace-nowrap"
            >
              Voir les échéances proches
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default InvoicePaymentAlert;
